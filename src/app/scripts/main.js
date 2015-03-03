/*jslint browser: true*/
/*global L */

var center = [0.0, 113];
var lat = 0.153115115481276;
var lon = 111.687242798354;
var geohexcode = "PO2670248";


function getGeohexPolygon(geohexcode, style){
	var zone = GEOHEX.getZoneByCode(geohexcode);
    var polygon = L.polygon(zone.getHexCoords(),style);
    return polygon;
}

function satelliteTypeSelectionChanged(sel) {
	var polygon = getGeohexPolygon(geohexcode);
    var bbox = polygon.getBounds().toBBoxString();
    getSatelliteImageData(bbox, sel.value, satelliteImagescallback);
}

function getSatelliteImageData(bbox,imagetype, callback) {
	var url = 'api/satelliteimages?bbox=' + bbox + '&imagetype=' + imagetype;

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


function imageDateChanged(sel){
	alert('selected date: ' + sel.value);
}

function satelliteImagescallback(req) {
	// first clear the date box
	var sel = document.getElementById("selectImageDate");
	sel.options.length = 0;

	for(var i=0;i<req.features.length;i++){
		var f = req.features[i];
		sel.options[sel.options.length]= new Option(f.properties.Published, f.properties.Published);
	}
	//alert(sel.options.length);

	// fill the date select box
	//var selectImageDate = document.getElementById("selectImageDate");
	//alert(selectImageDate.options.length);
	//alert(selectImageDate.options.length);

    //alert('response:' + req.features.length);
}

(function (window, document, L, undefined) {
    'use strict';

	L.Icon.Default.imagePath = 'images/';
    

	/* create leaflet map */

	// fire onchange event of first combobox
	 var selectImageType = document.getElementById("selectImageType");
	 selectImageType.onchange();
     // alert(selectImageType.selectedIndex);
    

	var map = L.map('map', {
		center: [lat, lon],
		zoom: 7
	});

	var myStyle = {
    "color": "#ff0000",
    "weight": 5,
    "opacity": 0.65
	};

	var polygon = getGeohexPolygon(geohexcode,myStyle);
    //var bbox = polygon.getBounds().toBBoxString();
    //getSatelliteImageData(bbox, "Aerial", satelliteImagescallback);
 
	// minlevel 0, maxlevel 13
    L.tileLayer('http://geodan.blob.core.windows.net/satellite/LS8_26oktober2014/{z}/{x}/{y}.png', {tms:true, maxZoom:13}).addTo(map);
    var ggl2 = new L.Google('satellite');
	map.addLayer(ggl2);
	omnivore.topojson('project.topojson').addTo(map);
	map.addLayer(polygon);
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