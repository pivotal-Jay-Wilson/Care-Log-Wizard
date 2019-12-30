import { Component, OnInit } from '@angular/core';
import { GapiSession } from './google/gapi.session';
import {
  trigger,
  style,
  animate,
  transition,
  keyframes
} from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('rotatedState', [
      // state('default', style({ transform: 'rotate(0)' })),
      // state('rotated', style({ transform: 'rotate(-180deg)' })),
      transition('* => rotated',
        animate('1s 1s ease-in-out', keyframes([
          style({ transform: 'rotate(0deg)' }),
          style({ transform: 'rotate(360deg)' })
        ])))
    ])
  ]
})
export class AppComponent implements OnInit {
  opened: boolean;
  isDarkTheme = false;
  running = false;
  isLoggingIn = 'default';


  constructor(public appContext: GapiSession) { }

  ngOnInit() {
    this.appContext.listen(() => {
      this.isLoggingIn = 'default';
    });
  }

  async signIn() {
    try {
      this.isLoggingIn = 'rotated';
      await this.appContext.signIn();
    } catch (error) {
      this.isLoggingIn = 'default';
    }
  }

  onEnd(event) {
    if (this.isLoggingIn !== 'default') {
    this.isLoggingIn = 'stop';
    setTimeout(() => {
        if (this.isLoggingIn !== 'default') {
          this.isLoggingIn = 'rotated';
        }
      }, 0);
    }
  }

  signOut() {
    this.isLoggingIn = 'rotated';
    try {
      this.appContext.signOut();
    } catch (error) {
      this.isLoggingIn = 'default';
    }
  }
}
