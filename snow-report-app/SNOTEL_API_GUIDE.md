# SNOTEL API Integration Guide

## Overview

The new SNOTEL API (`api/weather-data-snotel/`) provides the **same data format** as the existing NOAA API, making it a drop-in replacement with no frontend code changes required.

## API Comparison

### Request Format (Same for Both)
```javascript
POST /api/weather-data-snotel  // or /api/weather-data for NOAA

{
  "stationId": "602:CO:SNTL",  // SNOTEL format vs "GHCND:USC00054762" for NOAA
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### Response Format (Identical)
```javascript
{
  "success": true,
  "snowData": [
    {
      "date": "2024-01-15",
      "value": 50,
      "formattedDate": "1/15/2024",
      "station": "602:CO:SNTL"
    },
    // ...
  ],
  "precipData": [
    {
      "date": "2024-01-15",
      "value": 0.5,
      "formattedDate": "1/15/2024",
      "station": "602:CO:SNTL"
    },
    // ...
  ]
}
```

## Station ID Mapping

### SNOTEL Station IDs for Colorado Ski Resorts

| Resort/Location | SNOTEL Station ID | Station Name |
|----------------|-------------------|--------------|
| Loveland Pass | `602:CO:SNTL` | Loveland Pass |
| Berthoud Pass | `335:CO:SNTL` | Berthoud Summit |
| Winter Park | `970:CO:SNTL` | Jones Pass |
| Vail | `842:CO:SNTL` | Vail |

### SNOTEL Station IDs for Other States

| Resort/Location | SNOTEL Station ID | Station Name |
|----------------|-------------------|--------------|
| Snowbird, UT | `776:UT:SNTL` | Snowbird |
| Brighton, UT | `366:UT:SNTL` | Brighton Resort |
| Grand Targhee, WY | `1082:WY:SNTL` | Grand Targhee |
| Mt. Rainier, WA | `679:WA:SNTL` | Mt. Rainier/Paradise |
| Mt. Baker, WA | `909:WA:SNTL` | Mt. Baker/Wells Creek |

## How to Switch from NOAA to SNOTEL

### Option 1: Replace the Existing API (Recommended)

Simply replace the contents of `api/weather-data/index.js` with the SNOTEL version:

```bash
# Backup the old version
cp api/weather-data/index.js api/weather-data/index.js.noaa.backup

# Copy the SNOTEL version
cp api/weather-data-snotel/index.js api/weather-data/index.js
```

Then update your station IDs in your frontend code to use SNOTEL format.

### Option 2: Use SNOTEL as a Separate Endpoint

Keep both APIs and change the endpoint URL in your frontend:

**Before:**
```javascript
const response = await fetch('/api/weather-data', {
  method: 'POST',
  body: JSON.stringify({
    stationId: 'GHCND:USC00054762',
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  })
});
```

**After:**
```javascript
const response = await fetch('/api/weather-data-snotel', {
  method: 'POST',
  body: JSON.stringify({
    stationId: '602:CO:SNTL',  // SNOTEL format
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  })
});
```

### Option 3: Create a Station Mapping Helper

Create a utility to map your current station names to SNOTEL IDs:

```javascript
// utils/stationMapping.js
const STATION_MAP = {
  'loveland-pass': '602:CO:SNTL',
  'berthoud-summit': '335:CO:SNTL',
  'jones-pass': '970:CO:SNTL',
  'vail': '842:CO:SNTL',
  'snowbird': '776:UT:SNTL',
  // ... add more stations
};

export function getSnotelStationId(locationName) {
  return STATION_MAP[locationName] || '602:CO:SNTL'; // default to Loveland
}
```

## Advantages of SNOTEL over NOAA

1. **No API Key Required** - SNOTEL API is free and doesn't need authentication
2. **Better Coverage** - More stations specifically for mountain/snow areas
3. **More Data Elements** - Access to additional metrics:
   - `WTEQ` - Snow Water Equivalent
   - `TAVG` - Average Temperature
   - `TMAX` / `TMIN` - Temperature extremes
   - `RHUMV` - Relative Humidity
   - `WSPDV` - Wind Speed
   - `SRADV` - Solar Radiation

4. **Real-time Updates** - Often updated more frequently for snow conditions
5. **Ski Resort Focus** - Stations are located at or near ski resorts

## Requesting Additional Data Elements

The SNOTEL API can return more than just snow depth and precipitation. To add more elements:

**Modify `api/weather-data-snotel/index.js` line 49:**
```javascript
// Current:
elements: 'SNWD,PREC',

// Add temperature:
elements: 'SNWD,PREC,TAVG',

// Add snow water equivalent:
elements: 'SNWD,PREC,WTEQ',

// Add multiple elements:
elements: 'SNWD,PREC,WTEQ,TAVG,TMAX,TMIN',
```

Then update the parsing logic (around line 92) to handle the new elements:

```javascript
// Add after the PREC check:
else if (element === 'WTEQ') {
  wteqData.push(formattedItem);
} else if (element === 'TAVG') {
  tempData.push(formattedItem);
}
```

And return them in the response:

```javascript
body: {
  success: true,
  snowData: snowData,
  precipData: precipData,
  waterEquivalentData: wteqData,  // New
  temperatureData: tempData        // New
}
```

## Error Handling

The SNOTEL API includes the same error handling as the NOAA API:

- Returns `success: false` on errors
- Includes error message in `error` and `message` fields
- Handles missing parameters (400 status)
- Handles API failures (500 status)
- Supports CORS for cross-origin requests

## Testing

### Test with curl:

```bash
curl -X POST http://localhost:7071/api/weather-data-snotel \
  -H "Content-Type: application/json" \
  -d '{
    "stationId": "602:CO:SNTL",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31"
  }'
```

### Test with JavaScript:

```javascript
const response = await fetch('http://localhost:7071/api/weather-data-snotel', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    stationId: '602:CO:SNTL',
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  })
});

const data = await response.json();
console.log(data);
```

## Finding More Stations

To find additional SNOTEL stations:

1. Visit: https://wcc.sc.egov.usda.gov/awdbRestApi/swagger-ui/index.html
2. Use the `/stations` endpoint with filters:
   - `stateCodes`: CO, UT, WY, WA, etc.
   - `networkCodes`: SNTL (for SNOTEL stations)
   - `minElevation` / `maxElevation`: Filter by elevation

Example API call to find all Colorado SNOTEL stations:
```
GET https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/stations?stateCodes=CO&networkCodes=SNTL
```

## Deployment

No environment variables needed! The SNOTEL API works immediately:

1. Deploy to Azure Functions as usual
2. No need for API keys or secrets
3. Update frontend station IDs
4. Done!

## Support

SNOTEL API Documentation:
- Swagger UI: https://wcc.sc.egov.usda.gov/awdbRestApi/swagger-ui/index.html
- Station Finder: https://wcc.sc.egov.usda.gov/reportGenerator/
