import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';

import { MatTableDataSource } from "@angular/material/table";
import { UserService } from "../../_services/user.service";
import { User } from "../../models/user.model";

@Component({
    selector: 'app-user-list',
    templateUrl: './userlist.component.html',
    styleUrls: ['./userlist.component.css'],
    standalone: false
})

export class UserListComponent implements OnInit {

  user: User[] = [];

  public dataSource = new MatTableDataSource<User>();

  //column list: name,username,roles
  public displayedColumns: string[] = ['Name', 'Username', 'roles', 'isActive', 'action'];

  constructor(private userService: UserService, private router:Router) { }

  ngOnInit() {
    this.userService.getUserList().subscribe((res) => {
      this.dataSource.data = res;
      this.dataSource.data.forEach((user) => {
        var temparr = [];
        if (user.isAdmin) { temparr.push("Admin"); }
        if (user.isCustomerService) { temparr.push("Customer Service") }
        if (user.isPicker) { temparr.push("Picker") }
        if (user.isPickManager) { temparr.push("Pick Manager") }
        user.roles = temparr.toString();
      });
    })
  }

  gotoNew() {
    this.router.navigate(['/user/new']);
  }

  edituser(id:number) {
    this.router.navigate(['/user/edit/' + id]);
  }
}

