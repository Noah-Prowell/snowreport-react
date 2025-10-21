import React from 'react';
import { Box, ThemeProvider, CssBaseline } from '@mui/material';
import Header from './Header';
import HeroSection from './HeroSection';
import AreaGrid from './AreaGrid';
import FeaturesSection from './FeaturesSection';
import Footer from './Footer';
import Particles from './Particles';

const HomePage = ({ 
theme,
selectedArea, 
onHomeClick, 
onAboutClick, 
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
    position: 'relative', // Keep this for positioning
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
    // Remove all the &::before content - it's been replaced with Particles
    }}>
    
    {/* Particles Background - Full viewport coverage */}
    <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none', // Allow clicks to pass through to content below
    }}>
        <Particles
        particleColors={['#ffffff', '#e2e8f0', '#cbd5e1']} // Snow-like colors
        particleCount={800} // More particles for snow effect
        particleSpread={2}
        speed={0.05} // Slower for gentle snowfall
        particleBaseSize={80}
        moveParticlesOnHover={true}
        alphaParticles={false} // Enable alpha for more realistic snow
        disableRotation={false}
        />
    </Box>

    {/* All your existing content - now with higher z-index */}
    <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Header 
        selectedArea={selectedArea}
        onHomeClick={onHomeClick}
        areas={areas}
        onAreaSelect={onAreaSelect}
        />
        <HeroSection onViewDashboard={onViewDashboard}
        onAboutClick={onAboutClick} />
        <AreaGrid areas={areas} onAreaSelect={onAreaSelect} />
        <FeaturesSection />
        <Footer />
    </Box>
    </Box>
</ThemeProvider>
);
};

export default HomePage;