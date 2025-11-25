import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: number;
  name: string;
  description?: string;
  value: number;
  amount_available: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface ProductResponse {
  products: Product[];
}

export interface ProductQueryParams {
  include_deleted?: boolean;
  low_stock?: boolean;
  out_of_stock?: boolean;
  amount_available_lt?: number;
  amount_available_gt?: number;
  value_min?: number;
  value_max?: number;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  value: number;
  amount_available: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  value?: number;
  amount_available?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getProducts(params?: ProductQueryParams): Observable<ProductResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.include_deleted !== undefined) {
        httpParams = httpParams.set('include_deleted', params.include_deleted.toString());
      }
      if (params.low_stock !== undefined) {
        httpParams = httpParams.set('low_stock', params.low_stock.toString());
      }
      if (params.out_of_stock !== undefined) {
        httpParams = httpParams.set('out_of_stock', params.out_of_stock.toString());
      }
      if (params.amount_available_lt !== undefined) {
        httpParams = httpParams.set('amount_available_lt', params.amount_available_lt.toString());
      }
      if (params.amount_available_gt !== undefined) {
        httpParams = httpParams.set('amount_available_gt', params.amount_available_gt.toString());
      }
      if (params.value_min !== undefined) {
        httpParams = httpParams.set('value_min', params.value_min.toString());
      }
      if (params.value_max !== undefined) {
        httpParams = httpParams.set('value_max', params.value_max.toString());
      }
    }

    return this.http.get<ProductResponse>(`${this.apiUrl}/products`, { params: httpParams });
  }

  getProduct(id: number): Observable<{ product: Product }> {
    return this.http.get<{ product: Product }>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(product: CreateProductRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: number, product: UpdateProductRequest): Observable<{ product: Product }> {
    return this.http.patch<{ product: Product }>(`${this.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  restoreProduct(id: number): Observable<{ message: string; product: Product }> {
    return this.http.patch<{ message: string; product: Product }>(`${this.apiUrl}/products/${id}/restore`, {});
  }
}

