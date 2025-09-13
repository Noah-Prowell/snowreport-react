import React from 'react';
import {
Typography,
Grid,
Card,
CardContent,
Box,
Chip
} from '@mui/material';
import { 
Timeline
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';

const CombinedChart = ({ 
precipData,
snowData
}) => {
return (
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
);
};
export default CombinedChart;