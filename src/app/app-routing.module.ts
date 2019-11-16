import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ReadingRoomComponent } from './reading-room/reading-room.component';
import { AuthGuardService as AuthGuard} from './auth-guard.service';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'read', component: ReadingRoomComponent, canActivate: [AuthGuard] },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
