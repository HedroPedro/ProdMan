import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RegisterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setUser(response.user);
      })
    );
  }

  register(name: string, email: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/signin`, {
      name,
      email,
      password
    });
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.delete(`${environment.apiUrl}/auth/logout`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
          this.clearAuth();
          this.router.navigate(['/login']);
        },
        error: () => {
          this.clearAuth();
          this.router.navigate(['/login']);
        }
      });
    } else {
      this.clearAuth();
      this.router.navigate(['/login']);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  getUser(): LoginResponse['user'] | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private setUser(user: LoginResponse['user']): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }
}

