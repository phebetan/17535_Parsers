# Import necessary libraries and modules
from bson.objectid import ObjectId
from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS

import usersDatabase
import projectsDatabase
import hardwareDatabase



# Define the MongoDB connection string
MONGODB_SERVER = "mongodb+srv://phebetan:test@projectdatabase.6wsrr.mongodb.net/?retryWrites=true&w=majority&appName=ProjectDatabase"

# Initialize a new Flask web application
app = Flask(__name__)
CORS(app)  # This will allow all origins by default

# Helper function to connect to MongoDB
def get_db():
    client = MongoClient(MONGODB_SERVER, tls=True, tlsAllowInvalidCertificates=True)
    db = client['ProjectDatabase']
    return db, client

# Route for user login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    userid = data.get('userid')
    password = data.get('password')

    db, client = get_db()
    result = usersDatabase.login_user(db, userid, password)
    client.close()

    if result:
        return jsonify({'message': 'Login successful!', 'userid': userid})
    else:
        return jsonify({'message': 'Invalid credentials!'}), 401

# Route for the main page (Work in progress)
@app.route('/main')
def mainPage():
    data = request.args
    userid = data.get('userid')

    db, client = get_db()
    user_projects = usersDatabase.get_user_projects(db, userid)
    client.close()

    if user_projects is not None:
        return jsonify({'projects': user_projects})
    else:
        return jsonify({'message': 'User not found!'}), 404

# Route for joining a project
@app.route('/join_project', methods=['POST'])
def join_project():
    data = request.get_json()
    userid = data.get('userid')
    projectID = data.get('projectID')

    db, client = get_db()
    success = usersDatabase.join_project(db, userid, projectID)
    client.close()

    if success:
        return jsonify({'message': 'Joined project successfully!'})
    else:
        return jsonify({'message': 'Failed to join project!'}), 400

# Route for adding a new user
@app.route('/add_user', methods=['POST'])
def add_user():  
    data = request.get_json()
    try:
        db, client = get_db()
        # Attempt a simple operation like listing collections
        print("Collections in ProjectDatabase:", db.list_collection_names())
        client.close()
        print("MongoDB connection successful!")
    except Exception as e:
        print("MongoDB connection failed:", e)
    userid = data.get('userid')
    password = data.get('password')

    db, client = get_db()
    success = usersDatabase.add_user(db, userid, password)
    client.close()

    if success:
        return jsonify({'message': 'User added successfully!'})
    else:
        return jsonify({'message': 'User already exists!'}), 400

# Route for getting the list of user projects
@app.route('/get_user_projects_list', methods=['POST'])
def get_user_projects_list():
    data = request.get_json()
    userid = data.get('userid')

    db, client = get_db()
    user_projects = usersDatabase.get_user_projects(db, userid)
    client.close()

    return jsonify({'projects': user_projects})

# Route for creating a new project
@app.route('/create_project', methods=['POST'])
def create_project():
    data = request.get_json()
    project_name = data.get('name')
    description = data.get('description')
    projectID = data.get('projectID')

    db, client = get_db()
    success = projectsDatabase.create_project(db, project_name, description, projectID)
    client.close()

    if success:
        return jsonify({'message': 'Project created successfully!'})
    else:
        return jsonify({'message': 'Failed to create project!'}), 400

# Route for getting project information
@app.route('/get_project_info', methods=['POST'])
def get_project_info():
    data = request.get_json()
    projectID = data.get('projectID')

    db, client = get_db()
    project_info = projectsDatabase.get_project_info(db, projectID)
    client.close()

    if project_info:
        return jsonify(project_info)
    else:
        return jsonify({'message': 'Project not found!'}), 404

# Route for getting all hardware names
@app.route('/get_all_hw_names', methods=['POST'])
def get_all_hw_names():
    db, client = get_db()
    hw_names = hardwareDatabase.get_all_hardware_names(db)
    print(hw_names)
    client.close()

    return jsonify({'hardware_names': hw_names})

# Route for getting hardware information
@app.route('/get_hw_info', methods=['POST'])
def get_hw_info():
    data = request.get_json()
    hw_name = data.get('hw_name')

    db, client = get_db()
    hw_info = hardwareDatabase.get_hardware_info(db, hw_name)
    client.close()

    if hw_info:
        return jsonify(hw_info)
    else:
        return jsonify({'message': 'Hardware not found!'}), 404

# Route for checking out hardware
@app.route('/check_out', methods=['POST'])
def check_out():
    data = request.get_json()
    projectID = data.get('projectID')
    hw_name = data.get('hw_name')
    quantity = data.get('quantity')

    db, client = get_db()
    success = projectsDatabase.update_usage(db, projectID, hw_name, quantity)
    client.close()

    if success:
        return jsonify({'message': 'Hardware checked out successfully!'})
    else:
        return jsonify({'message': 'Failed to check out hardware!'}), 400

# Route for checking in hardware
@app.route('/check_in', methods=['POST'])
def check_in():
    data = request.get_json()
    projectID = data.get('projectID')
    hw_name = data.get('hw_name')
    quantity = data.get('quantity')

    db, client = get_db()
    success = projectsDatabase.check_in_hardware(db, projectID, hw_name, quantity)
    client.close()

    if success:
        return jsonify({'message': 'Hardware checked in successfully!'})
    else:
        return jsonify({'message': 'Failed to check in hardware!'}), 400

# Route for creating a new hardware set
@app.route('/create_hardware_set', methods=['POST'])
def create_hardware_set():
    data = request.get_json()
    hw_name = data.get('hw_name')
    capacity = data.get('capacity')

    db, client = get_db()
    success = hardwareDatabase.create_hardware_set(db, hw_name, capacity)
    client.close()

    if success:
        return jsonify({'message': 'Hardware set created successfully!'})
    else:
        return jsonify({'message': 'Failed to create hardware set!'}), 400

# Route for checking the inventory of projects
@app.route('/api/inventory', methods=['GET'])
def check_inventory():
    db, client = get_db()
    inventory = projectsDatabase.get_inventory(db)
    client.close()

    return jsonify({'inventory': inventory})

# Main entry point for the application
if __name__ == '__main__':
    app.run(debug=True)
