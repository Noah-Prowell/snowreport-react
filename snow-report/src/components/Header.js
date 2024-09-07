// src/components/Header.js
import React from 'react';
import Dropdown from './Dropdown';

const Header = ({ 
  stationOptions, 
  selectedStationLabel, 
  startDate, 
  endDate, 
  setStartDate, 
  setEndDate, 
  handleStationSelect, 
  handleUpdateClick 
}) => {
  
  return (
    <section id="header">
      <div className="container">
        <h1 id="logo"><a href="index.html">Snow Report</a></h1>
        <p>A site built by winter athletes for winter athletes</p>
        <br />
        <h1 id="logo">{selectedStationLabel}</h1>
        <br />
        {/* Station Select Dropdown */}
        <Dropdown 
          label="Select Station:" 
          options={stationOptions} 
          onSelect={handleStationSelect} 
        />

        {/* Start Date Input */}
        <div>
          <label>Start Date: </label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
          />
        </div>
        
        {/* End Date Input */}
        <div>
          <label>End Date: </label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
          />
        </div>

        {/* Update Button */}
        <button onClick={handleUpdateClick}>Update Graph</button>
      </div>
    </section>
  );
};

export default Header;
