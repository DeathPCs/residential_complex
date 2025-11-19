import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  Fab,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add,
  Search,
  Edit,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { getApartments, createApartment, updateApartment, deleteApartment, getUsers } from '../../services/api';
import Loading from '../../components/common/Loading';
import { AuthContext } from '../../context/AuthContext';

const Apartments = () => {
  const { user } = useContext(AuthContext);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    tower: '',
    floor: '',
    status: 'owner_occupied',
    type: '',
    assignedUserId: '',
    ownerId: '',
    assignedRole: '',
  });
  const [users, setUsers] = useState([]);
  const fetchInProgress = useRef(false);

  useEffect(() => {
    fetchApartments();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchApartments = async () => {
    if (fetchInProgress.current) return; // Prevent multiple concurrent calls
    fetchInProgress.current = true;
    try {
      setLoading(true);
      setError(null);
      const data = await getApartments();
      setApartments(data || []);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      setError(error.userMessage || 'Error al cargar apartamentos');
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  };

  const handleCreate = async () => {
    try {
      await createApartment(formData);
      setOpen(false);
      setFormData({ number: '', tower: '', floor: '', status: 'owner_occupied', type: '', assignedUserId: '', assignedRole: '' });
      fetchApartments();
    } catch (error) {
      console.error('Error creating apartment:', error);
      setError(error.userMessage || 'Error al crear apartamento');
    }
  };

  const handleUpdate = async () => {
    try {
      await updateApartment(editing.id, formData);
      setOpen(false);
      setEditing(null);
      setFormData({ number: '', tower: '', floor: '', status: 'owner_occupied', type: '', assignedUserId: '', assignedRole: '' });
      fetchApartments();
    } catch (error) {
      console.error('Error updating apartment:', error);
      setError(error.userMessage || 'Error al actualizar apartamento');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este apartamento?')) {
      try {
        await deleteApartment(id);
        fetchApartments();
      } catch (error) {
        console.error('Error deleting apartment:', error);
        setError(error.userMessage || 'Error al eliminar apartamento');
      }
    }
  };

  const handleEdit = (apartment) => {
    setEditing(apartment);
    setFormData({
      number: apartment.number,
      tower: apartment.tower,
      floor: apartment.floor,
      status: apartment.status,
      type: apartment.type,
      assignedUserId: apartment.assignedUserId || '',
      assignedRole: apartment.assignedRole || '',
    });
    setOpen(true);
  };

  const filteredApartments = apartments.filter((apartment) => {
    const matchesSearch = apartment.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apartment.tower?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (apartment.owner && apartment.owner.name ? apartment.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    const matchesStatus = !statusFilter || apartment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'owner_occupied': return 'primary';
      case 'rented': return 'warning';
      case 'airbnb': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'owner_occupied': return 'Propiedad';
      case 'rented': return 'Arriendo';
      case 'airbnb': return 'Airbnb';
      default: return status;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'studioApartment': return 'Apartaestudio';
      case 'oneApartment': return 'Apartamento de 1 habitación';
      case 'twoApartment': return 'Apartamento de 2 habitaciones';
      case 'threeApartment': return 'Apartamento de 3 habitaciones';
      case 'duplex': return 'Dúplex';
      case 'penthouse': return 'Penthouse';
      case 'loft': return 'Loft';
      case 'gardenApartment': return 'Apartamento jardín';
      default: return type;
    }
  };

  const columns = [
    {
      field: 'number',
      headerName: 'Número',
      width: 70,
    },
    {
      field: 'tower',
      headerName: 'Torre',
      width: 55,
    },
    {
      field: 'floor',
      headerName: 'Piso',
      width: 10,
      type: 'number',
    },
    {
      field: 'owner',
      headerName: 'Propietario',
      width: 200,
      renderCell: (params) => {
        const assignedUser = params.row.assignedUser;
        return assignedUser ? assignedUser.name : 'N/A';
      },
    },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 200,
      renderCell: (params) => getTypeLabel(params.value),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 100,
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
      headerName: 'Fecha Registro',
      width: 120,
      renderCell: (params) => {
      const date = new Date(params.value);
      return date.toLocaleDateString('es-CO');
      },
    },
    ...(user?.role === 'admin' ? [{
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      renderCell: (params) => (
        <Box>
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
    return <Loading message="Cargando apartamentos..." />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Apartamentos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión completa de apartamentos del conjunto residencial
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
              onClick={fetchApartments}
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
            placeholder="Buscar por número, torre o propietario"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          <TextField
            select
            label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="owner_occupied">En propiedad</MenuItem>
            <MenuItem value="rented">En Arriendo</MenuItem>
            <MenuItem value="airbnb">Airbnb</MenuItem>
          </TextField>
          {user?.role === 'admin' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditing(null);
                setFormData({ number: '', tower: '', floor: '', status: 'owner_occupied', type: '', assignedUserId: '', assignedRole: '' });
                setOpen(true);
              }}
            >
              Nuevo Apartamento
            </Button>
          )}
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredApartments}
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
          {editing ? 'Editar Apartamento' : 'Nuevo Apartamento'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Número"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Torre"
              value={formData.tower}
              onChange={(e) => setFormData({ ...formData, tower: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Piso"
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              fullWidth
              required
            />
            <TextField
              select
              label="Tipo"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              fullWidth
              placeholder="Ej: Familiar, estudio, etc.."
            >
            <MenuItem value="">Ninguno</MenuItem>
            <MenuItem value="studioApartment">Apartaestudio</MenuItem>
            <MenuItem value="oneApartment">Apartamento de 1 habitación</MenuItem>
            <MenuItem value="twoApartment">Apartamento de 2 habitaciones</MenuItem>
            <MenuItem value="threeApartment">Apartamento de 3 habitaciones</MenuItem>
            <MenuItem value="duplex">Dúplex</MenuItem>
            <MenuItem value="penthouse">Penthouse</MenuItem>
            <MenuItem value="loft">Loft</MenuItem>
            <MenuItem value="gardenApartment">Apartamento jardín</MenuItem>
          </TextField>
            <TextField
              select
              label="Asignar Usuario"
              value={formData.assignedUserId}
              onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
              fullWidth
            >
              <MenuItem value="">Ninguno</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Rol Asignado"
              value={formData.assignedRole}
              onChange={(e) => setFormData({ ...formData, assignedRole: e.target.value })}
              fullWidth
            >
              <MenuItem value="">Ninguno</MenuItem>
              <MenuItem value="owner">Propietario</MenuItem>
              <MenuItem value="tenant">Arrendatario</MenuItem>
              <MenuItem value="airbnb_guest">Huésped Airbnb</MenuItem>
            </TextField>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mt: 2, mb: 2 }}>
              <Button
                variant={formData.status === 'owner_occupied' ? 'contained' : 'outlined'}
                onClick={() => setFormData({ ...formData, status: 'owner_occupied' })}
                sx={{
                  flex: 1,
                  mr: 1,
                  borderRadius: '8px',
                  backgroundColor: formData.status === 'owner_occupied' ? '#004272' : '#fff',
                  color: formData.status === 'owner_occupied' ? '#fff' : '#004272',
                  borderColor: '#004272',
                  '&:hover': {
                    backgroundColor: formData.status === 'owner_occupied' ? '#002a4a' : '#f0f4f8',
                  },
                }}
              >
                Propiedad
              </Button>
              <Button
                variant={formData.status === 'rented' ? 'contained' : 'outlined'}
                onClick={() => setFormData({ ...formData, status: 'rented' })}
                sx={{
                  flex: 1,
                  mr: 1,
                  borderRadius: '8px',
                  backgroundColor: formData.status === 'rented' ? '#004272' : '#fff',
                  color: formData.status === 'rented' ? '#fff' : '#004272',
                  borderColor: '#004272',
                  '&:hover': {
                    backgroundColor: formData.status === 'rented' ? '#002a4a' : '#f0f4f8',
                  },
                }}
              >
                Arriendo
              </Button>
              <Button
                variant={formData.status === 'airbnb' ? 'contained' : 'outlined'}
                onClick={() => setFormData({ ...formData, status: 'airbnb' })}
                sx={{
                  flex: 1,
                  borderRadius: '8px',
                  backgroundColor: formData.status === 'airbnb' ? '#004272' : '#fff',
                  color: formData.status === 'airbnb' ? '#fff' : '#004272',
                  borderColor: '#004272',
                  '&:hover': {
                    backgroundColor: formData.status === 'airbnb' ? '#002a4a' : '#f0f4f8',
                  },
                }}
              >
                Airbnb
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={editing ? handleUpdate : handleCreate} variant="contained">
            {editing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Apartments;
