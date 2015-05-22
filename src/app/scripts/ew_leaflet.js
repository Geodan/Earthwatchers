function findLayerByType(type) {
    var result = null;
    map.eachLayer(function (layer) {
        if (layer.options.type !== null) {
            if (layer.options.type === type) {
                result = layer;
            }
        }
    });
    return result;
}

function findLayersByType(type) {
    var result = [];
    map.eachLayer(function (layer) {
        if (layer.options.type !== null) {
            if (layer.options.type === type) {
                result.push(layer);
            }
        }
    });
    return result;
}

function findLayerByName(name) {
    var result = null;
    map.eachLayer(function (layer) {
        if (layer.name !== null) {
            if (layer.name === name) {
                result = layer;
            }
        }
    });
    return result;
}

function centerOnPolygon(polygon) {
    var centerHex = polygon.getBounds().getCenter();
    map.setView(centerHex, startZoomLevel, {
        animation: true,
        pan: {
            duration: 0.4,
            easeLinearity: 0.5
        }
    });
    return centerHex;
}
