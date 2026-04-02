import { Component, OnInit } from '@angular/core';
import { StorageService } from '../_services/storage.service';
import { AuthService } from '../_services/auth.service';

@Component({
    selector: 'app-nav-menu',
    templateUrl: './nav-menu.component.html',
    styleUrls: ['./nav-menu.component.css'],
    standalone: false
})

export class NavMenuComponent implements OnInit {

  isExpanded = false;
  isLoggedIn = false;
  username: string = "";
  isAdmin = false;
  isCustomerService = false; 
  isPickManager = false;
  isPicker = false;

  constructor(private storageService: StorageService, private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {

      var user = this.storageService.getUser();
     
      this.username = user.Name;
      this.isAdmin = user.isAdmin;
      this.isCustomerService = user.isCustomerService;
      this.isPickManager = user.isPickManager;
      this.isPicker = user.isPicker;

      //this.roles = user.roles;
      //this.showAdminBoard = this.roles.includes('ROLE_ADMIN');
      //this.showModeratorBoard = this.roles.includes('ROLE_MODERATOR');

    }
  }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
