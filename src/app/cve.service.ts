import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CveService {

  constructor(private http: HttpClient) { }

  cveUrl = 'https://pivotal.io/security/rss';

  getCve(): Observable<any> {
    return this.http.get(this.cveUrl);
  }
}
