# ZenIRCBot-DarkSky
A service for [ZenIRCBot](https://github.com/wraithan/zenircbot) that pulls instant weather forecasts from the [Dark Sky](http://darkskyapp.com/) API.
Sends a message to an IRC channel when it will start or stop raining.

## Installation

1. Clone the repo as 'darksky' into the services folder

    $ git clone https://github.com/jyaganeh/ZenIRCBot-DarkSky.git darksky

2. Copy _config.json.dist_ to _config.json_ and set your Dark Sky API Key, location, and the notification channel.

3. Install Dark Sky client 

    $ npm install darksky
  
4. Send a message to the bot: 'restart darksky/darksky.js'
