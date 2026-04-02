import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from 'ngx-toastr';
import { BatchNumberService } from "../../_services/batchnumber.service";
import { StorageService } from '../../_services/storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-batchwarning',
  templateUrl: './batchwarning.component.html',
  styleUrls: ['./batchwarning.component.css'],
  standalone: false
})

export class BatchWarningComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private batchNumberService: BatchNumberService,
    private dialog: MatDialog,
    private storageService: StorageService
  ) { }

  id!: number;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['SalesOrderNo', 'PartnerName', 'ItemCode', 'Description', 'batchselect','pickedDate','Action'];
  canComplete = false;
  canUnlock = false;
  showCurrent: boolean = true;
  isLoading = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {

    let ServiceQuery;

    this.isLoading = true;
    if (this.showCurrent) {
      ServiceQuery = this.batchNumberService.getBatchWarning();
    } else {
      ServiceQuery = this.batchNumberService.getBatchWarningPrevious();
    }

    ServiceQuery.subscribe({
      next: (data:any) => {
        this.dataSource.data = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        Swal.fire({ title: "Error!", text: error.error });
      }
    })
  }

  view(id: number) {
    this.router.navigate(['/batchwarning/view/' + id]);
  }

  gotoToggleData() {
    this.showCurrent = !this.showCurrent
    this.loadData();
  }
}
