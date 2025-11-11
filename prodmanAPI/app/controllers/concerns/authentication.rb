module Authentication
  extend ActiveSupport::Concern

  included do
    helper_method :authenticated?
    helper_method :current_user
    before_action :require_authentication
  end

  class_methods do
    def allow_unauthenticated_access(**options)
      skip_before_action :require_authentication, **options
    end
  end

  private
    def authenticated?
      current_user.present?
    end

    def current_user
      Current.user
    end

    def require_authentication
      Current.user ||= authenticate_with_token
      Current.user || request_authentication
    end

    def authenticate_with_token
      token = request.headers["Authorization"]&.split&.last
      return nil unless token
      
      decoded_token = JsonWebToken.decode(token)
      return nil unless decoded_token
      
      User.find_by(id: decoded_token[:user_id])
    end

    def request_authentication
      render json: { error: "Unauthorized. Token invalid or not provided"}, status: :unauthorized
    end


end
