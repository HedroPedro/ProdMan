import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductStats {
  total: number;
  total_units: number;
  total_value: number;
  average_price: number;
  low_stock_count: number;
  low_stock_products: Array<{
    id: number;
    name: string;
    amount_available: number;
  }>;
  out_of_stock_count: number;
  most_expensive: {
    id: number;
    name: string;
    value: number;
  } | null;
  cheapest: {
    id: number;
    name: string;
    value: number;
  } | null;
}

export interface UserStats {
  total: number;
  created_last_7_days: number;
  created_last_30_days: number;
}

export interface DashboardStats {
  products: ProductStats;
  users: UserStats;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }
}

