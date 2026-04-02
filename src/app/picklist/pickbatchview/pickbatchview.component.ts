import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validator, ValidatorFn, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import { PickListService } from "../../_services/picklist.service";
import { BatchNumberService } from "../../_services/batchnumber.service";
import { AvailableBatchDialogComponent } from "../availablebatchdialog/availablebatchdialog.component";
import { BatchWarningComponent } from "../../batch/batchwarning/batchwarning.component";
import { ItemService } from "../../_services/item.service";
import Swal from 'sweetalert2';
import { error } from "console";

@Component({
  selector: 'app-pickbatch-view',
  templateUrl: './pickbatchview.component.html',
  styleUrls: ['./pickbatchview.component.css'],
  standalone: false
})

export class PickBatchViewComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private picklistService: PickListService,
    private batchNumberService: BatchNumberService,
    private itemService: ItemService,
    private changeDetectorRefs: ChangeDetectorRef
  ) { }

  form: FormGroup = new FormGroup({
    requiredQuantity: new FormControl(''),
    ScanText: new FormControl(''),
    availBatchNumbers: new FormControl(''),
    availBatches: new FormArray([])
  });

  id!: number;
  data!: any;
  itemData!: any;
  submitted = false;
  submitting = false;
  availBatchData = new Array;
  ScanText!: string;
  batchSelected = "";
  isExport = false;

  @ViewChild('scantext') scanTextElement: any;

  get f() { return this.form.controls; }
  get t() { return this.f['availBatches'] as FormArray; }
  get batches() { return this.t.controls as FormGroup[]; }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    if (isNaN(this.id) ) {
      this.toastr.error("Unavailable Pick List");
      this.router.navigate(['/picklistwh']);
    }

    this.form = this.formBuilder.group({
      requiredQuantity: [''],
      ScanText: [''],
      availBatchNumbers: [''],
      availBatches: new FormArray([])
    }, {
      validator: [IntValidation.requiredQuantityValidator()]
    })
    this.loadData();
    this.scanTextElement.nativeElement.focus();
  }

  loadData() {
    this.picklistService.getPickListLineDetails(this.id).subscribe({
      next: (data) => {
        this.itemService.getSAPItem(data.ItemCode).subscribe({
          next: (itemdata: any) => {
            this.ScanText = "";
            this.data = data;
            this.itemData = itemdata;
            this.isExport = data.Series == 61 ? true : false;
            this.scanTextElement.nativeElement.focus();
          },
          error: (error: any) => {
            this.toastr.error("Unavailable Item");
            this.router.navigate(['/picklistwh']);
          }
        });
      },
      error: (error) => {
        this.toastr.error("Unavailable Pick List");
        this.router.navigate(['/picklistwh']);
      }
    })
  }

  ngAfterViewInit() {
    this.scanTextElement.nativeElement.focus();
  }

  addBatch() {
    var strBarcode = ""
    if (this.ScanText != "") {
      if (this.ScanText.startsWith("01") == true ||
        this.ScanText.startsWith("02") == true ||
        this.ScanText.startsWith("03") == true ||
        this.ScanText.startsWith("05") == true ||
        this.ScanText.startsWith("06") == true
      ) {
        strBarcode = this.ScanText;
      } else {
        Swal.fire({ title: "Error!", text: "Barcode Incorrect format" });
      }
    }

    if (strBarcode != "") {

      var expiryDate: string = "";
      var batchNumber: string = "";
      var BarItemCode: string = "";
      var itemCode: string = "";

      if (strBarcode.indexOf("01") == 0) {
        BarItemCode = strBarcode.substring(2, 16);
        if (strBarcode.substring(16, 18) == "10") {
          batchNumber = strBarcode.substring(18, strBarcode.length);
          expiryDate = "";
        } else {
          expiryDate = strBarcode.substring(18, 24);
          batchNumber = strBarcode.substring(26, strBarcode.length);
        }
      } else if (strBarcode.indexOf("02") == 0) {
        BarItemCode = strBarcode.substring(2, 12);
        expiryDate = strBarcode.substring(14, 20);
        batchNumber = strBarcode.substring(22, strBarcode.length);
      } else if (strBarcode.indexOf("03") == 0) {
        BarItemCode = strBarcode.substring(2, 17);
        expiryDate = strBarcode.substring(19, 25);
        batchNumber = strBarcode.substring(27, strBarcode.length);
      } else if (strBarcode.indexOf("05") == 0 || strBarcode.indexOf("06") == 0) {
        BarItemCode = strBarcode.substring(2, strBarcode.length);
      } 
        
      //check if barcode matches
      if (BarItemCode.indexOf(this.itemData.CodeBars) > -1 ||
        BarItemCode.indexOf(this.itemData.CodeBars2) > -1 ||
        BarItemCode.indexOf(this.itemData.CodeBars3) > -1 ||
            BarItemCode.indexOf(this.data.ItemCode) > -1) {

        //check duplicate
        var checkdup = false;
        this.form.value.availBatches.forEach((item: any) => {
          if (item.BatchNumber == batchNumber) {
            checkdup = true;
          }
        });

        if (checkdup == false) {

          if (this.data.IsBatch == "Y") {
            //check if expiry date and batch number exist
            this.batchNumberService.getScanAvailableBatchNumber(
              this.data.Whse, this.data.ItemCode
            ).subscribe({
              next: (data: any) => {

                if (data.length > 0) {

                  this.availBatchData = data;

                  //check if batchnumber is found
                  var recordFound = false;
                  var recordCount = 0;

                  data.forEach((item: any) => {
                    //if (item.batchNum.indexOf(batchNumber) > -1) {
                    if (batchNumber.indexOf(item.BatchNum) > -1) {
                      recordFound = true;
                      const batchForm = this.formBuilder.group({
                        recordRow: [recordCount],
                        batchNumber: [item.BatchNum],
                        expirydate: [item.ExpDate],
                        availquantity: [item.Quantity - item.IsCommited],
                        pickquantity: ['', [Validators.pattern(/^\d+$/), IntValidation.pickBatchQtyOverValidator()]],
                        palletNo: [''],
                        boxNo: ['']
                      });
                      this.t.push(batchForm);
                      this.batchSelected = this.batchSelected + recordCount + ",";
                    }
                    recordCount++;
                  });

                  if (recordFound) {
                    this.form.value.ScanText = "";
                    this.ScanText = "";
                    this.submitting = true;

                  } else {
                    Swal.fire({ title: "Error!", text: "Batch Number not found." });
                    this.scanTextElement.nativeElement.focus();
                  }
                } else {
                  Swal.fire({ title: "Error!", text: "No Batch Number for this Item." });
                  this.scanTextElement.nativeElement.focus();
                }
              },
              error: (error: any) => {
                if (error.statusCode == "404") {
                  Swal.fire({ title: "Error!", text: "No Batch Number for this Item." });
                  this.scanTextElement.nativeElement.focus();
                } else {
                  Swal.fire({ title: "Error!", text: error.error });
                  this.scanTextElement.nativeElement.focus();
                }
              }
            })
          } else {
            //check for current available stock
            this.itemService.getSAPItemInventoryStatusByWhse(
              this.data.ItemCode, this.data.Whse,
            ).subscribe({
              next: (data: any) => {
                this.availBatchData = data;

                //check if batchnumber is found
                var recordFound = false;
                var recordCount = 0;

                data.forEach((item: any) => {
                  recordFound = true;
                  const batchForm = this.formBuilder.group({
                    recordRow: [recordCount],
                    batchNumber: "",
                    expirydate: "",
                    availquantity: item.OnHand - item.IsCommited + this.data.AvailQty,
                    pickquantity: ['', [Validators.pattern(/^\d+$/), IntValidation.pickBatchQtyOverValidator()]],
                    palletNo: [''],
                    boxNo: ['']
                  });
                  this.t.push(batchForm);
                  this.batchSelected = this.batchSelected + recordCount + ",";
                  recordCount++;
                });

                if (recordFound) {
                  this.form.value.ScanText = "";
                  this.ScanText = "";
                  this.submitting = true;

                } else {
                  Swal.fire({ title: "Error!", text: "Batch Number not found." });
                  this.scanTextElement.nativeElement.focus();
                 }

              },
              error: (error: any) => {
                if (error.statusCode == "404") {
                  Swal.fire({ title: "Error!", text: "No Inventory Status for this Item." });
                  this.scanTextElement.nativeElement.focus();
                } else {
                  Swal.fire({ title: "Error!", text: error.error });
                  this.scanTextElement.nativeElement.focus();
                }
              }
            });
          }
          
        } else {
          Swal.fire({ title: "Error!", text: "Batch Number already added." });
          this.scanTextElement.nativeElement.focus();
        }
      } else {
        Swal.fire({ title: "Error!", text: "Barcode not found or incorrect." });
        this.scanTextElement.nativeElement.focus();
      }
    }
    return false;
  }

  cleartext() {
    this.form.value.ScanText = "";
    this.ScanText = "";
    this.scanTextElement.nativeElement.focus();
  }

  removeBatch(element:any) {
    //find batch
    for (var i = 0; i < this.t.length; i++) {
      let item: any = this.t.at(i);
      if (item.controls.batchNumber.value == element.value.batchNumber) {
        this.batchSelected = this.batchSelected.replace(item.controls.recordRow.value + ",", "");
        this.t.removeAt(i);
        
      }
    }

    if (this.t.length == 0) {
      this.submitting = false;
    }
  }

  submitBatch() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.submitting = false;

    if (this.t.length > 0) {

      //check total quantity
      var totalqty = 0;
      for (var i = 0; i < this.t.length; i++) {
        let item: any = this.t.at(i);
        if (item.controls.pickquantity.value != "") {
          totalqty += Number.parseInt(item.controls.pickquantity.value);
        }
      }

      if (totalqty > 0) {
        var batchList: { batchNumber: string, quantity: number }[] = [];
        this.form.value.availBatches.forEach((item: any) => {
          batchList.push({
            batchNumber: item.batchNumber,
            quantity: parseFloat(item.pickquantity)
          })
        })

        var BatchWarning: number = 1;
        if (this.batchSelected.indexOf("0,") == 0) { BatchWarning = 0; }
        this.batchSelected = "(Mobile) - " + this.batchSelected;

        this.batchNumberService.submitQtySelection(
          this.data.Id,JSON.stringify(this.availBatchData),this.batchSelected,BatchWarning,batchList)
          .subscribe({
            next: (data) => {
              this.submitting = false;
              this.router.navigate(['/picklist/view/' + this.data.PickListId]);
            },
            error: (error) => {
              this.submitting = true;
              Swal.fire({ title: "Error!", text: error.error });
            }
          });
      } else {
        this.submitting = true;
        Swal.fire({ title: "Error!", text: "Please enter quantity." });
      }
    } else {
      this.submitting = true;
      Swal.fire({ title: "Error!", text: "Please add a batch number." });
    }
  }

  viewBatches() {
    let dialog = this.dialog.open(AvailableBatchDialogComponent, {
      width: '750px',
      // Can be closed only by clicking the close button
      disableClose: true,
      data: this.data
    });
  }

  close() {
    this.router.navigate(['/picklist/view/' + this.data.PickListId]);
  }
}

export class IntValidation {

  static pickBatchQtyOverValidator(): ValidatorFn {
    return (controls: AbstractControl) => {
      const checkControl = controls;
      const control = controls.parent?.get("availquantity");

      if (checkControl?.errors &&
        (!checkControl.errors['reqQtyLess'] || !checkControl.errors['reqQtyMore'])) {
        return null;
      }

      if (checkControl?.value > control?.value) {
        controls.get("pickquantity")?.setErrors({ pickOver: true });
        return { pickOver: true };
      } else {
        return null;
      }
    }
  }

  static requiredQuantityValidator(): ValidatorFn {
    return (controls: AbstractControl) => {
      const checkControl = controls.get('requiredQuantity');
      //const checkControl = controls;
      const reqQty = checkControl?.value;

      if (checkControl?.errors &&
        (!checkControl.errors['reqQtyLess'] && !checkControl.errors['reqQtyMore'])) {
        return null;
      }

      var totalPickedQty = 0;
      var availBatches = controls.get("availBatches") as FormArray;
      availBatches.controls.forEach((item) => {
        totalPickedQty += parseInt(item.get("pickquantity")?.value);
      });

      if (totalPickedQty < reqQty) {
        controls.get("requiredQuantity")?.setErrors({ reqQtyLess: true });
        return { reqQtyLess: true }
      } else if (totalPickedQty > reqQty) {
        controls.get("requiredQuantity")?.setErrors({ reqQtyMore: true });
        return { reqQtyMore: true }
      } else {
        controls.get("requiredQuantity")?.setErrors(null);
        return null;
      }

    }
  }
}

