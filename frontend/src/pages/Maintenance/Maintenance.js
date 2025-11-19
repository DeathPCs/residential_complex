import React, { useEffect, useState, useContext } from 'react';
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
  Paper,
  InputAdornment,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add,
  Search,
  Edit,
  Delete,
  Refresh,
  CheckCircle,
} from '@mui/icons-material';
import api, { updateEvent, deleteEvent, updateMaintenanceStatus } from '../../services/api';
import Loading from '../../components/common/Loading';
import { AuthContext } from '../../context/AuthContext';

const Maintenance = () => {
  const { user } = useContext(AuthContext);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    area: '',
    scheduledDate: '',
    completedDate: '',
    priority: '',
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
      setError(error.userMessage || 'Error al cargar mantenimientos');
      setMaintenances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/maintenance', formData);
      setOpen(false);
      setFormData({ title: '', description: '', area: '', scheduledDate: '', completedDate: '', priority: ''});
      fetchMaintenances();
    } catch (error) {
      console.error('Error creating maintenance:', error);
      setError(error.userMessage || 'Error al crear mantenimiento');
    }
  };

  const handleUpdate = async () => {
    try {
      await updateEvent(editing.id, formData);
      setOpen(false);
      setEditing(null);
      setFormData({ title: '', description: '', area: '', scheduledDate: '', completedDate: '', priority: '' });
      fetchMaintenances();
    } catch (error) {
      console.error('Error updating maintenance:', error);
      setError(error.userMessage || 'Error al actualizar mantenimiento');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este mantenimiento?')) {
      try {
        await deleteEvent(id);
        fetchMaintenances();
      } catch (error) {
        console.error('Error deleting maintenance:', error);
        setError(error.userMessage || 'Error al eliminar mantenimiento');
      }
    }
  };

  const handleEdit = (maintenance) => {
    setEditing(maintenance);
    setFormData({
      title: maintenance.title,
      description: maintenance.description,
      area: maintenance.area,
      scheduledDate: maintenance.scheduledDate ? maintenance.scheduledDate.split('T')[0] : '',
      completedDate: maintenance.completedDate ? maintenance.completedDate.split('T')[0] : '',
      priority: maintenance.priority || '',
    });
    setOpen(true);
  };

  const handleStatusToggle = async (id, currentStatus) => {
    if (currentStatus === 'completed') return; // No permitir cambiar de completado

    const nextStatus = currentStatus === 'pending' ? 'in_progress' : 'completed';

    // Optimistically update the local state
    setMaintenances(prev => prev.map(m => m.id === id ? { ...m, status: nextStatus } : m));

    try {
      await updateMaintenanceStatus(id, nextStatus);
    } catch (error) {
      // Revert the change on error
      setMaintenances(prev => prev.map(m => m.id === id ? { ...m, status: currentStatus } : m));
      console.error('Error updating status:', error);
      setError(error.userMessage || 'Error al actualizar estado');
    }
  };

  const filteredMaintenances = maintenances.filter((maintenance) => {
    const matchesSearch = maintenance.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.area?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const columns = [
    {
      field: 'title',
      headerName: 'Título',
      width: 200,
    },
    {
      field: 'description',
      headerName: 'Descripción',
      width: 300,
    },
    {
      field: 'area',
      headerName: 'Área',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'scheduledDate',
      headerName: 'Fecha Programada',
      width: 150,
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('es-CO');
      },
    },
    {
      field: 'completedDate',
      headerName: 'Fecha Completada',
      width: 150,
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('es-CO');
      },
    },
    {
      field: 'priority',
      headerName: 'Prioridad',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'high' ? 'error' :
            params.value === 'medium' ? 'warning' : 'default'
          }
          size="small"
        />
      ),
    },
    ...(user?.role === 'admin' ? [{
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {params.row.status !== 'completed' && (
            <IconButton
              color="success"
              onClick={() => handleStatusToggle(params.row.id, params.row.status)}
              title={params.row.status === 'pending' ? 'Iniciar' : 'Completar'}
            >
              <CheckCircle />
            </IconButton>
          )}
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row)}
            title="Editar"
          >
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
            title="Eliminar"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    }] : []),
  ];

  if (loading) {
    return <Loading message="Cargando mantenimientos..." />;
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
          {user?.role === 'admin' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditing(null);
                setFormData({ title: '', description: '', area: '', scheduledDate: '', completedDate: '', priority: '' });
                setOpen(true);
              }}
              sx={{
                backgroundColor: '#004272',
                '&:hover': { backgroundColor: '#002a4a' },
                borderRadius: '8px',
              }}
            >
              Agregar mantenimiento
            </Button>
          )}
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredMaintenances}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            disableSelectionOnClick
          />
        </Box>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', color: '#2586b8' }}>
          {editing ? 'Editar Mantenimiento' : 'Registrar Mantenimiento'}
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
              placeholder="Piscina, gym, elevador, áreas comunes, jardines..."
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
              label="Fecha completada"
              type="date"
              value={formData.completedDate}
              onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              select
              label="Prioridad"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              fullWidth
            >
              <MenuItem value="low">Baja</MenuItem>
              <MenuItem value="medium">Media</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={editing ? handleUpdate : handleCreate}
            variant="contained"
          >
            {editing ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Maintenance;