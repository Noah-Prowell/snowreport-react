import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  TextField, 
  Button 
} from '@mui/material';
import emailjs from '@emailjs/browser';

const Footer = () => {
const [formData, setFormData] = useState({
name: '',
email: '',
message: ''
});

// Add the missing isSubmitting state
const [isSubmitting, setIsSubmitting] = useState(false);

const handleInputChange = (e) => {
setFormData({
    ...formData,
    [e.target.name]: e.target.value
});
};

const handleSubmit = async (e) => {
e.preventDefault();
setIsSubmitting(true);

try {
    await emailjs.send(
    'service_vl2xrdk', 
    'template_rag60at',
    {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
    },
    '3MMeSmhHbNadxJwqo'
    );

    alert('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
} catch (error) {
    console.error('EmailJS error:', error);
    alert('Failed to send message. Please try again.');
} finally {
    setIsSubmitting(false);
}
};

return (
<Box sx={{ background: 'rgba(0,0,0,0.8)', color: 'white', mt: 8, py: 6 }}>
    <Container maxWidth="lg">
    <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
        <Typography variant="h6" mb={3} sx={{ fontWeight: 600 }}>
            Questions or comments? Get in touch:
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Name"
            variant="outlined"
            size="small"
            required
            disabled={isSubmitting}
            sx={{ 
                '& .MuiOutlinedInput-root': { 
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                },
                '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)' }
            }}
            />
            <TextField
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            type="email"
            variant="outlined"
            size="small"
            required
            disabled={isSubmitting}
            sx={{ 
                '& .MuiOutlinedInput-root': { 
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                },
                '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)' }
            }}
            />
            <TextField
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Message"
            multiline
            rows={3}
            variant="outlined"
            size="small"
            required
            disabled={isSubmitting}
            sx={{ 
                '& .MuiOutlinedInput-root': { 
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                },
                '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)' }
            }}
            />
            <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ 
                alignSelf: 'flex-start',
                background: 'linear-gradient(45deg, #1976d2, #26a69a)'
            }}
            >
            {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
        </Box>
        </Grid>
        <Grid item xs={12} md={6}>
        <Typography variant="body1" sx={{ mb: 3, color: 'rgba(255,255,255,0.8)' }}>
            Snow Report provides essential weather data for backcountry enthusiasts. Built with real-time NOAA data to help you make safe, informed decisions in the mountains.
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            © 2024 Snow Report. All rights reserved.
        </Typography>
        </Grid>
    </Grid>
    </Container>
</Box>
);
};

export default Footer;