import { LOCALE_ID, NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { RouterModule } from "@angular/router";
import { MatDialogModule } from "@angular/material/dialog";
import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS } from "@angular/common";
import { AppMaterialModule } from "./app.material-module";
import { ToastrModule } from "ngx-toastr";
import { SafeHtmlPipe } from './safe-html.pipe';

import { JwtInterceptor } from "./_helpers/JwtInterceptor";
import { HttpRequestInterceptor } from "./_helpers/HttpRequestInterceptor";
import { AuthGuard } from "./_helpers/authguard";

import { HomeComponent } from "./home/home.component";
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { LoginComponent } from "./login/login.component";
import { LogoutComponent } from "./logout/logout.component";
import { SecureHomeComponent } from "./securehome/securehome.component";
import { UserListComponent } from "./admin/userlist/userlist.component";
import { UserNewComponent } from "./admin/usernew/usernew.component";
import { UserviewComponent } from './admin/userview/userview.component';
import { UserEditComponent } from "./admin/useredit/useredit.component";
import { PickListWHComponent } from "./picklist/picklist-wh/picklist-wh.component";
import { PickListImportComponent } from "./picklist/picklistimport/picklistimport.component";
import { PickListViewComponent } from "./picklist/picklistview/picklistview.component";
import { PickListPickDialogComponent } from "./picklist/picklistpickdialog/picklistpickdialog.component";
import { AvailableBatchDialogComponent } from "./picklist/availablebatchdialog/availablebatchdialog.component";
import { PickBatchViewComponent } from "./picklist/pickbatchview/pickbatchview.component";
import { PickingSummaryComponent } from "./picklist/pickingsummary/pickingsummary.component";
import { SalesOrderListComponent } from "./salesorder/salesorderlist/salesorderlist.component";
import { SalesOrderViewComponent } from "./salesorder/salesorderview/salesorderview.component";
import { BarcodeCheckViewComponent } from "./inventory/barcodecheckview/barcodecheckview.component";
import { ItemMasterComponent } from "./inventory/itemmaster/itemmaster.component";
import { ItemLabelViewComponent } from "./inventory/itemlabelview/itemlabelview.component";
import { ItemDetailViewComponent } from "./inventory/itemdetailview/itemdetailview.component";
import { BatchWarningComponent } from "./batch/batchwarning/batchwarning.component";

@NgModule({ declarations: [
        SafeHtmlPipe,
        AppComponent,
        HomeComponent,
        LoginComponent,
        LogoutComponent,
        NavMenuComponent,
        SecureHomeComponent,
        UserListComponent,
        UserNewComponent,
        UserviewComponent,
        UserEditComponent,
        PickListWHComponent,
        PickListImportComponent,
        PickListViewComponent,
        PickListPickDialogComponent,
        PickBatchViewComponent,
        AvailableBatchDialogComponent,
        SalesOrderListComponent,
        SalesOrderViewComponent,
        BarcodeCheckViewComponent,
        ItemMasterComponent,
        ItemLabelViewComponent,
        ItemDetailViewComponent,
        BatchWarningComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        AppMaterialModule,
        FormsModule,
        MatDialogModule,
        ReactiveFormsModule,
        PickingSummaryComponent,
        ToastrModule.forRoot({
            timeOut: 10000,
            positionClass: 'toast-top-center',
            preventDuplicates: true,
          }), // ToastrModule added
        RouterModule.forRoot([
            { path: '', component: HomeComponent, pathMatch: 'full' },
            { path: 'login', component: LoginComponent },
            { path: 'logout', component: LogoutComponent, canActivate: [AuthGuard] },
            { path: 'securehome', component: SecureHomeComponent, canActivate: [AuthGuard] },
            { path: 'user', component: UserListComponent, canActivate: [AuthGuard] },
            { path: 'user/new', component: UserNewComponent, canActivate: [AuthGuard] },
            { path: 'user/view/:id', component: UserviewComponent, canActivate: [AuthGuard] },
            { path: 'user/edit/:id', component: UserEditComponent, canActivate: [AuthGuard] },
            { path: 'picklistwh', component: PickListWHComponent, canActivate: [AuthGuard] },
            { path: 'picklist/import', component: PickListImportComponent, canActivate: [AuthGuard] },
            { path: 'picklist/view/:id', component: PickListViewComponent, canActivate: [AuthGuard] },
            { path: 'pickbatch/:id', component: PickBatchViewComponent, canActivate: [AuthGuard] },
            { path: 'picksummary', component: PickingSummaryComponent, canActivate: [AuthGuard] },
            { path: 'salesorder', component: SalesOrderListComponent, canActivate: [AuthGuard] },
            { path: 'salesorder/view/:id', component: SalesOrderViewComponent, canActivate: [AuthGuard] },
            { path: 'barcodecheck', component: BarcodeCheckViewComponent, canActivate: [AuthGuard] },
            { path: 'itemmaster', component: ItemMasterComponent, canActivate: [AuthGuard] },
            { path: 'itemlabel', component: ItemLabelViewComponent, canActivate: [AuthGuard] },
            { path: 'itemdetail', component: ItemDetailViewComponent, canActivate: [AuthGuard] },
            { path: 'itemdetail', component: ItemDetailViewComponent, canActivate: [AuthGuard] },
            { path: 'batchwarning', component: BatchWarningComponent, canActivate: [AuthGuard] }
        ])], providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
        provideAnimationsAsync(),
        provideHttpClient(withInterceptorsFromDi()),
    ],
    bootstrap: [AppComponent]
 })

export default class AppModule {
    
  // constructor(
  //   private readonly router: Router,
  // ) {
  //   router.events
  //     .subscribe(console.log)
  // }

}