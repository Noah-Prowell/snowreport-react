import React from 'react';
import { Grid, Container } from '@mui/material';
import AreaCard from './AreaCard';

const AreaGrid = ({ areas, onAreaSelect }) => {
return (
    <Container maxWidth="lg">
        <Grid container spacing={6} mb={12}>
            {Object.values(areas).map((area, index) => (
            <Grid item xs={12} md={4} key={area.name}>
                <AreaCard 
                area={area}
                onAreaSelect={onAreaSelect}
                animationDelay={index * 200}
                />
            </Grid>
            ))}
        </Grid>
    </Container>
);
};

export default AreaGrid;