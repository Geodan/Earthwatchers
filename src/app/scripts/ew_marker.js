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
