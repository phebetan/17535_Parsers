# Import necessary libraries and modules
from pymongo import MongoClient
import hardwareDatabase

'''
Structure of Project entry:
Project = {
    'projectName': projectName,
    'projectId': projectId,
    'description': description,
    'hwSets': {HW1: 0, HW2: 10, ...},
    'users': [user1, user2, ...]
}
'''

# Function to query a project by its ID
def query_project(db, projectId):
    projects_collection = db['projects']
    
    project = projects_collection.find_one({'projectId': projectId})
    if project:
        return {
            'projectName': project['projectName'],
            'projectId': project['projectId'],
            'description': project['description'],
            'hwSets': project.get('hwSets', {}),
            'users': project.get('users', [])
        }
    return None

# Function to create a new project
def create_project(db, projectName, projectId, description):
    projects_collection = db['projects']
    
    # Check if the project already exists
    if projects_collection.find_one({'projectId': projectId}):
        return False  

    # Insert a new project document
    new_project = {
        'projectName': projectName,
        'projectId': projectId,
        'description': description,
        'hwSets': {},  # Initialize an empty hardware set
        'users': []    # Initialize an empty user list
    }
    projects_collection.insert_one(new_project)
    return True

# Function to add a user to a project
def add_user_to_project(db, projectId, userId):
    projects_collection = db['projects']
    
    # Use $addToSet to ensure userId is only added once
    result = projects_collection.update_one(
        {'projectId': projectId},
        {'$addToSet': {'users': userId}}
    )

    return result.modified_count > 0

# Function to update hardware usage in a project
def update_usage(db, projectId, hwSetName, qty):
    projects_collection = db['projects']
    
    # Update the quantity of hardware in the specified project's hwSets
    result = projects_collection.update_one(
        {'projectId': projectId},
        {'$set': {f'hwSets.{hwSetName}': qty}}
    )
    return result.modified_count > 0

# Function to check out hardware for a project
def check_out_hw(db, projectId, hwSetName, qty, userId):
    projects_collection = db['projects']
   
    project = projects_collection.find_one({'projectId': projectId})
    if not project:
        return False 

    # Get the current hardware usage for the project
    current_usage = project.get('hwSets', {}).get(hwSetName, 0)

    # Check with hardwareDatabase if the requested quantity is available
    if hardwareDatabase.request_space(db, hwSetName, qty):
        # Update the new hardware usage in the project
        new_usage = current_usage + qty
        update_usage(db, projectId, hwSetName, new_usage)
        return True
    else:
        return False

# Function to check in hardware for a project
def check_in_hw(db, projectId, hwSetName, qty, userId):
    projects_collection = db['projects']
    
    project = projects_collection.find_one({'projectId': projectId})
    if not project:
        return False  

    # Get the current hardware usage for the project
    current_usage = project.get('hwSets', {}).get(hwSetName, 0)

    # Ensure the quantity being checked in does not exceed current usage
    if current_usage < qty:
        return False  

    # Update availability in hardwareDatabase
    new_availability = current_usage - qty
    hardwareDatabase.update_availability(db, hwSetName, new_availability)

    # Update the new hardware usage in the project
    new_usage = current_usage - qty
    update_usage(db, projectId, hwSetName, new_usage)
    return True  