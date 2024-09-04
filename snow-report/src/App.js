// // src/App.js

import React from 'react';
import ReactDOM from 'react-dom';
import SnowDepthChart from './components/Depthchart';
import PrecipChart from './components/Precipitationchart';

const App = () => {
  return (
    <div>
      <SnowDepthChart 
        stationId="GHCND:USS0005K14S" 
        initialStartDate="2024-01-07" 
        initialEndDate="2024-01-14" 
      />
      <br></br>
      <PrecipChart 
        stationId="GHCND:USS0005K14S" 
        initialStartDate="2024-01-07" 
        initialEndDate="2024-01-14" 
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
export default App;