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
