import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root',
})

export class PickListService {

  private baseUrl;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
    //this.baseUrl = "http://192.168.1.242:7130/";
  }

  // checkSAPPickList(picklistno: string): Observable<any> {
  //   return this.http.post(this.baseUrl + "api/Picklists/checkSAPPickList",JSON.stringify(picklistno), httpOptions)
  // }

  // importSAPPickList(picklistno: string): Observable<any> {
  //   return this.http.post(this.baseUrl + "api/Picklists/importSAPPickList", JSON.stringify(picklistno), httpOptions)
  // }

  getPreviousPickList(): Observable<any> { //
    return this.http.get(this.baseUrl + "api/picklist/previous", httpOptions);
  }

  getCurrentPickList(): Observable<any> { //
    return this.http.get(this.baseUrl + "api/picklist/current", httpOptions);
  }

  // cancelPickList(id: number): Observable<any> {
  //   return this.http.post(this.baseUrl + "api/Picklists/cancel/" + id, {}, httpOptions);
  // }

  startPickList(id: number): Observable<any> { //
    return this.http.get(this.baseUrl + "api/picklist/start/" + id, httpOptions);
  }

  getPickListDetails(id: number): Observable<any> { //
    return this.http.get(this.baseUrl + "api/picklist/" + id, httpOptions);
  }

  getPickListLineDetails(id: number): Observable<any> { //
    return this.http.get(this.baseUrl + "api/picklist/line/" + id, httpOptions);
  }

  // pickBatch(id: number): Observable<any> {
  //   return this.http.post(this.baseUrl + "api/PickLists/pick/" + id, {}, httpOptions);
  // }

  completePickList(id: number): Observable<any> { //
    return this.http.get(this.baseUrl + "api/picklist/complete/" + id, httpOptions);
  }

  unlockPickList(id: number): Observable<any> { //
    return this.http.get(this.baseUrl + "api/picklist/unlock/" + id, httpOptions);
  }

  // batchResolve(id: number): Observable<any> {
  //   return this.http.get(this.baseUrl + "api/PickLists/batchresolve" + id, httpOptions);
  // }

  getAPIStatusText(id: string): string {
    if (id == "1") {
      return "New";
    } else if (id == "2") {
      return "Picking";
    } else if (id == "3") {
      return "Ready";
    } else if (id == "4") {
      return "Completed";
    } else if (id == "5") {
      return "Canceled";
    } else return "";
  }
}
