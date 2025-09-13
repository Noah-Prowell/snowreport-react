const fetch = require('node-fetch');

module.exports = async function (context, req) {
  try {
    // Get the NOAA API token from environment variables
    const NOAA_TOKEN = process.env.NOAA_API_TOKEN;
    
    if (!NOAA_TOKEN) {
      context.res = {
        status: 500,
        body: { 
          success: false, 
          error: 'NOAA API token not configured' 
        }
      };
      return;
    }

    // Get the data from the request body
    const { stationId, startDate, endDate } = req.body;
    
    context.log(`Fetching weather data for station: ${stationId}, dates: ${startDate} to ${endDate}`);
    
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
    
    context.log('Calling NOAA API...');
    
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
    
    context.log(`Received ${snowData.results?.length || 0} snow records`);
    context.log(`Received ${precipData.results?.length || 0} precipitation records`);
    
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
    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        success: true,
        snowData: formattedSnowData,
        precipData: formattedPrecipData
      }
    };
    
  } catch (error) {
    // If something goes wrong, send an error message
    context.log.error('Error fetching NOAA data:', error);
    context.res = {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: { 
        success: false,
        error: 'Failed to fetch weather data',
        message: error.message 
      }
    };
  }
};