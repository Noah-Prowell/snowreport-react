import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const PrecipChart = ({ stationId, initialStartDate, initialEndDate }) => {
    const [snowData, setSnowData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
    const fetchSnowData = async () => {
        try {
        const response = await axios.get(`https://www.ncei.noaa.gov/cdo-web/api/v2/data`, {
            params: {
            datasetid: 'GHCND',
            datatypeid: 'PRCP',
            locationid: 'FIPS:08',
            stationid: stationId,
            units: 'standard',
            startdate: initialStartDate,
            enddate: initialEndDate,
            limit: 1000,
            },
            headers: {
            'Content-Type': 'text/plain',
            'token': 'ptCSsKJigBiLLmlIdcjtNPMGhdYTpiXG'
            }
        });

        setSnowData(response.data.results);
        setLoading(false);
        } catch (error) {
        setError('Failed to fetch data');
        setLoading(false);
        }
    };

    fetchSnowData();
    }, [stationId, initialStartDate, initialEndDate]);
    const labels = snowData.map(item => item.date);
    const processDataForChart = () => {
        const labels = snowData.map(item => {
          // Format the date to only show the date part (YYYY-MM-DD)
        const date = new Date(item.date);
          return date.toISOString().split('T')[0];  // This removes the time part
        });

    const dataPoints = snowData.map(item => item.value);

    return {
        labels,
        datasets: [
        {
            label: 'Precipitation (inches)',
            data: dataPoints,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false
        }
        ]
    };
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
    <div>
        <h2>Precipitation</h2>
        <Line data={processDataForChart()} />
    </div>
    );
};

export default PrecipChart;
    