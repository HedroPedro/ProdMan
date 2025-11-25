class SessionsController < ApplicationController
  allow_unauthenticated_access only: :create
  rate_limit to: 10, within: 3.minutes, only: :create, 
    with: -> { render json: { error: "Tente novamente mais tarde." }, status: :too_many_requests }

  # POST /auth/login
  def create
    email = params[:email]
    password = params[:password]
    if @user = User. authenticate_by(email_address: email, password: password)
      payload = { user_id: @user.id }
      token = JsonWebToken.encode(payload)
      render json: { token: token, user: @user}, status: :created
    else
      render json: {error: "Email ou senha inválidos"}, status: :unauthorized
    end
  end

  def destroy
    if current_user
      head :no_content
    else
      render json: {error: "Nenhum usuário para fazer logout"}, status: :unauthorized
    end
  end

  def current_user
    Current.user
  end

end
