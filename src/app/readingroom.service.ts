import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReadingRoomLink } from './reading-room-link';
import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReadingroomService {

  constructor(private http: HttpClient) { }

  rrUrl = `${environment.rrUrl}/Links`;

  getRr(): Observable<ReadingRoomLink[]> {
    return this.http.get(this.rrUrl) as Observable<ReadingRoomLink[]>;
  }

  getRrInifin(params): Observable<ReadingroomServiceResult> {
    return this.http.post(`${this.rrUrl}/find`, params) as Observable<ReadingroomServiceResult>;
  }
  // getRows(params) {
  //   console.log(`asking for ${params.startRow}  to ${params.endRow}`);
  //   this.http.get(`${this.rrUrl}/${params.startRow}/${params.endRow}`).subscribe((data: ReadingroomServiceResult) => {
  //     params.successCallback(data.links, data.links.length);
  //   });
  // }
}
interface ReadingroomServiceResult {
  links: ReadingRoomLink[];
  count: number;
}
