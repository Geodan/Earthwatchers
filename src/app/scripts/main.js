/*jslint browser: true*/
/*global L */

function getSatelliteImageData(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);
            callback(data);
        }
    };
    request.send();
}

function satelliteImagescallback(req) {
    alert('response:' + req.features.length);
}

(function (window, document, L, undefined) {
    'use strict';

	L.Icon.Default.imagePath = 'images/';
    

	/* create leaflet map */
	var center = [0.0, 113];
	var lat = 0.153115115481276;
	var lon = 111.687242798354;
    var geohexcode = "PO2670248";
    
    var zone = GEOHEX.getZoneByCode(geohexcode);

	var map = L.map('map', {
		center: [lat, lon],
		zoom: 7
	});

	var myStyle = {
    "color": "#ff0000",
    "weight": 5,
    "opacity": 0.65
	};

	var myhex = L.polygon(zone.getHexCoords(),myStyle);
    var bounds = myhex.getBounds();
    getSatelliteImageData('api/satelliteimages?bbox=111.68114616674286, 0.14783529583901883, 111.69333942996492, 0.158394933823336&imagetype=Aerial', satelliteImagescallback);
 
	//alert(bounds.toBBoxString());
    

    
	//map.fitBounds(myhex.getBounds());
	// minlevel 0, maxlevel 13
    L.tileLayer('http://geodan.blob.core.windows.net/satellite/LS8_26oktober2014/{z}/{x}/{y}.png', {tms:true, maxZoom:13}).addTo(map);
    var ggl2 = new L.Google('satellite');
	map.addLayer(ggl2);
	omnivore.topojson('project.topojson').addTo(map);
	map.addLayer(myhex);
	// map.addControl(new L.Control.Layers( {'Google':ggl2, 'Esri':esri}, {}, {collapsed:false}));
    var options = {
    radius : 12,
    opacity: 0.5,
    duration: 200,
    lng: function(d){
        return d[0];
    },
    lat: function(d){
        return d[1];
    },
    value: function(d){
        return d.length;
    },
    valueFloor: 0,
    valueCeil: undefined
};

}(window, document, L));