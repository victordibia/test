# -*- coding: utf-8 -*-
import dash
from dash.dependencies import Input, Output, State
import dash_core_components as dcc
import dash_html_components as html
import plotly.plotly as py
from plotly import graph_objs as go
from plotly.graph_objs import *
from flask import Flask
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import json

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']
mapbox_access_token = 'pk.eyJ1IjoidmljdG9yZGliaWEiLCJhIjoiY2pzNWY3eGYyMGYxdzN5cGF1YnV6MWZqMSJ9.VxJJ0x_xhXRmBt4u5WciDQ'


with open('assets/citibike10k.json') as f:
    citibike_data = json.load(f)
    citibike_data = pd.read_json(citibike_data, orient='records')

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)

app.layout = html.Div(children=[
    html.Div(className="maintitle", children='''
        Dash: A web application framework for Python.
    '''),
    dcc.Input(id='my-id', className="hidden", value='initial value', type='text'),
    dcc.Graph(id='map-graph', className='mapgraph'),
])

@app.callback(
    Output("map-graph", "figure"),
    [Input("my-id", "value")]
)
def update_output_div(input_value):
    zoom = 12.0
    latInitial = 40.7272
    lonInitial = -73.991251
    bearing = 0

    graph_data = [
        go.Scattermapbox(
            lat= (citibike_data["slat"]),
            lon= (citibike_data["slon"]),
            mode='markers',
            hoverinfo="lat+lon+text",
            # text= citibike_data["start station name"] ,
            marker=dict(
                opacity=0.5,
                size=8,
            ),
             
        )
    ]

    graph_layout = go.Layout(
        autosize=True, 
        margin=Margin(l=0, r=0, t=0, b=0),
        showlegend=False,
        hovermode='closest',
        mapbox=dict(
            accesstoken=mapbox_access_token,
            bearing=0,
            center=dict(
                lat=latInitial,
                lon=lonInitial
            ),
            style='dark',
            pitch=0,
            zoom=zoom
        ),
    )
    return {"data":  graph_data, "layout": graph_layout}



if __name__ == '__main__': 
    app.run_server(debug=True)