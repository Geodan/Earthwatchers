/*global L */
var map=null;


function mapPolygon(poly){
      return poly.map(function(line){return mapLineString(line)})
    }

(function (window, document, L) {
    "use strict";

	var url = window.location.search;
	var projectName = url.replace('?', ''); 
	document.getElementById('projectName').innerHTML = projectName;
    
    loadJSON("data/projects.geojson", function (projects) {
        map = L.map('map');
        var ggl2 = new L.Google("satellite");
        map.addLayer(ggl2);
        var geojson = L.geoJson(projects, {fill: false, filter: function(feature, layer) {
                return feature.properties["Name"]=== projectName;
            }
        }).addTo(map);
        map.fitBounds(geojson.getBounds());
        
        loadJSON('api/observations/'+projectName, function(observations){
            document.getElementById('numberOfObservations').innerHTML = observations.features.length;
            var observationsLayer = L.geoJson(observations, {fill: false}).addTo(map);
        });
    });
}(window, document, L));
