"""
Parse station list from Steele et al. (2024) paper and find SNOTEL triplet IDs
"""

from snotel_api import SNOTELClient
import pandas as pd

# Stations from the paper (name, elevation_m, lat, lon, region)
# Parsed from the table you provided
PAPER_STATIONS = [
    # California (Region 1)
    {"name": "Forestdale Creek", "lat": 38.68, "lon": -119.96, "elev": 2443.6, "region": 1},
    {"name": "Horse Meadow", "lat": 38.84, "lon": -119.89, "elev": 2608.2, "region": 1},
    {"name": "Burnside Lake", "lat": 38.72, "lon": -119.89, "elev": 2477.7, "region": 1},
    {"name": "Summit Meadow", "lat": 38.92, "lon": -119.92, "elev": 2.2, "region": 1},  # Note: elev looks wrong
    {"name": "Independence Lake", "lat": 39.43, "lon": -120.31, "elev": 2541.4, "region": 1},
    {"name": "Monitor Pass", "lat": 38.67, "lon": -119.61, "elev": 2531.7, "region": 1},
    {"name": "Rubicon #2", "lat": 39.0, "lon": -120.13, "elev": 2322.3, "region": 1},
    {"name": "Squaw Valley G.C.", "lat": 39.19, "lon": -120.27, "elev": 2442.4, "region": 1},
    {"name": "Ward Creek #3", "lat": 39.14, "lon": -120.22, "elev": 2205.0, "region": 1},
    {"name": "Leavitt Lake", "lat": 38.28, "lon": -119.54, "elev": 2927.3, "region": 1},
    {"name": "Heavenly Valley", "lat": 38.4, "lon": -119.54, "elev": 2608.6, "region": 1},

    # Oregon/Washington Cascades (Region 2)
    {"name": "Cascade Summit", "lat": 43.59, "lon": -122.06, "elev": 1554.5, "region": 2},
    {"name": "Little Meadows", "lat": 44.61, "lon": -122.23, "elev": 1225.3, "region": 2},
    {"name": "Mt Hood Test Site", "lat": 45.32, "lon": -121.72, "elev": 1636.8, "region": 2},
    {"name": "Mt Hoe", "lat": 45.25, "lon": -121.74, "elev": 1240.5, "region": 2},
    {"name": "Lynn Lake", "lat": 47.2, "lon": -121.78, "elev": 1188.7, "region": 2},
    {"name": "Cayuse Pass", "lat": 46.87, "lon": -121.53, "elev": 1597.2, "region": 2},
    {"name": "Lone Pine", "lat": 46.27, "lon": -121.96, "elev": 1197.9, "region": 2},
    {"name": "Mount Crag", "lat": 47.76, "lon": -123.03, "elev": 1207.0, "region": 2},
    {"name": "Pigtail Peak", "lat": 46.62, "lon": -121.39, "elev": 1767.8, "region": 2},
    {"name": "Marten Ridge", "lat": 48.76, "lon": -121.7, "elev": 1072.9, "region": 2},
    {"name": "Mud Ridge", "lat": 45.87, "lon": -122.17, "elev": 1700.8, "region": 2},

    # Utah (Region 3)
    {"name": "Cascade Mountain", "lat": 40.28, "lon": -111.61, "elev": 2369.5, "region": 3},
    {"name": "Usu Doc Daniel", "lat": 41.86, "lon": -111.51, "elev": 2520.7, "region": 3},
    {"name": "Big Flat", "lat": 38.3, "lon": -112.36, "elev": 3154.4, "region": 3},
    {"name": "Farmington", "lat": 40.97, "lon": -111.81, "elev": 2408.5, "region": 3},
    {"name": "Farnsworth Lake", "lat": 38.77, "lon": -111.68, "elev": 2933.1, "region": 3},
    {"name": "Mammoth-Cottonwood", "lat": 39.68, "lon": -111.32, "elev": 2654.5, "region": 3},
    {"name": "Midway Valley", "lat": 37.57, "lon": -112.84, "elev": 2995.3, "region": 3},
    {"name": "Parleys Summit", "lat": 40.76, "lon": -111.63, "elev": 2311.9, "region": 3},
    {"name": "Snowbird", "lat": 40.57, "lon": -111.66, "elev": 2931.3, "region": 3},
    {"name": "Trial Lake", "lat": 40.68, "lon": -110.95, "elev": 3045.6, "region": 3},
    {"name": "Clayton Springs", "lat": 37.97, "lon": -111.83, "elev": 3062.9, "region": 3},

    # Colorado (Region 4)
    {"name": "Lone Cone", "lat": 40.35, "lon": -106.38, "elev": 3340.6, "region": 4},
    {"name": "Zirkel", "lat": 40.79, "lon": -106.6, "elev": 2846.8, "region": 4},
    {"name": "Bison Lake", "lat": 39.76, "lon": -107.36, "elev": 3316.2, "region": 4},
    {"name": "Butte", "lat": 38.89, "lon": -106.95, "elev": 3096.8, "region": 4},
    {"name": "Lily Pond", "lat": 37.38, "lon": -106.55, "elev": 3352.8, "region": 4},
    {"name": "Lizard Head Pass", "lat": 37.8, "lon": -107.92, "elev": 3109.0, "region": 4},
    {"name": "Niwot", "lat": 40.04, "lon": -105.54, "elev": 3020.6, "region": 4},
    {"name": "Schofield Pass", "lat": 39.02, "lon": -107.05, "elev": 3261.4, "region": 4},
    {"name": "Mesa Lakes", "lat": 39.06, "lon": -108.06, "elev": 3048.0, "region": 4},
    {"name": "Culebra #2", "lat": 37.21, "lon": -105.2, "elev": 3200.4, "region": 4},
    {"name": "Cumbres Trestle", "lat": 37.02, "lon": -106.45, "elev": 3060.2, "region": 4},

    # Idaho/Oregon/Wyoming (Region 5)
    {"name": "Cool Creek", "lat": 46.76, "lon": -115.3, "elev": 1914.1, "region": 5},
    {"name": "Annie Springs", "lat": 42.43, "lon": -122.13, "elev": 1831.8, "region": 5},
    {"name": "Big Red Mountain", "lat": 42.05, "lon": -122.85, "elev": 1844.0, "region": 5},
    {"name": "Blackwater", "lat": 44.38, "lon": -109.79, "elev": 2980.9, "region": 5},
    {"name": "Milk Shakes", "lat": 45.98, "lon": -117.95, "elev": 1700.8, "region": 5},

    # Arizona
    {"name": "Snowslide Canyon", "lat": 35.34, "lon": -111.08, "elev": 2965.7, "region": 6},
]


def find_snotel_stations():
    """
    Find SNOTEL triplet IDs for all paper stations by searching the SNOTEL database
    """
    client = SNOTELClient()

    print("=" * 80)
    print(f"Finding SNOTEL Triplet IDs for {len(PAPER_STATIONS)} Paper Stations")
    print("=" * 80)

    results = []

    # Get all SNOTEL stations from Western states
    states = ['CA', 'OR', 'WA', 'ID', 'MT', 'WY', 'CO', 'UT', 'NV', 'AZ', 'NM']

    print("\nFetching SNOTEL station database...")
    all_stations = []
    for state in states:
        try:
            stations = client.get_stations(state_codes=state, network_codes='SNTL')
            all_stations.extend(stations)
            print(f"  {state}: {len(stations)} stations")
        except Exception as e:
            print(f"  {state}: Error - {e}")

    print(f"\nTotal SNOTEL stations found: {len(all_stations)}")

    # Match paper stations to SNOTEL database
    print("\n" + "=" * 80)
    print("Matching Paper Stations to SNOTEL Database")
    print("=" * 80)

    for paper_station in PAPER_STATIONS:
        name = paper_station['name']
        lat = paper_station['lat']
        lon = paper_station['lon']

        # Find closest match by name and location
        best_match = None
        best_score = float('inf')

        for snotel_station in all_stations:
            snotel_name = snotel_station.get('name', '')
            snotel_lat = snotel_station.get('latitude', 0)
            snotel_lon = snotel_station.get('longitude', 0)

            # Calculate distance (simple Euclidean for now)
            dist = ((lat - snotel_lat)**2 + (lon - snotel_lon)**2)**0.5

            # Check name similarity (simple contains check)
            name_match = (name.lower() in snotel_name.lower() or
                         snotel_name.lower() in name.lower())

            # Score: prioritize close distance, bonus for name match
            score = dist
            if name_match:
                score *= 0.1  # Strong bonus for name match

            if score < best_score:
                best_score = score
                best_match = snotel_station

        if best_match:
            triplet = best_match.get('stationTriplet', best_match.get('triplet', 'Unknown'))
            snotel_name = best_match.get('name', 'Unknown')
            snotel_lat = best_match.get('latitude', 0)
            snotel_lon = best_match.get('longitude', 0)

            match_quality = "EXACT" if best_score < 0.01 else "CLOSE" if best_score < 0.1 else "APPROX"

            print(f"\n{match_quality}: {name}")
            print(f"  Paper:  ({lat:.2f}, {lon:.2f})")
            print(f"  SNOTEL: {snotel_name} ({snotel_lat:.2f}, {snotel_lon:.2f})")
            print(f"  Triplet: {triplet}")
            print(f"  Distance: {best_score:.4f}")

            results.append({
                'paper_name': name,
                'snotel_name': snotel_name,
                'triplet': triplet,
                'paper_lat': lat,
                'paper_lon': lon,
                'snotel_lat': snotel_lat,
                'snotel_lon': snotel_lon,
                'elevation': paper_station['elev'],
                'region': paper_station['region'],
                'match_quality': match_quality,
                'distance': best_score
            })
        else:
            print(f"\nNO MATCH: {name} ({lat:.2f}, {lon:.2f})")

    # Create DataFrame
    df = pd.DataFrame(results)

    # Save to CSV
    output_file = 'd:/projects/snowreport-react/paper_stations_matched.csv'
    df.to_csv(output_file, index=False)
    print(f"\n" + "=" * 80)
    print(f"Results saved to: {output_file}")
    print(f"Total matches: {len(df)}")
    print(f"  Exact: {len(df[df['match_quality'] == 'EXACT'])}")
    print(f"  Close: {len(df[df['match_quality'] == 'CLOSE'])}")
    print(f"  Approximate: {len(df[df['match_quality'] == 'APPROX'])}")
    print("=" * 80)

    return df


if __name__ == "__main__":
    matched_stations = find_snotel_stations()

    print("\n" + "=" * 80)
    print("Station Triplets for Training Configuration")
    print("=" * 80)
    print("\nPython dictionary format:")
    print("TRAINING_STATIONS = {")
    for _, row in matched_stations.iterrows():
        print(f"    '{row['triplet']}': '{row['snotel_name']}',")
    print("}")
