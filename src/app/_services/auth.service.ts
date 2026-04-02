import { EventEmitter, Inject, Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { UserService } from "./user.service"

//const AUTH_API = 'http://localhost:8080/api/auth/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private baseUrl = "";
  storageService: any;
  userService: any;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') baseUrl: string,
    storageService: StorageService,
    userService: UserService
  ) {
    this.storageService = storageService;
    this.userService = userService;
    this.baseUrl = baseUrl;
    //this.baseUrl = "http://192.168.1.242:7130/";
  }

  login(username: string, password: string): Observable<any> {

    return new Observable((subscriber) => {
      this.http.post<any>(
        this.baseUrl + 'api/token', {
        username,
        password,
      },
        httpOptions
      ).subscribe({
        next: data => {
          this.session().subscribe((data: any) => {
            this.storageService.saveToken(data);
            this.userService.getUser(data.userid).subscribe((userdata: any) => {
              this.storageService.saveUser(userdata);
              subscriber.next(data);
            });
          })
        },
        error: err => {
          subscriber.error(err);
        }
      })
    });
  }

  session(): Observable<any> {
    return this.http.get(this.baseUrl+"api/token",httpOptions);
  }

  checklogin(): Observable<any> {
    return this.http.head(this.baseUrl+"api/token", httpOptions);
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(
      this.baseUrl + 'signup',
      {
        username,
        email,
        password,
      },
      httpOptions
    );
  }

  logout(): Observable<any> {
    return new Observable((subscriber) => {
      this.http.delete<any>(
        this.baseUrl + 'api/token', httpOptions
      ).subscribe(data => {
        this.storageService.clean();
        subscriber.next(data);
      }, () => subscriber.error())
    });
  }

  refreshtoken(): Observable<any> {
    return new Observable((subscriber) => {
      if (this.isLoggedIn()) {
        var token = this.storageService.getToken();
        this.http.post<any>(
          this.baseUrl + 'api/token/refresh', {
            refreshToken: token.refreshToken,  
          }, httpOptions
        ).subscribe({
          next: data => {
            this.session().subscribe((data: any) => {
              this.storageService.saveToken(data);
              //check for username object
              let userStoreText = this.storageService.getUserStore(token.userguid);
              if (userStoreText == null) {
                this.userService.getUserNames(token.userguid).subscribe({
                  next: (userdata:any) => {
                    this.storageService.saveUserStore(userdata);
                  }
                });
              }
              subscriber.next(data);
            })
          },
          error: err => {
            subscriber.error(err);
          }
        })
      } else {
        window.location.href = "/";
      }
    });
  }

  isLoggedIn(): boolean {
    const token = this.storageService.getToken();
    if (!token) {
      return false;
    }
    const user = this.storageService.getUser();
    if (!user) {
      return false;
    }
    return true;
  }
}
