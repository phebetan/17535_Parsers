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


# Function to get all projects
def get_all_projects(db):
    projects_collection = db['projects']
    projects = projects_collection.find({}, {'_id': False})
    return list(projects)

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
    hardware_collection = db['hardwareSets']  # Access the hardware sets collection
    
    # Check if the project already exists
    if projects_collection.find_one({'projectId': projectId}):
        return False  

    # Fetch all hardware sets to initialize the project's hwSets
    hw_sets_cursor = hardware_collection.find({}, {'_id': 0, 'hwName': 1})
    hw_sets = {hw['hwName']: 0 for hw in hw_sets_cursor}  # Set initial quantity to 0 for each HWSet

    # Insert a new project document
    new_project = {
        'projectName': projectName,
        'projectId': projectId,
        'description': description,
        'hwSets': hw_sets,  # Populate hwSets with all hardware sets initialized to 0
        'users': []         # Initialize an empty user list
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
# Function to update hardware usage in a project
def update_usage(db, projectId, hwSetName, qty):
    projects_collection = db['projects']

    # Step 1: Ensure hwSets is initialized
    result_init = projects_collection.update_one(
        {'projectId': projectId, f'hwSets.{hwSetName}': {'$exists': False}},  # If hwSetName doesn't exist
        {'$set': {f'hwSets.{hwSetName}': 0}}  # Initialize it to 0
    )
    print(f"Initialization result: {result_init.modified_count > 0}")

    # Step 2: Increment the hardware quantity
    result_increment = projects_collection.update_one(
        {'projectId': projectId},
        {'$inc': {f'hwSets.{hwSetName}': qty}}  # Increment the value by qty
    )
    return result_increment.modified_count > 0

def reduce_usage(db, projectID, hwSetName, quantity):
    projects_collection = db['projects']

    # Step 1: Ensure hwSets.hwSetName is initialized
    result_init = projects_collection.update_one(
        {'projectId': projectID, f'hwSets.{hwSetName}': {'$exists': False}},  # Check if hwSetName doesn't exist
        {'$set': {f'hwSets.{hwSetName}': 0}}  # Initialize it to 0
    )
    print(f"Initialization result: {result_init.modified_count > 0}")

    # Step 2: Decrement the hardware quantity if sufficient quantity exists
    result_decrement = projects_collection.update_one(
        {
            'projectId': projectID,
            f'hwSets.{hwSetName}': {'$gte': quantity}  # Ensure enough hardware is checked out
        },
        {
            '$inc': {f'hwSets.{hwSetName}': -quantity}  # Decrease the value by quantity
        }
    )

    return result_decrement.modified_count > 0



#Function to add userid to the users array in the project
def join_project(db, projectId, userId):
    projects_collection = db['projects']
    
    # Update the project document by adding the userId to the users array if it doesn't already exist
    result = projects_collection.update_one(
        {'projectId': projectId},
        {'$addToSet': {'users': userId}}
    )
    
    # Return True if the user was added, otherwise False (if no document was modified)
    return result.modified_count > 0

