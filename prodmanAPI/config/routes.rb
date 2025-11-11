Rails.application.routes.draw do
  post "/auth/signin", to: "users#create"
  post "/auth/login", to: "sessions#create"
  delete "/auth/logout", to: "sessions#destroy"

  resources :users, except: [:create]
  resources :products

  patch "/users/:id/restore", to: "users#restore"
  patch "/products/:id/restore", to: "products#restore"

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
end
