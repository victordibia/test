mapboxgl.accessToken = 'pk.eyJ1IjoidmljdG9yZGliaWEiLCJhIjoiY2pzNWY3eGYyMGYxdzN5cGF1YnV6MWZqMSJ9.VxJJ0x_xhXRmBt4u5WciDQ'
// mapboxgl.accessToken = 'pk.eyJ1IjoidmljdG9yZGliaWEiLCJhIjoiY2pzNWY2OWp4MGYwaTQ0cXBkaHFsc2hueiJ9.JdZVrIDyHkAsnuXqAxycsg';
mapCenter = [-73.991251, 40.7272];
mapZoom = 12
var initialRadius = 5;
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    zoom: mapZoom,
    center: [-73.991251, 40.7272]
});

mapPoints = [
    [-73.991255, 40.760193],
    [-74.009660, 40.724055],
    [-73.972834, 40.785000],
    [-73.968181, 40.802117],
    [-73.994224, 40.715816],
    [-73.985180, 40.720664],
    [-73.945209, 40.808442],
    [-73.945925, 40.804038],
    [-73.987654, 40.750977],
    [-73.994156, 40.741740]
]

function addPoint(map, latlongs) {

    for (let i = 0; i < latlongs.length; i++) {
        map.addSource('point' + i, {
            "type": "geojson",
            "data": {
                "type": "Point",
                "coordinates": latlongs[i]
            }
        });

        map.addLayer({
            "id": "point" + i,
            "source": "point" + i,
            "type": "circle",
            "paint": {
                "circle-radius": initialRadius,
                "circle-radius-transition": {
                    duration: 0
                },
                "circle-opacity-transition": {
                    duration: 0
                },
                "circle-color": "#007cbf" //colors[i]
            }
        });
    }

}

numRoutes = 10;
map.on('load', function () {
    addPoint(map, mapPoints)
    addRoutes()
    requestAnimationFrame(animateLine)
});

function addRoutes() {
    tindex = 0
    setInterval(function () {
        for (let i = 0; i < numRoutes; i++) {
            getRoute(mapPoints[getRandInt(0, 9)], mapPoints[getRandInt(0, 9)], tindex)
            // getRoute(mapPoints[0], mapPoints[2], i)
            tindex++
        }
    }, 4000)

}



routesHolder = {}
maxRouteDiff = 0.004

// create a function to make a directions request
function getRoute(start, end, tripid) {
    // make a directions request using cycling profile
    // an arbitrary start will always be the same
    // only the end or destination will change 

    var url = 'https://api.mapbox.com/directions/v5/mapbox/cycling/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

    // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    var req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open('GET', url, true);
    req.onload = function () {
        routeid = "route" + tripid
        var data = req.response.routes[0];
        var route = data.geometry.coordinates;
        route = inspectRoutePoints(route)
        routesHolder[tripid] = route
        // console.log(routeid, route.length)


        var geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: []
            }
        };
        // console.log(map.getSource(routeid), routeid)
        // if the route already exists on the map, reset it using setData
        if (map.getSource(routeid)) {
            map.getSource(routeid).setData(geojson);
        } else { // otherwise, make a new request
            map.addSource(routeid, {
                type: 'geojson',
                data: geojson
            })
            map.addLayer({
                id: routeid,
                type: 'line',
                source: routeid,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': Math.random() > 0.5 ? "red" : "green",
                    'line-width': 3,
                    'line-opacity': Math.random()
                }
            });
        }
        // add turn instructions here at the end
    };
    req.send();
}

let lastTime = 0
let animationInterval = 50

function animateLine(timestamp) {
    if (timestamp > lastTime + animationInterval) {
        lastTime = timestamp;

        for (val in routesHolder) {
            routeid = "route" + val;
            if (map.getSource(routeid) && routesHolder[val].length > 0) {
                // console.log(map.getSource(routeid)._data.geometry.coordinates)
                route = map.getSource(routeid)._data
                route.geometry.coordinates.push(routesHolder[val].pop())
                // console.log(route)
                map.getSource(routeid).setData(route);
                // console.log("routeholder left", routesHolder.length)
            } else {
                map.removeLayer(routeid)
                map.removeSource(routeid)
                delete routesHolder[val]
                // console.log("route complete", routeid)
            }

        }


    }

    requestAnimationFrame(animateLine);
}