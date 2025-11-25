class DashboardController < ApplicationController

  # GET /dashboard/stats
  def stats
    render json: {
      products: product_stats,
      users: user_stats
    }, status: :ok
  end

  private

  def product_stats
    products = Product.all
    
    total = products.count
    total_units = products.sum(:amount_available)
    # Calculate total value using SQL for better performance
    total_value = products.sum("value * amount_available").to_f
    average_price = total > 0 ? products.average(:value).to_f : 0.0
    
    # Produtos com estoque baixo (threshold: 10)
    low_stock_products = products.where("amount_available < ?", 10)
    low_stock_count = low_stock_products.count
    low_stock_list = low_stock_products.select(:id, :name, :amount_available).map do |p|
      {
        id: p.id,
        name: p.name,
        amount_available: p.amount_available
      }
    end
    
    # Produtos sem estoque
    out_of_stock_count = products.where(amount_available: 0).count
    
    # Produto mais caro
    most_expensive = products.order(value: :desc).first
    most_expensive_data = most_expensive ? {
      id: most_expensive.id,
      name: most_expensive.name,
      value: most_expensive.value.to_f
    } : nil
    
    # Produto mais barato
    cheapest = products.order(value: :asc).first
    cheapest_data = cheapest ? {
      id: cheapest.id,
      name: cheapest.name,
      value: cheapest.value.to_f
    } : nil

    {
      total: total,
      total_units: total_units,
      total_value: total_value,
      average_price: average_price.round(2),
      low_stock_count: low_stock_count,
      low_stock_products: low_stock_list,
      out_of_stock_count: out_of_stock_count,
      most_expensive: most_expensive_data,
      cheapest: cheapest_data
    }
  end

  def user_stats
    users = User.all
    total = users.count
    
    # Usuários criados nos últimos 7 dias
    created_last_7_days = users.where("created_at >= ?", 7.days.ago).count
    
    # Usuários criados nos últimos 30 dias
    created_last_30_days = users.where("created_at >= ?", 30.days.ago).count

    {
      total: total,
      created_last_7_days: created_last_7_days,
      created_last_30_days: created_last_30_days
    }
  end

end

