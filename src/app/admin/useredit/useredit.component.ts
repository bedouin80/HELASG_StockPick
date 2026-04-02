import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { UserService } from "../../_services/user.service";
import { ActivatedRoute, Router} from "@angular/router";
import { ToastrService } from "ngx-toastr";
import Swal from 'sweetalert2';

@Component({
  selector:'app-user-edit',
  templateUrl: './useredit.component.html',
  styleUrls:['./useredit.component.css'],
  standalone:false
})

export class UserEditComponent implements OnInit {

  form: FormGroup = new FormGroup({
    Name: new FormControl(''),
    Username: new FormControl(''),
    Email: new FormControl(''),
    isEmailAsUserName: new FormControl(false),
    Password: new FormControl(''),
    confirmPassword: new FormControl(''),
    isAdmin: new FormControl(false),
    isCustomerService: new FormControl(false),
    isPickManager: new FormControl(false),
    isPicker: new FormControl(false),
    isActive: new FormControl(false)
  });

  submitted = false;
  submitting = false;
  id!: number;
  data!: any;

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    
    this.id = this.route.snapshot.params['id'];
    if (isNaN(this.id) ) {
      this.toastr.error("Unavailable User");
      this.router.navigate(['/user']);
    }

    //load data
    this.userService.getUser(this.id).subscribe({
      next: (data) => {
        this.data = data
        this.form = this.formBuilder.group({
          Name:[this.data.Name, Validators.required],
          Username:[{
            value:this.data.Username,
            disabled:true
          }, Validators.required],
          isAdmin: [this.data.isAdmin==1 ? true : false] ,
          isCustomerService: [this.data.isCustomerService==1 ? true : false],
          isPickManager: [this.data.isPickManager==1 ? true : false],
          isPicker: [this.data.isPicker==1 ? true : false],
          Email: [this.data.Email, Validators.email],
          Password: ['', [Validators.minLength(6), Validators.maxLength(40)]],
          confirmPassword: ['', [Validators.minLength(6)]],
          isActive: [this.data.isActive==1 ? true : false]
        }, {
          validators: [
            IntValidation.passwordMatchValidator()
          ]
        })
      },
      error: (error) => {
        this.toastr.error("Unavailable User");
        this.router.navigate(['/user']);
      }
    })

    
  }

  onSubmit() {
    this.submitted=true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.submitting=true;

    this.userService.updateUser(this.form.value, this.id)
      .subscribe({
        next: () => {
          this.toastr.success('User Updated Successfully');
          this.router.navigateByUrl('/user');
        },
        error: error => {
          if (error.status == 400 ){
            Swal.fire({
              title: "Error!",
              text: error.error,
              icon: "error"
            });
          }
          this.submitting = false;
        }
      })
  }

  Close() {
    this.router.navigate(['/user']);
  }
}

export class IntValidation {

  static passwordMatchValidator(): ValidatorFn {
    return (controls: AbstractControl) => {
      const control = controls.get("Password");
      const checkControl = controls.get("confirmPassword");

      if (checkControl?.errors && !checkControl.errors['matching']) {
        return null;
      }

      if (control?.value!= "" && control?.value != checkControl?.value) {
        controls.get("confirmPassword")?.setErrors({ matching: true });
        return { matching: true };
      } else {
        return null;
      }
    };
  }
}