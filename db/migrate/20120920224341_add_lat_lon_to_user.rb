class AddLatLonToUser < ActiveRecord::Migration
  def change
    add_column :users, :lat, :string
    add_column :users, :lon, :string
  end
end
