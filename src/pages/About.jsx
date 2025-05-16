import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SchoolIcon from "@mui/icons-material/School";
import GroupIcon from "@mui/icons-material/Group";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const features = [
  "Expert tutors for all subjects and grades",
  "Personalized attention and customized learning plans",
  "Flexible scheduling and home tutoring options",
  "Regular progress tracking and feedback",
  "Preparation for competitive exams and Olympiads",
  "Special focus on building conceptual understanding",
  "Safe and comfortable learning environment",
  "Affordable fee structure with flexible payment options",
];

const keyHighlights = [
  {
    icon: <SchoolIcon fontSize="large" color="primary" />,
    title: "Comprehensive Education",
    description:
      "From Pre-Nursery to Post-Graduation across multiple boards including CBSE, ICSE, IB, and State boards",
  },
  {
    icon: <GroupIcon fontSize="large" color="primary" />,
    title: "Expert Faculty",
    description:
      "Qualified and experienced teachers who are passionate about education and student success",
  },
  {
    icon: <LocationOnIcon fontSize="large" color="primary" />,
    title: "Wide Coverage",
    description:
      "Serving students in Indore, Bhopal, Dhar, Khargone, and surrounding areas",
  },
  {
    icon: <EmojiEventsIcon fontSize="large" color="primary" />,
    title: "Beyond Academics",
    description:
      "Support for Olympiads, Spell Bee, and extracurricular activities like Music, Dance, and Languages",
  },
];

function About() {
  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              background: "linear-gradient(90deg, #E20188 0%, #002661 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold", // Optional
            }}
          >
            About Raavi Tutorials
          </Typography>

          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Building Strong Academic Foundations Since 2010
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Raavi Home Tutorials is dedicated to providing high-quality
            education through personalized attention and expert guidance. Our
            mission is to build strong academic foundations while nurturing
            confidence, skills, and lifelong learning habits.
          </Typography>
        </Box>

        {/* Key Highlights */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {keyHighlights.map((highlight, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                  <Box sx={{ mb: 2 }}>{highlight.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {highlight.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {highlight.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Features List */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              Why Choose Us
            </Typography>
            <List>
              {features
                .slice(0, Math.ceil(features.length / 2))
                .map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleOutlineIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mt: { xs: 0, md: 8 } }}>
              <List>
                {features
                  .slice(Math.ceil(features.length / 2))
                  .map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleOutlineIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
              </List>
            </Box>
          </Grid>
        </Grid>

        {/* Mission Statement */}
        <Box sx={{ bgcolor: "background.paper", p: 4, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom align="center">
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph align="center">
            At Raavi Tutorials, we believe every student has unique potential
            waiting to be unlocked. Our mission is to provide personalized
            education that not only helps students excel academically but also
            develops critical thinking, creativity, and confidence. We strive to
            create a supportive learning environment where students can grow,
            explore, and achieve their full potential.
          </Typography>
          <Typography variant="h6" align="center" color="primary.main">
            "Education is not preparation for life; education is life itself."
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default About;
