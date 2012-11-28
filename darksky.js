var api = require('zenircbot-api');
var darksky = require('darksky');

var zen = new api.ZenIRCBot();
var config = api.load_config('./darksky/config.json');

var client = new darksky.Client(config.api_key);

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

      var msg = "[Dark Sky] " + forecast.currentTemp + "° F."
              + " " + capitalize(forecast.currentSummary);

      // if Dark Sky provides it, add the minutes until change to the message
      if (forecast.minutesUntilChange > 0) {
        msg += " for the next " + forecast.minutesUntilChange + " minutes.";
      }

      zen.send_privmsg(config.channel, msg);
    }

    setTimeout(check, forecast.checkTimeout * 1000);
  });
}

check();
