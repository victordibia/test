// Map Center and Settings
const mapDefault = {
    center: {
        lng: -73.99452764017138,
        lat: 40.702452794887506
    },
    zoom: 11.510207004992658,
    pitch: 45,
}

const mapTraderViz = {
    center: {
        lng: -73.99714989168012,
        lat: 40.724264770746686
    },
    zoom: 13.794519829055464,
    pitch: 60,
}


// Bike Vs Taxi Data 
const taxiZoneDataPath = "static/assets/taxi_zones.json"
const taxiVsBikeCompareDataPath = "static/assets/bvt.json"


// Trader Joes Constants
let outlierModelURl = "/model"
let routesHolder = {}
const maxRouteDiff = 0.003

let bikeOutlierData = null
let taxiOutlierData = null
let savedTransitRoutesData = null

const bikeOutlierFilePath = "static/assets/tj_fhv_trips.json"
const taxiOutlierFilePath = "static/assets/tj_citibike_trips.json"
const savedRoutesPath = "static/assets/savedroutes.json"

const filesToLoad = [taxiVsBikeCompareDataPath, taxiZoneDataPath, bikeOutlierFilePath, taxiOutlierData, savedRoutesPath]

const zoneToTJLocations = {
    90: [-73.9963098, 40.7420901],
    170: [-73.9812726, 40.7439882],
    65: [-73.9851052, 40.6909912],
    52: [-73.9950586, 40.6895837],
    143: [-73.9845552, 40.7785955],
    79: [-73.9833067, 40.7304478],
    232: [-73.9867718, 40.7164903],
    125: [-74.0072687, 40.7258226],
    238: [-73.9716985, 40.7907104]
}

const zoneToTJAddress = {
    90: "675 6th Ave, New York, NY 10010",
    170: "200 E 32nd St, New York, NY 10016",
    65: "445 Gold St, Brooklyn, NY 11201",
    52: "130 Court St, Brooklyn, NY 11201",
    143: "2073 Broadway, New York, NY 10023",
    79: "432 E14th St, New York, NY 10009",
    232: "400 Grand St, New York, NY 10002",
    125: "233 Spring St, New York, NY 10013",
    238: "670 Columbus Ave, New York, NY 10025"
}
const tjLocations = [{
        'id': 1,
        'address': "675 6th Ave, New York, NY 10010",
        'lat': 40.7420901,
        'lon': -73.9963098,
    },
    {
        'id': 2,
        'address': "200 E 32nd St, New York, NY 10016",
        'lat': 40.7439882,
        'lon': -73.9812726
    },
    {
        'id': 3,
        'address': "445 Gold St, Brooklyn, NY 11201",
        'lat': 40.6909912,
        'lon': -73.9851052
    },
    {
        'id': 4,
        'address': "130 Court St, Brooklyn, NY 11201",
        'lat': 40.6895837,
        'lon': -73.9950586
    },
    {
        'id': 5,
        'address': "2073 Broadway, New York, NY 10023",
        'lat': 40.7785955,
        'lon': -73.9845552
    },
    {
        'id': 6,
        'address': "432 E14th St, New York, NY 10009",
        'lat': 40.7304478,
        'lon': -73.9833067
    },
    {
        'id': 7,
        'address': "400 Grand St, New York, NY 10002",
        'lat': 40.7164903,
        'lon': -73.9867718
    },
    {
        'id': 8,
        'address': "233 Spring St, New York, NY 10013",
        'lat': 40.7258226,
        'lon': -74.0072687
    },
    {
        'id': 9,
        'address': "670 Columbus Ave, New York, NY 10025",
        'lat': 40.7907104,
        'lon': -73.9716985
    }
]