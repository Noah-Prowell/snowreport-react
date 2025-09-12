import React from 'react';
import { 
AppBar, 
Toolbar, 
IconButton, 
Box, 
Typography, 
Button,
Menu,
MenuItem,
ListItemIcon,
ListItemText
} from '@mui/material';
import { 
Terrain as Mountain, 
LocationOn as MapPin, 
KeyboardArrowDown,
Home as HomeIcon
} from '@mui/icons-material';

const DataHeader = ({ 
selectedArea,
areas,
onHomeClick,
onAreaSelect,
anchorEl,
onMenuOpen,
onMenuClose
}) => {
return (
    <AppBar position="sticky" sx={{ 
        backgroundColor: 'background.paper', 
        color: 'text.primary', 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(12px)' 
    }} elevation={1}>
        <Toolbar>
        <IconButton onClick={onHomeClick} sx={{ mr: 2 }}>
            <HomeIcon />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ 
            width: 32, 
            height: 32, 
            borderRadius: 2, 
            background: 'linear-gradient(45deg, #1976d2, #26a69a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
            }}>
            <Mountain sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Snow Report
            </Typography>
            <Typography variant="body2" sx={{ 
            color: 'text.secondary', 
            ml: 1, 
            display: { xs: 'none', md: 'block' } 
            }}>
            • Professional backcountry conditions
            </Typography>
        </Box>

        {/* Area Selector */}
        <Button
            onClick={onMenuOpen}
            endIcon={<KeyboardArrowDown />}
            startIcon={<MapPin />}
            variant="outlined"
            sx={{ ml: 2 }}
        >
            <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedArea.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {selectedArea.elevation}
            </Typography>
            </Box>
        </Button>
        
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={onMenuClose}
            PaperProps={{ sx: { minWidth: 200 } }}
        >
            {Object.values(areas).map((area) => (
            <MenuItem
                key={area.name}
                onClick={() => onAreaSelect(area)}
                selected={selectedArea.name === area.name}
            >
                <ListItemIcon>
                <MapPin fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                primary={area.name} 
                secondary={area.elevation}
                />
            </MenuItem>
            ))}
        </Menu>
        </Toolbar>
    </AppBar>
    );
    };

export default DataHeader;