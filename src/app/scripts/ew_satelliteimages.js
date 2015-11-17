function getSatelliteImageByDate(satelliteImages, date) {
    for (var i = 0; i < satelliteImages.features.length; i++) {
        if (satelliteImages.features[i].properties.Published === date) {
            return satelliteImages.features[i];
        }
    }
    return null;
}

function getSatelliteImageDataCallback(satelliteData) {
    satelliteData.features.sort(compare);

    var satelliteAgesId = ["earthWatchersPrevious", "earthWatchersNow"];
    var count = 0;
    if(satelliteData.features.length>0){
        for (var i = satelliteData.features.length - 2; i < satelliteData.features.length; i++) {

            if (satelliteImages && satelliteImages.features[i] !== satelliteData.features[i]) {
                removeSatelliteImage(satelliteAgesId[count]);
            }
            var satelliteDate = satelliteData.features[i].properties.Published;
            addSatelliteImage(map, satelliteData, satelliteDate, satelliteAgesId[count]);
            count++;
        }
    }
    satelliteImages = satelliteData;
    setInitialOpacityValues();
}

function removeSatelliteImage(satelliteAgeId) {
    var layer = findLayerByType(satelliteAgeId);
    if (layer) map.removeLayer(layer);
}

function drawSatelliteImages(map) {
    var polygon = getGeohexPolygon(geohexCode);
    var bbox = polygon.getBounds().toBBoxString();
    getSatelliteImageData(bbox, getSatelliteImageDataCallback);
}

function addSatelliteImage(map, satelliteImages, satelliteDate, type) {
    var s = getSatelliteImageByDate(satelliteImages, satelliteDate);
    var url = s.properties.UrlTileCache + "/{z}/{x}/{y}.png";
    var maxLevel = s.properties.MaxLevel;

    var newLayer = L.tileLayer(url, {
        tms: true,
        maxZoom: 16, //hardcoded for now, should depend on hexagon size later.
        maxNativeZoom: maxLevel,
        type: type,
        attribution: type
    });
    map.addLayer(newLayer);
}

function setInitialOpacityValues() {
    document.getElementById("opacitySlider").onchange();
    setDateName();
}

function opacitySliderChanged(control) {
    var recentImage = findLayerByType("earthWatchersNow");
    var previousImage = findLayerByType("earthWatchersPrevious");
    if(recentImage!=null && previousImage!=null){
        recentImage.setOpacity(control.value / 100);
        previousImage.setOpacity(1);
    }
}

function setDateName() {
    setLabel("satelliteDateLabelNow",satelliteImages.features[satelliteImages.features.length-1]);
    setLabel("satelliteDateLabelPrevious",satelliteImages.features[satelliteImages.features.length-2]);
}
function setLabel(divLabelName,satelliteImage){
    var labelDiv = document.getElementById(divLabelName);

    if(satelliteImage!=null){
        var date = satelliteImage.properties.Published;
        labelDiv.innerHTML = date;
    }
    else{
        labelDiv.innerHTML = "";
    }
}
