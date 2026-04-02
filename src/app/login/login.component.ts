import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../_services/auth.service';
import { StorageService } from '../_services/storage.service';
import { UserService } from '../_services/user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})

export class LoginComponent implements OnInit {

  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private userService: UserService
  ) { }
  
  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.roles = this.storageService.getUser().roles;
    }
  }

  onSubmit(): void {
    const { username, password } = this.form;

    this.authService.login(username, password).subscribe({
      next: data => {
        this.isLoginFailed = false;
        this.isLoggedIn = true;

        //check for username object
        let userStoreText =
          this.storageService.getUserStore(this.storageService.getToken().userguid);
        if (userStoreText == null || userStoreText == "") {
          this.userService.getUserNames(data.userguid).subscribe({
            next: (userdata: any) => {
              this.storageService.saveUserStore(userdata);
              //this.reloadPage();
              window.location.href = "/"
            }
          });
        }

        
      },
      error: err => {
        this.errorMessage = err.error;
        this.isLoginFailed = true;
      }
    });
  }

  reloadPage(): void {
    window.location.reload();
  }
}
