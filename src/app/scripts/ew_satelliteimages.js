function getSatelliteImageByDate(satelliteImages, date) {
    for (var i = 0; i < satelliteImages.features.length; i++) {
        if (satelliteImages.features[i].properties.Published === date) {
            return satelliteImages.features[i];
        }
    }
    return null;
}


function toggleSatelliteType(satelliteType) {
    var type = satelliteType.value === "Landsat" ? "Sentinel" : "Landsat";

    drawSatelliteImages(map, type);

    updateSatelliteType(satelliteType, type);
}

function updateSatelliteType(opacitySlider, satelliteType) {
    opacitySlider.parentNode.classList.remove(opacitySlider.value.toLowerCase());
    opacitySlider.setAttribute("value", satelliteType);
    opacitySlider.parentNode.classList.add(opacitySlider.value.toLowerCase());

    document.getElementById("satTypeLabel").innerText = satelliteType;
}

function getSatelliteImageDataCallback(satelliteData) {
    satelliteData.features.sort(compare);

    var satelliteAgesId = ["earthWatchersOld", "earthWatchersPrevious", "earthWatchersNow"];
    var count = 0;
    for (var i = satelliteData.features.length - 3; i < satelliteData.features.length; i++) {

        if (satelliteImages && satelliteImages.features[i] !== satelliteData.features[i]) {
            removeSatelliteImage(satelliteAgesId[count]);
        }
        var satelliteDate = satelliteData.features[i].properties.Published;
        addSatelliteImage(map, satelliteData, satelliteDate, satelliteAgesId[count]);
        count++;
    }

    satelliteImages = satelliteData;
    setInitialOpacityValues();
}

function removeSatelliteImage(satelliteAgeId) {
    var layer = findLayerByType(satelliteAgeId);
    if (layer) map.removeLayer(layer);
}

function drawSatelliteImages(map, satelliteType) {
    var polygon = getGeohexPolygon(geohexCode);
    var bbox = polygon.getBounds().toBBoxString();

    getSatelliteImageData(bbox, satelliteType, getSatelliteImageDataCallback);
}

function addSatelliteImage(map, satelliteImages, satelliteDate, type) {
    var s = getSatelliteImageByDate(satelliteImages, satelliteDate);
    var url = s.properties.UrlTileCache + "/{z}/{x}/{y}.png";
    var maxLevel = s.properties.MaxLevel;

    var newLayer = L.tileLayer(url, {
        tms: true,
        maxZoom: maxLevel,
        type: type
    });
    map.addLayer(newLayer);
}

function setInitialOpacityValues() {
    document.getElementById("opacitySlider").onchange();
}

function opacitySliderChanged(control) {
    var recentImage = findLayerByType("earthWatchersNow");
    var previousImage = findLayerByType("earthWatchersPrevious");

    if (control.value > 100) {
        recentImage.setOpacity((control.value - 100) / 100);
        previousImage.setOpacity(1);
    } else {
        recentImage.setOpacity(0);
        previousImage.setOpacity(control.value / 100);
    }

    setDateName(control.value);
}

function setDateName(sliderValue) {
    var dayNumber = sliderValue > 175 ? 2 : sliderValue > 75 ? 1 : 0;
    var day = satelliteImages.features[satelliteImages.features.length - 1 - [2 - dayNumber]].properties.Published;
    var label = document.getElementById("satelliteDateLabel");
    label.innerHTML = day;
}