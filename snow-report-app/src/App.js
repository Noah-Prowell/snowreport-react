import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  MenuItem,
  Alert,
  Menu,
  ListItemText,
  ListItemIcon,
  LinearProgress
} from '@mui/material';
import { 
  Refresh as RefreshIcon, 
  LocationOn as MapPin,
  Cloud as CloudSnow
} from '@mui/icons-material';
import HomePage from './components/HomePage';
import DataHeader from './components/DataHeader';
import DataControls from './components/DataControls';
import SnowDepthChart from './components/SnowDepthChart';
import PrecipitationChart from './components/PrecipitationChart';
import CombinedChart from './components/CombinedChart';
import DataTable from './components/DataTable';
// Create a professional theme
// Create a mountain/ski themed color palette
const theme = createTheme({
  palette: {
  primary: {
    main: '#1a365d',
    light: '#2c5282',
    dark: '#0f172a',
  },
  secondary: {
    main: '#2d3748',
    light: '#4a5568',
    dark: '#1a202c',
  },
  success: {
    main: '#38a169',
    light: '#68d391',
    dark: '#2f855a',
  },
  info: {
    main: '#3182ce',
    light: '#63b3ed',
    dark: '#2c5282',
  },
  warning: {
    main: '#ed8936',
    light: '#fbb369',
    dark: '#c05621',
  },
  error: {
    main: '#e53e3e',
    light: '#fc8181',
    dark: '#c53030',
  },
  background: {
    default: '#f7fafc',
    paper: '#ffffff',
  },
  text: {
    primary: '#1a202c',
    secondary: '#4a5568',
  },
},
  typography: {
  fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
  h1: {
    fontWeight: 800,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontWeight: 700,
    letterSpacing: '-0.025em',
  },
  h3: {
    fontWeight: 700,
  },
  h4: {
    fontWeight: 600,
  },
  h5: {
    fontWeight: 600,
  },
  h6: {
    fontWeight: 600,
  },
  body1: {
    fontWeight: 400,
    lineHeight: 1.6,
  },
  body2: {
    fontWeight: 400,
    lineHeight: 1.5,
  },
},
  shape: {
    borderRadius: 12,
  },
components: {
  MuiCard: {
    styleOverrides: {
      root: {
        boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.15)',
        borderRadius: 16,
        transition: 'all 0.3s ease-in-out',
        background: 'linear-gradient(145deg, #ffffff 0%, #f7fafc 100%)',
        '&:hover': {
          boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.2)',
          transform: 'translateY(-4px)',
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 12,
        fontWeight: 600,
        padding: '12px 24px',
      },
      contained: {
        background: 'linear-gradient(45deg, #1a365d, #2c5282)',
        boxShadow: '0 4px 14px 0 rgba(26, 54, 93, 0.4)',
        '&:hover': {
          background: 'linear-gradient(45deg, #0f172a, #1a365d)',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px 0 rgba(26, 54, 93, 0.5)',
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      },
    },
  },
},
});

const SkiArea = {
  GRANBY: { id: 'GHCND:USS0005K14S', name: 'Granby', elevation: '8,280 ft' },
  JONES_PASS: { id: 'GHCND:USS0005K21S', name: 'Jones Pass', elevation: '12,451 ft' },
  LOVELAND: { id: 'GHCND:USS0005K05S', name: 'Loveland Pass', elevation: '11,990 ft' },
  STEVENS_PASS: {id: 'GHCND:USS0021B01S', name: 'Stevens Pass', elevation:'4, 016 ft'},
  JACKSON_HOLE: {id: 'GHCND:USW00024166', name: 'Jackson Hole', elevation: '6, 419 ft'}
};



function SnowReportApp() {
  const [selectedArea, setSelectedArea] = useState(SkiArea.GRANBY);
  const [startDate, setStartDate] = useState('2025-01-07');
  const [endDate, setEndDate] = useState('2025-01-14');
  const [snowData, setSnowData] = useState([]);
  const [precipData, setPrecipData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [anchorEl, setAnchorEl] = useState(null);


  // At the top of your component, add this helper
const getApiUrl = () => {
  // Check if we're in development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api/weather-data';
  }
  // In production (Azure), use the relative path
  return '/api/weather-data';
};
  const fetchWeatherData = async (stationId, startDate, endDate) => {
    setLoading(true);
    setError(null);
    
    try {
    console.log('Calling backend API...');
    
    // Call your backend server instead of NOAA directly
    const response = await fetch(getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stationId,
        startDate,
        endDate
      })
    });
    
    if (!response.ok) {
      throw new Error(`Backend request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Backend returned an error');
    }
    
    // Set the data in your React state
    setSnowData(data.snowData || []);
    setPrecipData(data.precipData || []);
    
    console.log('Data loaded successfully:', {
      snowRecords: data.snowData?.length || 0,
      precipRecords: data.precipData?.length || 0
    });
    
  } catch (err) {
    const errorMessage = err.message || 'Failed to fetch weather data. Please try again.';
    setError(errorMessage);
    console.error('Error fetching data:', err);
    
    // Set empty arrays on error
    setSnowData([]);
    setPrecipData([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (currentPage === 'data') {
      fetchWeatherData(selectedArea.id, startDate, endDate);
    }
  }, [selectedArea, startDate, endDate, currentPage]);

  const handleUpdateData = () => {
    fetchWeatherData(selectedArea.id, startDate, endDate);
  };

  const handleAreaSelect = (area) => {
    setSelectedArea(area);
    setAnchorEl(null);
    setCurrentPage('data');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

if (currentPage === 'home') {
  return (
    <HomePage 
      theme={theme}
      selectedArea={selectedArea}
      onHomeClick={() => setCurrentPage('home')}
      onAreaMenuOpen={handleMenuOpen}
      onViewDashboard={() => setCurrentPage('data')}
      areas={SkiArea}
      onAreaSelect={handleAreaSelect}
    />
  );
}

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
        {/* Header */}
        <DataHeader 
        selectedArea={selectedArea}
        areas={SkiArea}
        onHomeClick={() => setCurrentPage('home')}
        onAreaSelect={handleAreaSelect}
        anchorEl={anchorEl}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
        />
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{ sx: { minWidth: 200 } }}
            >
              {Object.values(SkiArea).map((area) => (
                <MenuItem
                  key={area.name}
                  onClick={() => handleAreaSelect(area)}
                  selected={selectedArea.name === area.name}
                >
                  <ListItemIcon>
                    <MapPin fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={area.name} 
                    secondary={area.elevation}
                  />
                </MenuItem>
              ))}
            </Menu>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Controls */}
          <DataControls 
          selectedArea={selectedArea}
          startDate={startDate}
          endDate={endDate}
          loading={loading}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onUpdateData={handleUpdateData}
          />

          {/* Loading */}
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <strong>Error:</strong> {error}
            </Alert>
          )}

          {/* Charts */}
          {!loading && (
            <Grid container spacing={3}>
              {/* Snow Depth Chart */}
              <SnowDepthChart
              snowData={snowData}
              />

              {/* Precipitation Chart */}
              <PrecipitationChart
              precipData={precipData}
              />

              {/* Combined Chart */}
              <CombinedChart 
              precipData={precipData}
              snowData={snowData}
              />

              {/* Data Table */}
              <DataTable 
              precipData={precipData}
              snowData={snowData}
              />
            </Grid>
          )}

          {/* No Data State */}
          {!loading && snowData.length === 0 && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <CloudSnow sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" mb={1}>
                  No Data Available
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Select a date range and location to view snow conditions.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleUpdateData}
                  startIcon={<RefreshIcon />}
                >
                  Load Data
                </Button>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default SnowReportApp;  