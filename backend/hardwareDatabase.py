# Import necessary libraries and modules
from pymongo import MongoClient

'''
Structure of Hardware Set entry:
HardwareSet = {
    'hwName': hwSetName,
    'capacity': initCapacity,
    'availability': initCapacity
}
'''

# Function to create a new hardware set
def createHardwareSet(client, hwSetName, initCapacity):
    db = client['myDatabase']
    hardware_collection = db['hardwareSets']

    
    if hardware_collection.find_one({'hwName': hwSetName}):
        return False  

    new_hw_set = {
        'hwName': hwSetName,
        'capacity': initCapacity,
        'availability': initCapacity
    }
    hardware_collection.insert_one(new_hw_set)
    return True  

# Function to query a hardware set by its name
def queryHardwareSet(client, hwSetName):
    db = client['myDatabase']
    hardware_collection = db['hardwareSets']

    hardware_set = hardware_collection.find_one({'hwName': hwSetName})
    if hardware_set:
        return {
            'hwName': hardware_set['hwName'],
            'capacity': hardware_set['capacity'],
            'availability': hardware_set['availability']
        }
    else:
        return None

# Function to update the availability of a hardware set
def updateAvailability(client, hwSetName, newAvailability):
    db = client['myDatabase']
    hardware_collection = db['hardwareSets']

    # Update the availability of an existing hardware set
    result = hardware_collection.update_one(
        {'hwName': hwSetName},
        {'$set': {'availability': newAvailability}}
    )

    return result.modified_count > 0  # Returns True if update was successful

# Function to request space from a hardware set
def requestSpace(client, hwSetName, amount):
    db = client['myDatabase']
    hardware_collection = db['hardwareSets']
    hardware_set = hardware_collection.find_one({'hwName': hwSetName})

    if not hardware_set:
        return False 

    current_availability = hardware_set['availability']

    if current_availability >= amount:
        
        new_availability = current_availability - amount
        updateAvailability(client, hwSetName, new_availability)
        return True
    else:
        return False

# Function to get all hardware set names
def getAllHwNames(client):
    db = client['myDatabase']
    hardware_collection = db['hardwareSets']

    # Get and return a list of all hardware set names
    hw_names = hardware_collection.find({}, {'_id': 0, 'hwName': 1})
    return [hw['hwName'] for hw in hw_names]

