/*jslint browser: true*/
/*global L */
/*global GEOHEX */
var geohexcode = 'PO2670248';
var startZoomlevel = 12;
var user="barack";
var satelliteImages = null;
var map = null;
var default_geohex_level = 7;

function getSatelliteImageByDate(date) {
	for (var i = 0; i < satelliteImages.features.length; i++) {
		if (satelliteImages.features[i].properties.Published === date) {
			return satelliteImages.features[i];
		}
	}
}

function findEarthwatchersLayer() {
	var result = null;
	map.eachLayer(function(layer) {
		if (layer.options.type !== null) {
			if (layer.options.type === 'earthwatchers') {
				result = layer;
			}
		}
	});
	return result;
}

function sendObservation(observation){
	var zone = GEOHEX.getZoneByCode(geohexcode);
	var obs = { 
     "user"    :   user, 
     "lat"     :   zone.lat,
     "lon"     :   zone.lon,
     "level"    :  zone.getLevel(),
     "observation": observation,
     "geohex": geohexcode
	};
	var url = 'api/observations';
	var request = new XMLHttpRequest();
	request.open('POST', url, true);
	request.setRequestHeader("Content-type","application/json");
	request.send(JSON.stringify(obs));

	request.onload = function() {
		if (request.status == 201) {
			var data = JSON.parse(request.responseText);
			getHexagon(geohexcode, hexagoncallback);
		}
	};
}

function timesliderChanged(ctrl) {
	var day = satelliteImages.features[ctrl.value].properties.Published; document.getElementById('rangeValLabel').innerHTML = day;
	var earthwatchersLayer = findEarthwatchersLayer();

	var s = getSatelliteImageByDate(day);
	var url = s.properties.UrlTileCache + '/{z}/{x}/{y}.png';
	var maxlevel = s.properties.MaxLevel;
	var newLayer = L.tileLayer(url, {
		tms: true,
		maxZoom: maxlevel,
		type: 'earthwatchers'
	});
	map.addLayer(newLayer);

	if (earthwatchersLayer !== null) {
		map.removeLayer(earthwatchersLayer);
	}
}

function getGeohexPolygon(geohexcode, style) {
	var zone = GEOHEX.getZoneByCode(geohexcode);
	var polygon = L.polygon(zone.getHexCoords(), style);
	return polygon;
}

function getSatelliteImageData(bbox, imagetype, callback) {
	var url = 'api/satelliteimages?bbox=' + bbox + '&imagetype=' + imagetype;
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			var data = JSON.parse(request.responseText);
			callback(data);
		}
	};
	request.send();
}


function getHexagon(geohex, callback) {
	var url = 'api/hexagons/' + geohex;
	var request = new XMLHttpRequest();
	request.open('GET', url, true);

	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			var data = JSON.parse(request.responseText);
			callback(data);
		}
	};
	request.send();
}

function compare(a, b) {
	if (a.properties.Published < b.properties.Published){
		return -1;
	}
	if (a.properties.Published > b.properties.Published){
		return 1;
	}
	return 0;
}

function random (low, high) {
    return Math.random() * (high - low) + low;
}

function satelliteImagescallback(req) {
	satelliteImages = req;
	var sel = document.getElementById('timeslider');
	satelliteImages.features.sort(compare);
	sel.onchange();
}

function next(){
	location.reload();
}

function hexagoncallback(req) {
	// alert("obs: " + req);
	document.getElementById('btnYes').innerHTML = 'Yes (' + req.yes + ')';
	document.getElementById('btnNo').innerHTML = 'No (' + req.no + ')';
	document.getElementById('btnMaybe').innerHTML = 'Maybe (' + req.maybe + ')';
}

function satelliteTypeSelectionChanged(sel) {
	var currentImageType = sel.value;
	var polygon = getGeohexPolygon(geohexcode);
	var bbox = polygon.getBounds().toBBoxString();
	getSatelliteImageData(bbox, currentImageType, satelliteImagescallback);
}

(function(window, document, L, undefined) {
	'use strict';
	L.Icon.Default.imagePath = 'images/';

	var lon_min = 111.0;var lon_max = 112.0;
    var lat_min = 1;var lat_max = 2;

    var lon_rnd= random(lon_min,lon_max);
    var lat_rnd= random(lat_min,lat_max);

    geohexcode= GEOHEX.getZoneByLocation(lat_rnd,lon_rnd,default_geohex_level).code;

	// fire onchange event of first combobox
	var selectImageType = document.getElementById('selectImageType');
	selectImageType.onchange();

	map = L.map('map', {
		zoomControl: false,
		attributionControl: false
	});

	var myStyle = {
		'color': '#ff0000',
		'weight': 5,
		'opacity': 0.65
	};
	getHexagon(geohexcode, hexagoncallback);

	var polygon = getGeohexPolygon(geohexcode, myStyle);
	var centerHex = polygon.getBounds().getCenter();
	map.setView(centerHex, startZoomlevel, {
		animation: true
	});

	map.addControl(new L.Control.ZoomMin({
		position: 'topright', startLevel:startZoomlevel, startCenter:centerHex
	}));

	L.control.scale({imperial:false, position:'topleft'}).addTo(map);

	//map.addControl(new L.Control.DisplaySatelliteLayer({
	// }));


	var ggl2 = new L.Google('satellite');
	map.addLayer(ggl2);
	//omnivore.topojson('project.topojson').addTo(map);
	map.addLayer(polygon);
}(window, document, L));