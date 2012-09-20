JMN = {}
JMN.DEFAULTS = {
	latitude: 49.2825646098,    // Downtown Vancouver
	longitude: -123.1181656402, // Downtown Vancouver
	zoom: 14,
	circle_colour: "#13a9b8",
    geolocate_max_radius : 5000,    // 5000m - enough for a city
    geolocate_timeout : 8000,
    geolocate_options: {
        enableHighAccuracy: true,
        timeout: 4000, // in milliseconds
        maximumAge: 1, // in milliseconds
    },
//    max_geo_tries : 2,  // maximum number of times to try watchPosition calls before failure
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
            $.log("JMN.geolocate:  geolocation was successful: " + JSON.stringify(location));
        }).fail(function(error) {
            $.log("ERROR:  JMN.geolocate:  geolocation was not successful: " + error);
        });

    // Overall timeout:
    _.delay(function() {
        $.log("JMN.geolocate:  overall timeout occurred");
        geolocating = false;    // stops the loop of trying to geolocate
    }, JMN.DEFAULTS.geolocate_timeout);

    // Create watchPosition callbacks:
    var geo_fail = function(error) {
        navigator.geolocation.clearWatch(watcher_pid);  // stops the watchPosition watcher
        $.log("ERROR:  watchPosition error:",error);
        deferred_result.reject(error);
    };
    var geo_success = function(location) {
        navigator.geolocation.clearWatch(watcher_pid);  // stops the watchPosition watcher
        if(location.coords.accuracy <= max_radius) {
            $.log("JMN.geolocate:  got good accuracy!");
            deferred_result.resolve(location);
        }
        else {
            // Too inaccurate, so try again:
            if(geolocating) {
                $.log("JMN.geolocate:  got bad accuracy! (so trying again)");
                watcher_pid = navigator.geolocation.watchPosition(geo_success, geo_fail, options);
            }
            else{
                $.log("ERROR:  JMN.geolocate:  timeout has been forced!");
                deferred_result.reject("Forced time-out");
            }
        }
    };

    // Start the first watchPosition:
    watcher_pid = navigator.geolocation.watchPosition(geo_success, geo_fail, options);

    return deferred_result.promise();
};
