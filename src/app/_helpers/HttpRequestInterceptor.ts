import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, switchMap, throwError } from "rxjs";
import { StorageService } from "../_services/storage.service";
import { AuthService } from "../_services/auth.service";

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private storageService: StorageService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    req = req.clone({
      withCredentials: true,
    });
    
    return next.handle(req).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          !req.url.includes('auth/signin') &&
          error.status === 401
        ) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {

    if (this.authService.isLoggedIn()) {
      
      return this.authService.refreshtoken().pipe(
        switchMap(() => {
          // update new token
          const user = this.storageService.getToken();
          // request = request.clone({
          //   setHeaders: {
          //     Authorization: `Bearer ${user.token}`
          //   }
          // });
          //if userstore is different is not api request, redirect to home page
          if ( request.url.indexOf("/api/") == -1 &&
            this.storageService.getUserStore(user.userguid)!=null ) {
              window.location.href = "/";
          }
          return next.handle(request);
        }),
        catchError((error) => {

          if (error.url.match(/api\/token\/refresh/) != null) {
            this.storageService.clean();
            window.location.href = "/";
          }

          /*
          if (error.status == '403') {
            window.location.href = "/";
          }
          */            
          return throwError(() => error);
        })
      );
    }

    return next.handle(request);
  }

}