import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  IconButton,
  Menu,
  ListItemText,
  ListItemIcon,
  Divider,
  Fade,
  CardMedia,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  Terrain as Mountain, 
  BarChart as BarChartIcon, 
  Cloud as CloudSnow, 
  CalendarToday as Calendar, 
  Refresh as RefreshIcon, 
  LocationOn as MapPin, 
  Thermostat as Thermometer, 
  Home as HomeIcon, 
  Dashboard as DashboardIcon, 
  KeyboardArrowDown, 
  TrendingUp, 
  WbSunny, 
  AcUnit,
  Timeline,
  Assessment,
  TableChart
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Create a professional theme
// Create a mountain/ski themed color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E4F99', // Deep mountain blue
      light: '#5A7BC8',
      dark: '#1A3366',
    },
    secondary: {
      main: '#8B4513', // Saddle brown (earth/wood tones)
      light: '#CD853F',
      dark: '#654321',
    },
    success: {
      main: '#228B22', // Forest green
      light: '#32CD32',
      dark: '#006400',
    },
    info: {
      main: '#4682B4', // Steel blue (ski equipment)
      light: '#87CEEB',
      dark: '#2F4F4F',
    },
    warning: {
      main: '#FF8C00', // Dark orange (sunset on peaks)
      light: '#FFA500',
      dark: '#FF6347',
    },
    error: {
      main: '#DC143C', // Crimson (danger/avalanche warning)
      light: '#FF6B6B',
      dark: '#8B0000',
    },
    background: {
      default: '#F0F8FF', // Alice blue (fresh snow)
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2F4F4F', // Dark slate gray
      secondary: '#708090', // Slate gray
    },
  },
  typography: {
    h1: {
      fontWeight: 700,
      fontFamily: '"Roboto Condensed", "Arial", sans-serif',
    },
    h2: {
      fontWeight: 600,
      fontFamily: '"Roboto Condensed", "Arial", sans-serif',
    },
    h3: {
      fontWeight: 600,
      fontFamily: '"Roboto Condensed", "Arial", sans-serif',
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
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          transition: 'all 0.2s ease-in-out',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          '&:hover': {
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
        contained: {
          background: 'linear-gradient(45deg, #2E4F99, #4682B4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1A3366, #2F4F4F)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #2E4F99, #4682B4)',
        },
      },
    },
  },
});

const SkiArea = {
  GRANBY: { id: 'GHCND:USS0005K14S', name: 'Granby', elevation: '8,280 ft' },
  JONES_PASS: { id: 'GHCND:USS0005K29S', name: 'Jones Pass', elevation: '12,451 ft' },
  LOVELAND: { id: 'GHCND:USS0005K24S', name: 'Loveland Pass', elevation: '11,990 ft' }
};



function SnowReportApp() {
  const [selectedArea, setSelectedArea] = useState(SkiArea.GRANBY);
  const [startDate, setStartDate] = useState('2024-01-07');
  const [endDate, setEndDate] = useState('2024-01-14');
  const [snowData, setSnowData] = useState([]);
  const [precipData, setPrecipData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [anchorEl, setAnchorEl] = useState(null);

  const fetchWeatherData = async (stationId, startDate, endDate) => {
    setLoading(true);
    setError(null);
    
    try {
    console.log('Calling backend API...');
    
    // Call your backend server instead of NOAA directly
    const response = await fetch('http://localhost:3001/api/weather-data', {
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
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1, minHeight: '100vh', background: 'linear-gradient(135deg, #1e2c49ff 0%, #72b4ebff 50%, #87CEEB 100%)' }}>
          {/* Header */}
          <AppBar position="sticky" sx={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }} elevation={0}>
            <Toolbar>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 2, 
                  background: 'linear-gradient(45deg, #770e0eff, #ee4e4eff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <Mountain sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Snow Report
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                    Professional backcountry conditions
                  </Typography>
                </Box>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Hero Section */}
          <Container maxWidth="lg" sx={{ pt: 8, pb: 4 }}>
            <Fade in timeout={1000}>
              <Box textAlign="center" mb={8}>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '3.5rem' }, 
                    fontWeight: 700, 
                    mb: 3,
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  Make Informed{' '}
                  <Typography 
                    component="span" 
                    variant="h1" 
                    sx={{ 
                      fontSize: 'inherit',
                      background: 'linear-gradient(45deg, #770e0eff, #ee4e4eff)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700
                    }}
                  >
                    Backcountry
                  </Typography>
                  <br />
                  Decisions
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, color: 'rgba(255,255,255,0.9)', maxWidth: '600px', mx: 'auto' }}>
                  Real-time snow depth and precipitation data from NOAA weather stations across the US premier backcountry areas.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<DashboardIcon />}
                  onClick={() => setCurrentPage('data')}
                  sx={{ 
                    px: 4, 
                    py: 2, 
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg, #770e0eff, #ee4e4eff)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                    }
                  }}
                >
                  View Data Dashboard
                </Button>
              </Box>
            </Fade>

            {/* Area Cards */}
            <Grid container spacing={4} mb={8}>
              {Object.values(SkiArea).map((area, index) => (
                <Grid item xs={12} md={4} key={area.name}>
                  <Fade in timeout={1000 + index * 200}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                      }}
                      onClick={() => handleAreaSelect(area)}
                    >
                      <CardMedia
                        sx={{
                          height: 200,
                          background: 'linear-gradient(45deg, #275332ff, #09b64bff)',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'flex-end',
                          p: 2
                        }}
                      >
                        <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.3 }}>
                          <Mountain sx={{ fontSize: 48, color: 'white' }} />
                        </Box>
                        <Box>
                          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                            {area.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MapPin sx={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', mr: 0.5 }} />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                              {area.elevation}
                            </Typography>
                          </Box>
                        </Box>
                      </CardMedia>
                      <CardContent>
                        <Typography variant="body1" color="text.secondary" mb={2}>
                          Access real-time snow conditions and precipitation data for {area.name} area.
                        </Typography>
                        <Button 
                          variant="text" 
                          color="primary" 
                          endIcon={<TrendingUp />}
                          sx={{ fontWeight: 600 }}
                        >
                          View Conditions
                        </Button>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>

            {/* Features */}
            <Fade in timeout={1500}>
              <Card sx={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" textAlign="center" mb={4} sx={{ fontWeight: 600 }}>
                    Why Choose Snow Report?
                  </Typography>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={4} textAlign="center">
                      <Box sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: 3, 
                        background: 'linear-gradient(45deg, #F0F8FF, #E6F3FF)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}>
                        <AcUnit sx={{ fontSize: 32, color: 'primary.main' }} />
                      </Box>
                      <Typography variant="h6" mb={2} sx={{ fontWeight: 600 }}>
                        Real-time Data
                      </Typography>
                      <Typography color="text.secondary">
                        Direct access to NOAA weather stations for the most accurate, up-to-date conditions.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} textAlign="center">
                      <Box sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: 3, 
                        background: 'linear-gradient(45deg, #F0FFF0, #E6FFE6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}>
                        <BarChartIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
                      </Box>
                      <Typography variant="h6" mb={2} sx={{ fontWeight: 600 }}>
                        Visual Analytics
                      </Typography>
                      <Typography color="text.secondary">
                        Professional charts and graphs to quickly assess trends and make informed decisions.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} textAlign="center">
                      <Box sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: 3, 
                        background: 'linear-gradient(45deg, #FFF8DC, #F5E6D3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}>
                        <Mountain sx={{ fontSize: 32, color: '#7b1fa2' }} />
                      </Box>
                      <Typography variant="h6" mb={2} sx={{ fontWeight: 600 }}>
                        By Athletes, For Athletes
                      </Typography>
                      <Typography color="text.secondary">
                        Built by winter sports enthusiasts who understand what data matters most.
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Fade>
          </Container>

          {/* Footer */}
          <Box sx={{ background: 'rgba(0,0,0,0.8)', color: 'white', mt: 8, py: 6 }}>
            <Container maxWidth="lg">
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" mb={3} sx={{ fontWeight: 600 }}>
                    Questions or comments? Get in touch:
                  </Typography>
                  <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      placeholder="Name"
                      variant="outlined"
                      size="small"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                        },
                        '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                    <TextField
                      placeholder="Email"
                      variant="outlined"
                      size="small"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                        },
                        '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                    <TextField
                      placeholder="Message"
                      multiline
                      rows={3}
                      variant="outlined"
                      size="small"
                      sx={{ 
                        '& .MuiOutlinedInput-root': { 
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                        },
                        '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                    <Button
                      variant="contained"
                      sx={{ 
                        alignSelf: 'flex-start',
                        background: 'linear-gradient(45deg, #1976d2, #26a69a)'
                      }}
                    >
                      Send Message
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.8)' }}>
                    Snow Report provides essential weather data for backcountry enthusiasts. Built with real-time NOAA data to help you make safe, informed decisions in the mountains.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    © 2024 Snow Report. All rights reserved.
                  </Typography>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
        {/* Header */}
        <AppBar position="sticky" sx={{ backgroundColor: 'background.paper', color: 'text.primary' }} elevation={1}>
          <Toolbar>
            <IconButton 
              onClick={() => setCurrentPage('home')}
              sx={{ mr: 2 }}
            >
              <HomeIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: 2, 
                background: 'linear-gradient(45deg, #1976d2, #26a69a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}>
                <Mountain sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Snow Report
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1, display: { xs: 'none', md: 'block' } }}>
                • Professional backcountry conditions
              </Typography>
            </Box>

            {/* Area Selector */}
            <Button
              onClick={handleMenuOpen}
              endIcon={<KeyboardArrowDown />}
              startIcon={<MapPin />}
              variant="outlined"
              sx={{ ml: 2 }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedArea.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedArea.elevation}
                </Typography>
              </Box>
            </Button>
            
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
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Controls */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, border: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Thermometer sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {selectedArea.name} Conditions
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'center' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Calendar sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <TextField
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                  />
                  <Typography variant="body2" color="text.secondary">to</Typography>
                  <TextField
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                  />
                </Box>
                
                <Button
                  onClick={handleUpdateData}
                  disabled={loading}
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                >
                  Update Data
                </Button>
              </Box>
            </Box>
          </Paper>

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
              <Grid item xs={12} lg={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AcUnit sx={{ color: 'primary.main', mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Snow Depth
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${snowData.length} data points`} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Box>
                    
                    <Box sx={{ height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={snowData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="formattedDate" 
                            stroke="#666"
                            fontSize={12}
                            tick={{ fill: '#666' }}
                          />
                          <YAxis 
                            stroke="#666"
                            fontSize={12}
                            tick={{ fill: '#666' }}
                            label={{ value: 'Inches', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#1976d2"
                            strokeWidth={2}
                            fill="#1976d2"
                            fillOpacity={0.1}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Precipitation Chart */}
              <Grid item xs={12} lg={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CloudSnow sx={{ color: 'secondary.main', mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Precipitation
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${precipData.length} data points`} 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                      />
                    </Box>
                    
                    <Box sx={{ height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={precipData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="formattedDate" 
                            stroke="#666"
                            fontSize={12}
                            tick={{ fill: '#666' }}
                          />
                          <YAxis 
                            stroke="#666"
                            fontSize={12}
                            tick={{ fill: '#666' }}
                            label={{ value: 'Inches', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#26a69a"
                            strokeWidth={2}
                            fill="#26a69a"
                            fillOpacity={0.1}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Combined Chart */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Timeline sx={{ color: 'success.main', mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Combined Analysis
                        </Typography>
                      </Box>
                      <Chip 
                        label="Dual axis chart" 
                        size="small" 
                        color="success" 
                        variant="outlined" 
                      />
                    </Box>
                    
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={snowData.map((item, index) => ({
                          ...item,
                          precipitation: precipData[index]?.value || 0
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="formattedDate" 
                            stroke="#666"
                            fontSize={12}
                            tick={{ fill: '#666' }}
                          />
                          <YAxis 
                            yAxisId="snow"
                            stroke="#666"
                            fontSize={12}
                            tick={{ fill: '#666' }}
                            label={{ value: 'Snow Depth (in)', angle: -90, position: 'insideLeft' }}
                          />
                          <YAxis 
                            yAxisId="precip"
                            orientation="right"
                            stroke="#666"
                            fontSize={12}
                            tick={{ fill: '#666' }}
                            label={{ value: 'Precipitation (in)', angle: 90, position: 'insideRight' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #e0e0e0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Line
                            yAxisId="snow"
                            type="monotone"
                            dataKey="value"
                            stroke="#1976d2"
                            strokeWidth={3}
                            dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                            name="Snow Depth"
                          />
                          <Line
                            yAxisId="precip"
                            type="monotone"
                            dataKey="precipitation"
                            stroke="#26a69a"
                            strokeWidth={3}
                            dot={{ fill: '#26a69a', strokeWidth: 2, r: 4 }}
                            name="Precipitation"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Data Table */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TableChart sx={{ color: 'warning.main', mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Raw Data
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${snowData.length} records`} 
                        size="small" 
                        color="warning" 
                        variant="outlined" 
                      />
                    </Box>
                    
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Snow Depth (in)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Precipitation (in)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Daily Change</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {snowData.map((row, index) => {
                            const dailyChange = index > 0 ? (row.value - snowData[index - 1].value).toFixed(1) : '—';
                            const changeColor = parseFloat(dailyChange) > 0 ? 'success.main' : parseFloat(dailyChange) < 0 ? 'error.main' : 'text.secondary';
                            
                            return (
                              <TableRow key={row.date} hover>
                                <TableCell>{row.formattedDate}</TableCell>
                                <TableCell align="right">{row.value.toFixed(1)}</TableCell>
                                <TableCell align="right">{precipData[index]?.value.toFixed(2) || '0.00'}</TableCell>
                                <TableCell align="right">
                                  <Typography 
                                    component="span" 
                                    sx={{ 
                                      color: changeColor,
                                      fontWeight: dailyChange !== '—' ? 600 : 400
                                    }}
                                  >
                                    {dailyChange !== '—' && parseFloat(dailyChange) > 0 ? '+' : ''}{dailyChange}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
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