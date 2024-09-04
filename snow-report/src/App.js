// // src/App.js

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import SnowDepthChart from './components/Depthchart';
import PrecipChart from './components/Precipitationchart';
import Dropdown from './components/Dropdown';

const App = () => {
  const [stationId, setStationId] = useState('GHCND:USS0005K14S');
  const [selectedStationLabel, setSelectedStationLabel] = useState('Granby');
  const [startDate, setStartDate] = useState('2024-01-07');
  const [endDate, setEndDate] = useState('2024-01-14');
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
  return (

    <div>
    <h1>Snow Depth Data Viewer</h1>
    <Dropdown 
        label="Select Station:" 
        options={stationOptions} 
        onSelect={handleStationSelect} 
      />
    <h2>{selectedStationLabel}</h2>
      <SnowDepthChart 
        stationId={stationId} 
        initialStartDate={startDate} 
        initialEndDate={endDate} 
      />
      <PrecipChart 
        stationId={stationId} 
        initialStartDate={startDate} 
        initialEndDate={endDate} 
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
export default App;