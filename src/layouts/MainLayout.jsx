import { useState } from "react";
import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Link,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import SchoolIcon from "@mui/icons-material/School";
import LoginIcon from "@mui/icons-material/Login";
import { useAuth } from "../contexts/AuthContext";
import { useDialog } from "../contexts/DialogContext";

import RaaviLogoWhite from "../assets/RaaviLogo-White.png";

const pages = [
  { name: "Home", path: "/", icon: <HomeIcon /> },
  { name: "About", path: "/about", icon: <InfoIcon /> },
  { name: "Contact", path: "/contact", icon: <ContactMailIcon /> },
];

const userTypePages = {
  student: [{ name: "Student Dashboard", path: "/student-dashboard" }],
  teacher: [{ name: "Teacher Dashboard", path: "/teacher-dashboard" }],
  admin: [{ name: "Admin Panel", path: "/admin-panel" }],
};

export function MainLayout() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { showConfirm, showSnackbar } = useDialog();
  const location = useLocation();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleSignOut = () => {
    showConfirm({
      title: "Sign Out",
      message: "Are you sure you want to sign out?",
      onConfirm: async () => {
        const { error } = await signOut();
        if (error) {
          showSnackbar({
            message: "Error signing out. Please try again.",
            severity: "error",
          });
        } else {
          showSnackbar({
            message: "Successfully signed out",
            severity: "success",
          });
        }
      },
    });
  };

  const getUserMenu = () => {
    if (!user) {
      return [
        { name: "Student Login", path: "/student-login" },
        { name: "Teacher Login", path: "/teacher-login" },
        { name: "Admin Login", path: "/admin-login" },
      ];
    }

    const userSpecificPages = userTypePages[profile?.type] || [];
    return [...userSpecificPages, { name: "Sign Out", onClick: handleSignOut }];
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Raavi Tutorials
      </Typography>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem key={page.name} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={page.path}
              selected={location.pathname === page.path}
            >
              <ListItemIcon>{page.icon}</ListItemIcon>
              <ListItemText primary={page.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo - Desktop */}
            <Link
              component={RouterLink}
              to="/"
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                mr: 2,
              }}
            >
              <Box
                component="img"
                src={RaaviLogoWhite}
                alt="Raavi Logo"
                sx={{ height: 55 , width: 100 }} // Adjust height as needed
              />
            </Link>

            {/* Mobile Menu */}
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Logo - Mobile */}
            <Link
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src={RaaviLogoWhite}
                alt="Raavi Logo"
                sx={{ height: 70 , width: 130 }} // Smaller height for mobile
              />
            </Link>

            {/* Desktop Menu */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages.map((page) => (
                <Button
                  key={page.name}
                  component={RouterLink}
                  to={page.path}
                  onClick={handleCloseNavMenu}
                  sx={{
                    my: 2,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {page.icon}
                  {page.name}
                </Button>
              ))}
            </Box>

            {/* User Menu */}
            {user ? (
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={profile?.name} src={profile?.photo}>
                      {profile?.name?.[0]?.toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {getUserMenu().map((item) => (
                    <MenuItem
                      key={item.name}
                      onClick={() => {
                        handleCloseUserMenu();
                        item.onClick ? item.onClick() : null;
                      }}
                      component={item.path ? RouterLink : "li"}
                      to={item.path}
                    >
                      <Typography textAlign="center">{item.name}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  component={RouterLink}
                  to="/student-login"
                  startIcon={<LoginIcon />}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  component={RouterLink}
                  to="/student-registration"
                >
                  Register
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
        }}
      >
        <Outlet />
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            {"© "}
            <Link
              color="inherit"
              component={RouterLink}
              to="/"
              sx={{ textDecoration: "none" }}
            >
              Raavi Tutorials
            </Link>{" "}
            {new Date().getFullYear()}
            {". All rights reserved."}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
