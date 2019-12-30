import { Injectable, EventEmitter } from '@angular/core';

declare var gapi: any;
const CLIENT_ID = '102885278831-h8f29s7qqmqu1tdudstjn38u5vtr2mkc.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBs5fZvtYCPx8qlmzAuC54lE_sP720NPNU';
const DISCOVERY_DOCS = ['https://slides.googleapis.com/$discovery/rest?version=v1',
                       'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
                      'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'];
const SCOPES = 'https://www.googleapis.com/auth/presentations.readonly https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/gmail.compose';


@Injectable()
export class GapiSession {
    googleAuth: any;
    gapi: any;
    googleUser: any;
    initClient() {
        return new Promise((resolve, reject) => {
            gapi.load('client:auth2', () => {
                return gapi.client.init({
                    apiKey: API_KEY,
                    clientId: CLIENT_ID,
                    discoveryDocs: DISCOVERY_DOCS,
                    scope: SCOPES,
                }).then(() => {
                    this.googleAuth = gapi.auth2.getAuthInstance();
                    resolve();
                });
            });
            this.gapi = gapi;
        });

    }

    get isSignedIn(): boolean {
      // console.log(this.googleAuth);
      return this.googleAuth.isSignedIn.get();
    }

    listen(cb) {
      this.googleAuth.isSignedIn.listen(cb);
    }

    async signIn() {
      this.googleUser =  await this.googleAuth.signIn({ prompt: 'consent'});
    }

    signOut(): void {
        this.googleAuth.signOut();
    }
}
