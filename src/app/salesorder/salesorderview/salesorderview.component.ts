import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validator, ValidatorFn, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import { SalesOrderService } from "../../_services/salesorder.service";
import { PickListService } from "../../_services/picklist.service";
import { UserService } from "../../_services/user.service";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-salesorderview',
  templateUrl: './salesorderview.component.html',
  styleUrls: ['./salesorderview.component.css'],
  standalone:false
})

export class SalesOrderViewComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private salesorderservice: SalesOrderService,
    public pickListService: PickListService,
    public userService: UserService
  ) { }

  id!: number;
  data!: any;
  canSubmit = false;
  canCancel = false;
  canUndoSubmit = false;
  submittingBatch = false;
  SalesOrderRows = new MatTableDataSource<any>();
  SalesOrderRowColumns: string[] = ['DocEntry', 'LineNum', 'WhsCode', 'ItemCode', 'Dscription', 'CodeBars', 'Quantity'];
  SalesOrderRowBatches = new MatTableDataSource<any>();
  SalesOrderRowBatchesColumns: string[] = ['DocEntry', 'LineNum', 'WhsCode', 'ItemCode', 'Dscription', 'PickQty', 'BatchNumber', 'ExpiryDate'];
  PickListRows = new MatTableDataSource<any>();
  PickListRowColumns: string[] = ['ItemCode', 'Description', 'Whse', 'UOM', 'AvailQty', 'PickQty', 'PreviousQty'];
  PickListBatchRows = new MatTableDataSource<any>();
  PickListBatchRowsColumns: string[] = ['ItemCode', 'Description', 'Whse', 'PickQty', 'UOM', 'BatchNumber', 'ExpiryDate'];
  PickListStatusRows = new MatTableDataSource<any>();
  PickListStatusRowsColumns: string[] = ['Id', 'Status', 'CreatedBy', 'CreatedDate'];

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    if (isNaN(this.id) ) {  
      this.toastr.error("Unavailable Sales Order");
      this.router.navigate(['/salesorder']);
    }

    this.loadData();
    
  }

  loadData() {
    this.salesorderservice.getSalesOrderDetails(this.id).subscribe({
      next: (data) => {
        this.data = data;
        this.SalesOrderRows.data = data.SAPSalesOrder.Rows;
        this.SalesOrderRowBatches.data = data.SAPSalesOrderBatches;
        this.PickListRows.data = data.PickList.Lines;
        this.PickListBatchRows.data = data.PickListBatch;
        this.PickListStatusRows.data = data.PickList.StatusLogs;

        if (data.PickList.APIStatus == "3") {
          this.canSubmit = true;
        } else this.canSubmit = false;
        if (data.PickList.APIStatus == "1") {
          this.canCancel = true;
        } else this.canCancel = false;
        if (data.PickList.APIStatus == "4") {
          this.canUndoSubmit = true;
        } else this.canUndoSubmit = false;
      },
      error: (error) => {
        this.toastr.error("Unavailable Sales Order");
        this.router.navigate(['/salesorder']);
      }
    })
  }

  submitBatchNumbers() {
    this.canSubmit = false;
    this.submittingBatch = true;
    this.salesorderservice.submitBatchNumbers(this.id).subscribe({
      next: (data) => {        
        this.toastr.success("Successfully Updated SAP");
        this.router.navigate(['/salesorder']);
      },
      error: (error) => {
        this.submittingBatch = false;
        Swal.fire({ title: "Error!", text: error.error });
        this.loadData();
      }
    });
  }

  close() {
    this.router.navigate(['/salesorder']);
  }

  cancelSalesOrder() {
    this.salesorderservice.cancelSalesOrder(this.id).subscribe({
      next: (data: any) => {
        this.toastr.success("Sales Order Cancelled");
        this.loadData();
      },
      error: (error) => {
        this.toastr.error(error.error);
        this.loadData();
      }
    });
  }

  undoSubmitBatchNumbers() {
    this.salesorderservice.undoSubmitbatchNumbers(this.id).subscribe({
      next: (data: any) => {
        this.toastr.success("SAP Batch Assignments Removed");
        this.loadData();
      },
      error: (error) => {
        this.submittingBatch = false;
        Swal.fire({ title: "Error!", text: error.error });
        this.loadData();
      }
    });
  }
}

