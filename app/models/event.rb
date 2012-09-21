class Event < ActiveRecord::Base
  attr_accessible :fb_id, :name, :description, :start_time, :end_time, :lat, :lon
  belongs_to :user

  after_create :create_facebook_event

  def create_facebook_event
    # picture = Koala::UploadableIO.new(File.open("PATH TO YOUR EVENT IMAGE"))

    # picture is not required
    params = {
        # :picture => picture,
        :name => self.name,
        :description => self.name,
        :start_time => self.start_time,
        :end_time => self.end_time,
        :location_id => location_id
    }

    event = graph_api.put_object('me', 'events', params )
    self.update_column(:fb_id, event['id'])
  end

  def location_id
    # graph_api.get_connections('search?type=place&center=37.76,-122.427&distance=1000')
    # TODO...
    # graph_api
  end

  def graph_api
    @graph||= Koala::Facebook::GraphAPI.new(self.user.token)
  end
end
