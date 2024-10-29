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
def create_hardware_set(db, hwSetName, initCapacity):
    hardware_collection = db['hardwareSets']
    
    # Check if the hardware set already exists
    if hardware_collection.find_one({'hwName': hwSetName}):
        return False  

    # Insert a new hardware set document
    new_hw_set = {
        'hwName': hwSetName,
        'capacity': initCapacity,
        'availability': initCapacity
    }
    hardware_collection.insert_one(new_hw_set)
    return True  

# Function to query a hardware set by its name
def query_hardware_set(db, hwSetName):
    hardware_collection = db['hardwareSets']

    # Find and return the hardware set document
    hardware_set = hardware_collection.find_one({'hwName': hwSetName})
    if hardware_set:
        return {
            'hwName': hardware_set['hwName'],
            'capacity': hardware_set['capacity'],
            'availability': hardware_set['availability']
        }
    return None

# Function to update the availability of a hardware set
def update_availability(db, hwSetName, newAvailability):
    hardware_collection = db['hardwareSets']

    # Update the availability of an existing hardware set
    result = hardware_collection.update_one(
        {'hwName': hwSetName},
        {'$set': {'availability': newAvailability}}
    )

    return result.modified_count > 0  # Returns True if the update was successful

# Function to request space from a hardware set
def request_space(db, hwSetName, amount):
    hardware_collection = db['hardwareSets']
    hardware_set = hardware_collection.find_one({'hwName': hwSetName})

    if not hardware_set:
        return False 

    current_availability = hardware_set['availability']

    # Check if the requested amount is available
    if current_availability >= amount:
        # Update the hardware set availability
        new_availability = current_availability - amount
        update_availability(db, hwSetName, new_availability)
        return True
    return False

# Function to get all hardware set names
def get_all_hardware_names(db):
    hardware_collection = db['hardwareSets']

    # Retrieve and return a list of all hardware set names
    hw_names = hardware_collection.find({}, {'_id': 0, 'hwName': 1})
    return [hw['hwName'] for hw in hw_names]
