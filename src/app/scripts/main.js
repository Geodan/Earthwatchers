/*jslint browser: true*/
/*global L */
/*global GEOHEX */
var geohexcode = null;
var startZoomlevel = 12;
var localStoragePrefix = 'EW_'; // earthWatchers
var user = localStorage.getItem(localStoragePrefix + 'user') || 'anonymous' ;
var satelliteImages = null;
var map = null;
var polygon = null;
var default_geohex_level = 7;
var defaultSatelliteType = 'Landsat';
var uservote = null;
var defaultProject = 'Borneo';

function getSatelliteImageByDate(date) {
    for (var i = 0; i < satelliteImages.features.length; i++) {
        if (satelliteImages.features[i].properties.Published === date) {
            return satelliteImages.features[i];
        }
    }
    return null;
}

function findEarthWatchersLayer() {
    var result = null;
    map.eachLayer(function (layer) {
        if (layer.options.type !== null) {
            if (layer.options.type === 'earthWatchers') {
                result = layer;
            }
        }
    });
    return result;
}

function saveCleanedObservation(observationString) {
    // logging user actions
    //
    // create new line in localStorage like
    // { ...,
    //      'EW_1427635304381': '{"user":"barack","lat":1.0347919593425408,"lon":111.97073616826705,"level":7,"observation":"no","geohex":"PO5020737"}',
    //      ...}
    localStorage.setItem(
            localStoragePrefix + (new Date()).getTime(), observationString);
}


function timeSliderChanged(ctrl) {
    var day = satelliteImages.features[ctrl.value].properties.Published;
    var label = document.getElementById('rangeValLabel');
    label.innerHTML = day;
    // update label positioning
    label.className = 'value' + ctrl.value;

    var earthWatchersLayer = findEarthWatchersLayer();

    var s = getSatelliteImageByDate(day);
    var url = s.properties.UrlTileCache + '/{z}/{x}/{y}.png';
    var maxlevel = s.properties.MaxLevel;
    var newLayer = L.tileLayer(url, {
        tms: true,
        maxZoom: maxlevel,
        type: 'earthWatchers'
    });
    map.addLayer(newLayer);

    if (earthWatchersLayer !== null) {
        map.removeLayer(earthWatchersLayer);
    }
}


function getGeohexPolygon(geohexcode, style) {
    var zone = GEOHEX.getZoneByCode(geohexcode);
    return L.polygon(zone.getHexCoords(), style);
}


function next() {
    var url = location.href.replace(location.hash,'');
    location.href=url;
}

function styleButton(button,checked){
    if(checked){
        button.style.border='5px solid black'
    }
    else{
        button.style.border='0px solid black'
    }
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


function sendObservation(observation){
    if(observation!=uservote){
        colorizePolygon(observation);
        postObservation(observation,user,geohexcode,function(resp){
            getHexagon(geohexcode, user, function(resp){
                processHexagonResponse(resp);
            });

        });
    };
}

function updateUsername(newName) {
    // update global var and localstorage value
    user = newName;
    localStorage.setItem(localStoragePrefix + 'user', newName);
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
    uservote=null;
    getHexagon(geohexcode, user, function(resp){
        processHexagonResponse(resp);
    });

    return false;
}

function showUserForm() {
    var userform = document.getElementById('userform');

    userform.classList.remove('hide');
}

function initUserpanel() {
    updateUserinfo();
    var userform = document.getElementById('userform');
    userform.children[0].onsubmit = changeName;
}

function updateUserinfo() {
    var userinfo = document.getElementById('userinfo');

    userinfo.innerHTML =
        '<span class="username"> Hi, ' + user + '!</span> ' +
        '<a class="userhint" onclick="showUserForm();">Change?</a>';
}

function processHexagonResponse(resp){
    document.getElementById('btnYes').innerText = 'Yes (' + resp.yes + ')';
    document.getElementById('btnNo').innerText = 'No (' + resp.no + ')';
    document.getElementById('btnMaybe').innerText = 'Maybe (' + resp.maybe + ')';

    uservote = resp.uservote;
    styleButton (document.getElementById('btnYes'),uservote === 'yes');
    styleButton (document.getElementById('btnNo'),uservote === 'no');
    styleButton (document.getElementById('btnMaybe'),uservote === 'maybe');
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

    loadJSON('data/projects.geojson', function(response) {
        var projects = JSON.parse(response);

        for(var p=0;p<projects.features.length;p++){
            var project = projects.features[p];
            if(project.properties.Name === defaultProject){
                var env = turf.envelope(project);
                var bbox = env.geometry.coordinates[0];
                // get random point in env
                // todo: add check if hexagon is within the project (not only within envelope)
                var lon_rnd = random(bbox[0][0], bbox[1][0]);
                var lat_rnd = random(bbox[0][1], bbox[2][1]);
                if(geohexcode===null){
                    geohexcode = GEOHEX.getZoneByLocation(lat_rnd, lon_rnd, default_geohex_level).code;
                    location.hash = '#/hexagon/' + geohexcode;
                }
            }
        }

        // fire onchange event of first combobox
        satelliteTypeSelectionChanged({value: defaultSatelliteType});

        map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        });

        var myStyle = {
            'color': '#000000',
            'weight': 5,
            'opacity': 0.65,
            fillOpacity: 0
        };

        getHexagon(geohexcode, user, function (resp){
            processHexagonResponse(resp);
        });

        polygon = getGeohexPolygon(geohexcode, myStyle);
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
