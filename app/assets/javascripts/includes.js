JMN = {}
JMN.DEFAULTS = {
	latitude: 49.2825646098,    // Downtown Vancouver
	longitude: -123.1181656402, // Downtown Vancouver
	zoom: 14,
	circle_colour: "#13a9b8",  //"#fcb400"
    geolocate_max_radius : 5000,    // 5000m - enough for a city
    geolocate_timeout : 8000,
    geolocate_options: {
        enableHighAccuracy: true,
        timeout: 4000, // in milliseconds
        maximumAge: 1, // in milliseconds
    },
//    max_geo_tries : 2,  // maximum number of times to try watchPosition calls before failure
}

JMN.distance_between_points = function(p1, p2) {
  if (!p1 || !p2) {
    return 0;
  }
  var R = 6371000; // Radius of the Earth in meters
  var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
  var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};

JMN.create_marker_bounds = function(markers) {
    var bounds = new google.maps.LatLngBounds();
    for(var i in markers) {
        bounds.extend(markers[i].getPosition());
    }
    return bounds;
}


JMN.geolocate = function(max_radius, options) {
    // geolocate uses the HTML5 watchPosition method (more accurate than getCurrentPosition)
    // to determine location.  It will keep trying to get an accurate location, until
    // an error occurs, or until JMN.DEFAULTS.geolocation_timeout expires
    if(max_radius === undefined) { max_radius = JMN.DEFAULTS.geolocate_max_radius };
    if(options === undefined) { options = JMN.DEFAULTS.geolocate_options };

    var watcher_pid;
    var geolocating = true;     // timeout trigger

    // result returned to caller:
    var deferred_result = $.Deferred();
    deferred_result.done(function(location) {
            console.log("JMN.geolocate:  geolocation was successful: " + JSON.stringify(location));
        }).fail(function(error) {
            console.log("ERROR:  JMN.geolocate:  geolocation was not successful: " + error);
        });

    // Overall timeout:
    _.delay(function() {
        console.log("JMN.geolocate:  overall timeout occurred");
        geolocating = false;    // stops the loop of trying to geolocate
    }, JMN.DEFAULTS.geolocate_timeout);

    // Create watchPosition callbacks:
    var geo_fail = function(error) {
        navigator.geolocation.clearWatch(watcher_pid);  // stops the watchPosition watcher
        console.log("ERROR:  watchPosition error:",error);
        deferred_result.reject(error);
    };
    var geo_success = function(location) {
        navigator.geolocation.clearWatch(watcher_pid);  // stops the watchPosition watcher
        if(location.coords.accuracy <= max_radius) {
            console.log("JMN.geolocate:  got good accuracy!");
            deferred_result.resolve(location);
        }
        else {
            // Too inaccurate, so try again:
            if(geolocating) {
                console.log("JMN.geolocate:  got bad accuracy! (so trying again)");
                watcher_pid = navigator.geolocation.watchPosition(geo_success, geo_fail, options);
            }
            else{
                console.log("ERROR:  JMN.geolocate:  timeout has been forced!");
                deferred_result.reject("Forced time-out");
            }
        }
    };

    // Start the first watchPosition:
    watcher_pid = navigator.geolocation.watchPosition(geo_success, geo_fail, options);

    return deferred_result.promise();
};

function CircleMarker(circle_opts, marker_opts) {
	circle_opts = circle_opts || {};  // TODO: make default options
	marker_opts = marker_opts || {};   // TODO: make default options

	if(!marker_opts.position) {
		marker_opts.position = marker_opts.map.getCenter();
	}
	this.set('map', marker_opts.map);
	this.set('position', marker_opts.position);
	this.set('zIndex', marker_opts.zIndex);
	this.set('fillColor', circle_opts.fillColor);
	this.set('strokeColor', circle_opts.strokeColor);

	// Marker:
	var marker = new google.maps.Marker(marker_opts);
	marker.bindTo('map', this);
	this.marker = marker;

	// Circle:
	var circle = new google.maps.Circle(circle_opts);
	circle.bindTo('map', this);
	circle.bindTo('center', this, 'position');
	circle.bindTo('zIndex', this);
	circle.bindTo('fillColor', this);
	circle.bindTo('strokeColor', this);
	this.circle = circle;

	// Reverse bindings:
	this.bindTo('position', marker);
	this.bindTo('zIndex', marker);
	this.bindTo('bounds', circle);
	this.bindTo('radius', circle);
}
CircleMarker.prototype = new google.maps.MVCObject();
CircleMarker.prototype.getBounds = function() {
	return this.circle.getBounds();
}
CircleMarker.prototype.getPosition = function() {
    return this.marker.getPosition();
}

JMN.add_circle_marker = function(map, marker_opts, circle_opts) { //, radius, lat, lng, marker_icon) {
	var default_marker_opts = {
		map: map,
		draggable: false,
		raiseOnDrag: false,
		zIndex: 1000,
        icon: new google.maps.MarkerImage("{{=URL('static','images/tt/map_icons/blank_challenge_marker.png')}}"),
	}
    var default_circle_opts = {
        map: map,
        editable: false,
        fillColor: JMN.DEFAULTS.circle_colour,
        fillOpacity: 0.25,
        strokeColor: JMN.DEFAULTS.circle_colour,
        strokeWeight: 3,
        zIndex: 1,
    };
    // ----------------------
	var circle_options = {};
	if(circle_opts) {
        var circle_options = _.defaults(circle_opts, default_circle_opts);
    }
    var marker_options = _.defaults(marker_opts || {}, default_marker_opts);
    // ----------------------
	var circle_marker = new CircleMarker(circle_options, marker_options);
	return circle_marker;
};

