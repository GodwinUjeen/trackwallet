import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountService {
  constructor(private http: HttpClient) {}

  list(): Observable<Account[]> {
    return this.http.get<Account[]>(`${environment.apiUrl}/accounts`);
  }

  create(body: Partial<Account>): Observable<Account> {
    return this.http.post<Account>(`${environment.apiUrl}/accounts`, body);
  }

  update(id: string, body: Partial<Account>): Observable<Account> {
    return this.http.put<Account>(`${environment.apiUrl}/accounts/${id}`, body);
  }

  delete(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${environment.apiUrl}/accounts/${id}`);
  }
}
