"""
SNOTEL API Client
A clean, reusable API client for fetching snow and weather data from USDA AWDB REST API
"""

import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union
import pandas as pd


class SNOTELClient:
    """
    Client for interacting with the SNOTEL AWDB REST API

    API Documentation: https://wcc.sc.egov.usda.gov/awdbRestApi/swagger-ui/index.html

    Example:
        >>> from snotel_api import SNOTELClient
        >>> client = SNOTELClient()
        >>> data = client.get_recent_data("602:CO:SNTL", ["SNWD", "WTEQ"], days=30)
        >>> df = client.to_dataframe(data)
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

    def __init__(self, timeout: int = 30):
        """
        Initialize the SNOTEL API client

        Args:
            timeout: Request timeout in seconds (default: 30)
        """
        self.timeout = timeout
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
            station_triplet: Station identifier (e.g., "602:CO:SNTL")
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

        Raises:
            requests.HTTPError: If the API request fails
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
        response = self.session.get(url, params=params, timeout=self.timeout)
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
        response = self.session.get(url, params=params, timeout=self.timeout)
        response.raise_for_status()

        return response.json()

    def get_station_metadata(self, station_triplet: str) -> Dict:
        """
        Get detailed metadata for a specific station

        Args:
            station_triplet: Station identifier

        Returns:
            Station metadata including elevation, location, etc.
        """
        url = f"{self.BASE_URL}/stations/{station_triplet}"
        response = self.session.get(url, timeout=self.timeout)
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
                # Element code is nested in stationElement object
                station_element = element_data.get('stationElement', {})
                element = station_element.get('elementCode', element_data.get('element', 'Unknown'))

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
        days: int = 30,
        verbose: bool = True
    ) -> pd.DataFrame:
        """
        Get data for all monitored ski resort stations

        Args:
            elements: Element code(s) to retrieve
            days: Number of days to retrieve
            verbose: Print progress messages

        Returns:
            Combined DataFrame with all station data
        """
        all_data = []

        for station_id, station_name in self.STATIONS.items():
            try:
                if verbose:
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
                if verbose:
                    print(f"Error fetching data for {station_name}: {e}")

        if all_data:
            return pd.concat(all_data, ignore_index=True)
        else:
            return pd.DataFrame()

    def get_monitored_station_summary(self, verbose: bool = False) -> pd.DataFrame:
        """
        Get current conditions summary for all monitored stations

        Args:
            verbose: Print progress messages

        Returns:
            DataFrame with latest conditions for each station
        """
        summary_data = []

        for station_id, station_name in self.STATIONS.items():
            try:
                if verbose:
                    print(f"Fetching summary for {station_name}...")

                data = self.get_current_conditions(station_id)
                df = self.to_dataframe(data)

                if not df.empty:
                    latest = df.iloc[-1].to_dict()
                    latest['station_name'] = station_name
                    latest['station_id'] = station_id
                    summary_data.append(latest)
            except Exception as e:
                if verbose:
                    print(f"Error fetching summary for {station_name}: {e}")

        return pd.DataFrame(summary_data)

    def get_historical_data(
        self,
        station_triplet: str,
        elements: Union[str, List[str]],
        start_year: int,
        end_year: Optional[int] = None
    ) -> pd.DataFrame:
        """
        Get historical data for multiple years

        Args:
            station_triplet: Station identifier
            elements: Element code(s)
            start_year: Starting year
            end_year: Ending year (defaults to current year)

        Returns:
            DataFrame with historical data
        """
        if end_year is None:
            end_year = datetime.now().year

        begin_date = f"{start_year}-01-01"
        end_date = f"{end_year}-12-31"

        data = self.get_station_data(
            station_triplet=station_triplet,
            elements=elements,
            begin_date=begin_date,
            end_date=end_date
        )

        return self.to_dataframe(data)

    def close(self):
        """Close the HTTP session"""
        self.session.close()

    def __enter__(self):
        """Context manager entry"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()
