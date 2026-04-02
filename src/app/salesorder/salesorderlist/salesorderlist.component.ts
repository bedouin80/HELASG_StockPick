import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { SalesOrderService } from "../../_services/salesorder.service";
import { PickListService } from "../../_services/picklist.service";
import { UserService } from "../../_services/user.service";

@Component({
  selector: 'app-salesorder',
  templateUrl: './salesorderlist.component.html',
  styleUrls: ['./salesorderlist.component.css'],
  standalone: false
})

export class SalesOrderListComponent implements OnInit {

  constructor(
    private salesOrderService: SalesOrderService,
    public pickListService: PickListService,
    public userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  missingNumbers!: string;
  showCurrent: boolean = true;
  isLoading = false;
  isMissingLoading = false;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['SalesOrderNo', 'DeliveryDate', 'CustomerName', 'CustomerAddress', 'PickStatus', 'Pickby', 'PickDate','SubmitDate'];

  ngOnInit() {
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.CommonSO.ActiveSalesOrders.DocNum.toString().toLowerCase().includes(filter) ||
        data.CommonSO.ActiveSalesOrders.CardName.toLowerCase().includes(filter) ||
        data.CommonSO.ActiveSalesOrders.DocDueDate.toString().toLowerCase().includes(filter);
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

    this.isLoading = true ;
    if (this.showCurrent) {
      ServiceQuery = this.salesOrderService.getCurrentSalesOrder();
    } else {
      ServiceQuery = this.salesOrderService.getPreviousSalesOrder();
    }
    
    ServiceQuery.subscribe((res: any) => {
      this.dataSource.data = res;
      this.isLoading = false;
      this.missingNumbers = "";
      this.salesOrderService.missingSalesOrder().subscribe({
        next: (data: any) => {
          this.missingNumbers = data.toString().replaceAll(",", ", ");
        }
      });
    });
  }

  getMissingNumbers() {
    this.isMissingLoading = true;
    this.missingNumbers = "";
    this.salesOrderService.missingSalesOrder().subscribe({
      next: (data: any) => {
        this.missingNumbers = data.toString().replaceAll(",", ", ");
        this.isMissingLoading = false;
      }
    });
  }

  viewSalesOrder(id: number) {
    this.router.navigate(['/salesorder/view/' + id]);
  }

  gotoNew() {
    this.router.navigate(['/picklist/import']);
  }

  gotoToggleData() {
    this.showCurrent = !this.showCurrent
    this.loadData();
  }

  cancelSalesOrder(id: number) {
    this.salesOrderService.cancelSalesOrder(id).subscribe({
      next: (data:any) => {
        this.toastr.success("Sales Order Cancelled");
        this.loadData();
      },
      error: (data:any) => {
        this.toastr.error("Unable to Cancel Sales Order");
        this.loadData();
      }
    });
  }
}
