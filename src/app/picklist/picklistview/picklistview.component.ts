import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import { PickListService } from "../../_services/picklist.service";
import { StorageService } from '../../_services/storage.service';
import { PickListPickDialogComponent } from '../picklistpickdialog/picklistpickdialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-picklist-view',
  templateUrl: './picklistview.component.html',
  styleUrls: ['./picklistview.component.css'],
  standalone: false
})

export class PickListViewComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private picklistService: PickListService,
    private dialog: MatDialog,
    private storageService: StorageService,
    private changeDetectorRefs: ChangeDetectorRef
  ) { }

  id!: number;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['Description', 'ItemCode', 'quantity', 'Action'];
  canComplete = false;
  canUnlock = false;

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    if (isNaN(this.id) ) {
      this.toastr.error("Unavailable Pick List");
      this.router.navigate(['/picklistwh']);
    }

    this.loadData();
  }

  loadData() {
    this.picklistService.getPickListDetails(this.id).subscribe({
      next: (data) => {
        this.dataSource.data = data.Lines

        //check if complete
        var pickcount = 0, updateRequired = 0;
        data.Lines.forEach((item: any) => {
          if (item.AvailQty == item.PickQty) { pickcount++; }
          if (item.PreviousQty != 0) { updateRequired++; }
        });

        if (data.APIStatus == "2" && updateRequired == 0 && pickcount == data.Lines.length) {
          this.canComplete = true
        } else { this.canComplete = false; }

        //check if unlock
        if (data.APIStatus == "3") {
          this.canUnlock = true;
        } else { this.canUnlock = false; }

        this.changeDetectorRefs.detectChanges();
      },
      error: (error) => {
        this.toastr.error("Unavailable Pick List");
        this.router.navigate(['/picklistwh']);
      }
    })
  }

  disableButton(element: any) {
    if (element.pickedBy != null) {
      //disable button if PickQty == AvailQty
      //if (element.pickQty == element.availQty) {
      //disable if picklist is completed
      if (this.canUnlock) { 
        return true;
      } else { return false; }
    }
    return false;
  }

  pickBatch(element: any) {
    var user = this.storageService.getUser();

    if (user.isCustomerService || user.isAdmin) {
      let dialog = this.dialog.open(PickListPickDialogComponent, {
        width: '750px',
        // Can be closed only by clicking the close button
        disableClose: true,
        data: element
      });
      dialog.afterClosed().subscribe(
        data => {
          this.loadData();
        }
      );
    } else {
      this.router.navigate(['/pickbatch/' + element.Id]);
    }
  }

  complete() {
    this.picklistService.completePickList(this.id).subscribe({
      next: (data) => {
        this.loadData();
      },
      error: (error) => {
        Swal.fire({ title: "Error!", text: error.error });
      }
    });
  }

  unlock() {
    this.picklistService.unlockPickList(this.id).subscribe({
      next: (data) => {
        this.loadData();
      },
      error: (error) => {
        Swal.fire({ title: "Error!", text: error.error });
      }
    });
  }

  close() {
    this.router.navigate(['/picklistwh']);
  }
}
