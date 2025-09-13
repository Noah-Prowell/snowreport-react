import {
Typography,
Grid,
Card,
CardContent,
Box,
Chip
} from '@mui/material';
import { 
Cloud as CloudSnow,
} from '@mui/icons-material';
import {XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const PrecipitationChart = ({ 
precipData
}) => {
return (
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
);
};
export default PrecipitationChart;