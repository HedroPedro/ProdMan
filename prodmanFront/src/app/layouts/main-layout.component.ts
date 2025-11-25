import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, shareReplay, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UsersService, User } from '../services/users.service';

interface UserResponse {
  user: User;
}
import { UserFormDialogComponent } from '../users/users.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly usersService = inject(UsersService);

  user = this.authService.getUser();
  sidenavOpened = false;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map((result: any) => {
        this.sidenavOpened = !result.matches;
        return result.matches;
      }),
      shareReplay()
    );

  toggleSidenav(drawer: any): void {
    drawer.toggle();
  }

  onSidenavToggle(opened: boolean): void {
    this.sidenavOpened = opened;
  }

  logout(): void {
    this.authService.logout();
  }

  navigateToProfile(): void {
    const currentUser = this.authService.getUser();
    if (!currentUser || !currentUser.id) {
      return;
    }

    // Fetch full user data from backend
    this.usersService.getUser(Number(currentUser.id)).subscribe({
      next: (response: UserResponse) => {
        const dialogRef = this.dialog.open(UserFormDialogComponent, {
          width: '500px',
          data: { user: response.user }
        });

        dialogRef.afterClosed().subscribe((result: User | null) => {
          if (result) {
            // Update user info in localStorage if name or email changed
            const updatedUser = {
              id: result.id.toString(),
              name: result.name,
              email: result.email_address
            };
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            }
            // Update the user reference to trigger UI update
            this.user = updatedUser;
          }
        });
      },
      error: (err: any) => {
        console.error('Error loading user data:', err);
      }
    });
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }

  closeSidenavIfHandset(drawer: any): void {
    // Use take(1) to get current value and auto-unsubscribe
    this.isHandset$.pipe(take(1)).subscribe((isHandset: boolean) => {
      if (isHandset) {
        drawer.close();
      }
    });
  }
}

