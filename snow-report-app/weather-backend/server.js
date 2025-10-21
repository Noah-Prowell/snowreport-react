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

// Rate limiting variables
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 200; // Minimum 200ms between requests (5 requests per second max)

// Helper function to add delay between requests (NOAA has rate limits)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to ensure we don't exceed rate limits
async function rateLimitedDelay() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await delay(waitTime);
  }

  lastRequestTime = Date.now();
}

// Retry logic for API calls
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await rateLimitedDelay(); // Ensure rate limiting

      console.log(`Attempt ${attempt}/${maxRetries} for: ${url.substring(0, 100)}...`);

      const response = await fetch(url, {
        ...options,
        timeout: 10000 // 10 second timeout
      });

      // NOAA returns 429 for rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 2;
        console.warn(`Rate limited. Waiting ${retryAfter} seconds...`);
        await delay(retryAfter * 1000);
        continue; // Retry this request
      }

      // For other errors, check if we should retry
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Request failed (${response.status}): ${errorText}`);

        // Don't retry on 4xx errors except 429
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(`API error ${response.status}: ${errorText}`);
        }

        // Retry on 5xx errors
        if (attempt < maxRetries) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff
          console.log(`Retrying in ${backoffDelay}ms...`);
          await delay(backoffDelay);
          continue;
        }

        throw new Error(`API request failed after ${maxRetries} attempts: ${response.status}`);
      }

      return response;

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);

      // If it's a network error and we have retries left, try again
      if (attempt < maxRetries) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Network error. Retrying in ${backoffDelay}ms...`);
        await delay(backoffDelay);
        continue;
      }

      throw error;
    }
  }
}

// Create an API endpoint that your React app can call
app.post('/api/weather-data', async (req, res) => {
  try {
    // Get the data sent from your React app
    const { stationId, startDate, endDate } = req.body;

    // Validate inputs
    if (!stationId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'stationId, startDate, and endDate are required'
      });
    }

    console.log(`\n=== New Weather Data Request ===`);
    console.log(`Station: ${stationId}`);
    console.log(`Date Range: ${startDate} to ${endDate}`);
    console.log(`Time: ${new Date().toISOString()}`);

    // Validate NOAA token
    if (!NOAA_TOKEN) {
      throw new Error('NOAA API token is not configured');
    }

    // Set up headers for the NOAA API call
    const headers = {
      'token': NOAA_TOKEN,
      'Content-Type': 'application/json',
      'User-Agent': 'SnowReportApp/1.0' // Some APIs prefer a user agent
    };

    // Build the API URLs for both snow and precipitation data
    const baseUrl = 'https://www.ncei.noaa.gov/cdo-web/api/v2/data';
    const commonParams = `datasetid=GHCND&locationid=FIPS:08&stationid=${stationId}&units=standard&startdate=${startDate}&enddate=${endDate}&limit=1000`;

    const snowUrl = `${baseUrl}?${commonParams}&datatypeid=SNWD`;
    const precipUrl = `${baseUrl}?${commonParams}&datatypeid=PRCP`;

    console.log('Fetching data from NOAA API...');

    // Make API calls sequentially to avoid rate limiting (NOAA has strict limits)
    // Making them in parallel can trigger rate limits
    console.log('Fetching snow depth data...');
    const snowResponse = await fetchWithRetry(snowUrl, { headers });

    console.log('Fetching precipitation data...');
    const precipResponse = await fetchWithRetry(precipUrl, { headers });

    // Convert the responses to JSON
    const [snowData, precipData] = await Promise.all([
      snowResponse.json(),
      precipResponse.json()
    ]);

    console.log(`✓ Received ${snowData.results?.length || 0} snow records`);
    console.log(`✓ Received ${precipData.results?.length || 0} precipitation records`);

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

    console.log('✓ Request completed successfully\n');

    // Send the formatted data back to your React app
    res.json({
      success: true,
      snowData: formattedSnowData,
      precipData: formattedPrecipData,
      metadata: {
        requestTime: new Date().toISOString(),
        recordCounts: {
          snow: formattedSnowData.length,
          precipitation: formattedPrecipData.length
        }
      }
    });

  } catch (error) {
    // If something goes wrong, send an error message
    console.error('✗ Error fetching NOAA data:', error.message);
    console.error('Stack trace:', error.stack);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Add a simple test endpoint to make sure the server is working
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Server is running!',
    timestamp: new Date().toISOString(),
    hasToken: !!NOAA_TOKEN
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`Weather API Server Started`);
  console.log(`========================================`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`NOAA Token configured: ${NOAA_TOKEN ? 'Yes' : 'No'}`);
  console.log(`========================================\n`);
});
