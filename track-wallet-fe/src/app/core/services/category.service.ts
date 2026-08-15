import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private http: HttpClient) {}

  list(opts?: { type?: string; parentId?: string; top?: boolean }): Observable<Category[]> {
    let params = new HttpParams();
    if (opts?.type) params = params.set('type', opts.type);
    if (opts?.parentId) params = params.set('parentId', opts.parentId);
    if (opts?.top) params = params.set('top', '1');
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`, { params });
  }

  tree(type?: string): Observable<Category[]> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    return this.http.get<Category[]>(`${environment.apiUrl}/categories/tree`, { params });
  }

  get(id: string): Observable<Category> {
    return this.http.get<Category>(`${environment.apiUrl}/categories/${id}`);
  }

  create(body: Partial<Category> & { name: string; type: string }): Observable<Category> {
    return this.http.post<Category>(`${environment.apiUrl}/categories`, body);
  }

  update(id: string, body: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${environment.apiUrl}/categories/${id}`, body);
  }

  delete(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${environment.apiUrl}/categories/${id}`);
  }
}
