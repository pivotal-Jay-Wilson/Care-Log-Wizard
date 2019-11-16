import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GapiSession } from './google/gapi.session';
import { AppRepository } from './google/app.repository';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from './app.material.module';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatCheckboxComponent } from './grid/mat-checkbox.component';
import { AgGridModule } from 'ag-grid-angular';
import { HomeComponent } from './home/home.component';
import { ReadingRoomComponent } from './reading-room/reading-room.component';
import { AuthGuardService } from './auth-guard.service';
import { SpeedDialFabComponent } from './speed-dial-fab/speed-dial-fab.component';

export function initGapi(gapiSession: GapiSession) {
  return () => gapiSession.initClient();
 }

@NgModule({
  declarations: [
    AppComponent,
    MatCheckboxComponent,
    HomeComponent,
    ReadingRoomComponent,
    SpeedDialFabComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    FormsModule,
    HttpClientModule,
    AgGridModule.withComponents([MatCheckboxComponent])
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: initGapi, deps: [GapiSession], multi: true },
    GapiSession,
    AppRepository,
    AuthGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


