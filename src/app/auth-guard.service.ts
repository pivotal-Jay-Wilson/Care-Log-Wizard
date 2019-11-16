import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { GapiSession } from './google/gapi.session';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(public appContext: GapiSession, public router: Router) {}
  canActivate(): boolean {
    if (!this.appContext.isSignedIn) {
      this.router.navigate(['home']);
      return false;
    }
    return true;
  }
}
