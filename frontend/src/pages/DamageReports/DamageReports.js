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
  Chip,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add,
  Search,
  Edit,
  CheckCircle,
  Delete,
} from '@mui/icons-material';
import api, { updateDamageReportStatus } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';

const DamageReports = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '',
    apartmentId: '',
    reportedBy: '',
  });

  useEffect(() => {
    fetchReports();
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    try {
      const response = await api.get('/apartments');
      setApartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/damage-reports/my-reports');
      setReports(response.data.data || []);
    } catch (error) {
      console.error('Error fetching damage reports:', error);
      setError(error.userMessage || 'Error al cargar reportes de daños');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (editing) {
        await api.put(`/damage-reports/${editing.id}`, formData);
      } else {
        await api.post('/damage-reports', formData);
      }
      setOpen(false);
      setEditing(null);
      setFormData({ title: '', description: '', priority: '', apartmentId: '', reportedBy: '' });
      fetchReports();
    } catch (error) {
      console.error('Error creating/updating damage report:', error);
      setError(error.userMessage || 'Error al crear/actualizar reporte de daño');
    }
  };

  const handleEdit = (report) => {
    setEditing(report);
    setFormData({
      title: report.title,
      description: report.description,
      priority: report.priority,
      apartmentId: report.apartmentId,
      reportedBy: report.reportedBy,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      try {
        await api.delete(`/damage-reports/${id}`);
        fetchReports();
      } catch (error) {
        console.error('Error deleting damage report:', error);
        setError(error.userMessage || 'Error al eliminar reporte de daño');
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    if (currentStatus === 'resolved') return; // No permitir cambiar de resuelto

    const statusCycle = ['reported', 'acknowledged', 'in_progress', 'resolved'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[currentIndex + 1];

    if (nextStatus) {
      // Optimistically update the local state
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: nextStatus } : r));

      try {
        await updateDamageReportStatus(id, nextStatus);
      } catch (error) {
        // Revert the change on error
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: currentStatus } : r));
        console.error('Error updating damage report status:', error);
        setError(error.userMessage || 'Error al actualizar estado del reporte de daño');
      }
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.apartment?.number?.toString().includes(searchTerm);
    const matchesStatus = !statusFilter || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported': return 'warning';
      case 'acknowledged': return 'normal';
      case 'in_progress': return 'info';
      case 'resolved': return 'success'
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'reported': return 'Reportado';
      case 'acknowledged': return 'Admitido';
      case 'in_progress': return 'En Progreso';
      case 'resolved': return 'Resuelto'
      default: return status;
    }
  };

  const getPriorityColor = (status) => {
    switch (status) {
      case 'low': return 'normal';
      case 'medium': return 'warning';
      case 'high': return 'warning';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const getPriorityLabel = (status) => {
    switch (status) {
      case 'low': return 'Baja';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'urgent': return 'Urgente';
      default: return status;
    }
  };

  const columns = [
    {
      field: 'apartment',
      headerName: 'Apartamento',
      width: 190,
      renderCell: (params) => {
        const apartment = apartments.find(a => a.id === params.row.apartmentId);
        return apartment ? `Torre ${apartment.tower} - Apt. ${apartment.number} ` : 'N/A';
      },
    },
    {
      field: 'reportedBy',
      headerName: 'Reportero',
      width: 100,
      renderCell: (params) => {
        return params.row.reporter ? `${params.row.reporter.name}` : 'N/A';
      }
    },
    {
      field: 'title',
      headerName: 'Título',
      width: 100,
    },
    {
      field: 'description',
      headerName: 'Descripción',
      width: 250,
      flex: 1,
    },
    {
      field: 'priority',
      headerName: 'Prioridad',
      width: 100,
      renderCell: (params) => (
      <Chip
        label={getPriorityLabel(params.value)}
        color={getPriorityColor(params.value)}
        size="small"
      />
    ),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Fecha Creación',
      width: 150,
      renderCell: (params) => {
      const date = new Date(params.value);
      return date.toLocaleDateString('es-CO');
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {params.row.status !== 'resolved' && (
            <IconButton
              size="small"
              onClick={() => handleStatusToggle(params.row.id, params.row.status)}
              color="success"
              title={
                params.row.status === 'reported' ? 'Admitir' :
                params.row.status === 'acknowledged' ? 'Iniciar' :
                params.row.status === 'in_progress' ? 'Resolver' : 'Cambiar Estado'
              }
            >
              <CheckCircle />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            color="primary"
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(params.row.id)}
            color="error"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Reportes de Daños
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Reportes de daños y problemas en el conjunto residencial
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por título, descripción o apartamento"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 370 }}
          />
          <TextField
            select
            label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="reported">Reportado</MenuItem>
            <MenuItem value="acknowledged">Admitido</MenuItem>
            <MenuItem value="in_progress">En Progreso</MenuItem>
            <MenuItem value="resolved">Resuelto</MenuItem>
          </TextField>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            Nuevo Reporte
          </Button>
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredReports}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            disableSelectionOnClick
          />
        </Box>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editing ? 'Editar Reporte de Daño' : 'Nuevo Reporte de Daño'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Apartamento"
              value={formData.apartmentId}
              onChange={(e) => setFormData({ ...formData, apartmentId: e.target.value })}
              fullWidth
            >
              {apartments.map((apartment) => (
                <MenuItem key={apartment.id} value={apartment.id}>
                  Torre {apartment.tower} - Piso {apartment.floor} - Apartamento {apartment.number}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Título"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
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
              select
              label="Prioridad"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              fullWidth
            >
              <MenuItem value="low">Baja</MenuItem>
              <MenuItem value="medium">Media</MenuItem>
              <MenuItem value="high">Alta</MenuItem>
              <MenuItem value="urgent">Urgente</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} variant="contained">
            {editing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>


    </Container>
  );
};

export default DamageReports;
