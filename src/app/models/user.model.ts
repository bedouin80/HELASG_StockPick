export interface User {
  Id: number;
  Username: string;
  Name: string;
  Email: string;
  Password?: string;
  isAdmin: boolean;
  isCustomerService: boolean;
  isPicker: boolean;
  isPickManager: boolean;
  roles: string;
  isActive:boolean;
}
