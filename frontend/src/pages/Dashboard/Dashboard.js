import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Alert,
  Button,
} from '@mui/material';
import {
  Apartment,
  Build,
  Report,
  Payment,
  Notifications,
  People,
  Refresh,
} from '@mui/icons-material';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import { AuthContext } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    apartments: 0,
    maintenance: 0,
    damageReports: 0,
    payments: 0,
    notifications: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const requests = [];

      // Only fetch data for allowed sections based on user role
      if (user?.role === 'admin' || user?.role === 'owner') {
        requests.push(api.get('/apartments').catch(() => ({ data: { data: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { data: [] } }));
      }

      if (user?.role === 'admin') {
        requests.push(api.get('/maintenance').catch(() => ({ data: { data: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { data: [] } }));
      }

      if (['admin', 'owner', 'tenant', 'airbnb_guest'].includes(user?.role)) {
        requests.push(api.get('/notifications').catch(() => ({ data: { data: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { data: [] } }));
      }

      if (['admin', 'owner', 'security'].includes(user?.role)) {
        requests.push(api.get('/airbnb/guests/active').catch(() => ({ data: { data: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { data: [] } }));
      }

      let damageReportsRequest;
      if (user?.role === 'admin') {
        damageReportsRequest = api.get('/damage-reports').catch(() => ({ data: { data: [], total: 0 } }));
      } else if (['owner', 'tenant', 'airbnb_guest'].includes(user?.role)) {
        damageReportsRequest = api.get('/damage-reports/my-reports').catch(() => ({ data: { data: [] } }));
      } else {
        damageReportsRequest = Promise.resolve({ data: { data: [] } });
      }
      requests.push(damageReportsRequest);

      if (user?.role === 'admin') {
        requests.push(api.get('/payments').catch(() => ({ data: { data: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { data: [] } }));
      }

      if (user?.role === 'admin') {
        requests.push(api.get('/users').catch(() => ({ data: { data: [] } })));
      } else {
        requests.push(Promise.resolve({ data: { data: [] } }));
      }

      const [apartmentsRes, maintenanceRes, notificationsRes, airbnbRes, damageReportsRes, paymentsRes, usersRes] = await Promise.all(requests);

      setStats({
        apartments: apartmentsRes.data.data?.length || 0,
        maintenance: maintenanceRes.data.data?.length || 0,
        damageReports: damageReportsRes.data.total || damageReportsRes.data.data?.length || 0,
        payments: paymentsRes.data.data?.length || 0,
        notifications: notificationsRes.data.data?.length || 0,
        users: usersRes.data.total || usersRes.data.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.userMessage || 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Define role-based access for cards
  const getAllowedCards = () => {
    const allCards = [
      {
        title: 'Apartamentos',
        value: stats.apartments,
        icon: <Apartment sx={{ fontSize: 40, color: 'primary.main' }} />,
        color: 'primary.main',
        allowedRoles: ['admin', 'owner'],
      },
      {
        title: 'Reportes de Daños',
        value: stats.damageReports,
        icon: <Report sx={{ fontSize: 40, color: 'error.main' }} />,
        color: 'error.main',
        allowedRoles: ['admin', 'owner', 'tenant', 'airbnb_guest'],
      },
      {
        title: 'Mantenimientos',
        value: stats.maintenance,
        icon: <Build sx={{ fontSize: 40, color: 'secondary.main' }} />,
        color: 'secondary.main',
        allowedRoles: ['admin'],
      },
      {
        title: 'Pagos',
        value: stats.payments,
        icon: <Payment sx={{ fontSize: 40, color: 'success.main' }} />,
        color: 'success.main',
        allowedRoles: ['admin'],
      },
      {
        title: 'Notificaciones',
        value: stats.notifications,
        icon: <Notifications sx={{ fontSize: 40, color: 'warning.main' }} />,
        color: 'warning.main',
        allowedRoles: ['admin', 'owner', 'tenant', 'airbnb_guest'],
      },
      {
        title: 'Usuarios',
        value: stats.users,
        icon: <People sx={{ fontSize: 40, color: 'info.main' }} />,
        color: 'info.main',
        allowedRoles: ['admin'],
      },
    ];

    if (!user) return [];

    return allCards.filter(card => card.allowedRoles.includes(user.role));
  };

  const cards = getAllowedCards();

  if (loading) {
    return <Loading message="Cargando estadísticas..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido al sistema de gestión de conjuntos residenciales - NexoHome
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<Refresh />}
              onClick={fetchStats}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={4} xl={2} key={index}>
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
              <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {card.icon}
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;
