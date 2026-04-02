import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})

export class SalesOrderService {

  private baseUrl;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    
    this.baseUrl = baseUrl;
    //this.baseUrl = "http://192.168.1.242:7130/";
  }

  checkimport(picklistno: number): Observable<any> { //
    return this.http.get(this.baseUrl + "api/salesorder/checkimport/" + picklistno, httpOptions);
  }

  importSAP(picklistno: number): Observable<any> { //
    return this.http.get(this.baseUrl + "api/salesorder/importSAP/" + picklistno, httpOptions);
  }

  getCurrentSalesOrder(): Observable<any> { //
    return this.http.get(this.baseUrl + "api/salesorder/current", httpOptions);
  }

  getPreviousSalesOrder(): Observable<any> {//
    return this.http.get(this.baseUrl + "api/salesorder/previous", httpOptions);
  }

  getSalesOrderDetails(id: number): Observable<any> {//
    return this.http.get(this.baseUrl + "api/salesorder/view/" + id, httpOptions);
  }

  submitBatchNumbers(id: number): Observable<any> {
    return this.http.get(this.baseUrl + "api/salesorder/submitSAP/" + id, httpOptions);
  }

  cancelSalesOrder(id: number): Observable<any> { //
    return this.http.get(this.baseUrl + "api/salesorder/cancel/" + id, httpOptions);
  }

  missingSalesOrder(): Observable<any> {//
    return this.http.get(this.baseUrl + "api/salesorder/missing", httpOptions);
  }

  undoSubmitbatchNumbers(id: number): Observable<any> {
    return this.http.get(this.baseUrl + "api/salesorder/undosubmitSAP/" + id, httpOptions);
  }

  getStatusText(id: number): string {
    if (id == 1) {
      return "New";
    } else if (id == 2) {
      return "Completed";
    } else if (id == 3) {
      return "Cancelled";
    } else return "";
  }
}