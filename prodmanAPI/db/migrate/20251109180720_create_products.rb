class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|
      t.string :name
      t.decimal :value, precision: 10, scale: 2
      t.integer :amount_available
      t.datetime :deleted_at

      t.timestamps
    end
    add_index :products, :name, unique: true
  end
end
