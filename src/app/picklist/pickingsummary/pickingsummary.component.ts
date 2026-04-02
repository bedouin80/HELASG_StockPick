import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { PickListService } from "../../_services/picklist.service";
import { SalesOrderService } from "../../_services/salesorder.service";
import { CdkAccordionModule } from "@angular/cdk/accordion";
import { CommonModule } from "@angular/common";
//import * as sha512 from 'js-sha512';
//import { hash } from "bcryptjs";
import Swal from 'sweetalert2';
import { UserService } from "../../_services/user.service";

@Component({
  selector: 'app-picklist-summary',
  templateUrl: './pickingsummary.component.html',
  styleUrls: ['./pickingsummary.component.css'],
  imports: [CdkAccordionModule, CommonModule],
  standalone: true
})

export class PickingSummaryComponent implements OnInit, OnDestroy {

  //array struct: 0-West, 1-Central, 2-East, 3-Urgent, 4-export
  //Sub array //0-D-Day, 1-D+2, 2-D>=3 
  accordianData: any;
  interval: any;
  dataHash: any;

  constructor(
    private picklistService: PickListService,
    private router: Router,
    public userService: UserService
  ) { }

  ngOnInit() {
    this.loadData();
    this.interval = setInterval(() => {
      this.loadData(); // api call
    }, 10000);
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  loadData() {
    this.picklistService.getCurrentPickList().subscribe({
      next: (data: any) => {
  //      var hashCheck = sha512.sha512(JSON.stringify(data));

  //      if (this.dataHash != hashCheck) {
  //        this.dataHash = hashCheck;
          this.clearData();
          for (var i = 0; i < data.length; i++) {
            var dzone = 0, dday = 0;

            if (data[i].dbFilterSalesOrder.Series == "61") {
              dzone = 4;
            } else if (data[i].dbFilterSalesOrder.TrnspCode == 2) {
              dzone = 3;
            } else if (data[i].dbResult.DeliveryZone == "West") {
              dzone = 0;
            } else if (data[i].dbResult.DeliveryZone == "Central") {
              dzone = 1;
            } else if (data[i].dbResult.DeliveryZone == "East") {
              dzone = 2;
            }

            var DeliveryDate = new Date(
              parseInt(data[i].dbFilterSalesOrder.DocDueDate.toString().substring(0, 4)),
              parseInt(data[i].dbFilterSalesOrder.DocDueDate.toString().substring(4, 6)) - 1,
              parseInt(data[i].dbFilterSalesOrder.DocDueDate.toString().substring(6, 8)),
            );

            var DateNow = new Date();
            DateNow.setHours(0);
            DateNow.setMinutes(0);
            DateNow.setSeconds(0);
            DateNow.setMilliseconds(0);

            var DayDiff = Math.floor((DeliveryDate.getTime() - DateNow.getTime()) / 1000 / 60 / 60 / 24);

            if (DateNow.getDay() >= 0 && DateNow.getDay() <= 3) {
              if (DayDiff <= 1) {
                dday = 0;
              } else if (DayDiff == 2) {
                dday = 1;
              } else if (DayDiff >= 3) {
                dday = 2;
              }
            } else if (DateNow.getDay() == 4) {
              if (DayDiff <= 1) {
                dday = 0;
              } else if (DayDiff == 4) {
                dday = 1;
              } else if (DayDiff >= 5) {
                dday = 2;
              }
            } else if (DateNow.getDay() == 5) {
              if (DayDiff <= 3) {
                dday = 0;
              } else if (DayDiff == 4) {
                dday = 1;
              } else if (DayDiff >= 5) {
                dday = 2;
              }
            } else if (DateNow.getDay() == 6) {
              if (DayDiff <= 2) {
                dday = 0;
              } else if (DayDiff == 3) {
                dday = 1;
              } else if (DayDiff >= 4) {
                dday = 2;
              }
            }
            
            data[i].SpanText = '[' +
              data[i].dbFilterSalesOrder.DocDueDate.toString().charAt(6) +
              data[i].dbFilterSalesOrder.DocDueDate.toString().charAt(7) + ']' +
              data[i].dbFilterSalesOrder.DocNum +
              (data[i].dbResult.APIStatus == '2' || data[i].dbResult.APIStatus == '3' ?
              '(' + this.userService.getUserName(data[i].dbResult.StartPickingBy)?.charAt(0) + ')' : '');

            this.accordianData[dzone][dday].push(data[i]);
          }
//        }
        
      },
      error: (error: any) => {
        if (error.status == 404) {
          Swal.fire({ title: "Error!", text: "PickList not found" });
        } else {
          Swal.fire({ title: "Error!", text: error.error });
        }
      }
    });
  }

  clearData() {
    this.accordianData = new Array;
    this.accordianData[0] = new Array;
    this.accordianData[0][0] = new Array;
    this.accordianData[0][1] = new Array;
    this.accordianData[0][2] = new Array;
    this.accordianData[1] = new Array;
    this.accordianData[1][0] = new Array;
    this.accordianData[1][1] = new Array;
    this.accordianData[1][2] = new Array;
    this.accordianData[2] = new Array;
    this.accordianData[2][0] = new Array;
    this.accordianData[2][1] = new Array;
    this.accordianData[2][2] = new Array;
    this.accordianData[3] = new Array;
    this.accordianData[3][0] = new Array;
    this.accordianData[3][1] = new Array;
    this.accordianData[3][2] = new Array;
    this.accordianData[4] = new Array;
    this.accordianData[4][0] = new Array;
    this.accordianData[4][1] = new Array;
    this.accordianData[4][2] = new Array;
  }

  indexText(id: number) {
    if (id == 0) {
      return "D-Tmr";
    } else if (id == 1) {
      return "D-Next Day";
    } else {
      return "D > 3";
    }
  }

}