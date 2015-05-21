# Earthwatchers

[![Join the chat at https://gitter.im/Geodan/Earthwatchers](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Geodan/Earthwatchers?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

(https://travis-ci.org/Geodan/Earthwatchers.svg?branch=master)

Development preview: http://earthwatchers.azurewebsites.net/

Landing page: http://earthwatchers.azurewebsites.net/landing.html

Permalink, for example to project 'Borneo', hexagon PO2662: 

http://earthwatchers.azurewebsites.net/#/Borneo/PO2662

Issues: https://huboard.com/Geodan/Earthwatchers/

# Technology stack

Server side: Node.js with Express, Dotenv, Turf, NoSql

Client side: Leaflet, Leaflet-omnivore, Turf

Data: GeoJSON files

# Dependencies

To get Earthwatchers running on your machine, install Node.js (http://nodejs.org/)

# Development

```
git clone https://github.com/Geodan/Earthwatchers.git

cd earthwatchers\src

npm install

node server.js

http://localhost:3000
```

# Docker

```
docker pull bertt/earthwatchers

docker run -p 3000:3000 bertt/earthwatchers

http://localhost:3000
```


# Communication

Slack room:  https://earthwatchers.slack.com
