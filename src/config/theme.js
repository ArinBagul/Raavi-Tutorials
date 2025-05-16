import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#E20188',
      light: '#74AEEB',
      dark: '#002661',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFC857',
      light: '#FFD680',
      dark: '#D4A033',
      contrastText: '#000000',
    },
    error: {
      main: '#F95F62',
      light: '#FA8588',
      dark: '#D43A3D',
    },
    warning: {
      main: '#FFB547',
      light: '#FFC676',
      dark: '#CC8F38',
    },
    info: {
      main: '#47B4FF',
      light: '#76C7FF',
      dark: '#388FCF',
    },
    success: {
      main: '#34C759',
      light: '#5FD37B',
      dark: '#28A046',
    },
    grey: {
      50: '#F8F9FA',
      100: '#F1F3F5',
      200: '#E9ECEF',
      300: '#DEE2E6',
      400: '#CED4DA',
      500: '#ADB5BD',
      600: '#868E96',
      700: '#495057',
      800: '#343A40',
      900: '#212529',
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212529',
      secondary: '#495057',
      disabled: '#ADB5BD',
    },
    custom: {
    gradients: {
      primary: 'linear-gradient(90deg, #E20188 0%, #002661 100%)',
    },
  },
  },
  typography: {
    fontFamily: "'Poppins', 'Inter', 'Nunito', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.75rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.2,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.5rem',
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.2,
    },
    subtitle1: {
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.05)',
    '0px 8px 16px rgba(0, 0, 0, 0.05)',
    '0px 16px 24px rgba(0, 0, 0, 0.05)',
    '0px 24px 32px rgba(0, 0, 0, 0.05)',
    '0px 32px 40px rgba(0, 0, 0, 0.05)',
    '0px 40px 48px rgba(0, 0, 0, 0.05)',
    '0px 48px 56px rgba(0, 0, 0, 0.05)',
    '0px 56px 64px rgba(0, 0, 0, 0.05)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});