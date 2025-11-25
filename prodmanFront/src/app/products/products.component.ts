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
import { ProductsService, Product, ProductResponse, ProductQueryParams } from '../services/products.service';

@Component({
  selector: 'app-products',
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
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('deletedPaginator') deletedPaginator!: MatPaginator;
  @ViewChild('deletedSort') deletedSort!: MatSort;

  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  // Data sources
  dataSource = new MatTableDataSource<Product>([]);
  deletedDataSource = new MatTableDataSource<Product>([]);

  // Display columns
  displayedColumns: string[] = ['name', 'value', 'amount_available', 'actions'];
  deletedDisplayedColumns: string[] = ['name', 'value', 'amount_available', 'deleted_at', 'actions'];

  // States
  isLoading = false;
  isLoadingDeleted = false;
  error: string | null = null;
  showDeleted = false;

  // Search and filters
  searchTerm = '';
  lowStock = false;
  outOfStock = false;
  includeDeleted = false;
  amountMin: number | null = null;
  amountMax: number | null = null;
  valueMin: number | null = null;
  valueMax: number | null = null;
  dateStart = new FormControl<Date | null>(null);
  dateEnd = new FormControl<Date | null>(null);

  ngOnInit(): void {
    // Read query params from URL
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        this.loadFiltersFromQueryParams(params);
      }
      this.loadProducts();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.deletedDataSource.paginator = this.deletedPaginator;
    this.deletedDataSource.sort = this.deletedSort;
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;

    const params = this.buildQueryParams();
    
    this.productsService.getProducts(params).subscribe({
      next: (response: ProductResponse) => {
        // Filter by search term client-side if provided
        let products = response.products;
        if (this.searchTerm.trim()) {
          const search = this.searchTerm.toLowerCase().trim();
          products = products.filter((p: Product) => 
            p.name.toLowerCase().includes(search) ||
            (p.description && p.description.toLowerCase().includes(search))
          );
        }
        
        this.dataSource.data = products;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
        this.error = 'Erro ao carregar produtos. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  loadDeletedProducts(): void {
    if (this.deletedDataSource.data.length > 0) {
      return; // Already loaded
    }

    this.isLoadingDeleted = true;
    const params: ProductQueryParams = { include_deleted: true };
    
    this.productsService.getProducts(params).subscribe({
      next: (response: ProductResponse) => {
        const deleted = response.products.filter((p: Product) => p.deleted_at !== null);
        this.deletedDataSource.data = deleted;
        this.isLoadingDeleted = false;
      },
      error: (err: any) => {
        console.error('Error loading deleted products:', err);
        this.isLoadingDeleted = false;
      }
    });
  }

  onSearch(): void {
    this.updateUrlWithFilters();
    this.loadProducts();
  }

  onFilterChange(): void {
    // Don't reload immediately when in dialog - user will click Apply
  }

  openFiltersDialog(): void {
    const dialogRef = this.dialog.open(ProductFiltersDialogComponent, {
      width: '500px',
      data: {
        lowStock: this.lowStock,
        outOfStock: this.outOfStock,
        includeDeleted: this.includeDeleted,
        amountMin: this.amountMin,
        amountMax: this.amountMax,
        valueMin: this.valueMin,
        valueMax: this.valueMax
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.lowStock = result.lowStock;
        this.outOfStock = result.outOfStock;
        this.includeDeleted = result.includeDeleted;
        this.amountMin = result.amountMin;
        this.amountMax = result.amountMax;
        this.valueMin = result.valueMin;
        this.valueMax = result.valueMax;
        this.updateUrlWithFilters();
        this.loadProducts();
      }
    });
  }

  loadFiltersFromQueryParams(params: any): void {
    this.lowStock = params.low_stock === 'true';
    this.outOfStock = params.out_of_stock === 'true';
    this.includeDeleted = params.include_deleted === 'true';
    this.amountMin = params.amount_available_gt ? Number(params.amount_available_gt) : null;
    this.amountMax = params.amount_available_lt ? Number(params.amount_available_lt) : null;
    this.valueMin = params.value_min ? Number(params.value_min) : null;
    this.valueMax = params.value_max ? Number(params.value_max) : null;
    
    if (params.search) {
      this.searchTerm = params.search;
    }

    // Date filters
    if (params.date_start) {
      this.dateStart.setValue(new Date(params.date_start));
    }
    if (params.date_end) {
      this.dateEnd.setValue(new Date(params.date_end));
    }
  }

  updateUrlWithFilters(): void {
    const queryParams: any = {};

    // Only add params that have values, others will be removed
    if (this.searchTerm.trim()) {
      queryParams.search = this.searchTerm.trim();
    } else {
      queryParams.search = null; // Remove if empty
    }

    if (this.lowStock) {
      queryParams.low_stock = 'true';
    } else {
      queryParams.low_stock = null; // Remove if false
    }

    if (this.outOfStock) {
      queryParams.out_of_stock = 'true';
    } else {
      queryParams.out_of_stock = null; // Remove if false
    }

    if (this.includeDeleted) {
      queryParams.include_deleted = 'true';
    } else {
      queryParams.include_deleted = null; // Remove if false
    }

    if (this.amountMin !== null && this.amountMin !== undefined) {
      queryParams.amount_available_gt = this.amountMin.toString();
    } else {
      queryParams.amount_available_gt = null; // Remove if null
    }

    if (this.amountMax !== null && this.amountMax !== undefined) {
      queryParams.amount_available_lt = this.amountMax.toString();
    } else {
      queryParams.amount_available_lt = null; // Remove if null
    }

    if (this.valueMin !== null && this.valueMin !== undefined) {
      queryParams.value_min = this.valueMin.toString();
    } else {
      queryParams.value_min = null; // Remove if null
    }

    if (this.valueMax !== null && this.valueMax !== undefined) {
      queryParams.value_max = this.valueMax.toString();
    } else {
      queryParams.value_max = null; // Remove if null
    }

    if (this.dateStart.value) {
      queryParams.date_start = this.dateStart.value.toISOString().split('T')[0];
    } else {
      queryParams.date_start = null; // Remove if null
    }

    if (this.dateEnd.value) {
      queryParams.date_end = this.dateEnd.value.toISOString().split('T')[0];
    } else {
      queryParams.date_end = null; // Remove if null
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
    this.loadProducts();
  }

  clearDateFilter(): void {
    this.dateStart.setValue(null);
    this.dateEnd.setValue(null);
    this.updateUrlWithFilters();
    this.loadProducts();
  }

  hasDateFilter(): boolean {
    return !!(this.dateStart.value || this.dateEnd.value);
  }

  hasActiveFilters(): boolean {
    return this.lowStock || 
           this.outOfStock || 
           this.includeDeleted || 
           this.hasDateFilter() ||
           (this.amountMin !== null && this.amountMin !== undefined) ||
           (this.amountMax !== null && this.amountMax !== undefined) ||
           (this.valueMin !== null && this.valueMin !== undefined) ||
           (this.valueMax !== null && this.valueMax !== undefined);
  }

  buildQueryParams(): ProductQueryParams {
    const params: ProductQueryParams = {};

    if (this.lowStock) {
      params.low_stock = true;
    }

    if (this.outOfStock) {
      params.out_of_stock = true;
    }

    if (this.includeDeleted) {
      params.include_deleted = true;
    }

    if (this.amountMin !== null && this.amountMin !== undefined) {
      params.amount_available_gt = this.amountMin;
    }

    if (this.amountMax !== null && this.amountMax !== undefined) {
      params.amount_available_lt = this.amountMax;
    }

    if (this.valueMin !== null && this.valueMin !== undefined) {
      params.value_min = this.valueMin;
    }

    if (this.valueMax !== null && this.valueMax !== undefined) {
      params.value_max = this.valueMax;
    }

    return params;
  }

  editProduct(product: Product): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      data: { product: product }
    });

    dialogRef.afterClosed().subscribe((result: Product | null) => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  deleteProduct(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir o produto "${product.name}"?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.productsService.deleteProduct(product.id).subscribe({
          next: () => {
            this.snackBar.open('Produto excluído com sucesso', 'Fechar', {
              duration: 3000
            });
            this.loadProducts();
            // Reload deleted products if accordion is open
            if (this.showDeleted) {
              this.deletedDataSource.data = [];
              this.loadDeletedProducts();
            }
          },
          error: (err: any) => {
            console.error('Error deleting product:', err);
            this.snackBar.open('Erro ao excluir produto', 'Fechar', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  restoreProduct(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Restauração',
        message: `Tem certeza que deseja restaurar o produto "${product.name}"?`,
        confirmText: 'Restaurar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.productsService.restoreProduct(product.id).subscribe({
          next: () => {
            this.snackBar.open('Produto restaurado com sucesso', 'Fechar', {
              duration: 3000
            });
            // Remove from deleted list
            this.deletedDataSource.data = this.deletedDataSource.data.filter((p: Product) => p.id !== product.id);
            // Reload main products list
            this.loadProducts();
          },
          error: (err: any) => {
            console.error('Error restoring product:', err);
            this.snackBar.open('Erro ao restaurar produto', 'Fechar', {
              duration: 3000
            });
          }
        });
      }
    });
  }

  createProduct(): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      data: { product: null }
    });

    dialogRef.afterClosed().subscribe((result: Product | null) => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  onDeletedPanelOpened(): void {
    this.showDeleted = true;
    this.loadDeletedProducts();
  }

  onDeletedPanelClosed(): void {
    this.showDeleted = false;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

// Product Filters Dialog Component
@Component({
  selector: 'app-product-filters-dialog',
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
              <mat-checkbox [(ngModel)]="filters.lowStock">
                Estoque Baixo
              </mat-checkbox>
              <mat-checkbox [(ngModel)]="filters.outOfStock">
                Sem Estoque
              </mat-checkbox>
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
                <label>Quantidade Mínima</label>
                <mat-form-field appearance="fill" class="filter-number-field">
                  <input matInput type="number" [(ngModel)]="filters.amountMin" placeholder="Ex: 10">
                </mat-form-field>
              </div>

              <div class="filter-range-group">
                <label>Quantidade Máxima</label>
                <mat-form-field appearance="fill" class="filter-number-field">
                  <input matInput type="number" [(ngModel)]="filters.amountMax" placeholder="Ex: 100">
                </mat-form-field>
              </div>

              <div class="filter-range-group">
                <label>Valor Mínimo (R$)</label>
                <mat-form-field appearance="fill" class="filter-number-field">
                  <input matInput type="number" [(ngModel)]="filters.valueMin" placeholder="Ex: 10.00" step="0.01">
                </mat-form-field>
              </div>

              <div class="filter-range-group">
                <label>Valor Máximo (R$)</label>
                <mat-form-field appearance="fill" class="filter-number-field">
                  <input matInput type="number" [(ngModel)]="filters.valueMax" placeholder="Ex: 1000.00" step="0.01">
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
export class ProductFiltersDialogComponent {
  filters: any = {};

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.filters = {
      lowStock: data.lowStock || false,
      outOfStock: data.outOfStock || false,
      includeDeleted: data.includeDeleted || false,
      amountMin: data.amountMin || null,
      amountMax: data.amountMax || null,
      valueMin: data.valueMin || null,
      valueMax: data.valueMax || null
    };
  }

  clearFilters(): void {
    this.filters = {
      lowStock: false,
      outOfStock: false,
      includeDeleted: false,
      amountMin: null,
      amountMax: null,
      valueMin: null,
      valueMax: null
    };
    // Note: URL will be updated when user clicks "Aplicar"
  }
}

// Product Form Dialog Component
@Component({
  selector: 'app-product-form-dialog',
  template: `
    <h2 mat-dialog-title>{{ isEditing ? 'Editar Produto' : 'Novo Produto' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Nome *</mat-label>
          <input matInput formControlName="name" placeholder="Nome do produto">
          <mat-error *ngIf="productForm.get('name')?.hasError('required')">
            Nome é obrigatório
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Descrição</mat-label>
          <textarea matInput formControlName="description" placeholder="Descrição do produto" rows="4"></textarea>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Valor (R$) *</mat-label>
          <input matInput type="number" formControlName="value" placeholder="0.00" step="0.01" min="0.01">
          <mat-error *ngIf="productForm.get('value')?.hasError('required')">
            Valor é obrigatório
          </mat-error>
          <mat-error *ngIf="productForm.get('value')?.hasError('min')">
            Valor deve ser maior que zero
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Quantidade *</mat-label>
          <input matInput type="number" formControlName="amount_available" placeholder="0" min="0">
          <mat-error *ngIf="productForm.get('amount_available')?.hasError('required')">
            Quantidade é obrigatória
          </mat-error>
          <mat-error *ngIf="productForm.get('amount_available')?.hasError('min')">
            Quantidade não pode ser negativa
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null" [disabled]="isSaving">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="isSaving || productForm.invalid">
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
export class ProductFormDialogComponent {
  productForm: FormGroup;
  isEditing = false;
  isSaving = false;
  private readonly productsService = inject(ProductsService);
  private readonly dialogRef = inject(MatDialogRef<ProductFormDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  constructor(@Inject(MAT_DIALOG_DATA) public data: { product: Product | null }) {
    this.isEditing = !!data.product;

    this.productForm = this.fb.group({
      name: [data.product?.name || '', [Validators.required]],
      description: [data.product?.description || ''],
      value: [data.product?.value || null, [Validators.required, Validators.min(0.01)]],
      amount_available: [data.product?.amount_available || null, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid || this.isSaving) {
      return;
    }

    this.isSaving = true;
    const formValue = this.productForm.value;

    if (this.isEditing && this.data.product) {
      // Update existing product
      this.productsService.updateProduct(this.data.product.id, {
        name: formValue.name,
        description: formValue.description || undefined,
        value: formValue.value,
        amount_available: formValue.amount_available
      }).subscribe({
        next: (response: { product: Product }) => {
          this.snackBar.open('Produto atualizado com sucesso', 'Fechar', {
            duration: 3000
          });
          this.dialogRef.close(response.product);
        },
        error: (err: any) => {
          console.error('Error updating product:', err);
          this.snackBar.open('Erro ao atualizar produto', 'Fechar', {
            duration: 3000
          });
          this.isSaving = false;
        }
      });
    } else {
      // Create new product
      this.productsService.createProduct({
        name: formValue.name,
        description: formValue.description || undefined,
        value: formValue.value,
        amount_available: formValue.amount_available
      }).subscribe({
        next: () => {
          this.snackBar.open('Produto criado com sucesso', 'Fechar', {
            duration: 3000
          });
          this.dialogRef.close({ id: 0 } as Product); // Return a dummy product to trigger reload
        },
        error: (err: any) => {
          console.error('Error creating product:', err);
          this.snackBar.open('Erro ao criar produto', 'Fechar', {
            duration: 3000
          });
          this.isSaving = false;
        }
      });
    }
  }
}
