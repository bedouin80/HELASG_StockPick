import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})

export class BatchNumberService {

  private baseUrl;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
    //this.baseUrl = "http://192.168.1.242:7130/"
  }

  getAvailableBatchNumber(whse: string, itemCode: string): Observable<any> { //
    return this.http.post(this.baseUrl + "api/batch/current", {
      whse: whse,
      itemCode: itemCode
    }, httpOptions);
  }

  getScanAvailableBatchNumber(whse: string, itemCode: string): Observable<any> {//
    return this.http.post(this.baseUrl + "api/batch/currentm", {
      whse: whse,
      itemCode: itemCode
    }, httpOptions);
  }

  getBatchWarning(): Observable<any> { //
    return this.http.get(this.baseUrl + "api/batch/batchwarn", httpOptions);
  }

  getBatchWarningPrevious(): Observable<any> { //
    return this.http.get(this.baseUrl + "api/batch/batchwarnprev", httpOptions);
  }

  checkQty(pickListLineId: number, batchList: { batchNumber: string, quantity: number }[]): Observable<any> { //
    return this.http.post(this.baseUrl + "api/batch/check", {
      pickListLineId: pickListLineId,
      batchReq: batchList
    }, httpOptions);
  }

  submitQty(pickListLineId: number, batchList: { batchNumber: string, quantity: number }[] ): Observable<any> { //
    return this.http.post(this.baseUrl + "api/batch/submit", {
      pickListLineId: pickListLineId,
      batchReq: batchList
    }, httpOptions);
  }

  submitQtySelection( //
    pickListLineId: number,
    BatchResults: string,
    BatchSelection: string,
    BatchWarning: number,
    batchList: { batchNumber: string, quantity: number }[]
  ): Observable<any> {
    return this.http.post(this.baseUrl + "api/batch/submit", {
      pickListLineId: pickListLineId,
      BatchResults: BatchResults,
      BatchSelection: BatchSelection,
      BatchWarning: BatchWarning,
      batchReq: batchList
    }, httpOptions);
  }

  // getSAPBatchNumberByItemBatch(whse: string, itemCode: string, batchNumber: string): Observable<any> {
  //   return this.http.post(this.baseUrl + "api/batch", {
  //     whse: whse,
  //     itemCode: itemCode,
  //     batchNumber: batchNumber 
  //   }, httpOptions);
  // }

}
