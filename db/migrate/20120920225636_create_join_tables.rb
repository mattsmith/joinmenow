class CreateJoinTables < ActiveRecord::Migration
  def change
    create_table :interests_users do |t|
      t.integer :interest_id
      t.integer  :user_id
      t.timestamps
    end

    create_table :interests_events do |t|
      t.integer :interest_id
      t.integer  :event_id
      t.timestamps
    end
  end
end
