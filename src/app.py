from flask import Flask, request, render_template, Response, make_response
import json
from ultils import processInstr

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/database', methods=['GET', 'POST'])
def database():
    data = request.json
    result = processInstr(data)
    return json.dumps(result), 200

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)