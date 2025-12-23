const fetch = require('node-fetch');

module.exports = async function (context, req) {
  // Add CORS headers
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: {}
    };
    return;
  }

  try {
    // Get the data from the request body
    const { stationId, startDate, endDate } = req.body;

    if (!stationId || !startDate || !endDate) {
      context.res = {
        status: 400,
        headers: corsHeaders,
        body: {
          success: false,
          error: 'Missing required parameters: stationId, startDate, endDate'
        }
      };
      return;
    }

    context.log(`Fetching SNOTEL data for station: ${stationId}, dates: ${startDate} to ${endDate}`);

    // Build the SNOTEL API URL
    const baseUrl = 'https://wcc.sc.egov.usda.gov/awdbRestApi/services/v1/data';

    // Request both SNWD (Snow Depth) and PRCP (Precipitation Increment - daily)
    const params = new URLSearchParams({
      stationTriplets: stationId,
      elements: 'SNWD,PRCP', // Changed from PREC to PRCP (daily increment, not cumulative)
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

    context.log('Calling SNOTEL API...');

    // Make API call to SNOTEL
    const response = await fetch(snotelUrl, {
      headers: {
        'accept': 'application/json',
        'User-Agent': 'SnowReportApp/1.0'
      }
    });

    // Check if the API call was successful
    if (!response.ok) {
      throw new Error(`SNOTEL request failed: ${response.status} ${response.statusText}`);
    }

    // Convert the response to JSON
    const data = await response.json();

    context.log(`Received SNOTEL response with ${data.length} station records`);

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
                date: date.split('T')[0], // Extract just the date part
                value: value,
                formattedDate: new Date(date).toLocaleDateString(),
                station: station
              };

              // Separate into snow depth or precipitation based on element code
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

    context.log(`Formatted ${snowData.length} snow records and ${precipData.length} precipitation records`);

    // Send the formatted data back in the same format as NOAA API
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: {
        success: true,
        snowData: snowData,
        precipData: precipData
      }
    };

  } catch (error) {
    // If something goes wrong, send an error message
    context.log.error('Error fetching SNOTEL data:', error);
    context.res = {
      status: 500,
      headers: corsHeaders,
      body: {
        success: false,
        error: 'Failed to fetch weather data from SNOTEL',
        message: error.message
      }
    };
  }
};
