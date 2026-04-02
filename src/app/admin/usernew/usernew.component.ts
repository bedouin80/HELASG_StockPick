import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserService } from "../../_services/user.service";
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-new',
  templateUrl: './usernew.component.html',
  styleUrls: ['./usernew.component.css'],
  standalone: false
})

export class UserNewComponent implements OnInit {

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

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      Name: ['', Validators.required],
      Username: ['', [Validators.required,Validators.minLength(3), Validators.maxLength(20)]],
      Email: ['', Validators.email],
      Password: ['', [Validators.minLength(6), Validators.maxLength(40)]],
      confirmPassword: ['', [Validators.minLength(6)]],
      isAdmin: [false],
      isCustomerService: [false],
      isPickManager: [false],
      isPicker: [false],
      isActive: [true]
    }, {
      validators: [
        IntValidation.passwordMatchValidator()
      ]
    })
  }

  onSubmit() {

    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    this.submitting = true;

    this.userService.saveUser(this.form.value)
      .subscribe({
        next: () => {
          this.toastr.success('User Created Successfully');
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

  onReset(): void {
    this.submitted = false;
    this.form.reset();
  }

}

export class IntValidation {

  static passwordMatchValidator(): ValidatorFn {
    return (controls: AbstractControl) => {
      const control = controls.get("Password");
      const checkControl = controls.get("confirmPassword");
      const isPicker = controls.get("isPicker");

      if (checkControl?.errors && !checkControl.errors['matching']) {
        return null;
      }

      if (isPicker && control?.value != checkControl?.value) {
        controls.get("confirmPassword")?.setErrors({ matching: true });
        return { matching: true };
      } else {
        return null;
      }
    };
  }
}


