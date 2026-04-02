import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { Router } from "@angular/router";
import { SalesOrderService } from "../../_services/salesorder.service";
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-picklist-import',
  templateUrl: './picklistimport.component.html',
  styleUrls: ['./picklistimport.component.css'],
  standalone: false
})

export class PickListImportComponent implements OnInit {

  form: FormGroup = new FormGroup({
      PicklistNo: new FormControl('')
  });

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  constructor(
    private formBuilder: FormBuilder,
    private salesOrderService: SalesOrderService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      PicklistNo: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
    })
  }

  public dataSource = new MatTableDataSource<any>();
  public displayedColumns: string[] = [
    'dscription', 'itemCode', 'quantity', 'unitMsr', 'whsCode','expDate'
  ];

  Cansubmit = false;
  submitted = false;
  submitting = false;
  retrievingdata = false;
  picklist: any = {};
  picklistitem: any = {};

  VerifyPickList() {

    //clear current data
    this.picklist = {};
    this.picklistitem = {};
    this.dataSource.data = this.picklistitem;
    this.Cansubmit = false;
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    //load pick list form
    this.retrievingdata = true;

    this.salesOrderService.checkimport(this.form.controls["PicklistNo"].value)
      .subscribe({
        next: (data) => {
          this.Cansubmit = true;
          this.retrievingdata = false;

          // data binding
          this.picklist = data;
          var Expire90Day = false;
          var Expire180Day = false;
          var HotelManufCustomer = false;

          //check if customer from Hotel or Manufacturing
          if (this.picklist.CardCode.startsWith("CHT") || this.picklist.CardCode.startsWith("CMF")) {
            HotelManufCustomer = true;
          } 

          //check expiry date
          for (var i = 0; i < this.picklist.Rows.length; i++) {
            if (this.picklist.Rows[i].ExpiryDate != null) {
              this.picklist.Rows[i].Expiryday = Math.round((Date.parse(this.picklist.Rows[i].ExpiryDate) - Date.now()) / (1000 * 60 * 60 * 24));
              this.picklist.Rows[i].ExpiryDate =
                new Date(this.picklist.Rows[i].ExpiryDate).toISOString().split("T")[0] +
                " (" + this.picklist.Rows[i].Expiryday + " days)";
              if (this.picklist.Rows[i].Expiryday <= 90) { Expire90Day = true; }
              if (this.picklist.Rows[i].Expiryday <= 180) { Expire180Day = true; }
            } else { this.picklist.Rows[i].Expiryday = 999; this.picklist.Rows[i].ExpiryDate = ""}
          }
          this.dataSource.data = this.picklist.Rows;
          if (Expire180Day && HotelManufCustomer) {
            Swal.fire({
              title: "Warning!",
              text: "Customer from Hotel or Manufacturing. Items imported has Expiry Date Lesser than 180 Days.",
              icon: "warning"
            });
          }
          else if (Expire90Day) {
            Swal.fire({
              title: "Warning!",
              text: "Items imported has Expiry Date Lesser than 90 Days.",
              icon: "warning"
            });
          }
        },
        error: error => {
          if (error.status == 404) {
            this.form.controls["PicklistNo"].setErrors({
              invalid: true,
              message: "Not Found"
            });
          }
          else {
            this.form.controls["PicklistNo"].setErrors({
              invalid: true,
              message: error.error
            });
          }
          this.retrievingdata = false;
        }
      });
  }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;

    this.salesOrderService.importSAP(this.form.controls["PicklistNo"].value)
      .subscribe({
        next: (data) => {
          this.toastr.success('SAP Sales Order Imported Successfully');
          this.router.navigateByUrl('/salesorder');
        },
        error: error => {

          //clear picklist display data
          this.picklist = {};
          this.picklistitem = {};
          this.dataSource.data = this.picklistitem;
          this.Cansubmit = false;

          if (error.status == 404) {
            this.form.controls["PicklistNo"].setErrors({
              invalid: true,
              message: "Not Found"
            });
          }
          else {
            this.form.controls["PicklistNo"].setErrors({
              invalid: true,
              message: error.error
            });
          }

          this.submitting = false;
        }
      });
  }

}
