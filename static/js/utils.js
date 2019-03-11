let allRoutes = null
let taxiHolder = {}
const bikeColor = "#D77309"
const taxiColor = "#004F72"
const opacityMultiplier = 0.85



let timesOfDay = ["morning rush", "day", "afternoon rush", "evening", "night"]
let timesOfDayRange = {
    "morning rush": "7am - 11am",
    "day": "11am - 4pm",
    "afternoon rush": "4pm - 8pm",
    "evening": "8pm - 12am",
    "night": "12am - 7am"
}
let startZones = [256, 4, 261, 262, 262, 137, 12, 13, 142, 143, 144, 17, 140, 145, 148, 146, 141, 151, 24, 25, 158, 33, 162, 163, 34, 161, 164, 37, 40, 170, 43, 45, 48, 49, 50, 52, 181, 54, 186, 61, 190, 189, 65, 66, 193, 68, 195, 75, 79, 80, 209, 211, 87, 88, 217, 90, 224, 97, 225, 226, 100, 229, 230, 103, 231, 232, 233, 234, 107, 106, 237, 236, 239, 112, 113, 114, 241, 238, 246, 249, 228, 125]
let endZones = [4, 261, 262, 263, 137, 12, 13, 142, 143, 144, 17, 140, 145, 148, 146, 141, 151, 24, 25, 158, 33, 162, 163, 34, 161, 164, 37, 40, 170, 43, 45, 48, 49, 50, 52, 181, 54, 186, 61, 190, 189, 65, 66, 193, 68, 195, 75, 79, 80, 209, 211, 87, 88, 217, 90, 224, 97, 225, 226, 100, 229, 230, 103, 231, 232, 233, 234, 107, 106, 237, 236, 239, 112, 113, 114, 241, 238, 246, 249, 228, 125, 255]

loadJSONDataFiles()

function handleClickZone(tod, sz) {
    flushZoneHolder()
    targets = getCorrelation(tod, sz)
    clickSourceTargets(sz, targets)
    updateLabels(tod, sz)

}
let clickedZonesHolder = []
let clickCounter = 0
let currentSelectedTaxiZone = 4;
let currentSelectedTOD = "morning rush"

function clickSourceTargets(sourceZone, targets) {
    // console.log("targets ..", targets)
    clickCounter++
    let layerPrefix = "zone_click_" + clickCounter + "_"
    tileHolder = []
    seenTiles = []
    targets.forEach(each => {
        if (each.fhv_wins) {
            let tile = taxiHolder[each.end]
            colorVal = getColor(each.fhv_wins)
            tile.properties.color = colorVal.color
            tile.properties.opacity = colorVal.opacity
            tileHolder.push(tile)
            seenTiles.push(each.end)
            // addPolygon(layerPrefix + each.end, taxiHolder[each.end], "green", each.fhv_wins, false)
        }
    });

    // Add sourceLocation
    let sourceTile = taxiHolder[sourceZone]
    sourceTile.properties.color = "red"
    sourceTile.properties.opacity = opacityMultiplier
    tileHolder.push(sourceTile)
    seenTiles.push(sourceZone)

    // add tiles for which we have no data as white tiles
    startZones.forEach(each => {
        if (!seenTiles.includes(each)) {
            let tile = taxiHolder[each]
            tile.properties.color = "white"
            tile.properties.opacity = 0.5
            tileHolder.push(tile)
        }
    });
    seenTiles = []

    addPolygon(layerPrefix + "main", tileHolder, "green", 0.6, false)
    clickedZonesHolder.push(layerPrefix + "main")

}

function flushZoneHolder() {
    clickedZonesHolder.forEach(each => {
        removePolygon(each)
    });
    clickedZonesHolder = []
}

function addSourceTargets(sourceZone, targets) {
    setCounter++
    let layerPrefix = "zone_anim_" + setCounter + "_"

    tileHolder = []
    seenTiles = []
    targets.forEach(each => {
        if (each.fhv_wins) {
            let tile = taxiHolder[each.end]
            colorVal = getColor(each.fhv_wins)
            tile.properties.color = colorVal.color
            tile.properties.opacity = colorVal.opacity
            tileHolder.push(tile)
            seenTiles.push(each.end)
        }
    });

    // Add sourceLocation
    let sourceTile = taxiHolder[sourceZone]
    sourceTile.properties.color = "red"
    sourceTile.properties.opacity = opacityMultiplier
    tileHolder.push(sourceTile)
    seenTiles.push(sourceZone)

    // add tiles for which we have no data as white tiles
    startZones.forEach(each => {
        if (!seenTiles.includes(each)) {
            let tile = taxiHolder[each]
            tile.properties.color = "white"
            tile.properties.opacity = 0.5
            tileHolder.push(tile)
        }
    });
    seenTiles = []

    addPolygon(layerPrefix + "main", tileHolder, "green", 0.6, true)
    // clickedZonesHolder.push(layerPrefix + "main" )

    setTimeout(function () {
        removePolygon(layerPrefix + "main")
    }, displayDuration);
}



function loadDataFile(fileUrl, params) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.responseType = 'json';
        req.open('GET', fileUrl + formatParams(params), true);
        req.onload = function () {
            filesToLoad.pop()
            // console.log("loaded file ", fileUrl, filesToLoad.length," remaining")
            if (filesToLoad.length == 0) {
                console.log("All files loaded")
                loadingOverlay.classList.add("hidden")
            }
            resolve(req.response)
        }
        req.send();
    });
}

function getURL(fileUrl, params) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.responseType = 'json';
        req.open('GET', fileUrl + formatParams(params), true);
        req.onload = function () {  
            resolve(req.response)
        }
        req.send();
    });
}

function postURL(fileUrl, data) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.responseType = 'json';
        req.open('POST', fileUrl, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.onload = function () {  
            resolve(req.response)
        }
        req.send( JSON.stringify(data));
    });
}



function formatParams(params) {
    if(params) {
    return "?" + Object
        .keys(params)
        .map(function (key) {
            return key + "=" + encodeURIComponent(params[key])
        })
        .join("&")
    }else{
        return ""
    }
}


// Load data from json files as needed for the visualizaiton
function loadJSONDataFiles() {

    loadDataFile(taxiZoneDataPath).then(function (data) {
        data.features.forEach(each => {
            // console.log(each.properties)
            taxiHolder[each.properties.zone_id] = each;
        });

        loadDataFile(taxiVsBikeCompareDataPath).then(function (data) {
            allRoutes = JSON.parse(data)
            // startMonteCarloCycle()
            if (monteCarloAnimationPaused) {
                handleClickZone("morning rush", 4)
            }
        })
    })

    loadDataFile(savedRoutesPath).then(function (data) {
        savedTransitRoutesData =  data
        // console.log(savedTransitRoutesData["79_232_cycling"].routes )
    })

    loadDataFile(bikeOutlierFilePath).then(function (data) {
        taxiOutlierData = JSON.parse(data)

    })
    loadDataFile(taxiOutlierFilePath).then(function (data) {
        // console.log(data)
        bikeOutlierData = JSON.parse(data)
        // launchTraderRouteAnimation()
    })
}

function getColorOld(val) {
    if (!val) {
        return {
            "color": bikeColor,
            "opacity": 0
        };
    }
    midval = 0.5

    if (val > midval) {
        opacity = opacityMultiplier * ((val - midval) / midval);
        color = taxiColor
    } else {
        opacity = opacityMultiplier * (val / midval)
        color = bikeColor
    }
    return {
        "color": color,
        "opacity": opacity
    };
}




// Draw polygons of regions
function addPolygon(pointid, pointData, color = "green", opacity, isAnimation) {
    // console.log("add zone", pointid)
    let lineid = pointid + "line"
    if (color == "red" || color == "white") {
        // opacity = 0.9
    } else {
        colorVal = getColor(opacity)
        color = colorVal.color
        opacity = colorVal.opacity
    }

    map.addSource(pointid, {
        type: 'geojson',
        // data: pointData
        data: {
            "type": "FeatureCollection",
            "features": pointData
        }
    });
    map.addLayer({
        id: pointid,
        type: 'fill',
        source: pointid,
        layout: {},
        paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': ['get', 'opacity'],
            // "fill-opacity-transition": {
            //     duration: fadeDuration
            // }
        }
    });
    // draw border around zone
    map.addLayer({
        'id': lineid,
        'type': 'line',
        'source': pointid,
        'paint': {
            'line-color': 'white',
            'line-width': 1,
            'line-opacity': opacityMultiplier,
            // "line-opacity-transition": {
            //     duration: fadeDuration
            // }
        }
    });

    if (!isAnimation) {
        map.on('click', pointid, zoneClick);
        map.on('mouseenter', pointid, zoneEnter);
        map.on('mouseleave', pointid, zoneLeave);
        map.on('mousemove', pointid, zoneMove);

    }


    // setTimeout(function () {
    //     map.setPaintProperty(pointid, 'fill-opacity', opacity);
    //     map.setPaintProperty(lineid, 'line-opacity', 0.3);
    // }, 1);
}

function zoneClick(e) {
    // console.log("clickooo", e.features[0].properties)

    handleClickZone(currentSelectedTOD, e.features[0].properties.zone_id)
    currentSelectedTaxiZone = e.features[0].properties.zone_id
    // flushZoneHolder()
}

function zoneLeave(e) {
    map.getCanvas().style.cursor = '';
    floatHoverBox.innerHTML = ""
    floatHoverBox.classList.add("hidden")
}

function zoneMove(e) {
    map.getCanvas().style.cursor = 'pointer';
    floatHoverBox.classList.remove("hidden")
    floatHoverBox.innerHTML = e.features[0].properties.zone
    // console.log(e.originalEvent.clientX)
    floatHoverBox.style.transform = 'translateY(' + (e.originalEvent.clientY + 1) + 'px)';
    floatHoverBox.style.transform += 'translateX(' + (e.originalEvent.clientX + 15) + 'px)';
}

function zoneEnter(e) {
    map.getCanvas().style.cursor = 'pointer';
    // floatHoverBox.innerHTML = e.features[0].properties.zone
}

function removePolygon(pointid) {
    if (map.getLayer(pointid)) {
        // map.setPaintProperty(pointid, 'fill-opacity', 0);
        // map.setPaintProperty(pointid + "line", 'line-opacity', 0);
        // setTimeout(function () {
        map.removeLayer(pointid)
        if (map.getLayer(pointid + "line")) {
            map.removeLayer(pointid + "line")
        }
        map.removeSource(pointid)
        map.off('click', pointid, zoneClick);
        map.off('mouseenter', pointid, zoneEnter);
        map.off('mouseleave', pointid, zoneLeave);
        map.off('mousemove', pointid, zoneMove);
        // console.log("removed zone", pointid)
        // }, fadeDuration);
    } else {
        console.log("Attempted to remove layer that does not exist", pointid)
    }
}

function cycleTimePeriods() {
    startZones.forEach(sz => {
        timesOfDay.forEach(tod => {
            cycleSequence.push({
                timeOfDay: tod,
                startZone: sz
            })
        });
    });
}

let newCycleSequence = []

function getNewCycles() {
    startZones.forEach(sz => {
        timesOfDay.forEach(tod => {
            newCycleSequence.push({
                timeOfDay: tod,
                startZone: sz
            })
        });
    });
}

function getCorrelation(time, start) {
    holder = []
    allRoutes.forEach(each => {
        if (each.bin == time && each.start == start) {
            holder.push(each)
        }
    });
    return holder
}



function add3DBuildings() {
    map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 13,
        'paint': {
            'fill-extrusion-color': '#aaa',

            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            'fill-extrusion-height': [
                "interpolate", ["linear"],
                ["zoom"],
                15, 0,
                15.05, ["get", "height"]
            ],
            'fill-extrusion-base': [
                "interpolate", ["linear"],
                ["zoom"],
                15, 0,
                15.05, ["get", "min_height"]
            ],
            'fill-extrusion-opacity': .6
        }
    });
}

function remove3DBuilding() {
    map.removeLayer("3d-buildings")
    // map.removeSource("composite")
}



function inspectRoutePoints(route) {
    var finalRoute = []
    prev = route[0]
    finalRoute.push(route[0])
    for (var i = 1; i < route.length; i++) {
        each = route[i]
        diff = Math.hypot(each[0] - prev[0], each[1] - prev[1])

        if (diff > maxRouteDiff) {
            // console.log(i, diff, diff / maxRouteDiff)
            numpoints = Math.round(diff / maxRouteDiff)
            finalRoute.push(prev)
            getInterpolePositions(prev, each, numpoints, finalRoute)
        } else {
            finalRoute.push(prev)
        }
        prev = each

    }
    return finalRoute
}


function getInterpolePositions(a, b, num, fout) {
    interpolIncrement = 1 / num
    interpolInterval = interpolIncrement
    for (j = 0; j < num; j++) {
        ret = [lerp(a[0], b[0], interpolInterval), lerp(a[1], b[1], interpolInterval)]
        interpolInterval += interpolIncrement
        // console.log("\t n", j, ret, interpolInterval)
        fout.push(ret)
    }
}

function lerp(a, b, n) {
    return (1 - n) * a + n * b;
}

function getRandInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


Color = function (hexOrObject) {
    var obj;
    if (hexOrObject instanceof Object) {
        obj = hexOrObject;
    } else {
        obj = LinearColorInterpolator.convertHexToRgb(hexOrObject);
    }
    this.r = obj.r;
    this.g = obj.g;
    this.b = obj.b;
}
Color.prototype.asRgbCss = function () {
    return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
}

var LinearColorInterpolator = {
    // convert 6-digit hex to rgb components;
    // accepts with or without hash ("335577" or "#335577")
    convertHexToRgb: function (hex) {
        match = hex.replace(/#/, '').match(/.{1,2}/g);
        return new Color({
            r: parseInt(match[0], 16),
            g: parseInt(match[1], 16),
            b: parseInt(match[2], 16)
        });
    },
    // left and right are colors that you're aiming to find
    // a color between. Percentage (0-100) indicates the ratio
    // of right to left. Higher percentage means more right,
    // lower means more left.
    findColorBetween: function (left, right, percentage) {
        newColor = {};
        components = ["r", "g", "b"];
        for (var i = 0; i < components.length; i++) {
            c = components[i];
            newColor[c] = Math.round(left[c] + (right[c] - left[c]) * percentage / 100);
        }
        return new Color(newColor);
    }
}

function getColor(val) {
    val = val || 0
    var color = LinearColorInterpolator.findColorBetween(new Color(taxiColor), new Color(bikeColor), val * 100).asRgbCss();
    return {
        "color": color,
        "opacity": opacityMultiplier
    };
}

// console.log(getColor(0.7), "colorr..")