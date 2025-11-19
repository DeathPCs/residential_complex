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
  Delete,
  Person,
  People,
  Home,
  Refresh,
} from '@mui/icons-material';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/api';
import Loading from '../../components/common/Loading';
import { AuthContext } from '../../context/AuthContext';

const RESIDENT_TYPES = [
  { key: "all", label: "Todos" },
  { key: "owner", label: "Dueño" },
  { key: "tenant", label: "Arrendatario" },
  { key: "airbnb_guest", label: "Airbnb" },
];

const Users = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cedula: '',
    phone: '',
    password: '',
    role: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers();
      setUsers(response || []);
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
      if (editing) {
        await updateUser(editing.id, formData);
      } else {
        await createUser(formData);
      }
      setOpen(false);
      setEditing(null);
      setFormData({ name: '', email: '', cedula: '', phone: '', password: '', role: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating/updating user:', error);
      setError(error.userMessage || 'Error al crear/actualizar usuario');
    }
  };

  const handleEdit = (user) => {
    setEditing(user);
    setFormData({
      name: user.name,
      email: user.email,
      cedula: user.cedula,
      phone: user.phone || '',
      password: '', // No mostrar contraseña existente
      role: user.role,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        setError(error.userMessage || 'Error al eliminar usuario');
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = filter === "all" || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
                         user.cedula.toLowerCase().includes(searchTerm.trim().toLowerCase());
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
      case 'owner': return 'info';
      case 'tenant': return 'warning';
      case 'airbnb_guest': return 'error';
      case 'admin': return 'success';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner': return 'Dueño';
      case 'tenant': return 'Arrendatario';
      case 'airbnb_guest': return 'Airbnb';
      case 'admin': return 'Administrador'
      default: return role;
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Nombre',
      width: 200,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
    },
    {
      field: 'cedula',
      headerName: 'Cédula',
      width: 150,
    },
    {
      field: 'phone',
      headerName: 'Teléfono',
      width: 150,
    },
    {
      field: 'role',
      headerName: 'Rol',
      width: 150,
      renderCell: (params) => (
        <Chip
          icon={getRoleIcon(params.value)}
          label={getRoleLabel(params.value)}
          color={getRoleColor(params.value)}
          size="small"
        />
      ),
    },
    ...(user?.role === 'admin' ? [{
      field: 'actions',
      headerName: 'Acciones',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
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
            placeholder="Buscar por nombre, email o cédula..."
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
                setFormData({ name: '', email: '', cedula: '', phone: '', password: '', role: '' });
                setOpen(true);
              }}
            >
              Nuevo Usuario
            </Button>
          )}
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            disableSelectionOnClick
          />
        </Box>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', color: '#004272' }}>
          {editing ? 'Editar Usuario' : 'Nuevo Usuario'}
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
            {!editing && (
              <TextField
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                fullWidth
                required
              />
            )}
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
              {/* <MenuItem value="security">Vigilante</MenuItem> */}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
          >
            {editing ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;
