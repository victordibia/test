// Model to Visualize paths between trader joes

/*
Todo
- show trader joe points on map
- select some paths at random ... if bike plot bike color, if taxi use taxi color
- Plot if path is an outlier or not using red.
- Ref material: https://docs.mapbox.com/mapbox-gl-js/api/#animationoptions
*/
let traderRouteAnimationIntervalVar = null
let numConcurrentTraderRoutes = 8
const traderRouteAnimationIntervalTime = 100

let traderAddRoutesIntervalVar = null
const traderAddRoutesIntervalTime = 7000 // add numRoutes interval ever x seconds

let traderOutlierAnimationisPaused = true;


function launchTraderRouteAnimation() {
    if (!monteCarloAnimationPaused) {
        toggleMonteCarloPause()
    }
    // flushZoneHolder()
    traderRouteAnimationIntervalVar = setInterval(() => {
        animateTraderRoute()
    }, traderRouteAnimationIntervalTime);

    addTraderRoutes()
    traderAddRoutesIntervalVar = setInterval(() => {
        addTraderRoutes()
    }, traderAddRoutesIntervalTime);


    flushZoneHolder()
    showTraderJoes()
}

traderRouteIndex = 0


function addTraderRoutes() {
    // console.log("Add route fireing")
    flushTraderRoute()
    document.getElementById("outlierscroll").innerHTML = ""
    for (let index = 0; index < numConcurrentTraderRoutes; index++) {
        //  add  bikeroute
        traderRouteIndex++;
        genRouteQuery(traderRouteIndex, bikeOutlierData, "cycling", index)
        genRouteQuery(traderRouteIndex, taxiOutlierData, "driving", index)
    }
}

function genRouteQuery(index, outlierData, transitMode,  index) {
    tripid = index % outlierData.length
    tripdata = outlierData[tripid]
    start = zoneToTJLocations[tripdata.start_zone_id]
    end = zoneToTJLocations[tripdata.end_zone_id]
    isOutlier = Math.random() > 0.5 ? 0 : 1
    startEndZone = tripdata.start_zone_id + "_" + tripdata.end_zone_id + "_" + transitMode
    date = new Date(tripdata.start)
    // console.log((date.toString()).substring(0, 18), zoneToTJAddress[tripdata.start_zone_id])
   

    let div = document.createElement("div");
    divcontent =  " Trip from " + zoneToTJAddress[tripdata.start_zone_id] + (date.toString()).substring(0, 16) 
    colorclass = transitMode == "cycling" ? "orangebackground" : "bluebackground"
    div.classList.add("triprow", colorclass, "hidden")
    div.id = startEndZone
    div.innerHTML = divcontent;
    document.getElementById("outlierscroll").prepend(div);
    setTimeout(() => {
        // document.getElementById("outlierscroll").prepend(div);
        div.classList.remove("hidden")
    }, index*200);

    getTraderRoute(startEndZone, start, end, tripid, transitMode, isOutlier)
   
}

// create a function to make a directions request
function getTraderRoute(startEndZone, start, end, traderRouteTripid, transitMode = "cycling", isOutlier = 0) {
    // make a directions request using cycling profile
    // an arbitrary start will always be the same
    // only the end or destination will change 

    let pathColor = transitMode == "cycling" ? bikeColor : taxiColor

    let routeid = "route_" + transitMode + traderRouteTripid


    var data = savedTransitRoutesData[startEndZone];
    var route = data.routes[0].geometry.coordinates;
    route = inspectRoutePoints(route)

    // console.log("Fetchng route for trip", routeid, pathColor, route.length, "points")

    // Fetch model score
    getURL(outlierModelURl).then(function (data) {
        //  console.log("load model", data * 7)
        pathColor = data == 1 ? "red" : pathColor;
        // console.log(routeid)

        var geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: []
            }
        };
        if (data == 1) {
            document.getElementById(startEndZone).classList.add("leftredborder")
        }
       
        console.log(startEndZone, pathColor)
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
                    'line-color': pathColor,
                    'line-width': 5,
                    'line-opacity': 0.8
                }
            });
        }
        routesHolder[routeid] = route
    })


}



function animateTraderRoute() {
    // console.log("route size",Object.keys(routesHolder).length)
    // console.log("Animate route fireing")
    for (val in routesHolder) {
        routeid = val;
        if (map.getSource(routeid) && routesHolder[val].length > 0) {
            // console.log(map.getSource(routeid)._data.geometry.coordinates)
            route = map.getSource(routeid)._data
            route.geometry.coordinates.push(routesHolder[val].pop())
            // console.log(route)
            map.getSource(routeid).setData(route);
            // console.log("routeholder left", routesHolder.length)

        } else {
            // // console.log("Route animation complete, removing", routeid)
            // map.removeLayer(routeid)
            // map.removeSource(routeid)
            // delete routesHolder[val]
            // // console.log("route complete", routeid)
        }

    }

}

function flushTraderRoute() {

    // console.log("Flusing routes", routesHolder)

    for (val in routesHolder) {
        routeid = val;
        if (map.getSource(routeid)) {
            map.removeLayer(routeid)
            map.removeSource(routeid)

        }
        delete routesHolder[val]
    }
}

function showTraderJoes() {
    tpoints = []
    pointid = "tjlocations"

    for (var prop in zoneToTJLocations) {
        tpoints.push({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": zoneToTJLocations[prop]
            }
        })
    }

    map.addSource(pointid, {
        type: 'geojson',
        // data: pointData
        data: {
            "type": "FeatureCollection",
            "features": tpoints
        }
    });

    map.addLayer({
        "id": pointid,
        "type": "circle",
        "source": "tjlocations",
        "paint": {
            "circle-radius": 6,
            "circle-color": bikeColor
        }
    });

    clickedZonesHolder.push(pointid)
}