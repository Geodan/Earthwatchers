function getSatelliteImageByDate(satelliteImages,date) {
    for (var i = 0; i < satelliteImages.features.length; i++) {
        if (satelliteImages.features[i].properties.Published === date) {
            return satelliteImages.features[i];
        }
    }
    return null;
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
    var polygon = getGeohexPolygon(geohexCode);
    var bbox = polygon.getBounds().toBBoxString();
    getSatelliteImageData(bbox, currentImageType, function (resp) {
        satelliteImages = resp;
        var sel = document.getElementById('timeSlider');
        satelliteImages.features.sort(compare);
        sel.onchange();
    });
}


function timeSliderChanged(ctrl) {
    if (satelliteImages.features.length > 0) {
        var day = satelliteImages.features[ctrl.value].properties.Published;
        var label = document.getElementById('rangeValLabel');
        label.innerHTML = day;
        label.className = 'value' + ctrl.value;

        var earthwatchersLayer = findLayerByType('earthWatchers');

        var s = getSatelliteImageByDate(satelliteImages, day);
        var url = s.properties.UrlTileCache + '/{z}/{x}/{y}.png';
        var maxLevel = s.properties.MaxLevel;
        var newLayer = L.tileLayer(url, {
            tms: true,
            maxZoom: maxLevel,
            type: 'earthWatchers'
        });
        map.addLayer(newLayer);

        if (earthwatchersLayer !== null) {
            map.removeLayer(earthwatchersLayer);
        }
    }
}
