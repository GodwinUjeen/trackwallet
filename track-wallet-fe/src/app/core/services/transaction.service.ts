import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models';
import { environment } from '../../../environments/environment';

export interface TransactionQuery {
  from?: string;
  to?: string;
  type?: string;
  accountIds?: string[];
  categoryIds?: string[];
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  constructor(private http: HttpClient) {}

  list(q: TransactionQuery = {}): Observable<Transaction[]> {
    let params = new HttpParams();
    if (q.from) params = params.set('from', q.from);
    if (q.to) params = params.set('to', q.to);
    if (q.type) params = params.set('type', q.type);
    if (q.accountIds?.length) params = params.set('accountIds', q.accountIds.join(','));
    if (q.categoryIds?.length) params = params.set('categoryIds', q.categoryIds.join(','));
    if (q.search) params = params.set('search', q.search);
    return this.http.get<Transaction[]>(`${environment.apiUrl}/transactions`, { params });
  }

  get(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${environment.apiUrl}/transactions/${id}`);
  }

  create(body: Record<string, unknown>): Observable<Transaction> {
    return this.http.post<Transaction>(`${environment.apiUrl}/transactions`, body);
  }

  update(id: string, body: Record<string, unknown>): Observable<Transaction> {
    return this.http.put<Transaction>(`${environment.apiUrl}/transactions/${id}`, body);
  }

  delete(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${environment.apiUrl}/transactions/${id}`);
  }
}
