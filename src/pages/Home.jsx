import { Box, Button, Card, CardContent, Container, Grid, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import PsychologyIcon from '@mui/icons-material/Psychology'; // For Career Guidance
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'; // For Edu-venture Services

const serviceCards = [
  {
    title: 'Academics',
    description: 'Pre Nursery to Higher Education with personal attention and expert guidance.',
    icon: <SchoolIcon fontSize="large" />,
  },
  {
    title: 'Primary to Secondary Education',
    description: 'Pre Nursery to Sr KG : Skill activities, Phonetics, Mathematics (With Abacus and Vedic), Hand Writing, Public Speaking etc. 1 to 12th : All subjects, All Languages, Skill activities, Phonetics, Mathematics ( With Abacus and Vedic ), Hand Writing, Public Speaking and G.K.',
    icon: <AutoStoriesIcon fontSize="large" />,
  },
  {
    title: 'Higher Education',
    description: 'All subjects according to NEP with all activities, One to One Career guidance sessions for Higher Education ',
    icon: <MenuBookIcon fontSize="large" />,
  },
  {
    title: 'Multiple Boards',
    description: 'CBSE, ICSE, ISC, IGCSE, NIOS and State Boards.',
    icon: <CastForEducationIcon fontSize="large" />,
  },
  {
    title: 'Career Guidance',
    description: 'One to One Career Counseling sessions for Subject selection, Higher Education in India and abroad with Placement Consultancy. DMIT and Biometric test for Career analysis.',
    icon: <PsychologyIcon fontSize="large" />,
  },
  {
    title: 'Edu-venture Services ',
    description: ' FDP, FTP and SMS Services for PAN India. ',
    icon: <BusinessCenterIcon fontSize="large" />,
  },
];

function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Typography
  component="h1"
  variant="h2"
  gutterBottom
  sx={{
    background: 'linear-gradient(90deg, #E20188 0%, #002661 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 'bold', // Optional, for better visual impact
  }}
>
  Welcome to Raavi Tutorials
</Typography>

          <Typography variant="h5" color="text.secondary" paragraph>
            Expert Home Tuition and Career Counseling services in Indore, Bhopal, Ujjain, Dewas , Dhar, Khargone, Khandwa,  Barwani  Districts and  surrounding areas. With Technology-Enhanced Learning.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  component={RouterLink}
                  to="/student-registration"
                  variant="contained"
                  size="large"
                >
                  Register as Student
                </Button>
              </Grid>
              <Grid item>
                <Button
                  component={RouterLink}
                  to="/teacher-registration"
                  variant="outlined"
                  size="large"
                >
                  Join as Teacher
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Services Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Typography
          component="h2"
          variant="h3"
          align="center"
          color="text.primary"
          gutterBottom
        >
          Our Services
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {serviceCards.map((card, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {card.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography gutterBottom variant="h5" component="h3">
                    {card.title}
                  </Typography>
                  <Typography>
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* About Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="sm">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
          >
            About Us
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" paragraph>
            Raavi Home Tutorials is dedicated to providing high-quality education through personalized attention and expert guidance. Our mission is to build strong academic foundations while nurturing confidence, skills, and lifelong learning habits.
          </Typography>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button component={RouterLink} to="/about" variant="contained">
              Learn More About Us
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;