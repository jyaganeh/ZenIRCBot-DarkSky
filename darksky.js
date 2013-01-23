var api = require('zenircbot-api');
var darksky = require('darksky');
var request = require('request');

var zen = new api.ZenIRCBot();
var config = api.load_config('./darksky/config.json');

var client = new darksky.Client(config.api_key);
var sub = zen.get_redis_client();

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.substring(1);
}

var lastPrecipitating = null;

function check() {
  client.brief_forecast(config.lat, config.lng, function(err, data) {
    if (err) {
      console.error(err);
    }

    var forecast = JSON.parse(data);

    // print the current conditions if the isPrecipitation has changed
    if (lastPrecipitating != forecast.isPrecipitating) {
      lastPrecipitating = forecast.isPrecipitating;

      var msg = "[Weather] " + capitalize(forecast.currentSummary);

      // if Dark Sky provides it, add the minutes until change to the message
      if (forecast.minutesUntilChange > 0) {
        msg += " for the next " + forecast.minutesUntilChange + " minutes.";
      }
      
      msg += " (" + forecast.currentTemp + "°F)"

      zen.send_privmsg(config.channel, msg);
    }

    setTimeout(check, forecast.checkTimeout * 1000);
  });
}

function http_request(host, path, callback) {
  console.log('[darksky] '+host+path);
  request('http://'+host+path, function(error, response, body){
    callback(JSON.parse(body));
  });
}

function geocode(text, callback) {
  http_request('geocode.arcgis.com', '/arcgis/rest/services/World/GeocodeServer/find?text='+text+'&outFields=Shape,Score&f=pjson', function(response){
    if(response.locations && response.locations.length > 0) {
      var latitude = response.locations[0].feature.geometry.y;
      var longitude = response.locations[0].feature.geometry.x;
      callback(null, {latitude: latitude, longitude: longitude, name: response.locations[0].name});
    } else {
      callback({error: "Error trying to geocode \""+text+"\""}, null);
    }
  });
}

sub.subscribe('in');
sub.on('message', function(channel, message) {
  var msg = JSON.parse(message);
  var sender = msg.data.sender;
  if(msg.version == 1) {
    if(match=msg.data.message.match(/^!weather (.+)/)) {
      console.log('[darksky] Looking for weather for '+match[1]);
      geocode(match[1], function(err, location){
        if(err) {
          zen.send_privmsg(msg.data.channel, err.error);
        } else {
          client.brief_forecast(location.latitude, location.longitude, function(err, data){
            var forecast = JSON.parse(data);

            var reply = capitalize(forecast.currentSummary);

            // if Dark Sky provides it, add the minutes until change to the message
            if (forecast.minutesUntilChange > 0) {
              reply += " for the next " + forecast.minutesUntilChange + " minutes.";
            }
            
            reply += " " + forecast.currentTemp + "°F";
            reply += " (" + location.name + ")";

            zen.send_privmsg(msg.data.channel, reply);
          });
        }
      });
    }
  }
});

// Start the timer
check();
