import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { inject } from "@angular/core/testing";
import { Observable } from "rxjs";


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
}

@Injectable({ providedIn: 'root' })

export class ItemService {

  private baseUrl;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getSAPItem(id: string): Observable<any> { //
    return this.http.post(this.baseUrl + "api/item", { id }, httpOptions);
  }

  checkBarcode(id: string): Observable<any> { //
    return this.http.post(this.baseUrl + "api/item/barcode", { id }, httpOptions);
  }

  updateSAPItem(id: string, item: any): Observable<any> { //
    return this.http.post(this.baseUrl + "api/item/" + id, JSON.stringify(item), httpOptions);
  }

  getSAPItemList(): Observable<any> { //
    return this.http.get(this.baseUrl + "api/item", httpOptions);
  }

  getSAPItemInventoryStatusByWhse(id: string, WhseCode: string) { //
    return this.http.post(this.baseUrl + "api/item/status", { id, WhseCode }, httpOptions);
  }
}