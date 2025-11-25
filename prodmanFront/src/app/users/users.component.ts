import { Component, OnInit, AfterViewInit, ViewChild, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UsersService, User, UserResponse, UserQueryParams } from '../services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    MatExpansionModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('deletedPaginator') deletedPaginator!: MatPaginator;
  @ViewChild('deletedSort') deletedSort!: MatSort;

  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // Data sources
  dataSource = new MatTableDataSource<User>([]);
  deletedDataSource = new MatTableDataSource<User>([]);

  // Display columns
  displayedColumns: string[] = ['name', 'email_address', 'created_at', 'actions'];
  deletedDisplayedColumns: string[] = ['name', 'email_address', 'created_at', 'deleted_at', 'actions'];

  // States
  isLoading = false;
  isLoadingDeleted = false;
  error: string | null = null;
  showDeleted = false;

  // Search and filters
  searchTerm = '';
  includeDeleted = false;
  createdLastDays: number | null = null;
  dateStart = new FormControl<Date | null>(null);
  dateEnd = new FormControl<Date | null>(null);

  ngOnInit(): void {
    // Read query params from URL
    this.route.queryParams.subscribe((params: any) => {
      if (Object.keys(params).length > 0) {
        this.loadFiltersFromQueryParams(params);
      }
      this.loadUsers();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.deletedDataSource.paginator = this.deletedPaginator;
    this.deletedDataSource.sort = this.deletedSort;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;

    const params = this.buildQueryParams();
    
    this.usersService.getUsers(params).subscribe({
      next: (response: UserResponse) => {
        // Filter by search term client-side if provided
        let users = response.users;
        if (this.searchTerm.trim()) {
          const search = this.searchTerm.toLowerCase().trim();
          users = users.filter((u: User) => 
            u.name.toLowerCase().includes(search) ||
            u.email_address.toLowerCase().includes(search)
          );
        }
        
        this.dataSource.data = users;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.error = 'Erro ao carregar usuários. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  loadDeletedUsers(): void {
    if (this.deletedDataSource.data.length > 0) {
      return; // Already loaded
    }

    this.isLoadingDeleted = true;
    const params: UserQueryParams = { include_deleted: true };
    
    this.usersService.getUsers(params).subscribe({
      next: (response: UserResponse) => {
        const deleted = response.users.filter((u: User) => u.deleted_at !== null);
        this.deletedDataSource.data = deleted;
        this.isLoadingDeleted = false;
      },
      error: (err: any) => {
        console.error('Error loading deleted users:', err);
        this.isLoadingDeleted = false;
      }
    });
  }

  onSearch(): void {
    this.updateUrlWithFilters();
    this.loadUsers();
  }

  openFiltersDialog(): void {
    const dialogRef = this.dialog.open(UserFiltersDialogComponent, {
      width: '500px',
      data: {
        includeDeleted: this.includeDeleted,
        createdLastDays: this.createdLastDays
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.includeDeleted = result.includeDeleted;
        this.createdLastDays = result.createdLastDays;
        this.updateUrlWithFilters();
        this.loadUsers();
      }
    });
  }

  loadFiltersFromQueryParams(params: any): void {
    this.includeDeleted = params.include_deleted === 'true';
    this.createdLastDays = params.created_last_days ? Number(params.created_last_days) : null;
    
    if (params.search) {
      this.searchTerm = params.search;
    }

    // Date filters
    if (params.created_after) {
      this.dateStart.setValue(new Date(params.created_after));
    }
    if (params.created_before) {
      this.dateEnd.setValue(new Date(params.created_before));
    }
  }

  updateUrlWithFilters(): void {
    const queryParams: any = {};

    // Only add params that have values, others will be removed
    if (this.searchTerm.trim()) {
      queryParams.search = this.searchTerm.trim();
    } else {
      queryParams.search = null;
    }

    if (this.includeDeleted) {
      queryParams.include_deleted = 'true';
    } else {
      queryParams.include_deleted = null;
    }

    if (this.createdLastDays !== null && this.createdLastDays !== undefined) {
      queryParams.created_last_days = this.createdLastDays.toString();
    } else {
      queryParams.created_last_days = null;
    }

    if (this.dateStart.value) {
      queryParams.created_after = this.dateStart.value.toISOString().split('T')[0];
    } else {
      queryParams.created_after = null;
    }

    if (this.dateEnd.value) {
      queryParams.created_before = this.dateEnd.value.toISOString().split('T')[0];
    } else {
      queryParams.created_before = null;
    }

    // Remove null/undefined values before navigating
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === null || queryParams[key] === undefined) {
        delete queryParams[key];
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      replaceUrl: true
    });
  }

  onDateFilterChange(): void {
    this.updateUrlWithFilters();
    this.loadUsers();
  }

  clearDateFilter(): void {
    this.dateStart.setValue(null);
    this.dateEnd.setValue(null);
    this.updateUrlWithFilters();
    this.loadUsers();
  }

  hasDateFilter(): boolean {
    return !!(this.dateStart.value || this.dateEnd.value);
  }

  hasActiveFilters(): boolean {
    return this.includeDeleted || 
           this.hasDateFilter() ||
           (this.createdLastDays !== null && this.createdLastDays !== undefined);
  }

  buildQueryParams(): UserQueryParams {
    const params: UserQueryParams = {};

    if (this.includeDeleted) {
      params.include_deleted = true;
    }

    if (this.createdLastDays !== null && this.createdLastDays !== undefined) {
      params.created_last_days = this.createdLastDays;
    }

    if (this.dateStart.value) {
      params.created_after = this.dateStart.value.toISOString().split('T')[0];
    }

    if (this.dateEnd.value) {
      params.created_before = this.dateEnd.value.toISOString().split('T')[0];
    }

    return params;
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: { user: user }
    });

    dialogRef.afterClosed().subscribe((result: User | null) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir o usuário "${user.name}"?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.usersService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('Usuário excluído com sucesso', 'Fechar', {
              duration: 3000
            });
            this.loadUsers();
            // Reload deleted users if accordion is open
            if (this.showDeleted) {
              this.deletedDataSource.data = [];
              this.loadDeletedUsers();
            }
          },
          error: (err: any) => {
            console.error('Error deleting user:', err);
            this.snackBar.open('Erro ao excluir usuário', 'Fechar', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  restoreUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Restauração',
        message: `Tem certeza que deseja restaurar o usuário "${user.name}"?`,
        confirmText: 'Restaurar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.usersService.restoreUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('Usuário restaurado com sucesso', 'Fechar', {
              duration: 3000
            });
            // Remove from deleted list
            this.deletedDataSource.data = this.deletedDataSource.data.filter((u: User) => u.id !== user.id);
            // Reload main users list
            this.loadUsers();
          },
          error: (err: any) => {
            console.error('Error restoring user:', err);
            this.snackBar.open('Erro ao restaurar usuário', 'Fechar', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  createUser(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px',
      data: { user: null }
    });

    dialogRef.afterClosed().subscribe((result: User | null) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  onDeletedPanelOpened(): void {
    this.showDeleted = true;
    this.loadDeletedUsers();
  }

  onDeletedPanelClosed(): void {
    this.showDeleted = false;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
}

// Simple confirm dialog component
@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ data.cancelText || 'Cancelar' }}</button>
      <button mat-button [mat-dialog-close]="true" color="primary">{{ data.confirmText || 'Confirmar' }}</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule]
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}

// User Filters Dialog Component
@Component({
  selector: 'app-user-filters-dialog',
  template: `
    <h2 mat-dialog-title>Filtros</h2>
    <mat-dialog-content>
      <mat-tab-group>
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>flash_on</mat-icon>
            Rápidos
          </ng-template>
          <div class="filters-dialog-content">
            <div class="filter-section">
              <mat-checkbox [(ngModel)]="filters.includeDeleted">
                Incluir Deletados
              </mat-checkbox>
            </div>
          </div>
        </mat-tab>
        
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>tune</mat-icon>
            Específicos
          </ng-template>
          <div class="filters-dialog-content">
            <div class="filter-section">
              <div class="filter-range-group">
                <label>Criados nos Últimos X Dias</label>
                <mat-form-field appearance="fill" class="filter-number-field">
                  <input matInput type="number" [(ngModel)]="filters.createdLastDays" placeholder="Ex: 7" min="1">
                </mat-form-field>
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="clearFilters()">Limpar</button>
      <button mat-button [mat-dialog-close]="null">Cancelar</button>
      <button mat-button [mat-dialog-close]="filters" color="primary">Aplicar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .filters-dialog-content {
      padding: 16px 0;
      min-width: 400px;
    }

    .filter-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .filter-section mat-checkbox {
      display: block;
    }

    .filter-range-group {
      margin-bottom: 16px;
    }

    .filter-range-group:last-child {
      margin-bottom: 0;
    }

    .filter-range-group label {
      display: block;
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant);
      font-weight: 500;
      margin-bottom: 8px;
    }

    .filter-number-field {
      width: 100%;
    }

    mat-tab-group {
      margin-top: 8px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatTabsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class UserFiltersDialogComponent {
  filters: any = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.filters = {
      includeDeleted: data.includeDeleted || false,
      createdLastDays: data.createdLastDays || null
    };
  }

  clearFilters(): void {
    this.filters = {
      includeDeleted: false,
      createdLastDays: null
    };
  }
}

// User Form Dialog Component
@Component({
  selector: 'app-user-form-dialog',
  template: `
    <h2 mat-dialog-title>{{ isEditing ? 'Editar Usuário' : 'Novo Usuário' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Nome *</mat-label>
          <input matInput formControlName="name" placeholder="Nome do usuário">
          <mat-error *ngIf="userForm.get('name')?.hasError('required')">
            Nome é obrigatório
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Email *</mat-label>
          <input matInput type="email" formControlName="email" placeholder="email@exemplo.com">
          <mat-error *ngIf="userForm.get('email')?.hasError('required')">
            Email é obrigatório
          </mat-error>
          <mat-error *ngIf="userForm.get('email')?.hasError('email')">
            Email inválido
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Senha {{ isEditing ? '(deixe em branco para não alterar)' : '*' }}</mat-label>
          <input matInput type="password" formControlName="password" [placeholder]="isEditing ? 'Nova senha (opcional)' : 'Senha'">
          <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
            Senha deve ter pelo menos 6 caracteres
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null" [disabled]="isSaving">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="isSaving || userForm.invalid">
        <mat-spinner *ngIf="isSaving" diameter="20" class="inline-spinner"></mat-spinner>
        <span *ngIf="!isSaving">{{ isEditing ? 'Salvar' : 'Criar' }}</span>
        <span *ngIf="isSaving">{{ isEditing ? 'Salvando...' : 'Criando...' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .full-width:last-of-type {
      margin-bottom: 0;
    }

    mat-dialog-content {
      padding: 24px;
      min-width: 400px;
    }

    .inline-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    mat-form-field {
      display: block;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ]
})
export class UserFormDialogComponent {
  userForm: FormGroup;
  isEditing = false;
  isSaving = false;
  private readonly usersService = inject(UsersService);
  private readonly dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { user: User | null }) {
    this.isEditing = !!data.user;

    this.userForm = this.fb.group({
      name: [data.user?.name || '', [Validators.required]],
      email: [data.user?.email_address || '', [Validators.required, Validators.email]],
      password: ['', this.isEditing ? [] : [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid || this.isSaving) {
      return;
    }

    this.isSaving = true;
    const formValue = this.userForm.value;

    if (this.isEditing && this.data.user) {
      // Update existing user
      const updateData: any = {
        name: formValue.name,
        email: formValue.email
      };
      
      // Only include password if provided
      if (formValue.password) {
        updateData.password = formValue.password;
      }

      this.usersService.updateUser(this.data.user.id, updateData).subscribe({
        next: (response: { user: User }) => {
          this.snackBar.open('Usuário atualizado com sucesso', 'Fechar', {
            duration: 3000
          });
          this.dialogRef.close(response.user);
        },
        error: (err: any) => {
          console.error('Error updating user:', err);
          this.snackBar.open('Erro ao atualizar usuário', 'Fechar', {
            duration: 3000
          });
          this.isSaving = false;
        }
      });
    } else {
      // Create new user
      this.usersService.createUser({
        name: formValue.name,
        email: formValue.email,
        password: formValue.password
      }).subscribe({
        next: () => {
          this.snackBar.open('Usuário criado com sucesso', 'Fechar', {
            duration: 3000
          });
          this.dialogRef.close({ id: 0 } as User); // Return a dummy user to trigger reload
        },
        error: (err: any) => {
          console.error('Error creating user:', err);
          this.snackBar.open('Erro ao criar usuário', 'Fechar', {
            duration: 3000
          });
          this.isSaving = false;
        }
      });
    }
  }
}
