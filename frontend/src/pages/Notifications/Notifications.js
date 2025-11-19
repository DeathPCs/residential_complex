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
  Chip,
  Paper,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Add,
  Search,
  Notifications,
  Done,
  NotificationsActive,
  Edit,
  Delete,
} from '@mui/icons-material';
import api, { markNotificationAsRead } from '../../services/api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [formData, setFormData] = useState({
    message: '',
    userId: '',
    type: 'general',
  });

  useEffect(() => {
    fetchNotifications();
    // Set up polling for real-time updates
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (editing) {
        await api.put(`/notifications/${editing.id}`, formData);
      } else {
        await api.post('/notifications', formData);
      }
      setOpen(false);
      setEditing(null);
      setFormData({ message: '', userId: '', type: 'general' });
      fetchNotifications();
    } catch (error) {
      console.error('Error creating/updating notification:', error);
    }
  };

  const handleEdit = (notification) => {
    setEditing(notification);
    setFormData({
      message: notification.message,
      userId: notification.userId || '',
      type: notification.type,
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      try {
        await api.delete(`/notifications/${id}`);
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || notification.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Notificaciones
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} sin leer`}
              color="primary"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Centro de notificaciones del conjunto residencial
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar en mensajes"
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
            label="Filtrar por tipo"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="general">General</MenuItem>
            <MenuItem value="maintenance">Mantenimiento</MenuItem>
            <MenuItem value="payment">Pago</MenuItem>
            <MenuItem value="emergency">Emergencia</MenuItem>
          </TextField>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            Nueva Notificación
          </Button>
        </Box>

        {loading ? (
          <Typography>Cargando notificaciones...</Typography>
        ) : (
          <List>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ mr: 2 }}>
                    {notification.read ? (
                      <Notifications color="disabled" />
                    ) : (
                      <NotificationsActive color="primary" />
                    )}
                  </Box>
                  <ListItemText
                    primary={notification.message}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip
                          label={notification.type}
                          size="small"
                          color={
                            notification.type === 'emergency' ? 'error' :
                            notification.type === 'maintenance' ? 'warning' :
                            notification.type === 'payment' ? 'info' : 'default'
                          }
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(notification)}
                      title="Editar"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(notification.id)}
                      title="Eliminar"
                    >
                      <Delete />
                    </IconButton>
                    {!notification.read && (
                      <IconButton
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="Marcar como leída"
                      >
                        <Done />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                {index < filteredNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {filteredNotifications.length === 0 && (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No hay notificaciones
              </Typography>
            )}
          </List>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Editar Notificación' : 'Nueva Notificación'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Usuario ID"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              fullWidth
            />
            <TextField
              label="Mensaje"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              select
              label="Tipo"
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              fullWidth
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="maintenance">Mantenimiento</MenuItem>
              <MenuItem value="payment">Pago</MenuItem>
              <MenuItem value="emergency">Emergencia</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} variant="contained">
            {editing ? 'Actualizar' : 'Enviar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NotificationsPage;
