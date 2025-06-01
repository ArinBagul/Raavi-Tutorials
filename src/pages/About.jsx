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
  "Flexible scheduling",
  "Regular Progress tracking and feedback through DTD learning Modules and Test Series",
  "Preparation for competitive exams and Olympiads",
  "Special focus on building conceptual understanding",
  "Safe and comfortable learning environment",
  "Affordable fee structure with flexible payment options",
  "Free to Choose Male/Female Tutor according to requirement ",
  "Always ready to accept your suggestions to improve us for your kids",
  "Last but not least – We don’t believe in syllabus but have strong team for your ward’s bright marksheet"
];

const keyHighlights = [
  {
    icon: <SchoolIcon fontSize="large" color="primary" />,
    title: "Comprehensive Education",
    description:
      "From Pre-Nursery to Post-Graduation across multiple boards including CBSE, ICSE, IB, and State boards .",
  },
  {
    icon: <GroupIcon fontSize="large" color="primary" />,
    title: "Expert Faculty",
    description:
      "We supply Qualified and experienced tutors trained by  our special designed Faculty Development program. Who are passionate about education and all over development.",
  },
  {
    icon: <LocationOnIcon fontSize="large" color="primary" />,
    title: "Wide Coverage",
    description:
      "Serving students in Indore, Bhopal, Dewas, Ujjain, Khargone, Barwani districts and Surrounding areas .",
  },
  {
    icon: <EmojiEventsIcon fontSize="large" color="primary" />,
    title: "Beyond Academics",
    description:
      "Special Classes , guidance and Support for Abacus, Vedic Mathematics, Public Speaking, Hand writing, Olympiads, Spell Bee  and Other extracurricular activities like Classical /Western Music, Classical Classical /Western dance, and Indian/ Foreign Languages.",
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
            Building Strong Academic Foundation Since 2014
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Raavi Home Tutorials is dedicated to providing high- quality education through personal attention and expert guidance. Since last 10 years we are building strong academic foundation while nurturing confidence, skills and lifelong learnings. We are committed to delivering a transformative educational experience—where creativity, innovation, and personalized strategies make every student’s journey to take fly to the sky.
          </Typography>
        </Box>

        {/* Key Highlights */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {keyHighlights.map((highlight, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
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
            Raavi Tutorials believes that every Child has unique potential waiting to be unlocked. Our mission is to create a supportive educational community where students, parents, and tutors work together to empower students with the knowledge, skills, and confidence they need to achieve academic excellence to unlock their academic potential and inspiration to personal as well as social growth.
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
