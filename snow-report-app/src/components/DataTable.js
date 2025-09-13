import React from 'react';
import {
Typography,
Grid,
Card,
CardContent,
Box,
Chip,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow
} from '@mui/material';
import { 
TableChart
} from '@mui/icons-material';

const DataTable = ({ 
precipData,
snowData
}) => {
return (
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
);
};
export default DataTable;