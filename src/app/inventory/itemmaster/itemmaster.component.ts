import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { ItemService } from "../../_services/item.service";

@Component({
  selector: 'app-itemmaster-list',
  templateUrl: './itemmaster.component.html',
  styleUrls: ['./itemmaster.component.css'],
  standalone: false
})

export class ItemMasterComponent implements OnInit {

  constructor(
    private itemService: ItemService,
    private router: Router
  ) { }

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['itemCode', 'itemName', 'codeBars', 'codeBars2', 'codeBars3', 'rackLocation','action'];

  ngOnInit() {
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.ItemCode.toString().toLowerCase().includes(filter) ||
        data.ItemName.toString().toLowerCase().includes(filter) ||
        data.CodeBars?.toString().toLowerCase().includes(filter) ||
        data.CodeBars2?.toString().toLowerCase().includes(filter) ||
        data.CodeBars3?.toString().toLowerCase().includes(filter) ||
        data.RackLocation?.toString().toLowerCase().includes(filter);
    };
    this.loadData();    
  }

  applyFilter(event: Event) {
    // applies filtering to all columns ('position', 'name', 'weight', 'symbol')
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  label(element: any) {
    this.router.navigate(['/itemlabel'], { queryParams: { itemCode: element.ItemCode } });
  }

  details(element: any) {
    this.router.navigate(['/itemdetail'], { queryParams: { itemCode: element.ItemCode } });
  }

  loadData() {
    this.itemService.getSAPItemList().subscribe({
      next: (data: any) => {
        this.dataSource.data = data;
      }
    });
  }
}