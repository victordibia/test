mapboxgl.accessToken = 'pk.eyJ1IjoidmljdG9yZGliaWEiLCJhIjoiY2pzNWY3eGYyMGYxdzN5cGF1YnV6MWZqMSJ9.VxJJ0x_xhXRmBt4u5WciDQ'
// mapboxgl.accessToken = 'pk.eyJ1IjoidmljdG9yZGliaWEiLCJhIjoiY2pzNWY2OWp4MGYwaTQ0cXBkaHFsc2hueiJ9.JdZVrIDyHkAsnuXqAxycsg';
mapCenter = [-73.991251, 40.7272];
mapZoom = 10
var initialRadius = 5;
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    zoom: mapZoom,
    center: [-73.991251, 40.7272]
});

let taxiZones = []
let shuffleTaxiIndex = []
let numClosest = 100;
let newSetDelay = 2000


let setCounter = 0;
let fadeDuration = 1500
let displayDuration = 3000

numRoutes = 9.5;
map.on('load', function () {
    // addPoint(map, mapPoints)
    loadData()
});



function loadData() {
    var url = "static/assets/taxi_zones.json";
    var req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open('GET', url, true);
    req.onload = function () {
        var data = (req.response)
        taxiZones = data.features
        shuffleTaxiIndex = [...Array(taxiZones.length).keys()]

        // data.features.forEach((each, i) => {
        //     addPolygon("burro" + i, data.features[i])
        // });

        console.log(taxiZones[0])
        taxiZones.forEach((each, i) => {
            // console.log(each.geometry.type)
            each.geometry.bing = i
        });
        // addAll(taxiZones)
        // zoneid = "zone"
        // addPolygon(zoneid, taxiZones[0])
        // setTimeout(function () {
        //     removePolygon(zoneid)
        addSet()
        setInterval(() => {
            addSet()
        }, displayDuration + newSetDelay);


    };
    req.send();
}

let timeBox = document.getElementById("timebox")
timeCounter = 0
setInterval(() => {
    timeBox.innerHTML = "10:" + zeroPad(timeCounter % 60, 2) + " am"
    timeCounter++
}, displayDuration);

function addSet() {
    setCounter++
    let layerPrefix = "zone" + setCounter + "_"
    shuffleTaxiIndex = shuffle(shuffleTaxiIndex)
    sourceZone = shuffleTaxiIndex[0]

    sourceZoneid = sourceZone
    addPolygon(layerPrefix + sourceZoneid, taxiZones[sourceZone], "red")

    closestArray = shuffleTaxiIndex.slice(2, numClosest)
    closestArray.forEach(each => {
        addPolygon(layerPrefix + each, taxiZones[each], "green")
    });


    // console.log(closestArray)
    setTimeout(function () {
        removePolygon(layerPrefix + sourceZoneid)
        closestArray.forEach(each => {
            removePolygon(layerPrefix + each)
        });
    }, displayDuration);

    // console.log("map", map)
}

function addAll(geodata) {
    map.addSource("taxizones", {
        type: 'geojson',
        data: {
            "type": "FeatureCollection",
            "features": geodata,
        }
    });

    map.addLayer({
        "id": "taxi-layer",
        "type": "fill",
        "source": "taxizones",
        "paint": {
            'fill-color': "green",
            'fill-opacity': 1,
            "fill-opacity-transition": {
                duration: fadeDuration
            }
        },
        "filter": ["==", "$type", "Polygon"],
    });
}

function addBySource() {
    map.addSource("national-park", {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [
                            [-121.353637, 40.584978],
                            [-121.284551, 40.584758],
                            [-121.275349, 40.541646],
                            [-121.246768, 40.541017],
                            [-121.251343, 40.423383],
                            [-121.326870, 40.423768],
                            [-121.360619, 40.434790],
                            [-121.363694, 40.409124],
                            [-121.439713, 40.409197],
                            [-121.439711, 40.423791],
                            [-121.572133, 40.423548],
                            [-121.577415, 40.550766],
                            [-121.539486, 40.558107],
                            [-121.520284, 40.572459],
                            [-121.487219, 40.550822],
                            [-121.446951, 40.563190],
                            [-121.370644, 40.563267],
                            [-121.353637, 40.584978]
                        ]
                    ]
                }
            }, {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [-121.415061, 40.506229]
                }
            }, {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [-121.505184, 40.488084]
                }
            }, {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [-121.354465, 40.488737]
                }
            }]
        }
    });
}

function addPolygon(pointid, pointData, color = "green") {
    // console.log("add zone", pointid)
    map.addSource(pointid, {
        type: 'geojson',
        data: pointData
    });
    map.addLayer({
        id: pointid,
        type: 'fill',
        source: pointid,
        layout: {},
        paint: {
            'fill-color': color,
            'fill-opacity': 0,
            "fill-opacity-transition": {
                duration: fadeDuration
            }
        }
    });

    setTimeout(function () {
        map.setPaintProperty(pointid, 'fill-opacity', color == "red" ? 1 : Math.random());
    }, 1);
}

function removePolygon(pointid) {
    map.setPaintProperty(pointid, 'fill-opacity', 0);
    setTimeout(function () {
        map.removeLayer(pointid)
        map.removeSource(pointid)
        // console.log("removed zone", pointid)
    }, fadeDuration);
}