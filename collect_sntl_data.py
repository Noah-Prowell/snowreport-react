from snotel_api import SNOTELClient
import pandas as pd
import time
# Create a client
client = SNOTELClient()

station_csv = pd.read_csv("paper_stations_matched.csv")

required_elements = [
    'SNWD',    # Target variable (observed snow depth)
    'WTEQ',    # Snow water equivalent
    'PREC',    # Precipitation
    'TAVG',    # Temperature (for physical model)
    'TMAX',    # Max temperature
    'TMIN',    # Min temperature
    'SRADV',   # Solar radiation (if available)
    'RHUMV',   # Relative humidity (if available)
    'WSPDV',   # Wind speed (if available)
]

data = []
for _,row in station_csv.iterrows():
    triplet = row['triplet']
    name = row['snotel_name']

    print(f"Fetching {name}")

    try:
        df = client.get_historical_data(
            station_triplet=triplet,
            elements=["SNWD", "WTEQ", "PREC", "TAVG", "TMAX", "TMIN","SRADV","RHUMV","WSPDV"],
            start_year=2008,
            end_year=2024
        )
        df['station_name'] = name
        data.append(df)
    except Exception as e:
        print(f"  Error: {e}")
    time.sleep(1)
# Combine all stations
training_data = pd.concat(data, ignore_index=True)
training_data.to_csv('training_data_2008_2024.csv', index=False)