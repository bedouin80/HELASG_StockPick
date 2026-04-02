import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { BatchNumberService } from "../../_services/batchnumber.service";
import { ItemService } from "../../_services/item.service";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-barcodecheck-view',
  templateUrl: './barcodecheckview.component.html',
  styleUrls: ['./barcodecheckview.component.css'],
  standalone: false
})

export class BarcodeCheckViewComponent implements OnInit {

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private formBuilder: FormBuilder,
    private itemService: ItemService,
    private batchService: BatchNumberService
  ) { }

  form: FormGroup = new FormGroup({
    ScanText: new FormControl(''),
    Warehouse: new FormControl('')
  });

  get f() { return this.form.controls; }

  ScanText!: string;
  Warehouse: string = "";
  batchData!: any;
  itemData!: any;
  WarehouseList = ["01", "02", "IND", "3PTY", "DIR", "EXPREC", "JLT", "THA"];

  @ViewChild('scantext') scanTextElement: any;

  ngOnInit() {
    this.form = this.formBuilder.group({
      ScanText: [''],
      Warehouse: ['']
    });
  }

  checkBarcode() {

    var strBarcode = ""
    this.ScanText = this.form.controls["ScanText"].value
    if (this.ScanText != "") {
      if (this.ScanText.startsWith("01") == true ||
        this.ScanText.startsWith("02") == true ||
        this.ScanText.startsWith("03") == true ||
        this.ScanText.startsWith("05") == true ||
        this.ScanText.startsWith("06") == true
      ) {
        strBarcode = this.ScanText;
      } else {
        Swal.fire({ title: "Error!", text: "Barcode Incorrect format"});
      }
    }

    if (strBarcode != "") {

      var expiryDate: string = "";
      var batchNumber: string = "";
      var BarItemCode: string = "";
      var barcodeText: string = "";
      var itemCode: string = "";
      var found = false;
      var padChar = "";

      if (strBarcode.indexOf("01") == 0) {
        BarItemCode = strBarcode.substring(2, 16);
        if (strBarcode.substring(16, 18) == "10") {
          batchNumber = strBarcode.substring(18, strBarcode.length-8);
          expiryDate = strBarcode.substring(strBarcode.length-6, strBarcode.length);
        } else {
          expiryDate = strBarcode.substring(18, 24);
          batchNumber = strBarcode.substring(26, strBarcode.length);
        }
        padChar = "0";

      } else if (strBarcode.indexOf("02") == 0) {
        BarItemCode = strBarcode.substring(2, 12);
        expiryDate = strBarcode.substring(14, 20);
        batchNumber = strBarcode.substring(22, strBarcode.length);
        padChar = "^";
      } else if (strBarcode.indexOf("03") == 0) {
        BarItemCode = strBarcode.substring(2, 17);
        expiryDate = strBarcode.substring(19, 25);
        batchNumber = strBarcode.substring(27, strBarcode.length);
        padChar = "^";
      } else if (strBarcode.indexOf("05") == 0) {
        BarItemCode = strBarcode.substring(2, strBarcode.length);
      } else if (strBarcode.indexOf("06") == 0) {
        itemCode = strBarcode.substring(2, strBarcode.length);
      }

      if (padChar != "") {
        for (var i = 0; i < BarItemCode.length; i++) {
          if (BarItemCode.charAt(i) != padChar && found != true) {
            barcodeText = BarItemCode.substring(i, BarItemCode.length);
            found = true;
          }
        }

        if (strBarcode.indexOf("02") == 0 || strBarcode.indexOf("03") == 0) {
          itemCode = barcodeText;
          barcodeText = "";
        }
      } else { barcodeText = BarItemCode; }

      if (barcodeText != "") {
        this.itemService.checkBarcode(barcodeText).subscribe({
          next: (itemdata: any) => {
            this.itemData = itemdata;
            this.batchData = null;
            this.fetchbatchData(itemdata, batchNumber);
          },
          error: (error: any) => {
            if (error.status == 404) {
              Swal.fire({ title: "Error!", text: "Barcode Not Found" });
            } else {
              Swal.fire({ title: "Error!", text: error.error });
            }
          }
        });
      } else {
        this.itemService.getSAPItem(itemCode).subscribe({
          next: (itemdata: any) => {
            this.itemData = itemdata;
            this.fetchbatchData(itemdata, batchNumber);
          },
          error: (error: any) => {
            if (error.status == 404) {
              Swal.fire({ title: "Error!", text: "Item Code Not Found" });
            } else {
              Swal.fire({ title: "Error!", text: error.error });
            }
          }
        });
      }
      
    }
  }

  fetchbatchData(itemdata: any, batchNumber: string) {
    this.Warehouse = this.form.controls["Warehouse"].value
    if (this.Warehouse != "") {
      if (itemdata.ManBtchNum == "Y" && batchNumber != "") {
        //trim extra batch number code from MG products
        if (itemdata.ItemCode.startsWith("MG")) {
          batchNumber = batchNumber.substring(0, batchNumber.length - 3);
        }
        this.batchService.getScanAvailableBatchNumber(this.Warehouse, itemdata.ItemCode).subscribe({
          next: (data: any) => {
            var found = false;
            for (var i = 0; i < data.length; i++) {
              if (data[i].BatchNum == batchNumber && found == false) {
                found = true;
                this.batchData = data[i];
              }
            }
            if (!found) {
              Swal.fire({ title: "Error!", text: "Unable to find Batch Number." });
            }
          },
          error: (error: any) => {
            Swal.fire({ title: "Error!", text: error.error });
          }
        });
      }
    } else {
      Swal.fire({ title: "Error!", text: "Please select warehouse to check batch" });
    }
  }

  clearText() {
    this.ScanText = "";
    this.form.value.ScanText = "";
    this.scanTextElement.nativeElement.focus();
  }

  resetForm() {
    this.ScanText = "";
    this.form.value.ScanText = "";
    this.itemData = null;
    this.batchData = null;
    this.scanTextElement.nativeElement.focus();
  }

  ngAfterViewInit() {
    this.scanTextElement.nativeElement.focus();
  }
}