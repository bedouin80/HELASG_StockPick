import Swal from 'sweetalert2';
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ItemService } from '../../_services/item.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-itemdetail-view',
  templateUrl: './itemdetailview.component.html',
  styleUrls: ['./itemdetailview.component.css'],
  standalone: false
})

export class ItemDetailViewComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private itemService: ItemService
  ) { }

  form: FormGroup = new FormGroup({
    itemCode: new FormControl(''),
    CodeBars: new FormControl(''),
    CodeBars2: new FormControl(''),
    CodeBars3: new FormControl(''),
    RackLocation: new FormControl('')
  });

  get f() { return this.form.controls }

  itemCode!: string;
  CodeBars!: string;
  CodeBars2!: string;
  CodeBars3!: string;
  RackLocation!: string;
  itemData!: any;

  ngOnInit() {

    if (this.route.snapshot.queryParams['itemCode'] !== undefined) {
      this.itemCode = this.route.snapshot.queryParams['itemCode'];
    }

    this.form = this.formBuilder.group({
      itemCode: [''],
      CodeBars: [''],
      CodeBars2: [''],
      CodeBars3: [''],
      RackLocation: ['']
    });

    if (this.route.snapshot.queryParams['itemCode'] !== undefined) {
      this.checkitem();
    }
  }

  checkitem() {
    if (this.itemCode === undefined || this.itemCode=="" ) {
      this.itemCode = this.form.controls['itemCode'].value;
    }

    if (this.itemCode != "" && this.itemCode!=null) {
      this.itemService.getSAPItem(this.itemCode).subscribe({
        next: (data: any) => {
          this.itemData = data;
          this.form.setValue({
            "itemCode": this.itemCode,
            "CodeBars": data.CodeBars,
            "CodeBars2":data.CodeBars2,
            "CodeBars3":data.CodeBars3,
            "RackLocation":data.RackLocation
          });
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

  submitData() {
    this.itemData.CodeBars = this.form.controls['CodeBars'].value;
    this.itemData.CodeBars2 = this.form.controls['CodeBars2'].value;
    this.itemData.CodeBars3 = this.form.controls['CodeBars3'].value;
    this.itemData.RackLocation = this.form.controls['RackLocation'].value;
    this.itemService.updateSAPItem(this.itemData.Id, this.itemData).subscribe({
      next: (data: any) => {
        Swal.fire({ title: "Success", text: "Item Details Updated.", icon:'success' });
      },
      error: (error: any) => {
        Swal.fire({ title: "Error!", text: error.error });
      }
    });
  }

  resetForm() {
    this.itemCode = "";
    this.form.setValue({
      "itemCode": '',
      "CodeBars": '',
      "CodeBars2": '',
      "CodeBars3": '',
      "RackLocation": ''
    });
    this.itemData = null;
  }
}