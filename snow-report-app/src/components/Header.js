import React, { useState } from 'react';
import { 
Box, 
Paper, 
IconButton, 
Typography, 
Chip, 
Button,
Menu,
MenuItem,
ListItemIcon,
ListItemText
} from '@mui/material';
import { Home as HomeIcon, KeyboardArrowDown, LocationOn as MapPin } from '@mui/icons-material';

const Header = ({ selectedArea, onHomeClick, areas, onAreaSelect }) => {
const [anchorEl, setAnchorEl] = useState(null);

const handleMenuOpen = (event) => {
setAnchorEl(event.currentTarget);
};

const handleMenuClose = () => {
setAnchorEl(null);
};

const handleAreaSelect = (area) => {
onAreaSelect(area); // This will switch to the data page for that area
setAnchorEl(null); // Close the menu
};

return (
<Box sx={{ 
    position: 'sticky', 
    top: 16, 
    zIndex: 100, 
    px: 3,
    py: 1,
}}>
    <Paper 
    elevation={0}
    sx={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
        px: 3,
        py: 1.5,
    }}
    >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton 
            onClick={onHomeClick}
            sx={{ 
            mr: 2,
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            '&:hover': { background: 'rgba(255, 255, 255, 0.2)' }
            }}
        >
            <HomeIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mr: 1 }}>
            Snow Report
        </Typography>
        <Chip 
            label="BETA" 
            size="small" 
            sx={{ 
            background: 'rgba(237, 137, 54, 0.2)',
            color: '#ed8936',
            fontWeight: 600,
            fontSize: '0.7rem'
            }} 
        />
        </Box>

        {/* Area Selector */}
    <Button
        onClick={handleMenuOpen}
        endIcon={<KeyboardArrowDown />}
        sx={{ 
        color: 'white',
        background: 'rgba(255, 255, 255, 0.1)',
        '&:hover': { background: 'rgba(255, 255, 255, 0.2)' },
        borderRadius: 2,
        px: 2,
        py: 1
        }}
    >
        <Box sx={{ textAlign: 'left' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
            {selectedArea.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
            {selectedArea.elevation}
        </Typography>
        </Box>
    </Button>

    {/* Dropdown Menu */}
    <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ 
        sx: { 
            minWidth: 200,
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        } 
        }}
    >
        {Object.values(areas).map((area) => (
        <MenuItem
            key={area.name}
            onClick={() => handleAreaSelect(area)}
            selected={selectedArea.name === area.name}
            sx={{
            py: 1.5,
            '&.Mui-selected': {
                backgroundColor: 'rgba(26, 54, 93, 0.1)'
            }
            }}
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
</Box>
</Paper>
</Box>
);
};

export default Header;