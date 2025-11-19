import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Container, Typography, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Paper, InputAdornment, IconButton, Grid, Card, CardContent, } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Search, CheckCircle, Delete, Hotel, Person, Event, AccessTime, Edit,
} from '@mui/icons-material';
import { getAirbnbGuests, getActiveAirbnbGuests, createAirbnbGuest, updateAirbnbGuest, checkinAirbnbGuest, checkoutAirbnbGuest, deleteAirbnbGuest, getApartments, } from '../../services/api';

const Airbnb = () => {
  const { user } = useContext(AuthContext);
  const [guests, setGuests] = useState([]);
  const [activeGuests, setActiveGuests] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    apartmentId: '',
    guestName: '',
    guestCedula: '',
    numberOfGuests: 1,
    checkInDate: '',
    checkOutDate: '',
  });

  useEffect(() => {
    fetchGuests();
    fetchActiveGuests();
    fetchApartments();
  }, []);

  const fetchGuests = async () => {
    try {
      const guestsData = await getAirbnbGuests();
      setGuests((guestsData || []).filter(Boolean));
    } catch (error) {
      console.error('Error fetching guests:', error);
      setGuests([]);
    }
  };

  const fetchActiveGuests = async () => {
    try {
      setLoading(true);
      const activeGuestsData = await getActiveAirbnbGuests();
      setActiveGuests(activeGuestsData || []);
    } catch (error) {
      console.error('Error fetching active guests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApartments = async () => {
    try {
      const apartmentsData = await getApartments();
      setApartments(apartmentsData || []);
    } catch (error) {
      console.error('Error fetching apartments:', error);
    }
  };

  const handleCreate = async () => {
    try {
      if (editing) {
        await updateAirbnbGuest(editing.id, formData);
      } else {
        await createAirbnbGuest(formData);
      }
      setOpen(false);
      setEditing(null);
      setFormData({
        apartmentId: '',
        guestName: '',
        guestCedula: '',
        numberOfGuests: 1,
        checkInDate: '',
        checkOutDate: '',
      });
      fetchGuests();
      fetchActiveGuests();
    } catch (error) {
      console.error('Error creating/updating guest:', error);
    }
  };

  const handleEdit = (guest) => {
    setEditing(guest);
    setFormData({
      apartmentId: guest.apartmentId || '',
      guestName: guest.guestName,
      guestCedula: guest.guestCedula,
      numberOfGuests: guest.numberOfGuests,
      checkInDate: guest.checkInDate.split('T')[0], // Format for date input
      checkOutDate: guest.checkOutDate.split('T')[0],
    });
    setOpen(true);
  };

  const handleCheckIn = async (id) => {
    try {
      const updatedGuest = await checkinAirbnbGuest(id);
      setGuests(prev => prev.map(g => g.id === id ? updatedGuest : g));
      fetchActiveGuests();
    } catch (error) {
      console.error('Error checking in guest:', error);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      const updatedGuest = await checkoutAirbnbGuest(id);
      setGuests(prev => prev.map(g => g.id === id ? updatedGuest : g));
      fetchActiveGuests();
    } catch (error) {
      console.error('Error checking out guest:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este huésped?')) {
      try {
        await deleteAirbnbGuest(id);
        fetchGuests();
        fetchActiveGuests();
      } catch (error) {
        console.error('Error deleting guest:', error);
      }
    }
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = guest.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.guestCedula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guest.apartment?.number?.toString().includes(searchTerm);
    const matchesStatus = !statusFilter || guest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'checked_in': return 'info';
      case 'checked_out': return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'checked_in': return 'Registrado';
      case 'checked_out': return 'Revisado';
      default: return status;
    }
  };

  const columns = [
    {
      field: 'apartment',
      headerName: 'Apartamento',
      width: 120,
      renderCell: (params) => {
        const apartment = apartments.find(a => a.id === params.row.apartmentId);
        return apartment ? `Torre ${apartment.tower} - Apt ${apartment.number}` : 'N/A';
      },
    },
    {
      field: 'guestName',
      headerName: 'Nombre del Huésped',
      width: 200,
    },
    {
      field: 'guestCedula',
      headerName: 'Cédula',
      width: 150,
    },
    {
      field: 'numberOfGuests',
      headerName: 'N° Huéspedes',
      width: 120,
    },
    {
      field: 'checkInDate',
      headerName: 'Entrada',
      width: 120,
      renderCell: (params) => {
      const date = new Date(params.value);
      return date.toLocaleDateString('es-CO');
      },
    },
    {
      field: 'checkOutDate',
      headerName: 'Salida',
      width: 120,
      renderCell: (params) => {
      const date = new Date(params.value);
      return date.toLocaleDateString('es-CO');
      },
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
    ...(user?.role === 'admin' ? [{
      field: 'actions',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleEdit(params.row)}
            title="Editar"
          >
            <Edit />
          </IconButton>
          {params.row.status === 'pending' && (
            <IconButton
              color="success"
              onClick={() => handleCheckIn(params.row.id)}
              title="Check-in"
            >
              <CheckCircle />
            </IconButton>
          )}
          {params.row.status === 'checked_in' && (
            <IconButton
              color="warning"
              onClick={() => handleCheckOut(params.row.id)}
              title="Check-out"
            >
              <CheckCircle />
            </IconButton>
          )}
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

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestión Airbnb
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Control de huéspedes Airbnb y check-ins del conjunto residencial
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Hotel sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Huéspedes Activos</Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {activeGuests.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Total Huéspedes</Typography>
              </Box>
              <Typography variant="h3" color="success.main">
                {guests.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Event sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Entradas Pendientes</Typography>
              </Box>
              <Typography variant="h3" color="warning.main">
                {guests.filter(g => g.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccessTime sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Entradas Actuales</Typography>
              </Box>
              <Typography variant="h3" color="info.main">
                {guests.filter(g => g.status === 'checked_in').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por nombre, cédula o apartamento"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 350 }}
          />
          <TextField
            select
            label="Filtrar por estado"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pending">Pendiente</MenuItem>
            <MenuItem value="checked_in">Entrada</MenuItem>
            <MenuItem value="checked_out">Salida</MenuItem>
          </TextField>
          {user?.role === 'admin' ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpen(true)}
            >
              Registrar Huésped
            </Button>
          ) : null}
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredGuests}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            disableSelectionOnClick
          />
        </Box>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Huésped Airbnb' : 'Registrar Nuevo Huésped Airbnb'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Apartamento"
              value={formData.apartmentId}
              onChange={(e) => setFormData({ ...formData, apartmentId: e.target.value })}
              fullWidth
              required
            >
              <MenuItem value="">Ninguno</MenuItem>
              {apartments.map((apartment) => (
                <MenuItem key={apartment.id} value={apartment.id}>
                  Torre {apartment.tower} - Piso {apartment.floor} - Apartamento {apartment.number}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Nombre del Huésped"
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Cédula del Huésped"
              value={formData.guestCedula}
              onChange={(e) => setFormData({ ...formData, guestCedula: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Número de Huéspedes"
              type="number"
              value={formData.numberOfGuests}
              onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })}
              fullWidth
              inputProps={{ min: 1 }}
              required
            />
            <TextField
              label="Fecha de entrada"
              type="date"
              value={formData.checkInDate}
              onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Fecha de salida"
              type="date"
              value={formData.checkOutDate}
              onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} variant="contained">
            {editing ? 'Actualizar' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Airbnb;
