import json
import re
import pandas as pd
import numpy as np
from python_calamine.pandas import pandas_monkeypatch

pandas_monkeypatch()
df = pd.read_excel('./data/IIITB-Menu.xlsx', engine="calamine")


def process_meal_data(series):
    """
    Process a pandas series containing meal data into a structured dictionary format.
    
    Args:
        series: pandas.Series containing meal items with meal categories
        
    Returns:
        list: List of dictionaries containing meal categories and their items
    """
    # Initialize variables
    result = []
    current_category = None
    current_items = []
    
    # Define meal categories
    meal_categories = {'Breakfast', 'Lunch', 'Snacks', 'Dinner'}
    
    # Process each row in the series
    for item in series:
        # Skip empty or whitespace-only strings
        if not isinstance(item, str) or not item.strip():
            continue
            
        # Clean the item string
        item = item.strip()

        
        # Check if this is a meal category
        if item in meal_categories:
            # Save previous category if exists
            if current_category:
                result.append({
                    'title': current_category,
                    'items': current_items
                })
            # Start new category
            current_category = item
            current_items = []
        # If not a category and we have a current category, add to items
        elif current_category and item:
            current_items.append(item)
    
    # Add the last category
    if current_category and current_items:
        result.append({
            'title': current_category,
            'items': current_items
        })
    
    return result


def human_readable_time(date):
    def add_suffix(day):
        try:
            day = int(day)
        except ValueError:
            pass

        if day in [1, 21, 31]:
            return f"{day}st"
        elif day in [2, 22]:
            return f"{day}nd"
        elif day in [3, 23]:
            return f"{day}rd"
        else:
            return f"{day}th"
    
    dt = pd.to_datetime(date).dt

    return dt.strftime('%B ') + dt.day.apply(add_suffix) + dt.strftime(' %Y')


def capitalize_if_string(i):
    if isinstance(i, str):
        return i.capitalize()
    return i


# Get names of columns from Row 1
# Sometimes they somehow add NaNs into the excel file,
# and so I'd like to ensure it's a string before calling
# capitalize on it.
# df.columns = [capitalize_if_string(i) for i in df.iloc[0]]
df.columns = [capitalize_if_string(i) for i in df.columns] # - TEMP FIX 17 JULY


# Remove name row - TEMP FIX 17 JULY
# df = df.drop(index=[0])

# Make empty cells NaN
df = df.replace('\xa0', np.nan)

# Make empty cells empty
df = df.replace(np.nan, '')

# Title-ify names
df = df.applymap(lambda x: str(x).strip())
df = df.applymap(lambda x: str(x).title())

# Convert dates to human readable format
df.iloc[0] = human_readable_time(df.iloc[0])
df.iloc[1] = human_readable_time(df.iloc[1])


days = ['Sunday', 'Monday', 'Tuesday',
        'Wednesday', 'Thursday', 'Friday', 'Saturday']
meals = ['Breakfast', 'Lunch', 'Snacks', 'Dinner']

data = {}

print(df)

data = {}
for day in days:
    data[day] = {
        'dates': list(df[day][0:2]), 
        'catalog': process_meal_data(df[day])
    }

print(data)


with open('./data/menu.json', 'w') as jsonfile:
    json.dump(data, jsonfile)
