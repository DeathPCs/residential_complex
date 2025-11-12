import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#004272',
      light: '#2f80ff',
      dark: '#002a4a',
    },
    secondary: {
      main: '#25b884',
      light: '#4fc3a1',
      dark: '#1a7f5d',
    },
    background: {
      default: '#F4F6F8',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          '&.MuiButton-contained': {
            backgroundColor: '#004272',
            '&:hover': {
              backgroundColor: '#002a4a',
            },
          },
          '&.MuiButton-outlined': {
            backgroundColor: '#fff',
            color: '#004272',
            borderColor: '#004272',
            '&:hover': {
              backgroundColor: '#f0f4f8',
              borderColor: '#002a4a',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#fff',
            '& fieldset': {
              borderColor: '#BBC7D0',
            },
            '&:hover fieldset': {
              borderColor: '#004272',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#004272',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          padding: '25px',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            paddingLeft: '16px',
            paddingRight: '16px',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 280,
          '@media (min-width:900px)': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: 280,
            transition: 'width 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
          },
        },
      },
    },
  },
});

export default theme;
