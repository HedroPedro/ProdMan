import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <div class="home-container">
      <mat-card class="welcome-card">
        <mat-card-header>
          <mat-card-title>Bem-vindo ao ProdMan</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p *ngIf="user">Olá, {{ user.name }}!</p>
          <p *ngIf="user">Email: {{ user.email }}</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="warn" (click)="logout()">Sair</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
    }
    .welcome-card {
      max-width: 500px;
      width: 100%;
    }
  `]
})
export class HomeComponent {
  private readonly authService = inject(AuthService);
  user = this.authService.getUser();

  logout(): void {
    this.authService.logout();
  }
}

