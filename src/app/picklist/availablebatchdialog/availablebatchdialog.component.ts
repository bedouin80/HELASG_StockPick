import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { BatchNumberService } from "../../_services/batchnumber.service";
import { MatTableDataSource } from "@angular/material/table";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pickbatch-pickdialog',
  templateUrl: './availablebatchdialog.component.html',
  styleUrls: ['./availablebatchdialog.component.css'],
  standalone: false
})

export class AvailableBatchDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AvailableBatchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private batchNumberService: BatchNumberService
  ) { }

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['BatchNumber', 'ExpiryDate', 'InDate', 'Quantity', 'IsCommited'];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.batchNumberService.getAvailableBatchNumber(this.data.Whse, this.data.ItemCode).subscribe({
      next: (data: any) => {
        this.dataSource.data = data;
      },
      error: (error: any) => {
        if (error.status = 404) {
          Swal.fire({ title: "Error!", text: "Not Found" });
        }
        Swal.fire({ title: "Error!", text: error.error });
      }
    });
  }

  close() {
    this.dialogRef.close(this.data);
  }
}