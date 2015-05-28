/*jslint browser: true*/
/*global L */

this._startCenter = null;
this._startLevel = null;

L.Control.ZoomMin = L.Control.Zoom.extend({
    options: {
        position: 'topleft',
        zoomInText: '+',
        zoomInTitle: 'Zoom in',
        zoomOutText: '-',
        zoomOutTitle: 'Zoom out',
        zoomMinText: 'Zoom to hexagon',
        zoomMinTitle: 'Zoom to hexagon',
        startCenter: '',
        startLevel: ''
    },

    onAdd: function (map) {
        var zoomName = 'leaflet-control-zoom',
            container = L.DomUtil.create('div', zoomName + ' leaflet-bar'),
            options = this.options;

        this._map = map;

        this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
            zoomName + '-in', container, this._zoomIn, this);

        this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
            zoomName + '-out', container, this._zoomOut, this);

        this._zoomMinButton = this._createButton(options.zoomMinText, options.zoomMinTitle,
            zoomName + '-min', container, this._zoomMin, this);

        this._startLevel = options.startLevel;
        this._startCenter = options.startCenter;

        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

        return container;
    },

    _zoomMin: function () {
        this._map.setView(this._startCenter, this._startLevel, {animation: true});
    },

    _updateDisabled: function () {
        var map = this._map, className = 'leaflet-disabled';

        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);
        L.DomUtil.removeClass(this._zoomMinButton, className);

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }

        if (map._zoom === map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomMinButton, className);
        }
    }
});
