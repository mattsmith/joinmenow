class Event < ActiveRecord::Base
  attr_accessible :fb_id
  has_and_belongs_to_many :interests
end
