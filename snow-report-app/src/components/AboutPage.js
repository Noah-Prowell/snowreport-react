import React, {} from 'react';
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  IconButton,
  Divider,
  LinearProgress,
  Avatar,
  Chip,
  Paper,
  useTheme
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Language as WebsiteIcon,
  Cloud as CloudSnow,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';
// import Carousel from './Carousel'

const AboutPage = ({ onNavigateToHome }) => {
  const theme = useTheme();

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

  // Impact Metrics
  const metrics = [
    { value: '5+', label: 'Weather Stations', icon: <CloudSnow /> },
    { value: '1000+', label: 'Data Points Daily', icon: <StorageIcon /> },
    { value: '100%', label: 'Real-time Data', icon: <SpeedIcon /> },
    { value: '4', label: 'Chart Types', icon: <ShowChartIcon /> }
  ];

  // Skills with proficiency levels
  const skills = [
    { category: 'Data Analysis & Statistics', level: 90, proficiency: 'Expert' },
    { category: 'Python & Data Science Libraries', level: 85, proficiency: 'Advanced' },
    { category: 'Machine Learning & Predictive Models', level: 85, proficiency: 'Advanced' },
    { category: 'Time Series Analysis', level: 75, proficiency: 'Proficient' },
    { category: 'Data Visualization & Storytelling', level: 70, proficiency: 'Proficient' },
    { category: 'Weather Data & Meteorology', level: 75, proficiency: 'Proficient' }
  ];

  // Project Timeline
  const timeline = [
    {
      phase: 'Concept',
      date: 'Week 1',
      description: 'Initial idea and requirements gathering',
      icon: '💡'
    },
    {
      phase: 'MVP',
      date: 'Week 2',
      description: 'Basic SNOTEL/USDA API integration and data display',
      icon: '🚀'
    },
    {
      phase: 'Enhanced Features',
      date: 'Week 3',
      description: 'Multiple charts, historical data, and UI polish',
      icon: '⭐'
    },
    {
      phase: 'Deployment',
      date: 'Week 4',
      description: 'Azure deployment and production optimization',
      icon: '🌐'
    }
  ];

  // Feature highlights
  const features = [
    {
      icon: <CloudSnow />,
      title: 'Multi-Location Tracking',
      description: 'Monitor snow conditions across 9+ mountain locations in real-time with historical comparisons.',
      tech: ['React', 'SNOTEL/USDA API', 'Recharts']
    },
    {
      icon: <AnalyticsIcon />,
      title: 'Advanced Analytics',
      description: 'Interactive charts showing snow depth, precipitation, and combined weather patterns.',
      tech: ['Data Visualization', 'Time Series Analysis']
    },
    {
      icon: <TrendingUpIcon />,
      title: 'Historical Insights',
      description: 'Compare current conditions with historical data to identify seasonal trends and patterns.',
      tech: ['Data Processing', 'Statistical Analysis']
    }
  ];

  const getProficiencyColor = (level) => {
    if (level >= 85) return theme.palette.success.main;
    if (level >= 70) return theme.palette.info.main;
    return theme.palette.warning.main;
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 50%, #3182ce 100%)',
          color: 'white',
          py: 12,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label="FULL-STACK PROJECT"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    mb: 2
                  }}
                />
              </Box>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2,
                  mb: 2
                }}
              >
                The Snow Report
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  opacity: 0.95,
                  fontWeight: 400,
                  lineHeight: 1.6
                }}
              >
                A comprehensive weather data platform for snow enthusiasts, combining real-time SNOTEL/USDA data with intuitive visualizations to help you make informed decisions.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={onNavigateToHome}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                    },
                    transition: 'all 0.3s ease',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4
                  }}
                >
                  View Dashboard
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component="a"
                  href="#contact"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4
                  }}
                >
                  Get in Touch
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Avatar
                  src="/profile_photo.JPG" // User will add their photo here
                  alt="Profile Photo"
                  variant="rounded"
                  sx={{
                    width: { xs: 200, md: 380 },
                    height: { xs: 200, md: 380 },
                    border: '6px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    transition: 'all 0.3s ease',
                    borderRadius: 4,
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 25px 70px rgba(0,0,0,0.4)'
                    },
                    '& img': {
                      objectFit: 'cover',
                      objectPosition: 'left top'
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Impact Metrics Section */}
      <Container maxWidth="lg" sx={{ mt: -6, mb: 8, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          {metrics.map((metric, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card
                elevation={3}
                sx={{
                  textAlign: 'center',
                  py: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 1 }}>
                    {React.cloneElement(metric.icon, { sx: { fontSize: 40 } })}
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {metric.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Skills Section */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            textAlign="center"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            Technical Expertise
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Data science expertise applied to weather analysis and visualization
          </Typography>

          <Grid container spacing={3}>
            {skills.map((skill, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'white',
                      boxShadow: 3,
                      transform: 'translateX(8px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {skill.category}
                    </Typography>
                    <Chip
                      label={skill.proficiency}
                      size="small"
                      sx={{
                        bgcolor: getProficiencyColor(skill.level),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={skill.level}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getProficiencyColor(skill.level),
                        borderRadius: 4
                      }
                    }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 8 }} />

        {/* Project Timeline */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            textAlign="center"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            Development Journey
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            From initial concept to production deployment
          </Typography>

          <Box sx={{ position: 'relative', py: 4 }}>
            {/* Timeline Line */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 4,
                bgcolor: 'primary.main',
                transform: 'translateY(-50%)',
                display: { xs: 'none', md: 'block' }
              }}
            />

            <Grid container spacing={2}>
              {timeline.map((item, index) => (
                <Grid item xs={12} md={3} key={index}>
                  <Box
                    sx={{
                      position: 'relative',
                      textAlign: 'center',
                      '&:hover .timeline-card': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    {/* Timeline Circle */}
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        fontSize: '2rem',
                        boxShadow: '0 4px 12px rgba(26, 54, 93, 0.4)',
                        position: 'relative',
                        zIndex: 2,
                        border: '4px solid white'
                      }}
                    >
                      {item.icon}
                    </Box>

                    <Card
                      className="timeline-card"
                      elevation={2}
                      sx={{
                        p: 2.5,
                        minHeight: 140,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                        {item.phase}
                      </Typography>
                      <Chip
                        label={item.date}
                        size="small"
                        sx={{ mb: 1.5, bgcolor: 'grey.100' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Card>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        <Divider sx={{ my: 8 }} />

        {/* Feature Highlights */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            textAlign="center"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            Key Features
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Powerful tools for comprehensive weather data analysis
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                      '& .feature-icon': {
                        transform: 'scale(1.1) rotate(5deg)'
                      }
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      className="feature-icon"
                      sx={{
                        color: 'primary.main',
                        mb: 2,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {React.cloneElement(feature.icon, { sx: { fontSize: 56 } })}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
                      {feature.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {feature.tech.map((tech, i) => (
                        <Chip
                          key={i}
                          label={tech}
                          size="small"
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'white',
                            fontWeight: 500
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 8 }} />

        {/* About Me Section */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            textAlign="center"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            About the Creator
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Passionate about data, mountains, and building useful tools
          </Typography>

          <Grid container spacing={6} alignItems="flex-start">
            <Grid item xs={12} md={8}>
              <Paper elevation={0} sx={{ p: 4, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                  As a data scientist and snow sports enthusiast, I found myself constantly
                  checking multiple weather sources and snow reports before heading out to the mountains.
                  I saw an opportunity to apply my data analysis skills to create a single, insightful
                  interface that could transform raw weather data into actionable intelligence for
                  planning mountain adventures.
                </Typography>
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                  This passion project combines my expertise in data science with my love for the mountains.
                  By analyzing SNOTEL/USDA weather station data through statistical methods and time series analysis,
                  I built a platform that doesn't just show current conditions—it reveals patterns, trends,
                  and insights hidden in the data. The goal was to help fellow snow enthusiasts make
                  data-driven decisions about when and where to ride.
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                  What began as exploratory data analysis in Jupyter notebooks evolved into a full-stack
                  application. I applied data visualization best practices, built custom analytics pipelines,
                  and created interactive dashboards to make complex weather patterns accessible and
                  understandable. Whether you're planning a backcountry tour or analyzing seasonal snowfall
                  trends, this tool brings data science to the slopes.
                </Typography>

                {/* Technologies */}
                <Box mt={4}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Tech Stack
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'SQL', 'R', 'Jupyter', 'Statistical Analysis', 'React', 'Data APIs', 'Time Series Forecasting'].map((tech) => (
                      <Chip
                        key={tech}
                        label={tech}
                        variant="outlined"
                        sx={{
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          fontWeight: 500,
                          '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'white'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Contact Card */}
            <Grid item xs={12} md={4}>
              <Card
                id="contact"
                elevation={3}
                sx={{
                  position: 'sticky',
                  top: 24,
                  background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)',
                  color: 'white'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                    Let's Connect
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ opacity: 0.9, mb: 3 }}>
                    Feel free to reach out for collaborations, questions, or just to say hello!
                  </Typography>

                  <Box display="flex" justifyContent="center" flexWrap="wrap" gap={1.5} mb={3}>
                    {socialLinks.map((social) => (
                      <IconButton
                        key={social.name}
                        component="a"
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.2)',
                            transform: 'scale(1.15) rotate(5deg)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                        aria-label={`Visit my ${social.name}`}
                      >
                        {social.icon}
                      </IconButton>
                    ))}
                  </Box>

                  <Button
                    variant="contained"
                    component="a"
                    href="mailto:noahprowell@gmail.com"
                    fullWidth
                    startIcon={<EmailIcon />}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                      },
                      transition: 'all 0.3s ease',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5
                    }}
                  >
                    Get In Touch
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        <Divider sx={{ my: 8 }} />

        {/* Photo Carousel Section */}
        {/* <Box sx={{ mb: 10 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            textAlign="center"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            Mountain Moments
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
          >
            Photos from the field where data science meets mountain adventures
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '550px', py: 4 }}>
            <Carousel
              items={[
                {
                  title: 'Mountain Research',
                  description: 'Collecting snow data in the backcountry',
                  id: 1,
                  image: '/photo1.jpg' // Replace with your actual photo filename
                },
                {
                  title: 'Peak Conditions',
                  description: 'Analyzing snowpack and weather patterns',
                  id: 2,
                  image: '/photo2.jpg' // Replace with your actual photo filename
                },
                {
                  title: 'Field Work',
                  description: 'Where passion meets data collection',
                  id: 3,
                  image: '/photo3.jpg' // Replace with your actual photo filename
                }
              ]}
              baseWidth={400}
              autoplay={true}
              autoplayDelay={4000}
              pauseOnHover={true}
              loop={true}
              round={false}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 8 }} /> */}
        {/* Call to Action */}
        <Box
          textAlign="center"
          sx={{
            background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
            borderRadius: 3,
            p: 6,
            border: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <CloudSnow sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to Explore?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
            Check out real-time snow conditions, interactive charts, and comprehensive weather data for your favorite mountain locations.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onNavigateToHome}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 5,
              py: 1.5,
              fontSize: '1.1rem',
              boxShadow: 4,
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: 6
              },
              transition: 'all 0.3s ease'
            }}
          >
            View Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutPage;
