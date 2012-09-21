class Event < ActiveRecord::Base
  attr_accessible :fb_id, :name, :description, :start_time, :end_time
  belongs_to :user

  after_create :create_facebook_event

  def create_facebook_event
    graph = Koala::Facebook::GraphAPI.new(self.user.token)
    # picture = Koala::UploadableIO.new(File.open("PATH TO YOUR EVENT IMAGE"))

    # picture is not required
    params = {
        # :picture => picture,
        :name => self.name,
        :description => self.name,
        :start_time => self.start_time,
        :end_time => self.end_time
    }

    event = graph.put_object('me', 'events', params )
    self.update_column(:fb_id, event['id'])
  end
end
