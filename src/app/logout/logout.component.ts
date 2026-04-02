import { Component, OnInit } from "@angular/core";
import { AuthService } from "../_services/auth.service";

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    standalone: false
})

export class LogoutComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.logout().subscribe({
      next: res => {
        window.location.href = "/";
      },
      error: err => {
        //console.log(err);
      }
    });
  }

}
