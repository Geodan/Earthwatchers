/*jslint browser: true*/
/*global L */

(function (window, document, L, undefined) {
	'use strict';

	L.Icon.Default.imagePath = 'images/';

	/* create leaflet map */
	var center = [0.0, 113];
	var map = L.map('map', {
		center: [center[0], center[1]],
		zoom: 7
	});

    var esri = new L.esri.basemapLayer('Imagery');
    //L.esri.basemapLayer('ImageryLabels').addTo(map);
    L.tileLayer('http://geodan.blob.core.windows.net/satellite/LS8_26oktober2014/{z}/{x}/{y}.png', {tms:true}).addTo(map);
    var ggl2 = new L.Google('satellite');
	map.addLayer(ggl2);
	map.addControl(new L.Control.Layers( {'Google':ggl2, 'Esri':esri}, {}, {collapsed:false}));
	    // Options for the hexbin layer
	/**
	var options = {
	    radius : 10000,                            // Size of the hexagons/bins
	    opacity: 0.5,                           // Opacity of the hexagonal layer
	    duration: 200,                          // millisecond duration of d3 transitions (see note below)
	    lng: 113,       // longitude accessor
	    lat: 0,       // latitude accessor
	    value: 3, // value accessor - derives the bin value
	    valueFloor: 0,                          // override the color scale domain low value
	    valueCeil: undefined,                   // override the color scale domain high value
	    colorRange: ['#f7fbff', '#08306b']      // default color range for the heat map
	};

	// Create the hexbin layer and add it to the map
	var hexLayer = L.hexbinLayer(options).addTo(map);
	//hexLayer.data([[113, 0]]);
    */
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

var hexLayer = L.hexbinLayer(options).addTo(map);
hexLayer.colorScale().range(['white', 'blue']);

var latFn = d3.random.normal(center[0], 1);
var longFn = d3.random.normal(center[1], 1);

var generateData = function(){
    var data = [];
    for(var i=0; i<1000; i++){
        data.push([longFn(),  latFn()]);
    }
    hexLayer.data(data);
};
generateData();
omnivore.topojson('project.topojson').addTo(map);


    // http://geodan.blob.core.windows.net/satellite/USGS_LS8_False_North_24june'13/10/830/514.png

}(window, document, L));