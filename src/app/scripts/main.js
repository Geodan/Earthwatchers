/*jslint browser: true*/
/*global L */
/*global GEOHEX */
var geohexcode = null;
var startZoomlevel = 12;
var localStoragePrefix = 'EW_'; // earthWatchers
var user = localStorage.getItem(localStoragePrefix + 'user') || 'anonymous' ;
var satelliteImages = null;
var map = null;
var default_geohex_level = 7;
var defaultSatelliteType = 'Landsat';
var defaultProject = 'Borneo';
var observationCategory = null;
var project = null;
var categories=null;


function timeSliderChanged(ctrl) {
    var day = satelliteImages.features[ctrl.value].properties.Published;
    var label = document.getElementById('rangeValLabel');
    label.innerHTML = day;
    // update label positioning
    label.className = 'value' + ctrl.value;

    var earthwatchersLayer = findLayerByType('earthWatchers');

    var s = getSatelliteImageByDate(satelliteImages, day);
    var url = s.properties.UrlTileCache + '/{z}/{x}/{y}.png';
    var maxlevel = s.properties.MaxLevel;
    var newLayer = L.tileLayer(url, {
        tms: true,
        maxZoom: maxlevel,
        type: 'earthWatchers'
    });
    map.addLayer(newLayer);

    if (earthwatchersLayer !== null) {
        map.removeLayer(earthwatchersLayer);
    }
}

function next() {
    var url = location.href.replace(location.hash,'');
    location.href=url;
}

function toggleSatelliteType(sel) {
    var labels = {
            Landsat: 'Landsat 8',
            Sentinel: 'Sentinel 1'
        },
        newtype = sel.value === 'Landsat' ? 'Sentinel' : 'Landsat';

    // change map layer
    satelliteTypeSelectionChanged({value: newtype});

    // update satellite type value
    sel.parentNode.classList.remove(sel.value.toLowerCase());
    sel.setAttribute('value', newtype);
    sel.parentNode.classList.add(sel.value.toLowerCase());

    // update satellite type label
    document.getElementById('satTypeLabel').innerText = labels[newtype];
}

function satelliteTypeSelectionChanged(sel) {
    var currentImageType = sel.value;
    var polygon = getGeohexPolygon(geohexcode);
    var bbox = polygon.getBounds().toBBoxString();
    getSatelliteImageData(bbox, currentImageType, function(resp){
        satelliteImages = resp;
        var sel = document.getElementById('timeSlider');
        satelliteImages.features.sort(compare);
        sel.onchange();
    });
}


function setCategory(category){
    observationCategory = category;
    styleCategoryButtons(categories,category);
}


function onMapClick(e){
    // todo: add hexagon with currently active button
    // send message to server
    // check if clicked point is inside the project
    var pt = turf.point([e.latlng.lng, e.latlng.lat]);
    isinside = turf.inside(pt, project);
    if(isinside){
        // todo draw hexagon
        // alert('click on map');
        var newMarker = new L.marker(e.latlng, {draggable:true});
        var div = document.createElement('div');
        div.innerHTML = observationCategory + '<br/>' ;
        var inputButton = document.createElement('input');
        inputButton.className='marker-delete-button';
        inputButton.value='delete';
        inputButton.type='button';
        inputButton.onclick = function(){
            // alert('delete: ' + newMarker.id);
            map.removeLayer(newMarker);
        };
        div.appendChild(inputButton);
        newMarker.bindPopup(div);
        newMarker.on('dragend', function(event){
            var marker = event.target;
            var position = marker.getLatLng();
            updateObservationPosition(marker.id,position.lng,position.lat,function(resp){
                alert(resp);
            });
            // alert('dragend' + newMarker.id);
        });

        newMarker.addTo(map);

        postObservation(observationCategory,user,geohexcode,e.latlng.lng,e.latlng.lat,function(resp){
            newMarker.id = resp.id;
        });
    }
    else{
        alert('Please click inside the project area');
    }

}


function onPopupOpen(){
    var tempMarker = this;

    var list = document.getElementsByClassName('marker-delete-button');
    for (var i = 0; i < list.length; i++) {
        list[i].click(function () {
        });
    }
}

function changeName(event) {
    var form = event.target,
        newName = form.children[0].value;

    // stop from saving empty name
    if (!newName) return false;

    updateUsername(newName);

    // clean and hide form
    form.parentElement.classList.add('hide');
    form.children[0].value = '';

    updateUserinfo();
    return false;
}

(function (window, document, L) {
    'use strict';
    L.Icon.Default.imagePath = 'images/';

    Path.map("#/hexagon/:hex").to(function(){
        // sample: #/hexagon/PO2670248
        geohexcode = this.params['hex'];
    });
    Path.listen();

    initUserpanel();

    var projectTypes;
    loadJSON('data/projecttypes.json', function (typesResponse){
        projectTypes = JSON.parse(typesResponse);
    });



    loadJSON('data/projects.geojson', function(response) {
        var projects = JSON.parse(response);
        project = getProjectByName(projects,defaultProject);
        categories = project.properties.ObservationCategories.split(',');
        addCategoryButtons(categories, projectTypes);

        setCategory(categories[0]);
        default_geohex_level = project.properties.GeohexLevel;
        
        if(geohexcode===null){
            geohexcode = getRandomHexagon(project,default_geohex_level);
            location.hash = '#/hexagon/' + geohexcode;
        }

        // fire onchange event of first combobox
        satelliteTypeSelectionChanged({value: defaultSatelliteType});

        map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        });
        map.dragging.disable();
        if (map.tap) map.tap.disable();

        map.on('click', onMapClick);

        var myStyle = {
            'color': '#000000',
            'weight': 5,
            'opacity': 0.65,
            fillOpacity: 0
        };

        var polygon = getGeohexPolygon(geohexcode, myStyle);
        var centerHex = polygon.getBounds().getCenter();
        map.setView(centerHex, startZoomlevel, {
            animation: true
        });

        map.addControl(new L.Control.ZoomMin({
            position: 'topright', startLevel: startZoomlevel, startCenter: centerHex
        }));

        L.control.scale({imperial: false, position: 'topleft'}).addTo(map);

        var ggl2 = new L.Google('satellite');
        map.addLayer(ggl2);
        map.addLayer(polygon);

        L.geoJson(projects,{fill:false}).addTo(map);
        // todo: calculate hexagon based on project areas
    });


}(window, document, L));
