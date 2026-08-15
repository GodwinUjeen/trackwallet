import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Averages,
  BalanceSeries,
  CategoryBreakdown,
  CompareData,
  Summary,
  TimeseriesPoint,
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private http: HttpClient) {}

  private params(month: number, year: number, extra?: Record<string, string>): HttpParams {
    let p = new HttpParams().set('month', String(month)).set('year', String(year));
    if (extra) {
      for (const [k, v] of Object.entries(extra)) p = p.set(k, v);
    }
    return p;
  }

  summary(month: number, year: number): Observable<Summary> {
    return this.http.get<Summary>(`${environment.apiUrl}/analytics/summary`, {
      params: this.params(month, year),
    });
  }

  byCategory(month: number, year: number, type = 'expense'): Observable<CategoryBreakdown> {
    return this.http.get<CategoryBreakdown>(`${environment.apiUrl}/analytics/by-category`, {
      params: this.params(month, year, { type }),
    });
  }

  timeseries(month: number, year: number): Observable<TimeseriesPoint[]> {
    return this.http.get<TimeseriesPoint[]>(`${environment.apiUrl}/analytics/timeseries`, {
      params: this.params(month, year),
    });
  }

  averages(month: number, year: number): Observable<Averages> {
    return this.http.get<Averages>(`${environment.apiUrl}/analytics/averages`, {
      params: this.params(month, year),
    });
  }

  compare(month: number, year: number): Observable<CompareData> {
    return this.http.get<CompareData>(`${environment.apiUrl}/analytics/compare`, {
      params: this.params(month, year),
    });
  }

  balanceSeries(month: number, year: number): Observable<BalanceSeries> {
    return this.http.get<BalanceSeries>(`${environment.apiUrl}/analytics/balance-series`, {
      params: this.params(month, year),
    });
  }

  importCsv(file: File): Observable<{ imported: number; skipped: number }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ imported: number; skipped: number }>(
      `${environment.apiUrl}/import/csv`,
      form
    );
  }
}
