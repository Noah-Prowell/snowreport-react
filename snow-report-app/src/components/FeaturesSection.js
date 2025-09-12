import React from 'react';
import {
Typography,
Container,
Grid,
Card,
CardContent,
Box,
Fade
} from '@mui/material';
import { 
Terrain as Mountain, 
BarChart as BarChartIcon, 
AcUnit
} from '@mui/icons-material';



const FeaturesSection = () => {
return (
    <Container maxWidth="lg">
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
    );
};

export default FeaturesSection;