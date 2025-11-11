class User < ApplicationRecord
  has_secure_password
  default_scope { where(deleted_at: nil) }

  validates :name, presence: true
  validates :email_address, presence: true, uniqueness: true

  normalizes :email_address, with: ->(e) { e.strip.downcase }

  def as_json(options = nil)
    super(options).except("password_digest")
  end 
end
