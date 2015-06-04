/*global L */
var map=null;

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    var html = "user: " + feature.properties.user +"<br/>";
    html += "observation: " + feature.properties.observation +"<br/>";
    html += "date: " + feature.properties.date +"<br/>";
    html += "hexagon: " + feature.properties.geohex +"<br/>";
    layer.bindPopup(html);
}

(function (window, document, L) {
    "use strict";

	var url = window.location.search;
	var projectName = url.replace('?', ''); 
	document.getElementById('projectName').innerHTML = projectName;
    //"#/" + projectName + "/"
    document.getElementById('editorLink').href = '/#/' + projectName;
    document.getElementById('editorLink').innerHTML = 'editor project ' + projectName;
    
    
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
            var observationsLayer = L.geoJson(observations, {fill: false, onEachFeature: onEachFeature}).addTo(map);
        });
    });
}(window, document, L));
