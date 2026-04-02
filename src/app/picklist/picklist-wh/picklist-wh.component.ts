import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { PickListService } from "../../_services/picklist.service";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { UserService } from "../../_services/user.service";

@Component({
  selector: 'app-picklist-wh',
  templateUrl: './picklist-wh.component.html',
  styleUrls: ['./picklist-wh.component.css'],
  standalone: false
})

export class PickListWHComponent implements OnInit {

  constructor(
    public picklistService: PickListService,
    private toastr: ToastrService,
    private router: Router,
    public userService: UserService
  ) { }

  showCurrent: boolean = true;
  isLoading = false;

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['PickNo', 'DeliveryDate','CustomerName', 'ShippingAddress', 'Status', 'PickDate', 'Pickby', 'Action'];

  ngOnInit() {
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.dbFilterSalesOrder.DocNum.toString().toLowerCase().includes(filter) ||
        data.dbFilterSalesOrder.DocDueDate.toString().toLowerCase().includes(filter) ||
        data.dbResult.CustomerName.toString().toLowerCase().includes(filter);
    };
    this.loadData();
  }

  applyFilter(event: Event) {
    // applies filtering to all columns ('position', 'name', 'weight', 'symbol')
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadData() {

    let ServiceQuery;

    if (this.showCurrent) {
      ServiceQuery = this.picklistService.getCurrentPickList();
    } else {
      ServiceQuery = this.picklistService.getPreviousPickList();
    }

    ServiceQuery.subscribe((res) => {
      this.dataSource.data = res;
    })

  }

  disableButton(type: string, element: any) { 
    if (type == "StartPicking") {
      if (element.dbResult.APIStatus == "1") {
        return true;
      }
    }
    if (type == "ViewPicking") {
      if (element.dbResult.APIStatus != "1") {
        return true;
      }
    }
    return false;
  }

  startPicking(id: number) {
    this.picklistService.startPickList(id).subscribe({
      next: (data) => {
        this.toastr.success("Pick List Started");
        this.router.navigate(['/picklist/view/' + id]);
      },
      error: (data) => {
        this.toastr.error("Unable to Start Pick List");
        this.loadData();
      }
    });
  }

  viewPicking(id: number) {
    this.router.navigate(['/picklist/view/' + id]);
  }

  gotoToggleData() {
    this.showCurrent = !this.showCurrent
    this.loadData();
  }
}
