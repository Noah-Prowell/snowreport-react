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
app.post('/api/weather-data-snotel', async (req, res) => {
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

    console.log(`\n=== New SNOTEL Data Request ===`);
    console.log(`Station: ${stationId}`);
    console.log(`Date Range: ${startDate} to ${endDate}`);
    console.log(`Time: ${new Date().toISOString()}`);

    // Set up headers for the SNOTEL API call
    const headers = {
      'accept': 'application/json',
      'User-Agent': 'SnowReportApp/1.0'
    };

    // Build the SNOTEL API URL
    const baseUrl = 'https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data';
    const params = new URLSearchParams({
      stationTriplets: stationId,
      elements: 'SNWD,PRCP',  // Changed from PREC to PRCP (daily increment, not cumulative)
      duration: 'DAILY',
      periodRef: 'END',
      beginDate: startDate,
      endDate: endDate,
      centralTendencyType: 'NONE',
      returnFlags: 'false',
      returnOriginalValues: 'false',
      returnSuspectData: 'false'
    });

    const snotelUrl = `${baseUrl}?${params.toString()}`;

    console.log('Fetching data from SNOTEL API...');

    // Make API call to SNOTEL (no rate limiting needed - SNOTEL is more permissive)
    const response = await fetchWithRetry(snotelUrl, { headers }, 2); // Only 2 retries needed

    // Convert the response to JSON
    const data = await response.json();

    console.log(`✓ Received SNOTEL response with ${data.length} station records`);

    // Initialize arrays for snow and precipitation data
    let snowData = [];
    let precipData = [];

    // Parse the nested SNOTEL JSON structure
    if (data && data.length > 0) {
      for (const stationData of data) {
        const station = stationData.stationTriplet || stationId;

        for (const elementData of stationData.data || []) {
          // Get element code from nested structure
          const stationElement = elementData.stationElement || {};
          const element = stationElement.elementCode || elementData.element;

          // Process each value
          for (const valueObj of elementData.values || []) {
            const date = valueObj.date;
            const value = valueObj.value;

            if (date && value !== null && value !== undefined) {
              const formattedItem = {
                date: date.split('T')[0],
                value: value,
                formattedDate: new Date(date).toLocaleDateString(),
                station: station
              };

              // Separate into snow depth or precipitation
              if (element === 'SNWD') {
                snowData.push(formattedItem);
              } else if (element === 'PRCP') {  // Changed from PREC to PRCP
                precipData.push(formattedItem);
              }
            }
          }
        }
      }
    }

    console.log(`✓ Formatted ${snowData.length} snow records`);
    console.log(`✓ Formatted ${precipData.length} precipitation records`);
    console.log('✓ Request completed successfully\n');

    // Send the formatted data back to your React app
    res.json({
      success: true,
      snowData: snowData,
      precipData: precipData,
      metadata: {
        requestTime: new Date().toISOString(),
        recordCounts: {
          snow: snowData.length,
          precipitation: precipData.length
        }
      }
    });

  } catch (error) {
    // If something goes wrong, send an error message
    console.error('✗ Error fetching SNOTEL data:', error.message);
    console.error('Stack trace:', error.stack);

    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data from SNOTEL',
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
    apiType: 'SNOTEL'
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`SNOTEL Weather API Server Started`);
  console.log(`========================================`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`API Endpoint: /api/weather-data-snotel`);
  console.log(`API Source: USDA SNOTEL (No token required)`);
  console.log(`========================================\n`);
});
