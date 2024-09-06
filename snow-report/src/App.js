// // src/App.js

import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import SnowDepthChart from './components/Depthchart';
import PrecipChart from './components/Precipitationchart';
import Dropdown from './components/Dropdown';
import Header from './components/Header'
import Footer from './components/Footer';
import './App.css';

const App = () => {
  const [stationId, setStationId] = useState('GHCND:USS0005K14S');
  const [selectedStationLabel, setSelectedStationLabel] = useState('Granby');
  const [startDate, setStartDate] = useState('2024-01-07');
  const [endDate, setEndDate] = useState('2024-01-14');
  const [chartStartDate, setChartStartDate] = useState(startDate);
  const [chartEndDate, setChartEndDate] = useState(endDate);
  const stationOptions = [
    { label: 'Granby', value: 'GHCND:USS0005K14S' },
    { label: 'Jones Pass', value: 'GHCND:USS0005K21S' },
    { label: 'Loveland Pass', value: 'GHCND:USS0005K09S' },
    // Add more stations as needed
  ];
  const handleStationSelect = (stationValue) => {
    setStationId(stationValue);
    const selectedStation = stationOptions.find(option => option.value === stationValue);
    if (selectedStation) {
      setSelectedStationLabel(selectedStation.label);
    }
  };
  const handleUpdateClick = () => {
    setChartStartDate(startDate);
    setChartEndDate(endDate);
  };
  return (

    <div>
      <Header />
      <h1>{selectedStationLabel}</h1>

    
    <Dropdown 
        label="Select Station:" 
        options={stationOptions} 
        onSelect={handleStationSelect} 
      />
    <div>
        <label>Start Date: </label>
        <input 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
        />
      </div>
      
      <div>
        <label>End Date: </label>
        <input 
          type="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)} 
        />
      </div>

      <button onClick={handleUpdateClick}>Update Graph</button>
      <SnowDepthChart 
        stationId={stationId} 
        initialStartDate={chartStartDate} 
        initialEndDate={chartEndDate} 
      />
      <PrecipChart 
        stationId={stationId} 
        initialStartDate={chartStartDate} 
        initialEndDate={chartEndDate} 
      />
    <Footer />
    </div>
  );
};

// ReactDOM.createRoot(<App />, document.getElementById('root'));
export default App;