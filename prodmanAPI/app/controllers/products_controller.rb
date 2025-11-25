class ProductsController < ApplicationController

  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
  before_action :set_product, only: [:show, :update, :destroy]

  # POST /products
  def create
    @product = Product.new(product_params)
    if @product.save
      render json: { message: "Produto criado com sucesso" }, status: :created
    else
      render json: { message: "Erro ao salvar produto", errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /products
  def index
    @products = build_products_query
    render json: { products: @products }, status: :ok
  end

  # GET /products/{id}
  def show
    render json: { product: @product }, status: :ok
  end

  # PATCH /products/{id}
  def update
    if @product.update(product_params)
      render json: { product: @product }, status: :ok
    else  
      render json: { message: "Erro ao atualizar produto", errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /products/{id}
  def destroy
    @product.update(deleted_at: Time.current)
    head :no_content
  end

  # PATCH /products/{id}/restore
  def restore
    @product = Product.unscoped.find(params[:id])
    if @product.update(deleted_at: nil)
      render json: { message: "Produto restaurado com sucesso", product: @product }
    else
      render json: { message: "Erro ao restaurar produto", errors: @product.errors.full_messages }, status: :bad_request
    end
  end

  private

  def record_not_found(error)
    render json: { error: "Produto com ID #{params[:id]} não encontrado" }, status: :not_found
  end

  def set_product
    @product = Product.find(params[:id])
  end

  def product_params
    params.permit(:name, :value, :amount_available)
  end

  def build_products_query
    # Start with base query - use unscoped if include_deleted is true
    products = params[:include_deleted] == 'true' ? Product.unscoped : Product.all

    # Filter by low stock (amount_available < 10)
    if params[:low_stock] == 'true'
      products = products.where("amount_available < ?", 10)
    end

    # Filter by out of stock (amount_available = 0)
    if params[:out_of_stock] == 'true'
      products = products.where(amount_available: 0)
    end

    # Filter by amount_available less than
    if params[:amount_available_lt].present?
      products = products.where("amount_available < ?", params[:amount_available_lt].to_i)
    end

    # Filter by amount_available greater than
    if params[:amount_available_gt].present?
      products = products.where("amount_available > ?", params[:amount_available_gt].to_i)
    end

    # Filter by minimum value
    if params[:value_min].present?
      products = products.where("value >= ?", params[:value_min].to_d)
    end

    # Filter by maximum value
    if params[:value_max].present?
      products = products.where("value <= ?", params[:value_max].to_d)
    end

    products
  end

end