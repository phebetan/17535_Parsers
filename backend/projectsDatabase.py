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
def queryProject(client, projectId):
    db = client['myDatabase']
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
    else:
        return None

# Function to create a new project
def createProject(client, projectName, projectId, description):
    db = client['myDatabase']
    projects_collection = db['projects']
       
    if projects_collection.find_one({'projectId': projectId}):
        return False  

    new_project = {
        'projectName': projectName,
        'projectId': projectId,
        'description': description,
        'hwSets': {},  
        'users': []    
    }
    projects_collection.insert_one(new_project)
    return True

# Function to add a user to a project
def addUser(client, projectId, userId):
    db = client['myDatabase']
    projects_collection = db['projects']
    
    result = projects_collection.update_one(
        {'projectId': projectId},
        {'$addToSet': {'users': userId}}
    )

    return result.modified_count > 0

# Function to update hardware usage in a project
def updateUsage(client, projectId, hwSetName):
    db = client['myDatabase']
    projects_collection = db['projects']

    result = projects_collection.update_one(
        {'projectId': projectId},
        {'$set': {f'hwSets.{hwSetName}': qty}}
    )

# Function to check out hardware for a project
def checkOutHW(client, projectId, hwSetName, qty, userId):
    db = client['myDatabase']
    projects_collection = db['projects']
   
    project = projects_collection.find_one({'projectId': projectId})
    if not project:
        return False 

    
    current_usage = project.get('hwSets', {}).get(hwSetName, 0)

    
    hw_client = client
    if hardwareDatabase.requestSpace(hw_client, hwSetName, qty):
        new_usage = current_usage + qty
        updateUsage(client, projectId, hwSetName, new_usage)
        return True
    else:
        return False

# Function to check in hardware for a project
def checkInHW(client, projectId, hwSetName, qty, userId):
    db = client['myDatabase']
    projects_collection = db['projects']
    
    project = projects_collection.find_one({'projectId': projectId})
    if not project:
        return False  

    current_usage = project.get('hwSets', {}).get(hwSetName, 0)

    if current_usage < qty:
        return False  

    hw_client = client
    new_availability = current_usage - qty
    hardwareDatabase.updateAvailability(hw_client, hwSetName, new_availability)

    new_usage = current_usage - qty
    updateUsage(client, projectId, hwSetName, new_usage)
    return True  

