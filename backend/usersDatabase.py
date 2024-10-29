# Import necessary libraries and modules
from pymongo import MongoClient

import projectsDatabase

'''
Structure of User entry:
User = {
    'username': username,
    'userId': userId,
    'password': password,
    'projects': [project1_ID, project2_ID, ...]
}
'''

# Function to add a new user
def add_user(db, userid, password):
    # Check if the user already exists
    user_collection = db['users']
    # if user_collection.find_one({"userid": userid}):
    #     return False  # User already exists

    # Insert a new user document
    user_data = {
        "userid": userid,
        "password": password
    }
    user_collection.insert_one(user_data)
    return True

# Helper function to query a user by username and userId
def __queryUser(client, username, userId):
    # Query and return a user from the database
    pass

# Function to log in a user
def login(client, username, userId, password):
    # Authenticate a user and return login status
    pass

# Function to add a user to a project
def joinProject(client, userId, projectId):
    # Add a user to a specified project
    pass

# Function to get the list of projects for a user
def getUserProjectsList(client, userId):
    # Get and return the list of projects a user is part of
    pass

