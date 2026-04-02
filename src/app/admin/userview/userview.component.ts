import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../_services/user.service';
import { ToastrService } from 'ngx-toastr';
import { last } from 'rxjs';

@Component({
  selector: 'app-userview',
  standalone: false,
  templateUrl: './userview.component.html',
  styleUrl: './userview.component.css'
})

export class UserviewComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService
  ) {

  }

  id!: number;
  data!: any;

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
      },
      error: (error) => {
        this.toastr.error("Unavailable User");
        this.router.navigate(['/user']);
      }
    })
  }

  close() {
    this.router.navigate(['/user']);
  }

}
