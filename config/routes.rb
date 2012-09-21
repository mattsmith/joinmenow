Joinmenow::Application.routes.draw do
  devise_for :users, :controllers => { :omniauth_callbacks => "users/omniauth_callbacks" }

  resources :events
  resources :interests

  root :to => 'events#index'
end
