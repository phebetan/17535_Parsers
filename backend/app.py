# Import necessary libraries and modules
from flask import Flask, request, jsonify, send_from_directory
from pymongo import MongoClient
from flask_cors import CORS
import os

import usersDatabase
import projectsDatabase
import hardwareDatabase

# Define the MongoDB connection string
MONGODB_SERVER = os.getenv("MONGO_URI", "mongodb+srv://phebetan:test@projectdatabase.6wsrr.mongodb.net/?retryWrites=true&w=majority&appName=ProjectDatabase")

# Initialize the Flask application
app = Flask(__name__, static_folder="static")
CORS(app)  # Enable Cross-Origin Resource Sharing (CORS)

# Helper function to connect to MongoDB
def get_db():
    client = MongoClient(MONGODB_SERVER, tls=True, tlsAllowInvalidCertificates=True)
    db = client["ProjectDatabase"]
    return db, client


# === Routes for Static Files (React Frontend) ===
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_static(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


# === User Routes ===
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    userid = data.get("userid")
    password = data.get("password")

    db, client = get_db()
    result = usersDatabase.login_user(db, userid, password)
    client.close()

    if result:
        return jsonify({"message": "Login successful!", "userid": userid})
    return jsonify({"message": "Invalid credentials!"}), 401


@app.route("/add_user", methods=["POST"])
def add_user():
    data = request.get_json()
    userid = data.get("userid")
    password = data.get("password")

    db, client = get_db()
    success = usersDatabase.add_user(db, userid, password)
    client.close()

    if success:
        return jsonify({"message": "User added successfully!"})
    return jsonify({"message": "User already exists!"}), 400


@app.route("/get_user_projects_list", methods=["POST"])
def get_user_projects_list():
    data = request.get_json()
    userid = data.get("userid")

    if not userid:
        return jsonify({"message": "User ID is required"}), 400

    db, client = get_db()
    try:
        user_projects = usersDatabase.get_user_projects(db, userid)
    except Exception as e:
        print(f"Error fetching user projects: {e}")
        return jsonify({"message": "Error fetching user projects"}), 500
    finally:
        client.close()

    return jsonify({"projects": user_projects})


@app.route("/join_project", methods=["POST"])
def join_project():
    data = request.get_json()
    userid = data.get("userid")
    projectId = data.get("projectId")

    if not userid or not projectId:
        return jsonify({"message": "Missing userid or projectId"}), 400

    db, client = get_db()
    success = (
        usersDatabase.join_project(db, userid, projectId)
        and projectsDatabase.add_user_to_project(db, projectId, userid)
    )
    client.close()

    if success:
        return jsonify({"message": "Joined project successfully!"})
    return jsonify({"message": "Failed to join project!"}), 400


# === Project Routes ===
@app.route("/create_project", methods=["POST"])
def create_project():
    data = request.get_json()
    project_name = data.get("projectName")
    description = data.get("description")
    projectID = data.get("projectId")

    db, client = get_db()
    success = projectsDatabase.create_project(db, project_name, projectID, description)
    client.close()

    if success:
        return jsonify({"message": "Project created successfully!"})
    return jsonify({"message": "Failed to create project!"}), 400


@app.route("/get_all_projects", methods=["GET"])
def get_all_projects():
    db, client = get_db()
    projects = projectsDatabase.get_all_projects(db)
    client.close()

    return jsonify({"projects": projects})


@app.route("/get_project_hw_usage", methods=["POST"])
def get_project_hw_usage():
    data = request.get_json()
    projectId = data.get("projectId")

    if not projectId:
        return jsonify({"message": "Project ID is required!"}), 400

    db, client = get_db()
    try:
        project = db["projects"].find_one({"projectId": projectId}, {"_id": 0, "hwSets": 1})
        if not project:
            return jsonify({"message": "Project not found!"}), 404

        hw_usage = project.get("hwSets", {})
        return jsonify({"hwSets": hw_usage})
    except Exception as e:
        print(f"Error fetching project hardware usage: {e}")
        return jsonify({"message": "Error fetching project hardware usage!"}), 500
    finally:
        client.close()


# === Hardware Routes ===
@app.route("/get_all_hw_names", methods=["POST"])
def get_all_hw_names():
    db, client = get_db()
    try:
        hw_names = hardwareDatabase.get_all_hardware_names(db)
    except Exception as e:
        print("Error fetching hardware names:", e)
        hw_names = []
    finally:
        client.close()

    return jsonify({"hardware_names": hw_names})


@app.route("/get_hw_info", methods=["POST"])
def get_hw_info():
    data = request.get_json()
    hw_name = data.get("hw_name")

    db, client = get_db()
    hw_info = hardwareDatabase.get_hardware_info(db, hw_name)
    client.close()

    if hw_info:
        return jsonify(hw_info)
    return jsonify({"message": "Hardware not found!"}), 404


@app.route("/check_out", methods=["POST"])
def check_out():
    data = request.get_json()
    projectID = data.get("projectID")
    hw_name = data.get("hw_name")
    quantity = data.get("quantity")

    if not all([projectID, hw_name, quantity]):
        return jsonify({"message": "Missing required fields!"}), 400

    db, client = get_db()
    try:
        success_project = projectsDatabase.update_usage(db, projectID, hw_name, quantity)
        success_hardware = hardwareDatabase.checkout_hardware(db, hw_name, quantity)

        if success_project and success_hardware:
            return jsonify({"message": "Hardware checked out successfully!"})
        return jsonify({"message": "Failed to check out hardware!"}), 400
    except Exception as e:
        print(f"Error in check_out: {e}")
        return jsonify({"message": "Internal server error!"}), 500
    finally:
        client.close()


@app.route("/check_in", methods=["POST"])
def check_in():
    data = request.get_json()
    projectID = data.get("projectID")
    hw_name = data.get("hw_name")
    quantity = data.get("quantity")

    if not all([projectID, hw_name, quantity]):
        return jsonify({"message": "Missing required fields!"}), 400

    db, client = get_db()
    try:
        success_project = projectsDatabase.reduce_usage(db, projectID, hw_name, quantity)
        success_hardware = hardwareDatabase.checkin_hardware(db, hw_name, quantity)

        if success_project and success_hardware:
            return jsonify({"message": "Hardware checked in successfully!"})
        return jsonify({"message": "Failed to check in hardware!"}), 400
    except Exception as e:
        print(f"Error in check_in: {e}")
        return jsonify({"message": "Internal server error!"}), 500
    finally:
        client.close()


# === Entry Point ===
if __name__ == "__main__":
    app.run(debug=True)
