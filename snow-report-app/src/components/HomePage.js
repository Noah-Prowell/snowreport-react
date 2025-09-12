import React from 'react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import Header from './Header';
import HeroSection from './HeroSection';
import AreaGrid from './AreaGrid';
import FeaturesSection from './FeaturesSection';
import Footer from './Footer';

const HomePage = ({ 
  theme,
  selectedArea, 
  onHomeClick, 
  onAreaMenuOpen, 
  onViewDashboard, 
  areas, 
  onAreaSelect 
}) => {
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
    }
    }}>
    <Header 
        selectedArea={selectedArea}
        onHomeClick={onHomeClick}
        onAreaMenuOpen={onAreaMenuOpen}
    />
    <HeroSection onViewDashboard={onViewDashboard} />
    <AreaGrid areas={areas} onAreaSelect={onAreaSelect} />
    <FeaturesSection />
    <Footer />
    </Box>
</ThemeProvider>
);
};

export default HomePage;