class Product < ApplicationRecord
  default_scope { where(deleted_at: nil) }
  validates :name, presence: true, uniqueness: true
  validates :value, presence: true
  validates :amount_available, presence: true
end