import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { User } from "../models/user.model"
import * as bcrypt from 'bcryptjs';
import { StorageService } from "../_services/storage.service";

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})

export class UserService {

  private baseUrl;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') baseUrl: string,
    private storageService: StorageService)
  {
    this.baseUrl = baseUrl;
    //this.baseUrl = "http://192.168.1.242:7130/";
  }

  getUser(id: number): Observable<any> {
    return this.http.get(this.baseUrl + 'api/users/' + id, httpOptions);
  }

  getUserList(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl + 'api/users', httpOptions);
  }

  saveUser(user: any): Observable<any> {
    user.Password = bcrypt.hashSync(user.Password);
    user.confirmPassword = bcrypt.hashSync(user.confirmPassword);
    return this.http.post(this.baseUrl + 'api/users', JSON.stringify(user), httpOptions);
  }

  updateUser(user: User, userid: number): Observable<any> {
    if (user.Password=="") {
      delete user.Password
    } else if (user.Password !== undefined) {
      user.Password = bcrypt.hashSync(user.Password);
    }
    return this.http.post(this.baseUrl + 'api/users/' + userid, JSON.stringify(user), httpOptions);
  }

  updateUserPW(password: string): Observable<any> {
    return this.getUser(this.storageService.getUser().id).pipe(
      switchMap((userData: any) => {
        userData.password = bcrypt.hashSync(password);
        return this.http.put(this.baseUrl + "api/users/" + userData.id, JSON.stringify(userData), httpOptions);  
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getUserNames(guid: string): Observable<any> {
    return this.http.get(this.baseUrl + "api/usersummary/" + guid, httpOptions);
  }

  getUserName(id: number): string | null {
    //check user store
    let userStoreText = this.storageService.getUserStore(this.storageService.getToken().userguid);
    if (userStoreText != null) {
      return this.storageService.getUserName(id, userStoreText);
    } 
    return null;
  }
}
