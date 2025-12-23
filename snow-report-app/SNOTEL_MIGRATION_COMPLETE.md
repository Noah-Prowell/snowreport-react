# SNOTEL Migration Complete ✅

All code has been updated to use the SNOTEL API instead of NOAA.

## Changes Made

### 1. Frontend (`src/App.js`)

#### API Endpoint Updated
- **Line 178**: Changed from `http://localhost:3001/api/weather-data` to `http://localhost:3001/api/weather-data-snotel`
- **Line 181**: Changed from `/api/weather-data` to `/api/weather-data-snotel`

#### Station IDs Replaced
**Old NOAA Format:**
```javascript
GRANBY: { id: 'GHCND:USS0005K14S', name: 'Granby', elevation: '8,280 ft' }
JONES_PASS: { id: 'GHCND:USS0005K21S', name: 'Jones Pass', elevation: '12,451 ft' }
// etc...
```

**New SNOTEL Format:**
```javascript
// Colorado Stations
LOVELAND: { id: '602:CO:SNTL', name: 'Loveland Pass', elevation: '11,990 ft' }
BERTHOUD: { id: '335:CO:SNTL', name: 'Berthoud Summit', elevation: '11,315 ft' }
JONES_PASS: { id: '970:CO:SNTL', name: 'Jones Pass', elevation: '12,451 ft' }
VAIL: { id: '842:CO:SNTL', name: 'Vail', elevation: '10,300 ft' }

// Utah Stations
SNOWBIRD: { id: '776:UT:SNTL', name: 'Snowbird', elevation: '9,640 ft' }
BRIGHTON: { id: '366:UT:SNTL', name: 'Brighton Resort', elevation: '9,660 ft' }

// Wyoming Stations
GRAND_TARGHEE: { id: '1082:WY:SNTL', name: 'Grand Targhee', elevation: '9,200 ft' }

// Washington Stations
MT_RAINIER: { id: '679:WA:SNTL', name: 'Mt. Rainier/Paradise', elevation: '5,400 ft' }
MT_BAKER: { id: '909:WA:SNTL', name: 'Mt. Baker/Wells Creek', elevation: '4,100 ft' }
```

#### Default Station Changed
- **Line 173**: Changed from `SkiArea.GRANBY` to `SkiArea.LOVELAND`

### 2. Backend Server (`weather-backend/server.js`)

#### Removed NOAA Dependencies
- Removed `NOAA_TOKEN` requirement (no API key needed!)
- Updated endpoint from `/api/weather-data` to `/api/weather-data-snotel`

#### New SNOTEL Integration
- **API Base URL**: `https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data`
- **Elements Requested**: SNWD (Snow Depth) and PREC (Precipitation)
- **Headers**: Only requires `accept: application/json` and `User-Agent`
- **Response Parsing**: Updated to handle SNOTEL's nested JSON structure

#### Updated Console Messages
- Server startup now shows "SNOTEL Weather API Server"
- Shows "API Source: USDA SNOTEL (No token required)"
- Health endpoint returns `apiType: 'SNOTEL'`

### 3. Azure Functions (`api/weather-data-snotel/`)

Created new Azure Function endpoint:
- **File**: `api/weather-data-snotel/index.js`
- **Config**: `api/weather-data-snotel/function.json`
- **Purpose**: Serverless alternative to Express backend
- **Response Format**: Identical to NOAA version for compatibility

## New Stations Added

Your app now includes **9 ski resort stations** across 4 states:

### Colorado (4 stations)
1. Loveland Pass - 11,990 ft
2. Berthoud Summit - 11,315 ft
3. Jones Pass - 12,451 ft
4. Vail - 10,300 ft

### Utah (2 stations)
5. Snowbird - 9,640 ft
6. Brighton Resort - 9,660 ft

### Wyoming (1 station)
7. Grand Targhee - 9,200 ft

### Washington (2 stations)
8. Mt. Rainier/Paradise - 5,400 ft
9. Mt. Baker/Wells Creek - 4,100 ft

## Testing the Changes

### 1. Start the Backend Server
```bash
cd weather-backend
node server.js
```

You should see:
```
========================================
SNOTEL Weather API Server Started
========================================
Server URL: http://localhost:3001
Health check: http://localhost:3001/api/health
API Endpoint: /api/weather-data-snotel
API Source: USDA SNOTEL (No token required)
========================================
```

### 2. Test the Health Endpoint
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "Server is running!",
  "timestamp": "2025-01-22T...",
  "apiType": "SNOTEL"
}
```

### 3. Test Data Fetch
```bash
curl -X POST http://localhost:3001/api/weather-data-snotel \
  -H "Content-Type: application/json" \
  -d '{
    "stationId": "602:CO:SNTL",
    "startDate": "2025-01-01",
    "endDate": "2025-01-15"
  }'
```

### 4. Start the React App
```bash
cd ..
npm start
```

Navigate to the Data page and select a station. Data should load automatically!

## Benefits of SNOTEL vs NOAA

✅ **No API Key Required** - SNOTEL is free and open
✅ **Better Coverage** - Stations at ski resorts and mountain locations
✅ **More Reliable** - Less strict rate limiting
✅ **More Data Available** - Can add temperature, humidity, wind, solar radiation
✅ **Real-time Updates** - More frequent updates during snow season

## Troubleshooting

### "Failed to fetch weather data"
- Check that the backend server is running on port 3001
- Verify the station ID format is correct (e.g., `602:CO:SNTL`)
- Check browser console for detailed error messages

### "No Data Available"
- Some stations may not have complete data for all date ranges
- Try a different date range (last 30 days usually works best)
- Verify the station ID is valid

### Backend server won't start
- Make sure you're in the `weather-backend` directory
- Run `npm install` to ensure dependencies are installed
- Check that port 3001 is not already in use

## Adding More Stations

To find additional SNOTEL stations:

1. Visit the SNOTEL station finder:
   https://wcc.sc.egov.usda.gov/reportGenerator/

2. Search by state, location, or map

3. Get the station triplet (format: `{id}:{state}:{network}`)
   - Example: `602:CO:SNTL`

4. Add to `SkiArea` object in `App.js`:
   ```javascript
   NEW_STATION: {
     id: '{id}:{state}:{network}',
     name: 'Station Name',
     elevation: '{elevation} ft'
   }
   ```

## Additional Data Elements

Want temperature, humidity, or wind data? See `SNOTEL_API_GUIDE.md` for instructions on adding:
- `TAVG` - Average Temperature
- `TMAX` / `TMIN` - Temperature extremes
- `WTEQ` - Snow Water Equivalent
- `RHUMV` - Relative Humidity
- `WSPDV` - Wind Speed
- `SRADV` - Solar Radiation

## Next Steps

Your app is now fully migrated to SNOTEL! Consider:

1. **Deploy to Azure** - No environment variables needed (no API key!)
2. **Add more stations** - Expand to more ski resorts
3. **Add more data** - Temperature, wind, humidity graphs
4. **Historical comparisons** - Compare current season to past years

## Files Modified

✅ `src/App.js` - Updated API endpoint and station IDs
✅ `weather-backend/server.js` - Switched to SNOTEL API
✅ `api/weather-data-snotel/index.js` - New Azure Function (created)
✅ `api/weather-data-snotel/function.json` - Azure Function config (created)

## Files Created

📄 `SNOTEL_API_GUIDE.md` - Complete usage guide
📄 `SNOTEL_MIGRATION_COMPLETE.md` - This file
📄 `api/weather-data-snotel/index.js` - Azure Function
📄 `api/weather-data-snotel/function.json` - Azure config

Enjoy your new SNOTEL-powered snow report app! 🎿❄️
