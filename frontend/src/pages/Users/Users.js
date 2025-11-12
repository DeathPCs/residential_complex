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
  Person,
  People,
  Home,
  Refresh,
} from '@mui/icons-material';
import api from '../../services/api';
import Loading from '../../components/common/Loading';

const RESIDENT_TYPES = [
  { key: "all", label: "Todos" },
  { key: "owner", label: "Dueño" },
  { key: "tenant", label: "Arrendatario" },
  { key: "airbnb_guest", label: "Airbnb" },
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cedula: '',
    phone: '',
    password: '',
    role: 'tenant',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.userMessage || 'Error al cargar usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/users', formData);
      setOpen(false);
      setFormData({ name: '', email: '', cedula: '', phone: '', password: '', role: 'tenant' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.userMessage || 'Error al crear usuario');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = filter === "all" || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner': return <Person />;
      case 'tenant': return <People />;
      case 'airbnb_guest': return <Home />;
      default: return <Person />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return '#25b884';
      case 'tenant': return '#e6c863';
      case 'airbnb_guest': return '#009acf';
      default: return '#4a6373';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner': return 'Dueño';
      case 'tenant': return 'Arrendatario';
      case 'airbnb_guest': return 'Airbnb';
      default: return role;
    }
  };

  if (loading) {
    return <Loading message="Cargando residentes..." />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Residentes del conjunto
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de usuarios del conjunto residencial
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
              onClick={fetchUsers}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {RESIDENT_TYPES.map((type) => (
              <Button
                key={type.key}
                variant={filter === type.key ? 'contained' : 'outlined'}
                onClick={() => setFilter(type.key)}
                sx={{
                  borderRadius: '14px',
                  textTransform: 'none',
                  backgroundColor: filter === type.key ? '#25b884' : '#e8ecf2',
                  color: filter === type.key ? '#fff' : '#444',
                  borderColor: filter === type.key ? '#25b884' : '#e8ecf2',
                  '&:hover': {
                    backgroundColor: filter === type.key ? '#1f9a6c' : '#d0d7de',
                    borderColor: filter === type.key ? '#1f9a6c' : '#d0d7de',
                  },
                }}
              >
                {type.label}
              </Button>
            ))}
          </Box>
          <TextField
            placeholder="Buscar por nombre..."
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
              minWidth: 250,
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
            Nuevo Usuario
          </Button>
        </Box>

        {filteredUsers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No hay residentes en esta categoría.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredUsers.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.id}>
                <Card sx={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  backgroundColor: '#fff',
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: getRoleColor(user.role),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}>
                        {getRoleIcon(user.role)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#004272' }}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                        <Typography variant="caption" sx={{
                          backgroundColor: getRoleColor(user.role),
                          color: '#fff',
                          px: 1,
                          py: 0.5,
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          mt: 1,
                          display: 'inline-block',
                        }}>
                          {getRoleLabel(user.role)}
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
        <DialogTitle sx={{ textAlign: 'center', color: '#004272' }}>
          Nuevo Usuario
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Cédula"
              value={formData.cedula}
              onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              required
            />
            <TextField
              select
              label="Rol"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              fullWidth
              required
            >
              <MenuItem value="owner">Propietario</MenuItem>
              <MenuItem value="tenant">Arrendatario</MenuItem>
              <MenuItem value="airbnb_guest">Huésped Airbnb</MenuItem>
              <MenuItem value="security">Vigilante</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
          >
            Crear Usuario
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;
