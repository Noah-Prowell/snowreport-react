import React from 'react';
import {
Typography,
Container,
Grid,
Card,
CardContent,
Button,
Box,
IconButton,
Divider
} from '@mui/material';
import {
GitHub as GitHubIcon,
LinkedIn as LinkedInIcon,
Email as EmailIcon,
Language as WebsiteIcon,
Cloud as CloudSnow,
Analytics as AnalyticsIcon,
TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const AboutPage = ({ onNavigateToHome }) => {
const socialLinks = [
{
    name: 'GitHub',
    icon: <GitHubIcon />,
    url: 'https://github.com/Noah-Prowell',
    color: '#333'
},
{
    name: 'LinkedIn',
    icon: <LinkedInIcon />,
    url: 'https://linkedin.com/in/noah-prowell',
    color: '#0077B5'
},
{
    name: 'Email',
    icon: <EmailIcon />,
    url: 'mailto:noahprowell@gmail.com',
    color: '#EA4335'
},
{
    name: 'Website',
    icon: <WebsiteIcon />,
    url: 'https://noah-prowell.github.io',
    color: '#4285F4'
}
];

const siteFeatures = [
{
    icon: <CloudSnow />,
    title: 'Snow Depth Tracking',
    description: 'Real-time monitoring and visualization of snow depth measurements across different locations.'
},
{
    icon: <AnalyticsIcon />,
    title: 'Data Analytics',
    description: 'Advanced charts and analytics to help understand precipitation patterns and weather trends.'
},
{
    icon: <TrendingUpIcon />,
    title: 'Historical Analysis',
    description: 'Compare current conditions with historical data to identify long-term weather patterns.'
}
];

return (
<Container maxWidth="lg" sx={{ py: 4 }}>
    {/* Header Section */}
    <Box textAlign="center" mb={6}>
    <Typography variant="h2" component="h1" gutterBottom>
        About This Project
    </Typography>
    <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
        A comprehensive weather data platform focused on snow depth monitoring and precipitation analysis
    </Typography>
    </Box>

    {/* Site Features Section */}
    <Box mb={6}>
    <Typography variant="h4" component="h2" gutterBottom textAlign="center" mb={4}>
        What This Site Offers
    </Typography>
    <Grid container spacing={4}>
        {siteFeatures.map((feature, index) => (
        <Grid item xs={12} md={4} key={index}>
            <Card 
            sx={{ 
                height: '100%',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
                }
            }}
            >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                {React.cloneElement(feature.icon, { sx: { fontSize: 48 } })}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                {feature.description}
                </Typography>
            </CardContent>
            </Card>
        </Grid>
        ))}
    </Grid>
    </Box>

    <Divider sx={{ my: 6 }} />

    {/* About Me Section */}
    <Grid container spacing={6} alignItems="center">
    <Grid item xs={12} md={8}>
        <Typography variant="h4" component="h2" gutterBottom>
        About Me
        </Typography>
        <Typography variant="body1" paragraph>
            As both a snow sports enthusiast and data enthusiast, I found myself constantly 
            checking multiple weather sources and snow reports before heading out to the mountains. 
            I wanted a single, clean interface that could give me the snow depth and precipitation 
            data I needed to make informed decisions about my ski and snowboard adventures.
        </Typography>
        <Typography variant="body1" paragraph>
        This project started as a personal tool to visualize historical and current snow 
        conditions at my favorite mountain locations. Built with React and Material-UI, 
        it pulls data from NOAA weather stations and presents it through interactive charts 
        and tables. The goal was to create something that fellow snow sports enthusiasts 
        could use to quickly understand snow conditions and trends.
        </Typography>
        <Typography variant="body1" paragraph>
        What began as a weekend project evolved into a comprehensive data platform. 
        I integrated multiple chart types, historical comparisons, and real-time data 
        to help users understand not just current conditions, but seasonal patterns and 
        trends. Whether you're planning a backcountry tour or just curious about snowfall 
        at your local resort, this tool provides the data-driven insights you need.
        </Typography>

        {/* Skills/Technologies */}
        <Box mt={3}>
        <Typography variant="h6" gutterBottom>
            Technologies Used
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
            {['React', 'Material-UI', 'JavaScript', 'Data Visualization', 'Weather APIs'].map((tech) => (
            <Button
                key={tech}
                variant="outlined"
                size="small"
                disabled
                sx={{ 
                borderRadius: 20,
                textTransform: 'none',
                '&.Mui-disabled': {
                    borderColor: 'primary.main',
                    color: 'primary.main'
                }
                }}
            >
                {tech}
            </Button>
            ))}
        </Box>
        </Box>
    </Grid>

    <Grid item xs={12} md={4}>
        <Card>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h6" gutterBottom>
            Let's Connect
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
            Feel free to reach out for collaborations, questions, or just to say hello!
            </Typography>
            
            <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1}>
            {socialLinks.map((social) => (
                <IconButton
                key={social.name}
                component="a"
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                    color: social.color,
                    '&:hover': {
                    backgroundColor: `${social.color}15`,
                    transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease-in-out'
                }}
                aria-label={`Visit my ${social.name}`}
                >
                {social.icon}
                </IconButton>
            ))}
            </Box>

            <Box mt={3}>
            <Button
                variant="contained"
                component="a"
                href="mailto:noahprowell@gmail.com"
                startIcon={<EmailIcon />}
                sx={{ textTransform: 'none' }}
            >
                Get In Touch
            </Button>
            </Box>
        </CardContent>
        </Card>
    </Grid>
    </Grid>

    {/* Call to Action */}
    <Box textAlign="center" mt={6} p={4} sx={{ backgroundColor: 'grey.50', borderRadius: 2 }}>
    <Typography variant="h5" gutterBottom>
        Explore the Data
    </Typography>
    <Typography variant="body1" color="text.secondary" paragraph>
        Ready to dive into the weather data? Check out the interactive charts and real-time monitoring tools.
    </Typography>
    <Button
        variant="contained"
        size="large"
        sx={{ textTransform: 'none' }}
        onClick={onNavigateToHome}
    >
        Back to Dashboard
    </Button>
    </Box>
</Container>
);
};

export default AboutPage;