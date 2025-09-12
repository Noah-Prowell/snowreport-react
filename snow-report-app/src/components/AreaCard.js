import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box, Fade } from '@mui/material';
import { 
Terrain as Mountain, 
LocationOn as MapPin, 
TrendingUp
} from '@mui/icons-material';

const AreaCard = ({ area, onAreaSelect, animationDelay = 0 }) => {
return (
<Fade in timeout={1000 + animationDelay}>
    <Card 
    sx={{ 
        height: '100%',
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
    }}
    onClick={() => onAreaSelect(area)}
    >
    <CardMedia
        sx={{
        height: 200,
        background: 'linear-gradient(45deg, #275332ff, #38a169)',
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
);
};

export default AreaCard;