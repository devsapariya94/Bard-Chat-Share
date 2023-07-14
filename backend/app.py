from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient
import random
from flask_cors import CORS
import json

# get aip_key from congif.json file

with open('config.json') as f:
    config = json.load(f)

API_KEY = config['API_KEY']

app = Flask(__name__)
CORS(app) 

client = MongoClient(f"mongodb+srv://{config['mongo_username']}:{config['mongo_password']}@{config['mongo_host']}/")
# client = MongoClient('localhost', 27017)
db_name= config['mongo_db']
db = client.get_database(db_name)
collection_name = config['mongo_collection']
collection = db.get_collection(collection_name)



@app.route('/api', methods=['POST'])
def create_conversation():
    api_key = request.headers.get('API_Key')
    if not api_key or api_key != API_KEY:
        return jsonify({'error': 'Unauthorized access.'}), 401

    data = request.get_json()
    if 'human' not in data or 'ai' not in data:
        return jsonify({'error': 'Missing fields in request payload.'}), 400

    human = data['human']
    ai = data['ai']

    chat_id = generate_unique_chat_id()
    collection.insert_one({'chat_id': chat_id, 'human': human, 'ai': ai})

    return jsonify({'id': chat_id}), 201


@app.route('/api/<chat_id>', methods=['GET'])
def get_conversation(chat_id):
    chat = collection.find_one({'chat_id': int(chat_id)})
    if chat:
        human = chat['human']
        ai = chat['ai']
        return render_template('index.html', human=human, ai=ai)
    else:
        return jsonify({'error': 'Chat not found.'}), 404


def generate_unique_chat_id():
    while True:
        chat_id = random.randint(100000000, 9999999999)

        if not collection.find_one({'chat_id': chat_id}):
            return chat_id


if __name__ == '__main__':
    app.run(debug=True)
