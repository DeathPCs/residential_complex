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
  Chip,
  Paper,
  InputAdornment,
  IconButton,
  Grid,
  Alert,
} from '@mui/material';
import {
  Add,
  Search,
  CheckCircle,
  Person,
  Home,
  Flight,
  Refresh,
} from '@mui/icons-material';
import { getUsers, getApartments, getPayments, registerPaymentAsPaid, createPayment } from '../../services/api';
import Loading from '../../components/common/Loading';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
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
      await createPayment(formData);
      setOpen(false);
      setFormData({ userId: '', apartmentId: '', amount: '', concept: 'Pago de administración', dueDate: '' });
      fetchPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
      setError(error.userMessage || 'Error al crear pago');
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await registerPaymentAsPaid(id);
      fetchPayments();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      setError(error.userMessage || 'Error al registrar pago');
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.concept?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.apartment?.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.apartment?.tower?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#39c079';
      case 'pending': return '#eac73f';
      case 'late': return '#ed4b4b';
      default: return '#4a6373';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'AL DÍA';
      case 'pending': return 'PENDIENTE';
      case 'late': return 'MORA';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return 'checkmark-circle';
      case 'pending': return 'alert-circle';
      case 'late': return 'close-circle';
      default: return 'help-circle';
    }
  };

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
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            Agregar pago
          </Button>
        </Box>

        {filteredPayments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No hay pagos registrados este mes.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredPayments.map((payment) => (
              <Grid item xs={12} sm={6} md={4} key={payment.id}>
                <Card sx={{
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  backgroundColor: '#fff',
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(payment.status),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                      }}>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>
                          {getStatusIcon(payment.status) === 'checkmark-circle' ? '✓' :
                           getStatusIcon(payment.status) === 'alert-circle' ? '!' :
                           getStatusIcon(payment.status) === 'close-circle' ? '✗' : '?'}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#004272' }}>
                          {payment.apartment
                            ? `Torre ${payment.apartment.tower}, Apto ${payment.apartment.number}`
                            : "Sin apartamento"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {payment.user?.name || "Usuario"} — {payment.concept}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getStatusLabel(payment.status)} · Vence: {payment.dueDate
                            ? new Date(payment.dueDate).toLocaleDateString()
                            : "N/A"}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{
                        fontWeight: 'bold',
                        color: getStatusColor(payment.status),
                        ml: 1
                      }}>
                        ${payment.amount?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                    {(payment.status === 'pending' || payment.status === 'late') && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => handleMarkAsPaid(payment.id)}
                        sx={{
                          mt: 1,
                          backgroundColor: '#39c079',
                          '&:hover': { backgroundColor: '#2e8b5f' },
                          borderRadius: '8px',
                          textTransform: 'none',
                        }}
                      >
                        Registrar pago
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', color: '#004272' }}>
          Registrar pago de administración
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Selecciona usuario"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              fullWidth
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
          >
            Registrar pago
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Payments;
