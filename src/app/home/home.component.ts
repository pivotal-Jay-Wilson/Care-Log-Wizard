import { Component, OnInit } from '@angular/core';
import { GapiSession } from '../google/gapi.session';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public loggedin = false;
  public name;
  public imageurl = '/assets/person-24px.svg';
  constructor(public appContext: GapiSession) { }

  ngOnInit() {
    this.loggedin = this.appContext.isSignedIn;
    if ( this.loggedin ) {
      const profile = this.appContext.googleAuth.currentUser.get().getBasicProfile();
      this.name = profile.getName();
      this.imageurl = profile.getImageUrl();
    } else {
      this.imageurl = '/assets/person-24px.svg';
    }
    this.appContext.listen(signinChanged => {
      if ( signinChanged ) {
        const newProfile = this.appContext.googleAuth.currentUser.get().getBasicProfile();
        this.name = newProfile.getName();
        this.imageurl = newProfile.getImageUrl();
        console.log(signinChanged);
      } else {
        this.imageurl = '/assets/person-24px.svg';
      }
      this.loggedin = signinChanged;
    });
  }
}
