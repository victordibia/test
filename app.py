# serve.py

from flask import Flask,  jsonify
from flask import render_template
import random

# creates a Flask application, named app
app = Flask(__name__)

# a route where we will display a welcome message via an HTML template


@app.route("/")
def home():
    message = "Hello, World"
    return render_template('chloro.html', message=message)


@app.route("/test")
def test():
    message = "Hello, World"
    return render_template('test.html', message=message)

@app.route("/model")
def model():
    score = 0 if random.uniform(0,1) > 0.5 else 1
    return jsonify(score)

@app.route("/anim")
def chloro():
    message = "Hello, World"
    return render_template('index.html', message=message)


# run the application
if __name__ == "__main__":
    app.run(debug=True, port=5002)
