class UsersController < ApplicationController

  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found
  allow_unauthenticated_access only: :create
  before_action :set_user, only: [:show, :update, :destroy]

  # POST /auth/signin
  def create
    attrs = user_params.to_h
    attrs[:email_address] = attrs.delete(:email) if attrs.key?(:email)
    @user = User.new(attrs)

    if @user.save
      render json: { message: "User was successfully created" }, status: :created
    else
      render json: { message: "Issue saving user", errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /users
  def index
    @users = build_users_query
    render json: { users: @users }, status: :ok
  end

  # GET /users/{id}
  def show
    render json: { user: @user }, status: :ok
  end

  # PATCH /users/{id}
  def update
    attrs = user_params.to_h
    attrs[:email_address] = attrs.delete(:email) if attrs.key?(:email)
    
    if @user.update(attrs)
      render json: { user: @user }, status: :ok
    else
      render json: { message: "Issue updating user", errors: @user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /users/{id}
  def destroy
    @user.update(deleted_at: Time.current)
    head :no_content
  end

  # PATCH /users/{id}/restore
  def restore
    @user = User.unscoped.find(params[:id])
    if @user.update(deleted_at: nil)
      render json: { message: "User was successfully restored", user: @user}
    else
      render json: { message: "Issue restoring user", errors: @user.errors.full_messages }, status: :bad_request
    end
  end

  private

  def record_not_found(error)
    render json: { error: "User with ID #{params[:id]} not found" }, status: :not_found
  end

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.permit(:name, :email, :password)
  end

  def build_users_query
    # Start with base query - use unscoped if include_deleted is true
    users = params[:include_deleted] == 'true' ? User.unscoped : User.all

    # Filter by created_after date
    if params[:created_after].present?
      begin
        date = Date.parse(params[:created_after])
        users = users.where("created_at >= ?", date.beginning_of_day)
      rescue ArgumentError
        # Invalid date format, ignore parameter
      end
    end

    # Filter by created_before date
    if params[:created_before].present?
      begin
        date = Date.parse(params[:created_before])
        users = users.where("created_at <= ?", date.end_of_day)
      rescue ArgumentError
        # Invalid date format, ignore parameter
      end
    end

    # Filter by created_last_days (users created in the last X days)
    if params[:created_last_days].present?
      days = params[:created_last_days].to_i
      if days > 0
        users = users.where("created_at >= ?", days.days.ago)
      end
    end

    users
  end
end