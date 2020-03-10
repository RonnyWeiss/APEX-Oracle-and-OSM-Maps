var apexOracleOSMMaps = (function () {
    "use strict";
    var scriptVersion = "1.0";
    var util = {
        version: "1.2.7",
        isDefinedAndNotNull: function (pInput) {
            if (typeof pInput !== "undefined" && pInput !== null) {
                return true;
            } else {
                return false;
            }
        },
        isAPEX: function () {
            if (typeof (apex) !== 'undefined') {
                return true;
            } else {
                return false;
            }
        },
        debug: {
            info: function (str) {
                if (util.isAPEX()) {
                    apex.debug.info(str);
                }
            },
            error: function (str) {
                if (util.isAPEX()) {
                    apex.debug.error(str);
                } else {
                    console.error(str);
                }
            }
        },
        link: function (link, tabbed) {
            if (tabbed) {
                window.open(link, "_blank");
            } else {
                return window.location = link;
            }
        },
        loader: {
            start: function (id, skipHeight) {
                if (!skipHeight) {
                    $(id).css("min-height", "100px");
                }
                if (util.isAPEX()) {
                    apex.util.showSpinner($(id));
                } else {
                    /* define loader */
                    var faLoader = $("<span></span>");
                    faLoader.attr("id", "loader" + id);
                    faLoader.addClass("ct-loader");

                    /* define refresh icon with animation */
                    var faRefresh = $("<i></i>");
                    faRefresh.addClass("fa fa-refresh fa-2x fa-anim-spin");
                    faRefresh.css("background", "rgba(121,121,121,0.6)");
                    faRefresh.css("border-radius", "100%");
                    faRefresh.css("padding", "15px");
                    faRefresh.css("color", "white");

                    /* append loader */
                    faLoader.append(faRefresh);
                    $(id).append(faLoader);
                }
            },
            stop: function (id) {
                $(id + " > .u-Processing").remove();
                $(id + " > .ct-loader").remove();
            }
        },
        noDataMessage: {
            show: function (id, text) {
                var div = $("<div></div>")
                    .css("margin", "12px")
                    .css("text-align", "center")
                    .css("padding", "64px 0")
                    .addClass("nodatafoundmessage");

                var subDiv = $("<div></div>");

                var subDivSpan = $("<span></span>")
                    .addClass("fa")
                    .addClass("fa-search")
                    .addClass("fa-2x")
                    .css("height", "32px")
                    .css("width", "32px")
                    .css("color", "#D0D0D0")
                    .css("margin-bottom", "16px");

                subDiv.append(subDivSpan);

                var span = $("<span></span>")
                    .text(text)
                    .css("display", "block")
                    .css("color", "#707070")
                    .css("font-size", "12px");

                div
                    .append(subDiv)
                    .append(span);

                $(id).append(div);
            },
            hide: function (id) {
                $(id).children('.nodatafoundmessage').remove();
            }
        },
        jsonSaveExtend: function (srcConfig, targetConfig) {
            var finalConfig = {};
            var tmpJSON = {};
            /* try to parse config json when string or just set */
            if (typeof targetConfig === 'string') {
                try {
                    tmpJSON = JSON.parse(targetConfig);
                } catch (e) {
                    console.error("Error while try to parse targetConfig. Please check your Config JSON. Standard Config will be used.");
                    console.error(e);
                    console.error(targetConfig);
                }
            } else {
                tmpJSON = targetConfig;
            }
            /* try to merge with standard if any attribute is missing */
            try {
                finalConfig = $.extend(true, srcConfig, tmpJSON);
            } catch (e) {
                console.error('Error while try to merge 2 JSONs into standard JSON if any attribute is missing. Please check your Config JSON. Standard Config will be used.');
                console.error(e);
                finalConfig = srcConfig;
                console.error(finalConfig);
            }
            return finalConfig;
        },
        getLanguage: function () {
            if (util.isAPEX()) {
                return apex.locale.getLanguage();
            } else {
                return navigator.language || navigator.userLanguage || en;
            }
        }
    };

    return {
        /* Initialize function for cards */
        initialize: function (parentID, ajaxID, udConfigJSON, items2Submit, bindRefreshOnId, baseURL, mapType) {
            var containerID = parentID + "-c";
            var stdConfigJSON = {
                "refresh": 0,
                "height": "600px",
                "map": {
                    "longitude": 0,
                    "latitude": 0,
                    "zoom": 1
                },
                "marker": {
                    "height": 54,
                    "width": 54,
                    "labels": false,
                    "url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEeElEQVRogcWZT2hdRRTGf/cRQhYhBAmlhC5CkRBCKCEqVBcSShTRLkSKiJQiLooLF+JCgohQXHThyoVIESkSsuiqiBTRIiolipQS/NcWJG0lVKvV1lBriGnO52LmNjc3d+579915fQeGN+/CzHzfme/MPXNuQk2T+xkAdgOjwEPAFDDsnwP8C1wDvgfOAueBS8CNBKwuhrZNMGhwwOCYYMlgXaB8s63/NwRXBfMGL8oR7Qr4CYNTBr97UNuAlzVz7abBgmBG0LhXwHcKjhjczHs31G+h3TZ435wEOwp+h2BecDsi+LStCz4XjHcS/HEFdB6xfRqdhJfNXChIfVs1uOB36KBgSrBLMGwuXp6RC/ZzBitNdu0LwVg0AgZvpLIJtF8MXhfsEfSUOKIhGBEcNlgsCf4NwYdRAlswZvBXaCGDrwT7BL0V5mwIJv1urQV2Y9Vgf13wAwYnbfPYy3vpuGBnjfn7BG8arBXJyZzcRuoQ2C+4GjhVztQBnyVhTi7b5GRwy+DlMlmWTdwveCeg02XBTF3wmbUmBN8GAvqjthwlGBf8VOCVNYMjVTTfzMytdyiNNdsqoxXBdGhsWZTvFtxf8PxKAh8n8F9d4DkQnwEXBSS++f4A8GCTsYU2mXgva+vz87isMrZdS+DLJPMg0384NKiMwAMFE5HA6Zjez61xCpzDUqf5/mRoXBmBUOBcrIyudSuSEJSk3EECgv5MP2t/1EHYxP5O4E76J9n87QsNCJ6vAS3eE0sdlmz2g7e2shfEjcDzoXZAtWgDgp7UYRkJ/RMaUBYDl9JOTkKdvHSMFu28MljyVkZgIT+Rn+yxmC+xzLwAT6X97CmUwNehcWVB/KPgz/zzBCbozK1pCJguOIXuAGdCg4IEEvg18S+snIRGgCfaSrAC5iN0HzBeIKErci/PaiboEcwKVgvy9SXBo7WRezMYlbtX5POuDcF72qwvVSaxV/BzJrHKLnBacF8E8L0e5HrBneC64Dk1nyZIoE8wV5BOpxead+uQ8OBflSurFN2PFwx2tDt/SmLCwgtsCD4RPFIlJnz6PC53yV8tcdCBWuAzJE4UxMHdX4MLBq/IabnsZEMwLFe1WAjIJm2LKkkhqhKYlqtnBus5BrcE33mvPi0YNRiUe7uOCB4XvC34RpmLSxF4c7tyKAp4T6BP8FbgRGrar9J87WlOsVMWwZjgbBXgbfYvy5Vp4ppBw5x22/Fqlf7RaNoPEJm3TKUipoTM7XDnwHsCk4LFDkhoWXUrca2YoNfgsMLlxnYktOql098cQRwSPYKj5mqjMSR0QhHSkqokhvznoboSuqyYpfSKJGY8gHYltGLwQlfAewINuWzxt6oS8oXb1zp+6rRAok8wW5Ryl/UNPlBnCwStm1y+c7KChH5Qt74Ph0ywy1wpfD0kIf8CPCfY022820yuTcllmyHZLAmeVMT7dFTzQb3X/EfwHJF1g2fVgZJMdJPL/ZcyJK4LXuo2rpbN33WfFyz73ZhVu5WFbpk/Xg/KfYUc7NQ6/wPXO1op+IbpEgAAAABJRU5ErkJggg=="
                }
            };

            /* get parent */
            var parent = $("#" + parentID);

            if (parent.length > 0) {
                var configJSON = {};
                configJSON = util.jsonSaveExtend(stdConfigJSON, udConfigJSON);

                /* define container and add it to parent */
                var container = drawContainer(parent);

                /* get data and draw */
                getData();

                /* try to bind apex refreh event if "apex" exists */
                try {
                    apex.jQuery("#" + bindRefreshOnId).bind("apexrefresh", function () {
                        if (container.children('span').length == 0) {
                            getData();
                        }
                    });
                } catch (e) {
                    console.log("Can't bind refresh event on " + bindRefreshOnId + ". Apex is missing");
                    console.log(e);
                }

                /* Used to set a refresh via json configuration */
                if (configJSON.refresh > 0) {
                    setInterval(function () {
                        if (container.children('span').length == 0) {
                            getData();
                        }
                    }, configJSON.refresh * 1000);
                }
            } else {
                console.log("Can't find parentID: " + parentID);
            }

            /************************************************************************
             **
             ** Used to draw the whole region
             **
             ***********************************************************************/
            function drawMap(pData) {
                /* empty container for new stuff */
                container.empty();

                util.debug.info({
                    "data": pData
                });

                var long = configJSON.map.longitude;
                var lat = configJSON.map.latitude;
                var zoom = configJSON.map.zoom;

                if (mapType === 'oracle') {
                    OM.gv.setResourcePath(baseURL + "/jslib/v2.3/");
                    OM.gv.setBaseMapViewerURL(baseURL);
                    OM.Map.setLocale(util.getLanguage());

                    util.debug.info({
                        "map": OM
                    });

                    var sRID = 8307;

                    var mapUniverse = new OM.universe.Universe({
                        srid: sRID,
                        bounds: new OM.geometry.Rectangle(-180, -65, 180, 65, sRID),
                        numberOfZoomLevels: 5
                    });

                    var mapDiv = document.getElementById(containerID);
                    var mapOptions = {
                        mapviewerURL: baseURL,
                        universe: mapUniverse
                    };

                    var map = new OM.Map(mapDiv, mapOptions);

                    var layerMap = new OM.layer.ElocationTileLayer("map");

                    var layerOptions = {
                        def: {
                            type: OM.layer.VectorLayer.TYPE_LOCAL
                        }
                    };
                    var layerVec = new OM.layer.VectorLayer("vectors", layerOptions);

                    if (pData.row && pData.row.length > 0) {
                        $.each(pData.row, function (idx, data) {
                            if (idx === 0) {
                                if (util.isDefinedAndNotNull(data.MAP_LONGITUDE)) {
                                    long = data.MAP_LONGITUDE;
                                }
                                if (util.isDefinedAndNotNull(data.MAP_LATITUDE)) {
                                    lat = data.MAP_LATITUDE;
                                }
                                if (util.isDefinedAndNotNull(data.MAP_ZOOM)) {
                                    zoom = data.MAP_ZOOM;
                                }
                            }
                            var point = new OM.geometry.Point(data.MARKER_LONGITUDE, data.MARKER_LATITUDE);
                            var feature = new OM.Feature(data.MARKER_LABEL || idx, point, {
                                label: data.MARKER_LABEL.toString(),
                                renderingStyle: new OM.style.Marker({
                                    src: data.MARKER_URL || configJSON.marker.url,
                                    width: data.MARKER_WIDTH || configJSON.marker.width,
                                    height: data.MARKER_HEIGHT || configJSON.marker.height
                                })
                            });
                            layerVec.addFeature(feature);

                            if (util.isDefinedAndNotNull(data.MARKER_LINK)) {
                                feature.addListener("click", function () {
                                    util.link(data.MARKER_LINK);
                                });
                            }
                        });
                    }

                    layerVec.setLabelsVisible(configJSON.marker.labels);
                    map.addLayer(layerMap);
                    map.addLayer(layerVec);
                    var center = new OM.geometry.Point(long, lat, sRID);
                    map.setMapCenterAndZoomLevel(center, zoom, true);

                    map.init();
                } else {
                    var map;
                    var layer_mapnik = new OpenLayers.Layer.OSM.Mapnik("Mapnik");

                    function Lon2Merc(lon) {
                        return 20037508.34 * lon / 180;
                    }

                    function Lat2Merc(lat) {
                        var PI = 3.14159265358979323846;
                        lat = Math.log(Math.tan((90 + lat) * PI / 360)) / (PI / 180);
                        return 20037508.34 * lat / 180;
                    }

                    function addMarker(layer, lon, lat, iconUrl, iconWidth, iconHeight, link, title) {
                        var ll = new OpenLayers.LonLat(Lon2Merc(lon), Lat2Merc(lat));

                        var sizeWidth = iconWidth || configJSON.marker.width;
                        var sizeHeight = iconHeight || configJSON.marker.height;
                        var size = new OpenLayers.Size(sizeWidth, sizeHeight);
                        var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
                        var markerIconUrl = iconUrl || configJSON.marker.url;
                        var icon = new OpenLayers.Icon(markerIconUrl, size, offset);

                        var feature = new OpenLayers.Feature(layer, ll);
                        var marker = new OpenLayers.Marker(ll, icon);
                        marker.icon.imageDiv.title = title;
                        marker.feature = feature;

                        layer.addMarker(marker);

                        if (util.isDefinedAndNotNull(link)) {
                            marker.events.register('click', layer, function () {
                                util.link(link);
                            });
                        }
                    }

                    OpenLayers.Lang.setCode(util.getLanguage());

                    map = new OpenLayers.Map(containerID, {
                        projection: new OpenLayers.Projection("EPSG:900913"),
                        displayProjection: new OpenLayers.Projection("EPSG:4326"),
                        maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
                        numZoomLevels: 18,
                        maxResolution: 156543,
                        units: 'meters'
                    });

                    if (pData.row && pData.row.length > 0) {
                        $.each(pData.row, function (idx, data) {
                            if (idx === 0) {
                                if (util.isDefinedAndNotNull(data.MAP_LONGITUDE)) {
                                    long = data.MAP_LONGITUDE;
                                }
                                if (util.isDefinedAndNotNull(data.MAP_LATITUDE)) {
                                    lat = data.MAP_LATITUDE;
                                }
                                if (util.isDefinedAndNotNull(data.MAP_ZOOM)) {
                                    zoom = data.MAP_ZOOM;
                                }
                            }

                            var layer_markers = new OpenLayers.Layer.Markers("Address", {
                                projection: new OpenLayers.Projection("EPSG:4326"),
                                visibility: true,
                                displayInLayerSwitcher: false
                            });

                            addMarker(
                                layer_markers,
                                data.MARKER_LONGITUDE,
                                data.MARKER_LATITUDE,
                                data.MARKER_URL,
                                data.MARKER_WIDTH,
                                data.MARKER_HEIGHT,
                                data.MARKER_LINK,
                                data.MARKER_LABEL
                            );

                            map.addLayers([layer_mapnik, layer_markers]);
                        });
                    }

                    var x = Lon2Merc(long);
                    var y = Lat2Merc(lat);
                    map.setCenter(new OpenLayers.LonLat(x, y), (zoom + 1));

                    container.find(".olControlAttribution").css("bottom", "5px");
                }
            }

            /***********************************************************************
             **
             ** Used to draw a container
             **
             ***********************************************************************/
            function drawContainer(parent) {
                var div = $("<div></div>");
                div.addClass("aom-container");
                div.attr("id", containerID);
                div.height(configJSON.height);
                parent.append(div);
                return (div);
            }

            /***********************************************************************
             **
             ** function to get data from Apex
             **
             ***********************************************************************/
            function getData() {
                util.loader.start(container);

                var submitItems = items2Submit;

                apex.server.plugin(
                    ajaxID, {
                        pageItems: submitItems
                    }, {
                        success: drawMap,
                        error: function (d) {
                            container.empty();
                            console.log(d.responseText);
                            util.noDataMessage("#" + containerID, 'Error occured!');
                        },
                        dataType: "json"
                    });
            }
        }
    }
})();
