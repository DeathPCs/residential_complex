import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  Apartment,
  Build,
  Report,
  Payment,
  Notifications,
  People,
  Hotel,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ open, onClose, variant = 'temporary' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = React.useContext(AuthContext);

  const getMenuItems = (role) => {
    const allItems = [
      { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['admin', 'owner', 'tenant', 'airbnb_guest'] },
      { text: 'Apartamentos', icon: <Apartment />, path: '/apartments', roles: ['admin', 'owner'] },
      { text: 'Airbnb', icon: <Hotel />, path: '/airbnb', roles: ['admin', 'owner', 'security'] },
      { text: 'Reportes de Daños', icon: <Report />, path: '/damage-reports', roles: ['admin', 'owner', 'tenant', 'airbnb_guest'] },
      { text: 'Mantenimientos', icon: <Build />, path: '/maintenance', roles: ['admin'] },
      { text: 'Pagos', icon: <Payment />, path: '/payments', roles: ['admin'] },
      { text: 'Usuarios', icon: <People />, path: '/users', roles: ['admin'] },
      { text: 'Notificaciones', icon: <Notifications />, path: '/notifications', roles: ['admin', 'owner', 'tenant', 'airbnb_guest'] },
    ];

    return allItems.filter(item => item.roles.includes(role));
  };

  const menuItems = user ? getMenuItems(user.role) : [];

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <List sx={{ width: 280, pt: 2, height: '100%', overflow: 'hidden' }}>
      <ListItem>
        <ListItemText
          primary="NexoHome"
          primaryTypographyProps={{
            variant: 'h6',
            fontWeight: 'bold',
            color: 'primary.main',
          }}
        />
      </ListItem>
      <Divider sx={{ my: 1 }} />
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              selected={isActive}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  if (variant === 'permanent') {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            top: 64, // Header height
            height: 'calc(100vh - 64px)',
            borderRight: 'none', // Remove border
            position: 'fixed',
            left: 0,
            overflow: 'hidden', // Prevent scrollbar
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          top: 64, // Header height
          height: 'calc(100vh - 64px)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
