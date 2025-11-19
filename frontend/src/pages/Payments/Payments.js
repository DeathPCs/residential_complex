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
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import { getUsers, getApartments, getPayments, registerPaymentAsPaid, createPayment, updatePayment, deletePayment } from '../../services/api';
import Loading from '../../components/common/Loading';
import { AuthContext } from '../../context/AuthContext';

const Payments = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    apartmentId: '',
    amount: '',
    concept: 'Pago de administración',
    dueDate: '',
    paidDate: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchUsers();
    fetchApartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchApartments = async () => {
    try {
      const data = await getApartments();
      setApartments(data || []);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      setApartments([]);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPayments();
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError(error.userMessage || 'Error al cargar pagos');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (editing) {
        await updatePayment(editing.id, formData);
      } else {
        await createPayment(formData);
      }
      setOpen(false);
      setEditing(null);
      setFormData({ userId: '', apartmentId: '', amount: '', concept: 'Pago de administración', dueDate: '', paidDate: '' });
      fetchPayments();
    } catch (error) {
      console.error('Error creating/updating payment:', error);
      setError(error.userMessage || 'Error al crear/actualizar pago');
      // Always fetch payments to ensure UI is up to date even on error
      fetchPayments();
    }
  };

  const handleEdit = (payment) => {
    setEditing(payment);
    setFormData({
      userId: payment.userId || '',
      apartmentId: payment.apartment?.id || '',
      amount: payment.amount || '',
      concept: payment.concept || 'Pago de administración',
      dueDate: payment.dueDate ? payment.dueDate.split('T')[0] : '',
      paidDate: payment.paidDate ? payment.paidDate.split('T')[0] : '',
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este pago?')) {
      try {
        await deletePayment(id);
        fetchPayments();
      } catch (error) {
        console.error('Error deleting payment:', error);
        setError(error.userMessage || 'Error al eliminar pago');
      }
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    if (currentStatus === 'paid') return; // No permitir cambiar de pagado

    try {
      await registerPaymentAsPaid(id);
      fetchPayments();
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError(error.userMessage || 'Error al actualizar estado del pago');
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.concept?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.apartment?.number?.toString().includes(searchTerm) ||
                         payment.apartment?.tower?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'late': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'late': return 'Mora';
      default: return status;
    }
  };

  const columns = [
    {
      field: 'apartment',
      headerName: 'Apartamento',
      width: 120,
      renderCell: (params) => {
        return params.row.apartment ? `Torre ${params.row.apartment.tower} - Apt ${params.row.apartment.number}` : 'N/A';
      },
    },
    {
      field: 'user',
      headerName: 'Usuario',
      width: 150,
      renderCell: (params) => {
        return params.row.user ? `${params.row.user.name}` : 'N/A';
      },
    },
    {
      field: 'concept',
      headerName: 'Concepto',
      width: 200,
    },
    {
      field: 'amount',
      headerName: 'Monto',
      width: 120,
      renderCell: (params) => `$${params.value?.toLocaleString() || 0}`,
    },
    {
      field: 'dueDate',
      headerName: 'Fecha de Vencimiento',
      width: 150,
      renderCell: (params) => {
        if (!params.value) return 'N/A';
        const date = new Date(params.value);
        return date.toLocaleDateString('es-CO');
      },
    },
    {
      field: 'paidDate',
      headerName: 'Fecha de Pago',
      width: 150,
      renderCell: (params) => {
        if (!params.value) return 'N/A';
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          {params.row.status !== 'paid' && (
            <IconButton
              color="success"
              onClick={() => handleStatusToggle(params.row.id, params.row.status)}
              title="Marcar como pagado"
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
    return <Loading message="Cargando pagos..." />;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Pagos de administración
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de pagos y cuotas del conjunto residencial
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
              onClick={fetchPayments}
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
            placeholder="Buscar por concepto, usuario o apartamento"
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
          {user?.role === 'admin' && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditing(null);
                setFormData({ userId: '', apartmentId: '', amount: '', concept: 'Pago de administración', dueDate: '', paidDate: '' });
                setOpen(true);
              }}
            >
              Agregar pago
            </Button>
          )}
        </Box>

        <Box sx={{ height: 600 }}>
          <DataGrid
            rows={filteredPayments}
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
          {editing ? 'Editar Pago' : 'Registrar pago de administración'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Selecciona usuario"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              fullWidth
              required
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {`${user.name} (${user.email})`}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Selecciona apartamento"
              value={formData.apartmentId}
              onChange={(e) => setFormData({ ...formData, apartmentId: e.target.value })}
              fullWidth
              required
            >
              {apartments.map((apartment) => (
                <MenuItem key={apartment.id} value={apartment.id}>
                  Torre {apartment.tower} - Piso {apartment.floor} - Apartamento {apartment.number}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Monto"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              fullWidth
              required
              placeholder="Monto a cobrar"
            />
            <TextField
              label="Concepto"
              value={formData.concept}
              onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              fullWidth
              placeholder="Concepto (opcional)"
            />
            <TextField
              label="Fecha de vencimiento"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Fecha de pago"
              type="date"
              value={formData.paidDate}
              onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
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
            {editing ? 'Actualizar' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Payments;
