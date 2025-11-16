"""
SNOTEL API Client for Snow Depth Prediction
Integrates with USDA AWDB REST API to fetch snow and weather data
"""

import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union
import pandas as pd


class SNOTELClient:
    """
    Client for interacting with the SNOTEL AWDB REST API

    API Documentation: https://wcc.sc.egov.usda.gov/awdbRestApi/swagger-ui/index.html
    """

    BASE_URL = "https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1"

    # Monitored ski resort SNOTEL stations
    STATIONS = {
        "335:CO:SNTL": 'Berthoud Summit',
        "970:CO:SNTL": 'Jones Pass',
        "602:CO:SNTL": 'Loveland Pass',
        "842:CO:SNTL": 'Vail',
        "776:UT:SNTL": 'Snowbird',
        "366:UT:SNTL": 'Brighton Resort',
        "1082:WY:SNTL": 'Grand Targhee',
        "679:WA:SNTL": 'Mt. Rainier/Paradise',
        "909:WA:SNTL": 'Mt. Baker/Wells Creek'
    }

    # Common SNOTEL data elements
    ELEMENTS = {
        'SNWD': 'Snow Depth',
        'WTEQ': 'Snow Water Equivalent',
        'PREC': 'Precipitation Accumulation',
        'PRCP': 'Precipitation Increment',
        'TAVG': 'Average Air Temperature',
        'TMAX': 'Maximum Air Temperature',
        'TMIN': 'Minimum Air Temperature',
        'TOBS': 'Observed Air Temperature',
        'SMS': 'Soil Moisture',
        'STO': 'Soil Temperature',
        'SNRR': 'Snow Rain Ratio',
        'RHUMV': 'Relative Humidity',
        'WDIR': 'Wind Direction',
        'WSPDV': 'Wind Speed',
        'SRADV': 'Solar Radiation'
    }

    def __init__(self):
        """Initialize the SNOTEL API client"""
        self.session = requests.Session()
        self.session.headers.update({
            'accept': 'application/json',
            'User-Agent': 'SnowReportApp/1.0'
        })

    def get_station_data(
        self,
        station_triplet: str,
        elements: Union[str, List[str]],
        duration: str = "DAILY",
        period_ref: str = "END",
        begin_date: Optional[str] = None,
        end_date: Optional[str] = None,
        central_tendency: str = "NONE",
        return_flags: bool = False,
        return_original: bool = False,
        return_suspect: bool = False
    ) -> Dict:
        """
        Fetch data from a SNOTEL station

        Args:
            station_triplet: Station identifier (e.g., "WA:SNTL" or "302:WA:SNTL")
            elements: Single element code or list of element codes (e.g., "SNWD", ["SNWD", "PREC"])
            duration: Data duration - DAILY, HOURLY, SEMIMONTHLY, etc.
            period_ref: Period reference - START, END, CENTRAL
            begin_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            central_tendency: NONE, MEAN, MEDIAN, MIN, MAX
            return_flags: Include quality flags
            return_original: Return original values
            return_suspect: Include suspect data

        Returns:
            JSON response from API
        """
        # Convert elements to comma-separated string
        if isinstance(elements, list):
            elements_str = ','.join(elements)
        else:
            elements_str = elements

        # Build parameters
        params = {
            'stationTriplets': station_triplet,
            'elements': elements_str,
            'duration': duration,
            'periodRef': period_ref,
            'centralTendencyType': central_tendency,
            'returnFlags': str(return_flags).lower(),
            'returnOriginalValues': str(return_original).lower(),
            'returnSuspectData': str(return_suspect).lower()
        }

        # Add date filters if provided
        if begin_date:
            params['beginDate'] = begin_date
        if end_date:
            params['endDate'] = end_date

        # Make request
        url = f"{self.BASE_URL}/data"
        response = self.session.get(url, params=params)
        response.raise_for_status()

        return response.json()

    def get_recent_data(
        self,
        station_triplet: str,
        elements: Union[str, List[str]],
        days: int = 30
    ) -> Dict:
        """
        Get recent data for the last N days

        Args:
            station_triplet: Station identifier
            elements: Element code(s)
            days: Number of days to retrieve

        Returns:
            JSON response from API
        """
        end_date = datetime.now().strftime('%Y-%m-%d')
        begin_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')

        return self.get_station_data(
            station_triplet=station_triplet,
            elements=elements,
            begin_date=begin_date,
            end_date=end_date
        )

    def get_current_conditions(self, station_triplet: str) -> Dict:
        """
        Get current snow and weather conditions

        Args:
            station_triplet: Station identifier

        Returns:
            JSON response with current conditions
        """
        elements = ['SNWD', 'WTEQ', 'TAVG', 'PREC']
        return self.get_recent_data(station_triplet, elements, days=1)

    def get_stations(
        self,
        state_codes: Optional[Union[str, List[str]]] = None,
        network_codes: Optional[Union[str, List[str]]] = None,
        huc: Optional[str] = None,
        county_names: Optional[Union[str, List[str]]] = None,
        min_latitude: Optional[float] = None,
        max_latitude: Optional[float] = None,
        min_longitude: Optional[float] = None,
        max_longitude: Optional[float] = None,
        min_elevation: Optional[float] = None,
        max_elevation: Optional[float] = None
    ) -> List[Dict]:
        """
        Search for SNOTEL stations based on criteria

        Args:
            state_codes: State code(s) (e.g., "WA", ["WA", "OR"])
            network_codes: Network code(s) (e.g., "SNTL" for SNOTEL)
            huc: Hydrologic Unit Code
            county_names: County name(s)
            min_latitude: Minimum latitude
            max_latitude: Maximum latitude
            min_longitude: Minimum longitude
            max_longitude: Maximum longitude
            min_elevation: Minimum elevation in feet
            max_elevation: Maximum elevation in feet

        Returns:
            List of station information
        """
        params = {}

        # Helper to convert to comma-separated string
        def to_csv(val):
            return ','.join(val) if isinstance(val, list) else val

        if state_codes:
            params['stateCodes'] = to_csv(state_codes)
        if network_codes:
            params['networkCodes'] = to_csv(network_codes)
        if huc:
            params['huc'] = huc
        if county_names:
            params['countyNames'] = to_csv(county_names)
        if min_latitude:
            params['minLatitude'] = min_latitude
        if max_latitude:
            params['maxLatitude'] = max_latitude
        if min_longitude:
            params['minLongitude'] = min_longitude
        if max_longitude:
            params['maxLongitude'] = max_longitude
        if min_elevation:
            params['minElevation'] = min_elevation
        if max_elevation:
            params['maxElevation'] = max_elevation

        url = f"{self.BASE_URL}/stations"
        response = self.session.get(url, params=params)
        response.raise_for_status()

        return response.json()

    def get_station_metadata(self, station_triplet: str) -> Dict:
        """
        Get detailed metadata for a specific station

        Args:
            station_triplet: Station identifier

        Returns:
            Station metadata
        """
        url = f"{self.BASE_URL}/stations/{station_triplet}"
        response = self.session.get(url)
        response.raise_for_status()

        return response.json()

    def to_dataframe(self, api_response: Dict) -> pd.DataFrame:
        """
        Convert API response to pandas DataFrame

        Args:
            api_response: Response from get_station_data

        Returns:
            DataFrame with date index and element columns
        """
        records = []

        # Parse the nested JSON structure
        for station_data in api_response:
            station_id = station_data.get('stationTriplet', 'Unknown')

            for element_data in station_data.get('data', []):
                element = element_data.get('element', 'Unknown')

                for value_obj in element_data.get('values', []):
                    date = value_obj.get('date')
                    value = value_obj.get('value')

                    records.append({
                        'date': pd.to_datetime(date),
                        'station': station_id,
                        'element': element,
                        'value': value
                    })

        # Create DataFrame
        df = pd.DataFrame(records)

        if not df.empty:
            # Pivot to have elements as columns
            df = df.pivot_table(
                index=['date', 'station'],
                columns='element',
                values='value',
                aggfunc='first'
            ).reset_index()

        return df

    def get_all_monitored_stations_data(
        self,
        elements: Union[str, List[str]],
        days: int = 30
    ) -> pd.DataFrame:
        """
        Get data for all monitored ski resort stations

        Args:
            elements: Element code(s) to retrieve
            days: Number of days to retrieve

        Returns:
            Combined DataFrame with all station data
        """
        all_data = []

        for station_id, station_name in self.STATIONS.items():
            try:
                print(f"Fetching data for {station_name} ({station_id})...")
                data = self.get_recent_data(
                    station_triplet=station_id,
                    elements=elements,
                    days=days
                )
                df = self.to_dataframe(data)
                if not df.empty:
                    df['station_name'] = station_name
                    all_data.append(df)
            except Exception as e:
                print(f"Error fetching data for {station_name}: {e}")

        if all_data:
            return pd.concat(all_data, ignore_index=True)
        else:
            return pd.DataFrame()

    def get_monitored_station_summary(self) -> pd.DataFrame:
        """
        Get current conditions summary for all monitored stations

        Returns:
            DataFrame with latest conditions for each station
        """
        summary_data = []

        for station_id, station_name in self.STATIONS.items():
            try:
                data = self.get_current_conditions(station_id)
                df = self.to_dataframe(data)

                if not df.empty:
                    latest = df.iloc[-1].to_dict()
                    latest['station_name'] = station_name
                    latest['station_id'] = station_id
                    summary_data.append(latest)
            except Exception as e:
                print(f"Error fetching summary for {station_name}: {e}")

        return pd.DataFrame(summary_data)


# Example usage
if __name__ == "__main__":
    # Initialize client
    client = SNOTELClient()

    print("=" * 80)
    print("SNOTEL API Client - Ski Resort Snow Data")
    print("=" * 80)

    # Example 1: List all monitored stations
    print("\n" + "=" * 80)
    print("Monitored Ski Resort Stations")
    print("=" * 80)
    for station_id, station_name in client.STATIONS.items():
        print(f"  {station_name}: {station_id}")

    # Example 2: Get current conditions summary for all monitored stations
    print("\n" + "=" * 80)
    print("Current Conditions Summary")
    print("=" * 80)
    summary = client.get_monitored_station_summary()
    if not summary.empty:
        print("\n", summary.to_string(index=False))
    else:
        print("No data available")

    # Example 3: Get detailed data for a specific station
    print("\n" + "=" * 80)
    print("Example: Loveland Pass - 30 Day Snow Depth History")
    print("=" * 80)

    loveland_data = client.get_recent_data(
        station_triplet="602:CO:SNTL",
        elements=['SNWD', 'WTEQ', 'PREC', 'TAVG', 'TMAX', 'TMIN'],
        days=30
    )

    df_loveland = client.to_dataframe(loveland_data)
    if not df_loveland.empty:
        print("\nMost recent 10 days:")
        print(df_loveland.tail(10).to_string(index=False))

        # Calculate some statistics
        if 'SNWD' in df_loveland.columns:
            print(f"\n30-Day Snow Depth Statistics:")
            print(f"  Current: {df_loveland['SNWD'].iloc[-1]:.1f} inches")
            print(f"  Average: {df_loveland['SNWD'].mean():.1f} inches")
            print(f"  Maximum: {df_loveland['SNWD'].max():.1f} inches")
            print(f"  Minimum: {df_loveland['SNWD'].min():.1f} inches")

    # Example 4: Get all monitored stations data
    print("\n" + "=" * 80)
    print("Fetching All Monitored Stations (7 days)")
    print("=" * 80)

    all_stations_df = client.get_all_monitored_stations_data(
        elements=['SNWD', 'WTEQ', 'TAVG'],
        days=7
    )

    if not all_stations_df.empty:
        print(f"\nTotal records retrieved: {len(all_stations_df)}")
        print("\nSample data:")
        print(all_stations_df.head(15).to_string(index=False))
    else:
        print("No data retrieved")
