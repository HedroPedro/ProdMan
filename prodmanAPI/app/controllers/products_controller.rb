class ProductsController < ApplicationController

  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
  before_action :set_product, only: [:show, :update, :destroy]

  # POST /products
  def create
    @product = Product.new(product_params)
    if @product.save
      render json: { message: "Product was successfully created" }, status: :created
    else
      render json: { message: "Issue saving product", errors: @product.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /products
  def index
    @products = Product.all
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
      render json: { message: "Issue updating product", errors: @product.errors.full_messages }, status: :unprocessable_entity
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
      render json: { message: "Product was successfully restored", product: @product }
    else
      render json: { message: "Issue restoring product", errors: @product.errors.full_messages }, status: :bad_request
    end
  end

  private

  def record_not_found(error)
    render json: { error: "Product with ID #{params[:id]} not found" }, status: :not_found
  end

  def set_product
    @product = Product.find(params[:id])
  end

  def product_params
    params.permit(:name, :value, :amount_available)
  end

end