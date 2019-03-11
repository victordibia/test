import joblib
import json
import pandas as pd
import geopandas
import requests


def process_bike_vs_tax_file():
    bvt = joblib.load("../input/result_workday_bike-vs-fhv.joblib")
    bvtdf = pd.DataFrame(bvt)
    bvtjson = bvtdf.to_json(orient='records')
    print(bvtdf.head())

    print("Morning rush", len(bvtdf[bvtdf['bin'] == "morning rush"]))
    print("afternoon rush", len(bvtdf[bvtdf['bin'] == "afternoon rush"]))
    print("day rush", len(bvtdf[bvtdf['bin'] == "day"]))
    print("nigh ", len(bvtdf[bvtdf['bin'] == "night"]))
    print("evening ", len(bvtdf[bvtdf['bin'] == "evening"]))
    print("Unique starts, ends",  list(bvtdf["start"].unique()))
    print("Unique ends", list(bvtdf["end"].unique()))


    with open('static/assets/bvt.json', 'w') as outfile:
        json.dump(bvtjson, outfile)

    taxi = joblib.load("../input/taxi_zones.joblib")
    tdf = pd.DataFrame(taxi)
    print(tdf.head())

def process_trader_joe_files(file_path):
    tj_filepath = "../output/" + file_path
    with open(tj_filepath) as f:
        data = json.load(f)
    df = pd.DataFrame(data)
    outdf = df[:1000]
    # print(outdf[["start_zone_id", "end_zone_id"]])
    print(len(df))

    # with open("static/assets/" + file_path, 'w') as outfile:
    #     print("saved file", file_path)
    #     json.dump(outdf.to_json(orient='records'), outfile)
    # num_outliers = len(df[df["outlier"]==1])
    # print("Size of outliers", file_path, num_outliers, " of", num_outliers/ len(df) ,  len(outdf[outdf["outlier"]==1]) )

# process_bike_vs_tax_file()
# process_trader_joe_files("tj_citibike_trips.json")
# process_trader_joe_files("tj_fhv_trips.json")

zone_to_location = {
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

accessToken = 'pk.eyJ1IjoidmljdG9yZGliaWEiLCJhIjoiY2pzNWY3eGYyMGYxdzN5cGF1YnV6MWZqMSJ9.VxJJ0x_xhXRmBt4u5WciDQ'
all_route_holder = {}

def make_request(czones, start, end, transitmode):
    # print(start)
    url = "https://api.mapbox.com/directions/v5/mapbox/" + transitmode + "/" + str(start[0]) + ',' + str(start[1]) + ';' + str(end[0]) + ',' + str(end[1]) 
    payload = {'steps': 'true', 'geometries': 'geojson', "access_token": accessToken}
    r = requests.get(url, params=payload)
    routes = json.loads(r.text)
    all_route_holder[czones] = routes
    print(routes["code"], czones)

#  var url = 'https://api.mapbox.com/directions/v5/mapbox/' 
# + transitMode + '/' + start[0] + ',' + start[1] + ';' + end[0] + ',' 
# + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

zone_holder =  [[-73.9867718, 40.7164903], [-73.9833067, 40.7304478]]
# print(zone_holder[1])
# make_request("232_79",zone_holder[0], zone_holder[0],"driving")


routes_path = 'static/assets/savedroutes.json'
def get_uniques(comb):
    zone_holder =  []
    for pair in comb:
        coords = pair.split("_")
        start = zone_to_location[int(coords[0])]
        end =  zone_to_location[int(coords[1])]
        zone_holder.append([start, end])
        
    # print(zone_holder[0][0])
        make_request(pair + "_cycling" ,start, end,"cycling")
        make_request(pair + "_driving" ,start, end,"driving")

    
    with open(routes_path, 'w') as outfile:
        json.dump(all_route_holder, outfile)


def precompute_trip_duration(file_path):
    tj_filepath = "../output/" + file_path
    with open(tj_filepath) as f:
        data = json.load(f)
    # print(data[0])

    df = pd.DataFrame(data)
    outdf = df[:1000]
    df["comb"] = (df["start_zone_id"]).astype(str) + "_"+ (df["end_zone_id"]).astype(str)

    # print(df.head())
    # print(file_path,df["comb"].unique(), len(df["comb"].unique()))
    comb = df["comb"].unique()
    comb.sort()
    print(comb)
    get_uniques(comb)

precompute_trip_duration("tj_citibike_trips.json")
# make_request()
# precompute_trip_duration("tj_fhv_trips.json")

#  var url = 'https://api.mapbox.com/directions/v5/mapbox/' + transitMode + '/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;
# mapboxgl.accessToken = 'pk.eyJ1IjoidmljdG9yZGliaWEiLCJhIjoiY2pzNWY3eGYyMGYxdzN5cGF1YnV6MWZqMSJ9.VxJJ0x_xhXRmBt4u5WciDQ'

