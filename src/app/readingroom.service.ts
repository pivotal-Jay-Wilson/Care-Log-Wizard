import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReadingRoomLink } from './reading-room-link';

@Injectable({
  providedIn: 'root'
})
export class ReadingroomService {

  constructor(private http: HttpClient) { }

  rrUrl = 'https://bcsreadingroom.apps.pcfone.io/Links';

  getRr(): Observable<ReadingRoomLink[]> {
    return this.http.get(this.rrUrl) as Observable<ReadingRoomLink[]>;
  }
}

