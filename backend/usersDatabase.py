# Import necessary libraries and modules
from pymongo import MongoClient

# Helper functions and database functions from projectsDatabase (imported from your original code)
import projectsDatabase

'''
Structure of User entry:
User = {
    'username': username,
    'userid': userid,
    'password': password,
    'projects': [project1_ID, project2_ID, ...]
}
'''

# Function to add a new user
def add_user(db, userid, password):
    # Check if the user already exists
    user_collection = db['users']
    if user_collection.find_one({"userid": userid}):
        return False  # User already exists

    # Insert a new user document
    user_data = {
        "userid": userid,
        "password": password,
        "projects": []
    }
    user_collection.insert_one(user_data)
    return True

# Helper function to query a user by username and userid
def __queryUser(db, userid):
    # Query and return a user from the database
    user_collection = db['users']
    user = user_collection.find_one({"userid": userid})
    return user

# Function to log in a user
def login_user(db, userid, password):
    # Authenticate a user and return login status
    user = __queryUser(db, userid)
    if user and user.get("password") == password:
        return True  # Login successful
    return False  # Login failed

# Function to add a user to a project
def join_project(db, userid, projectId):
    # Add a user to a specified project
    user_collection = db['users']
    user = user_collection.find_one({"userid": userid})

    if user:
        # Check if the user is already part of the project
        if projectId not in user.get("projects", []):
            # Update the user's project list to include the new project
            user_collection.update_one(
                {"userid": userid},
                {"$push": {"projects": projectId}}
            )
            return True  # Joined project successfully
    return False  # Failed to join project or already a member

# Function to get the list of projects for a user
def get_user_projects(db, userid):
    # Get and return the list of projects a user is part of
    user = __queryUser(db, userid)
    if user:
        return user.get("projects", [])
    return None  # User not found or has no projects
