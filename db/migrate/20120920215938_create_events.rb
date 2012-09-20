class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.string :fb_id

      t.timestamps
    end
  end
end
