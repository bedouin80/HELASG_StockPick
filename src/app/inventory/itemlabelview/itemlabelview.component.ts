import { formatDate } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { BatchNumberService } from "../../_services/batchnumber.service";
import { ItemService } from "../../_services/item.service";
import bwipjs from 'bwip-js';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-itemlabel-view',
  templateUrl: './itemlabelview.component.html',
  styleUrls: ['./itemlabelview.component.css'],
  standalone: false
})

export class ItemLabelViewComponent implements OnInit {

  form: FormGroup = new FormGroup({
    ItemQuery: new FormControl(''),
    warehouse: new FormControl(''),
    batch: new FormControl(''),
    description: new FormControl('')
  });

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private itemService: ItemService,
    private router: Router,
    private batchNumberService: BatchNumberService
  ) { }

  submitted = false;
  canGenerate = false;
  retrievingdata = false;
  ItemDetails: any;
  batchdata: any;
  warehouses: string[] = [];
  batches: string[] = [];
  selectedIndex: number = 0;
  barcodedata: string = "";
  isBatch = "N";
  svgData = "";
  description: string = "";
  warehouse = "";
  batch = "";
  ItemQuery = "";

  correction: any = {
    "packets": "pks",
    "bottles": "bt",
    "carton": "ctn"
  };

  ngOnInit() {
    if (this.route.snapshot.queryParams['itemCode'] != undefined) {
      this.ItemQuery = this.route.snapshot.queryParams['itemCode']; 
    }

    this.form = this.formBuilder.group({
      ItemQuery: [this.ItemQuery],
      warehouse: [''],
      batch: [''],
      description: ['']
    });

    if (this.route.snapshot.queryParams['itemCode'] != undefined) {
      this.queryitem();
    }
    
  }

  clearItem() {
    this.canGenerate = false;
    this.ItemDetails = {};
    this.batchdata = {};
    this.warehouses = [];
    this.batches = [];
    this.isBatch = "N";
    this.svgData = "";
    this.description = "";
    this.warehouse = "";
    this.batch = "";
    this.barcodedata = "";
  }

  queryitem() {

    this.submitted = true;
    var itemQuery: string = this.form.controls["ItemQuery"].value;
    
    this.itemService.getSAPItem(itemQuery).subscribe({
      next: (data: any) => {
        this.canGenerate = true;
        this.ItemDetails = data;

        this.description = this.ItemDetails.ItemName;
        Object.keys(this.correction).forEach((key) => {
          this.description = this.description.replace(key, this.correction[key]);
        });
        this.form.patchValue({description: this.description})

        this.isBatch = this.ItemDetails.ManBtchNum;
        if (data.ManBtchNum == "Y") {
          this.batchNumberService.getScanAvailableBatchNumber("", data.ItemCode).subscribe({
            next: (batchData: any) => {
              this.batchdata = batchData;
              this.warehouses = [];
              this.warehouse = "";
              this.batch = "";
              this.barcodedata = "";
              this.svgData = "";
              for (var i = 0; i < batchData.length; i++) {
                if (!this.warehouses.find((item) => item == batchData[i].WhsCode)) {
                  this.warehouses.push(batchData[i].WhsCode);
                }
              }
            },
            error: (error: any) => {
              if (error.status == 404) {
                Swal.fire({ title: "Error!", text: "Batch Number Not Found" });
              } else {
                Swal.fire({ title: "Error!", text: error.error });
              }
            }
          });
        } else {
          this.barcodedata = this.generate();
          this.svgData = bwipjs.toSVG({
            bcid: "code128",
            text: this.barcodedata,
            scale: 2,
            height: 20,
            textxalign: 'center'
          });
        }
      },
      error: (error: any) => {
        this.submitted = false;
        this.canGenerate = true;
        if (error.status == 404) {
          Swal.fire({ title: "Error!", text: "Item Not Found" });
        } else {
          Swal.fire({ title: "Error!", text: error.error });
        }
      }
    });
  }

  FillBatchNumberDDL() {
    this.batches = [];
    for (var i = 0; i < this.batchdata.length; i++) {
      if (this.batchdata[i].WhsCode == this.form.controls["warehouse"].value
        && !this.batches.find((item) => item == this.batchdata[i].BatchNum))
      {
        this.batches.push(this.batchdata[i].BatchNum);
      }
    }
  }

  FillBatchDetails() {
    for (var i = 0; i < this.batchdata.length; i++) {
      if (this.batchdata[i].WhsCode == this.form.controls["warehouse"].value
        && this.batchdata[i].BatchNum == this.form.controls["batch"].value) {
        this.selectedIndex = i;
        this.barcodedata = this.generate();
        this.svgData = bwipjs.toSVG({
          bcid: "code128",
          text: this.barcodedata,
          scale: 2,
          height: 20,
          textxalign: 'center'
        });
        break;
      }
    }
  }
  
  generate() {
    var result = "";

    if (this.ItemDetails.ManBtchNum == "Y") {
      if (this.ItemDetails.CodeBars != "") {
        //using barcode
        var result: string = "";
        var pad0: string = "0";
        result = "01" +
          pad0.repeat(14 - this.ItemDetails.CodeBars.length) +
          this.ItemDetails.CodeBars +
          "15" + formatDate(this.batchdata[this.selectedIndex].ExpDate, "YYMMdd", "en-us") +
          "10" + this.batchdata[this.selectedIndex].BatchNum;

      } else {
        //using item code
        var result: string = "";
        var pad0: string = "^";
        if (this.ItemDetails.ItemCode.length <= 10) {
          //fixed length 10
          result = "02" +
            pad0.repeat(10 - this.ItemDetails.ItemCode.length)
        } else if (this.ItemDetails.ItemCode.length <= 15) {
          //fixed length 15
          result = "03" +
            pad0.repeat(15 - this.ItemDetails.ItemCode.length)
        } else {
          //lenght more than 20
        }

        result += this.ItemDetails.ItemCode +
          "15" + formatDate(this.batchdata[this.selectedIndex].ExpDate, "YYMMdd", "en-us") +
          "10" + this.batchdata[this.selectedIndex].BatchNum;
      }
    } else {
      if (this.ItemDetails.CodeBars != "") {
        result = "05" + this.ItemDetails.CodeBars;
      } else {
        result = "06" + this.ItemDetails.ItemCode;
      }
    }
    

    return result;
  }
}
