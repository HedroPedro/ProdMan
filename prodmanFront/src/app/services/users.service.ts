import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  name: string;
  email_address: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface UserResponse {
  users: User[];
}

export interface UserQueryParams {
  include_deleted?: boolean;
  created_after?: string;
  created_before?: string;
  created_last_days?: number;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getUsers(params?: UserQueryParams): Observable<UserResponse> {
    let httpParams = new HttpParams();
    
    if (params) {
      if (params.include_deleted !== undefined) {
        httpParams = httpParams.set('include_deleted', params.include_deleted.toString());
      }
      if (params.created_after) {
        httpParams = httpParams.set('created_after', params.created_after);
      }
      if (params.created_before) {
        httpParams = httpParams.set('created_before', params.created_before);
      }
      if (params.created_last_days !== undefined) {
        httpParams = httpParams.set('created_last_days', params.created_last_days.toString());
      }
    }

    return this.http.get<UserResponse>(`${this.apiUrl}/users`, { params: httpParams });
  }

  getUser(id: number): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/users/${id}`);
  }

  createUser(user: CreateUserRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/signin`, user);
  }

  updateUser(id: number, user: UpdateUserRequest): Observable<{ user: User }> {
    return this.http.patch<{ user: User }>(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  restoreUser(id: number): Observable<{ message: string; user: User }> {
    return this.http.patch<{ message: string; user: User }>(`${this.apiUrl}/users/${id}/restore`, {});
  }
}

