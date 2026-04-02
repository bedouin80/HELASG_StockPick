import { Component, OnInit } from "@angular/core";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    standalone: false
})

export class HomeComponent implements OnInit {

  title = 'clientapp';
  
  ngOnInit(): void {
    //throw new Error("Method not implemented.");
  }
  
}