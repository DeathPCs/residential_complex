import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Paper,
  InputAdornment,
  Grid,
  Alert,
} from '@mui/material';
import {
  Add,
  Search,
  Build,
  Event,
  Celebration,
  People,
  Refresh,
} from '@mui/icons-material';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

const Maintenance = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    area: '',
    scheduledDate: '',
    type: 'mantenimiento',
  });

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/maintenance');
      setMaintenances(response.data.data || []);
    } catch (error) {
      console.error('Error fetching maintenances:', error);
      setError(error.userMessage || 'Error al cargar eventos');
      setMaintenances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/maintenance', formData);
      setOpen(false);
      setFormData({ title: '', description: '', area: '', scheduledDate: '', type: 'mantenimiento' });
      fetchMaintenances();
    } catch (error) {
      console.error('Error creating maintenance:', error);
      setError(error.userMessage || 'Error al crear evento');
    }
  };

  const filteredMaintenances = maintenances.filter((maintenance) => {
    const matchesSearch = maintenance.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.area?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getIcon = (type) => {
    if (type && type.toLowerCase().includes("manten")) return <Build />;
    if (type && type.toLowerCase().includes("fiesta")) return <Celebration />;
    if (type && type.toLowerCase().includes("reuni")) return <People />;
    return <Event />;
  };

  const getIconColor = (type) => {
    if (type && type.toLowerCase().includes("manten")) return "#ee9738";
    if (type && type.toLowerCase().includes("fiesta")) return "#5c3eee";
    if (type && type.toLowerCase().includes("reuni")) return "#3eb063";
    return "#2586b8";
  };

  if (loading) {
    return <Loading message="Cargando eventos..." />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
           Mantenimientos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de solicitudes de mantenimiento del conjunto residencial
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
              onClick={fetchMaintenances}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por título, descripción o área"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                backgroundColor: '#f7fafd',
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{
              backgroundColor: '#004272',
              '&:hover': { backgroundColor: '#002a4a' },
              borderRadius: '8px',
            }}
          >
            Agregar evento
          </Button>
        </Box>

        {filteredMaintenances.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No hay eventos registrados.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredMaintenances.map((maintenance) => (
              <Grid item xs={12} sm={6} md={4} key={maintenance.id}>
                <Card sx={{
                  borderRadius: '14px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  backgroundColor: '#fff',
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '50%',
                        backgroundColor: getIconColor(maintenance.type),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}>
                        {getIcon(maintenance.type)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2586b8' }}>
                          {maintenance.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" numberOfLines={2}>
                          {maintenance.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {maintenance.type ? maintenance.type.toUpperCase() : "MANTENIMIENTO"} · {maintenance.scheduledDate
                            ? new Date(maintenance.scheduledDate).toLocaleDateString()
                            : "Sin fecha"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Área: {maintenance.area}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', color: '#2586b8' }}>
          Registrar mantenimiento
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Título"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Área"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              placeholder="piscina, parque, etc."
              fullWidth
              required
            />
            <TextField
              label="Fecha programada"
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Tipo"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="mantenimiento, fiesta, etc."
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Maintenance;