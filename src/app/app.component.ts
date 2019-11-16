import { Component, OnInit } from '@angular/core';
import { GapiSession } from './google/gapi.session';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  opened: boolean;
  isDarkTheme = false;
  ctx: GapiSession;
  running = false;


  constructor(appContext: GapiSession) {
    this.ctx = appContext;
  }

  ngOnInit() {

  }

  signIn() {
    this.ctx.signIn();
  }

  signOut() {
    this.ctx.signOut();
  }

}
