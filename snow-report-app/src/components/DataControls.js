import React from 'react';
import { 
Paper, 
Box, 
Typography, 
TextField, 
Button,
CircularProgress
} from '@mui/material';
import { 
Thermostat as Thermometer, 
CalendarToday as Calendar,
Refresh as RefreshIcon 
} from '@mui/icons-material';

const DataControls = ({ 
    selectedArea,
    startDate,
    endDate,
    loading,
    onStartDateChange,
    onEndDateChange,
    onUpdateData
}) => {
return (
    <Paper elevation={0} sx={{ p: 3, mb: 3, border: 1, borderColor: 'divider' }}>
        <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { md: 'center' }, 
        gap: 2 
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Thermometer sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {selectedArea.name} Conditions
            </Typography>
        </Box>
        
        <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: 2, 
            alignItems: { sm: 'center' } 
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar sx={{ color: 'text.secondary', fontSize: 20 }} />
            <TextField
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
            />
            <Typography variant="body2" color="text.secondary">to</Typography>
            <TextField
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
            />
            </Box>
            
            <Button
            onClick={onUpdateData}
            disabled={loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            >
            Update Data
            </Button>
        </Box>
        </Box>
    </Paper>
    );
};

export default DataControls;