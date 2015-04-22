function getObservationsCount(){
    var i=0;
    map.eachLayer(function (layer) {
        if(layer.id!=null) {
            i++;
        }
    });
    return i;
}

function drawObservations(observations,observationTypes){
    for(var i=0;i<observations.length;i++){
        var observation = observations[i];
        if(observation.observation!='clear'){
            var observationType = getObservationType(observationTypes,observation.observation);
            var newMarker = getObservationMarker(map, observation.lon,observation.lat,observation.geohex, observation.observation,observation.id,observationType);
            newMarker.addTo(map);
        }
    }
}

function getObservationType(observationTypes, type){
    for(var i=0;i<observationTypes.length;i++){
        var observationType = observationTypes[i];
        if(observationType.type === type){
            return observationType;
        }
    }
    return null;
}

function getPopupContent(map, marker,observation){
    var div = document.createElement('div');
    div.innerHTML = observation + '<br/>';

    var inputButton = document.createElement('input');
    inputButton.className = 'marker-delete-button';
    inputButton.value = 'remove';
    inputButton.type = 'button';
    inputButton.onclick = function () {
        map.removeLayer(marker);
        deleteObservation(marker.id, function(res){
        });
    };
    div.appendChild(inputButton);
    return div;
}


function onPopupOpen() {
    var tempMarker = this;

    var list = document.getElementsByClassName('marker-delete-button');
    for (var i = 0; i < list.length; i++) {
        list[i].click(function () {
        });
    }
}

function getObservationMarker(map, lon,lat,geohexcode, observation,id,observationType){
    var markerIcon = L.icon({
        iconUrl: "./images/" + observationType.icon,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
    var ll=new L.LatLng(lat, lon);
    var newMarker = new L.marker(ll, {icon: markerIcon, draggable: true});
    newMarker.id = id;
    var div = getPopupContent(map, newMarker,observation);
    newMarker.bindPopup(div);
    newMarker.on('dragend', function (event) {
        var marker = event.target;
        var position = marker.getLatLng();
        var isInside = isPointInHexagon(geohexcode, position);
        if (isInside) {
            updateObservationPosition(marker.id, position.lng, position.lat, function (resp) {
                // do nothing for now
            });
        }
        else {
            newMarker.setLatLng(dragMarkerPosition);
        }

    });
    newMarker.on('dragstart', function (event) {
        dragMarkerPosition = event.target.getLatLng();
    });
    return newMarker;
}
