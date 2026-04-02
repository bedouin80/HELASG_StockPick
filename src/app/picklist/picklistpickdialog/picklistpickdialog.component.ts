import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validator, ValidatorFn, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { BatchNumberService } from "../../_services/batchnumber.service";

@Component({
  selector: 'app-picklist-pickdialog',
  templateUrl: './picklistpickdialog.component.html',
  styleUrls: ['./picklistpickdialog.component.css'],
  standalone: false
})

export class PickListPickDialogComponent implements OnInit {

  form: FormGroup = new FormGroup({
    requiredQuantity: new FormControl(''),
    availBatchNumbers: new FormControl(''),
    availBatches: new FormArray([])
  });

  submitted = false;
  submitting = false;
  availBatchData = new Array;

  get f() { return this.form.controls; }
  get t() { return this.f['availBatches'] as FormArray; }
  get batches() { return this.t.controls as FormGroup[]; }

  constructor(
    public dialogRef: MatDialogRef<PickListPickDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private batchNumberService: BatchNumberService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      isBatch:[''],
      requiredQuantity: [''],
      availBatchNumbers: [''],
      picksinglequantity: ['', [Validators.pattern(/^\d+$/), IntValidation.pickBatchQtyOverValidator()]],
      availBatches: new FormArray([])
    }, {
      validator: [IntValidation.requiredQuantityValidator()]
    })

    this.loadBatch();

  }

  loadBatch() {

    //get available batch number and quantity
    this.batchNumberService.getAvailableBatchNumber(this.data.Whse,this.data.ItemCode).subscribe({
      next: (data) => {
        this.availBatchData = data;
        this.t.clear();
        data.forEach((item: any) => {
          const batchForm = this.formBuilder.group({
            selbatchNumber: [false],
            batchNumber: [item.BatchNum],
            expirydate: [item.ExpDate],
            availquantity: [item.Quantity - item.IsCommited],
            pickquantity: ['', [Validators.pattern(/^\d+$/), IntValidation.pickBatchQtyOverValidator()]]
          });
          this.t.push(batchForm);
        });
      }
    });
  }

  pick() {

    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;

    if (this.data.IsBatch == "Y") {
      //check if stock is still available
      var batchList: { batchNumber: string, quantity: number }[] = [];

      var BatchSelection: string = "";
      var BatchCounter: number = 0;
      var BatchWarning: number = 1;
      this.form.value.availBatches.forEach((item: any) => {
        if (item.selbatchNumber) {
          BatchSelection = BatchSelection.concat(BatchCounter + ",");
          batchList.push({
            batchNumber: item.batchNumber,
            quantity: parseFloat(item.pickquantity)
          })
        }
        BatchCounter++;
      })

      if (BatchSelection.indexOf("0,") == 0) { BatchWarning = 0; }
      BatchSelection = "(Form) - " + BatchSelection;

      this.batchNumberService.checkQty(this.data.Id, batchList).subscribe({
        next: (chkdata) => {
          this.batchNumberService.submitQtySelection(
            this.data.Id, JSON.stringify(this.availBatchData), BatchSelection, BatchWarning, batchList).subscribe({
            next: (data) => {
              this.submitting = false;
              this.dialogRef.close(this.data);
            },
            error: (error) => {
              this.submitting = false;
              this.dialogRef.close(this.data);
            }
          });
        },
        error: (chkerror) => {
          this.submitting = false;
          this.loadBatch();
        }
      });
    } else {
      var batchList: { batchNumber: string, quantity: number }[] = [];
      batchList.push({
        batchNumber: "",
        quantity: parseFloat(this.form.value.picksinglequantity)
      });
      this.batchNumberService.submitQty(
        this.data.Id, batchList).subscribe({
        next: (data) => {
          this.submitting = false;
          this.dialogRef.close(this.data);
        },
        error: (error) => {
          this.submitting = false;
          this.dialogRef.close(this.data);
        }
      });
    }
    
  }

  close() {
    this.submitting = false;
    this.submitted = false;
    this.dialogRef.close()
  }

  report() {

  }
}

export class IntValidation {

  static pickBatchQtyOverValidator(): ValidatorFn {
    return (controls: AbstractControl) => {
      const checkControl = controls;
      const control = controls.parent?.get("availquantity");

      if (checkControl?.errors &&
        (!checkControl.errors['reqQtyLess'] || !checkControl.errors['reqQtyMore'] || !checkControl.errors['earlyBatch'])) {
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
      const reqQty = checkControl?.value;

      if (checkControl?.errors &&
        (!checkControl.errors['reqQtyLess'] && !checkControl.errors['reqQtyMore'] && !checkControl.errors['earlyBatch'])) {
        return null;
      }

      var totalPickedQty = 0;
      var availBatches = controls.get("availBatches") as FormArray;
      var rowCount = 0;
      var earlierBatchNotSelected = false;
      var remRequired = controls.get('requiredQuantity')?.value;
      var isBatch = controls.get('isBatch')?.value;

      if (isBatch == "Y") {
        availBatches.controls.forEach((item) => {
          if (item.get("availquantity")?.value <= remRequired) {
            if (item.get("selbatchNumber")?.value != true) {
              //earlierBatchNotSelected = true;
            } else if (item.get("pickquantity")?.value < remRequired) {
              if (item.get("availquantity")?.value != item.get("availquantity")?.value) {
                //earlierBatchNotSelected = true;
              }
            }
          }
          else {
            if (remRequired != 0) {
              if (item.get("selbatchNumber")?.value != true) {
                //earlierBatchNotSelected = true;
              } else if (item.get("pickquantity")?.value < remRequired) {
                if (item.get("availquantity")?.value != item.get("availquantity")?.value) {
                  //earlierBatchNotSelected = true;
                }
              }
            }
          }

          if (item.get("selbatchNumber")?.value == true) {
            totalPickedQty += parseInt(item.get("pickquantity")?.value);
            remRequired -= parseInt(item.get("pickquantity")?.value);
          }

        });
      } else {
        totalPickedQty = parseInt(controls.get("picksinglequantity")?.value)
      }

      if (earlierBatchNotSelected) {
        controls.get("requiredQuantity")?.setErrors({ earlyBatch: true });
        return { earlyBatch: true }
      } else {
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
}
