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
def get_hardware_info(db, hwSetName):
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
# Function to check out hardware units
def checkout_hardware(db, hwSetName, quantity):
    hardware_collection = db['hardwareSets']

    # Atomically decrease availability if enough units are available
    result = hardware_collection.update_one(
        {
            'hwName': hwSetName,
            'availability': {'$gte': quantity}  # Ensure enough units are available
        },
        {
            '$inc': {'availability': -quantity}  # Decrease availability
        }
    )

    return result.modified_count > 0  # Return True if update was successful

# Function to check in hardware units
def checkin_hardware(db, hwSetName, quantity):
    hardware_collection = db['hardwareSets']

    # Atomically increase availability but ensure it doesn't exceed capacity
    result = hardware_collection.update_one(
        {
            'hwName': hwSetName,
            '$expr': {'$lte': ['$availability', {'$subtract': ['$capacity', quantity]}]}  # Ensure within capacity
        },
        {
            '$inc': {'availability': quantity}  # Increase availability
        }
    )

    return result.modified_count > 0  # Return True if update was successful




# Function to get all hardware set names
def get_all_hardware_names(db):
    hardware_collection = db['hardwareSets']

    # Retrieve and return a list of all hardware set names
    hw_names = hardware_collection.find({}, {'_id': 0, 'hwName': 1})
    return [hw['hwName'] for hw in hw_names]
