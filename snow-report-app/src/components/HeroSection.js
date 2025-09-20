import React from 'react';
import { 
Container, 
Box, 
Typography, 
Button, 
Fade 
} from '@mui/material';
import { Dashboard as DashboardIcon, Article as ArticleIcon } from '@mui/icons-material';

const HeroSection = ({ onViewDashboard, onAboutClick }) => {
return (
<Container maxWidth="lg" sx={{ pt: 8, pb: 4 }}>
    <Fade in timeout={1000}>
    <Box textAlign="center" mb={12}
    sx={{ 
        position: 'relative', 
        zIndex: 10 // Add z-index to ensure it stays above particles
    }}>
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
        onClick={onViewDashboard}
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
        {/* New About button */}
        <Button
            variant="contained"
            size="large"
            startIcon={<ArticleIcon />}
            onClick={onAboutClick}
            sx={{
            ml: 2,
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
            About
        </Button>
    </Box>
    </Fade>
</Container>
);
};

export default HeroSection;