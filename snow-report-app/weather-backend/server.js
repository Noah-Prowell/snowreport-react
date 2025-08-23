// Load environment variables from .env file
require('dotenv').config();

// Import the libraries we installed
const express = require('express');
const cors = require('cors');

// Create our web server
const app = express();

// Middleware setup (think of these as rules for how the server behaves)
app.use(cors()); // Allow requests from your React app
app.use(express.json()); // Allow the server to understand JSON data

// Get the API token from environment variables (keeps it secure)
const NOAA_TOKEN = process.env.NOAA_API_TOKEN;

// Create an API endpoint that your React app can call
app.post('/api/weather-data', async (req, res) => {
  try {
    // Get the data sent from your React app
    const { stationId, startDate, endDate } = req.body;
    
    console.log(`Fetching weather data for station: ${stationId}, dates: ${startDate} to ${endDate}`);
    
    // Set up headers for the NOAA API call
    const headers = {
    'token': NOAA_TOKEN,
    'Content-Type': 'application/json'
    };
    
    // Build the API URLs for both snow and precipitation data
    const baseUrl = 'https://www.ncei.noaa.gov/cdo-web/api/v2/data';
    const commonParams = `datasetid=GHCND&locationid=FIPS:08&stationid=${stationId}&units=standard&startdate=${startDate}&enddate=${endDate}&limit=1000`;
    
    const snowUrl = `${baseUrl}?${commonParams}&datatypeid=SNWD`;
    const precipUrl = `${baseUrl}?${commonParams}&datatypeid=PRCP`;
    
    console.log('Calling NOAA API...');
    
    // Make both API calls at the same time (parallel requests for speed)
    const [snowResponse, precipResponse] = await Promise.all([
      fetch(snowUrl, { headers }),
      fetch(precipUrl, { headers })
    ]);
    
    // Check if the API calls were successful
    if (!snowResponse.ok) {
      throw new Error(`Snow data request failed: ${snowResponse.status} ${snowResponse.statusText}`);
    }
    
    if (!precipResponse.ok) {
      throw new Error(`Precipitation data request failed: ${precipResponse.status} ${precipResponse.statusText}`);
    }
    
    // Convert the responses to JSON
    const [snowData, precipData] = await Promise.all([
      snowResponse.json(),
      precipResponse.json()
    ]);
    
    console.log(`Received ${snowData.results?.length || 0} snow records`);
    console.log(`Received ${precipData.results?.length || 0} precipitation records`);
    
    // Format the data the same way your React app expects it
    const formattedSnowData = snowData.results ? snowData.results.map(item => ({
      date: item.date.split('T')[0], // Extract just the date part
      value: item.value,
      formattedDate: new Date(item.date).toLocaleDateString(),
      station: item.station
    })) : [];
    
    const formattedPrecipData = precipData.results ? precipData.results.map(item => ({
      date: item.date.split('T')[0],
      value: item.value,
      formattedDate: new Date(item.date).toLocaleDateString(),
      station: item.station
    })) : [];
    
    // Send the formatted data back to your React app
    res.json({
      success: true,
      snowData: formattedSnowData,
      precipData: formattedPrecipData
    });
    
  } catch (error) {
    // If something goes wrong, send an error message
    console.error('Error fetching NOAA data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch weather data',
      message: error.message 
    });
  }
});

// Add a simple test endpoint to make sure the server is working
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Weather API server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});