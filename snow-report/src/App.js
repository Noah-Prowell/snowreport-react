// // src/App.js

import React, { useState } from 'react';
import SnowDepthChart from './components/Depthchart';
import PrecipChart from './components/Precipitationchart';
import Dropdown from './components/Dropdown';
import Header from './components/Header'
import Footer from './components/Footer';
import './App.css';

const App = () => {
  const [stationId, setStationId] = useState('GHCND:USS0005K14S');
  const [selectedStationLabel, setSelectedStationLabel] = useState('Granby');
  const [newStationId, setNewStationId] = useState(stationId);
  const [newStationLabel, setNewStationLabel] = useState(selectedStationLabel);
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
    const selectedStation = stationOptions.find(option => option.value === stationValue);
    if (selectedStation) {
      setNewStationId(selectedStation.value);  // Temporary state for station ID
      setNewStationLabel(selectedStation.label);  // Temporary state for station label
    }
  };
  const handleUpdateClick = () => {
    setStationId(newStationId);  // Update station ID
    setSelectedStationLabel(newStationLabel);  // Update station label
    setChartStartDate(startDate);  // Update chart start date
    setChartEndDate(endDate);  // Update chart end date
  };
  return (

    <div>
       <Header 
        stationOptions={stationOptions}
        selectedStationLabel={selectedStationLabel}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        handleStationSelect={handleStationSelect}
        handleUpdateClick={handleUpdateClick}
      />
      {/* <h1>{selectedStationLabel}</h1> */}
      {/* <h1>{selectedStationLabel}</h1> */}
      <SnowDepthChart 
        stationId={stationId} 
        initialStartDate={chartStartDate} 
        initialEndDate={chartEndDate} 
      />
      <br />
      <PrecipChart 
        stationId={stationId} 
        initialStartDate={chartStartDate} 
        initialEndDate={chartEndDate} 
      />
    <Footer />
    </div>
  );
};


export default App;