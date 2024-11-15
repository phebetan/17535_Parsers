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

# usersDatabase.py
def join_project(db, userid, projectID):
    try:
        # Check that `projectID` exists in the projects collection
        project = db.projects.find_one({"projectId": projectID})
        if not project:
            print(f"Project with ID {projectID} not found!")  # Improved debugging log
            return False

        # Check that `userid` exists in the users collection
        user = db.users.find_one({"userid": userid})
        if not user:
            print(f"User with ID {userid} not found!")  # Improved debugging log
            return False

        # Update the user's project list to include this project
        result = db.users.update_one(
            {"userid": userid},
            {"$addToSet": {"projects": projectID}}  # Adds to the set to avoid duplicates
        )

        # Check if the update modified a document
        if result.modified_count == 1:
            print(f"User {userid} successfully joined project {projectID}")
            return True
        else:
            print(f"User {userid} already in project {projectID} or update failed")
            return False
    except Exception as e:
        print(f"Error in join_project: {e}")
        return False


# Function to get the list of projects for a user
def get_user_projects(db, userid):
    # Get and return the list of projects a user is part of
    user = __queryUser(db, userid)
    if user:
        return user.get("projects", [])
    return None  # User not found or has no projects

# Function to set the login status of a user in the database
def set_user_logged_in(db, userid, status=True):
    user_collection = db['users']
    user_collection.update_one({'userid': userid}, {'$set': {'loggedIn': status}})

# Function to check if a user is currently logged in
def is_user_logged_in(db, userid):
    user = __queryUser(db, userid)
    return user and user.get("loggedIn", False)
