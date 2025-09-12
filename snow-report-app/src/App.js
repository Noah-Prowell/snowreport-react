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
import AreaGrid from './components/AreaGrid';
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
        <Box sx={{ 
  flexGrow: 1, 
  minHeight: '100vh', 
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
  '&::before': {
  content: '""',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `
    /* Outermost contour - base elevation (thickest line) */
    radial-gradient(ellipse 1400px 800px at 50% 50%, transparent 0%, transparent 79%, rgba(255, 255, 255, 0.06) 79.5%, rgba(255, 255, 255, 0.06) 81%, transparent 81.5%),
    
    /* Major contour lines (every 200ft - thicker) */
    radial-gradient(ellipse 1200px 700px at 50% 50%, transparent 0%, transparent 79%, rgba(255, 255, 255, 0.05) 79.5%, rgba(255, 255, 255, 0.05) 80.5%, transparent 81%),
    radial-gradient(ellipse 1000px 600px at 50% 50%, transparent 0%, transparent 79%, rgba(255, 255, 255, 0.06) 79.5%, rgba(255, 255, 255, 0.06) 80.5%, transparent 81%),
    radial-gradient(ellipse 800px 500px at 50% 50%, transparent 0%, transparent 79%, rgba(255, 255, 255, 0.05) 79.5%, rgba(255, 255, 255, 0.05) 80.5%, transparent 81%),
    radial-gradient(ellipse 600px 400px at 50% 50%, transparent 0%, transparent 79%, rgba(255, 255, 255, 0.06) 79.5%, rgba(255, 255, 255, 0.06) 80.5%, transparent 81%),
    
    /* Intermediate contour lines (every 40ft - medium thickness) */
    radial-gradient(ellipse 1300px 750px at 50% 50%, transparent 0%, transparent 79.2%, rgba(255, 255, 255, 0.04) 79.5%, rgba(255, 255, 255, 0.04) 80.2%, transparent 80.5%),
    radial-gradient(ellipse 1100px 650px at 50% 50%, transparent 0%, transparent 79.2%, rgba(255, 255, 255, 0.04) 79.5%, rgba(255, 255, 255, 0.04) 80.2%, transparent 80.5%),
    radial-gradient(ellipse 900px 550px at 50% 50%, transparent 0%, transparent 79.2%, rgba(255, 255, 255, 0.04) 79.5%, rgba(255, 255, 255, 0.04) 80.2%, transparent 80.5%),
    radial-gradient(ellipse 700px 450px at 50% 50%, transparent 0%, transparent 79.2%, rgba(255, 255, 255, 0.04) 79.5%, rgba(255, 255, 255, 0.04) 80.2%, transparent 80.5%),
    radial-gradient(ellipse 500px 350px at 50% 50%, transparent 0%, transparent 79.2%, rgba(255, 255, 255, 0.04) 79.5%, rgba(255, 255, 255, 0.04) 80.2%, transparent 80.5%),
    
    /* Minor contour lines (every 20ft - thinner) */
    radial-gradient(ellipse 1350px 775px at 50% 50%, transparent 0%, transparent 79.3%, rgba(255, 255, 255, 0.03) 79.5%, rgba(255, 255, 255, 0.03) 80%, transparent 80.2%),
    radial-gradient(ellipse 1250px 725px at 50% 50%, transparent 0%, transparent 79.3%, rgba(255, 255, 255, 0.03) 79.5%, rgba(255, 255, 255, 0.03) 80%, transparent 80.2%),
    radial-gradient(ellipse 1150px 675px at 50% 50%, transparent 0%, transparent 79.3%, rgba(255, 255, 255, 0.03) 79.5%, rgba(255, 255, 255, 0.03) 80%, transparent 80.2%),
    radial-gradient(ellipse 1050px 625px at 50% 50%, transparent 0%, transparent 79.3%, rgba(255, 255, 255, 0.03) 79.5%, rgba(255, 255, 255, 0.03) 80%, transparent 80.2%),
    radial-gradient(ellipse 950px 575px at 50% 50%, transparent 0%, transparent 79.3%, rgba(255, 255, 255, 0.03) 79.5%, rgba(255, 255, 255, 0.03) 80%, transparent 80.2%),
    radial-gradient(ellipse 850px 525px at 50% 50%, transparent 0%, transparent 79.3%, rgba(255, 255, 255, 0.03) 79.5%, rgba(255, 255, 255, 0.03) 80%, transparent 80.2%),
    radial-gradient(ellipse 750px 475px at 50% 50%, transparent 0%, transparent 79.3%, rgba(255, 255, 255, 0.03) 79.5%, rgba(255, 255, 255, 0.03) 80%, transparent 80.2%),
    radial-gradient(ellipse 650px 425px at 50% 50%, transparent 0%, transparent 79.3%, rgba(255, 255, 255, 0.03) 79.5%, rgba(255, 255, 255, 0.03) 80%, transparent 80.2%),
    radial-gradient(ellipse 550px 375px at 50% 50%, transparent 0%, transparent 79.3%, rgba(255, 255, 255, 0.03) 79.5%, rgba(255, 255, 255, 0.03) 80%, transparent 80.2%),
    radial-gradient(ellipse 450px 325px at 50% 50%, transparent 0%, transparent 79.3%, rgba(255, 255, 255, 0.03) 79.5%, rgba(255, 255, 255, 0.03) 80%, transparent 80.2%),
    radial-gradient(ellipse 350px 275px at 50% 50%, transparent 0%, transparent 79.3%, rgba(255, 255, 255, 0.03) 79.5%, rgba(255, 255, 255, 0.03) 80%, transparent 80.2%),
    radial-gradient(ellipse 250px 225px at 50% 50%, transparent 0%, transparent 79.3%, rgba(255, 255, 255, 0.03) 79.5%, rgba(255, 255, 255, 0.03) 80%, transparent 80.2%),
    
    /* Peak area - summit (brightest) */
    radial-gradient(ellipse 150px 125px at 50% 50%, transparent 0%, transparent 78%, rgba(255, 255, 255, 0.07) 79%, rgba(255, 255, 255, 0.07) 81%, transparent 82%),
    radial-gradient(ellipse 75px 65px at 50% 50%, transparent 0%, transparent 77%, rgba(255, 255, 255, 0.08) 78%, rgba(255, 255, 255, 0.08) 82%, transparent 83%)
  `,
  zIndex: 0,
}}}>
          {/* Floating Header */}
<Box sx={{ 
  position: 'sticky', 
  top: 16, 
  zIndex: 100, 
  px: 3,
  py: 1,
}}>
  <Paper 
    elevation={0}
    sx={{ 
      background: 'rgba(255, 255, 255, 0.1)', 
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: 3,
      px: 3,
      py: 1.5,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton 
          onClick={() => setCurrentPage('home')}
          sx={{ 
            mr: 2,
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            '&:hover': { background: 'rgba(255, 255, 255, 0.2)' }
          }}
        >
          <HomeIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mr: 1 }}>
          Snow Report
        </Typography>
        <Chip 
          label="BETA" 
          size="small" 
          sx={{ 
            background: 'rgba(237, 137, 54, 0.2)',
            color: '#ed8936',
            fontWeight: 600,
            fontSize: '0.7rem'
          }} 
        />
      </Box>

      {/* Minimal Area Selector */}
      <Button
        onClick={handleMenuOpen}
        endIcon={<KeyboardArrowDown />}
        sx={{ 
          color: 'white',
          background: 'rgba(255, 255, 255, 0.1)',
          '&:hover': { background: 'rgba(255, 255, 255, 0.2)' },
          borderRadius: 2,
          px: 2,
          py: 1
        }}
      >
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {selectedArea.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
            {selectedArea.elevation}
          </Typography>
        </Box>
      </Button>
    </Box>
  </Paper>
</Box>

          {/* Hero Section */}
          <Container maxWidth="lg" sx={{ pt: 8, pb: 4 }}>
            <Fade in timeout={1000}>
              <Box textAlign="center" mb={12}>
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
                      background: 'linear-gradient(45deg, #e6fffa, #b2f5ea)',
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
                    background: 'linear-gradient(45deg, #ed8936, #f6ad55)',
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
            <AreaGrid areas={SkiArea} onAreaSelect={handleAreaSelect} />

            {/* Features */}
            <Fade in timeout={1500}>
              <Card sx={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" textAlign="center" mb={4} sx={{ fontWeight: 600 }}>
                    Why Choose Snow Report?
                  </Typography>
                  <Grid container spacing={6}>
                    <Grid item xs={12} md={4} textAlign="center">
                      <Box sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: 3, 
                        background: 'linear-gradient(45deg, #e6fffa, #b2f5ea)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}>
                        <AcUnit sx={{ fontSize: 32, color: 'primary.main' }} />
                      </Box>
                      <Typography variant="h6" mb={2} sx={{ fontWeight: 600 }}>
                        Real-Time Data
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
                        background: 'linear-gradient(45deg, #fef5e7, #fed7aa)',
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
                        background: 'linear-gradient(45deg, #f0f9ff, #bae6fd)',
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
              <Grid container spacing={6}>
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
        <AppBar position="sticky" sx={{ backgroundColor: 'background.paper', 
          color: 'text.primary', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)' }} elevation={1}>
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