import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip
} from '@mui/material';
import { 
  AcUnit
} from '@mui/icons-material';
import {XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const SnowDepthChart = ({ 
snowData
}) => {
return (
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
);
};
export default SnowDepthChart;