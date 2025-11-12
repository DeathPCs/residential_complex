import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'Ha ocurrido un error inesperado';

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 400:
          errorMessage = data?.error || 'Datos inválidos';
          break;
        case 401:
          errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          errorMessage = 'No tienes permisos para realizar esta acción';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 422:
          errorMessage = data?.error || 'Datos de entrada inválidos';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Inténtalo más tarde';
          break;
        default:
          errorMessage = data?.error || `Error ${status}`;
      }
    } else if (error.request) {
      // Network error
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'La solicitud ha tardado demasiado. Verifica tu conexión';
      } else {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet';
      }
    }

    // Enhance error object with user-friendly message
    const enhancedError = {
      ...error,
      userMessage: errorMessage,
      originalError: error,
    };

    return Promise.reject(enhancedError);
  }
);

// LOGIN
export const login = async (email, password) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data;
  } catch (err) {
    console.error("Error en login:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

// GET ALL APARTMENTS
export const getApartments = async () => {
  try {
    const res = await api.get('/apartments');
    return res.data.data;
  } catch (err) {
    console.error("Error al obtener apartamentos:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

// CREATE APARTMENT
export const createApartment = async (apartmentData) => {
  try {
    const res = await api.post('/apartments', apartmentData);
    return res.data.data;
  } catch (err) {
    console.error("Error al crear apartamento:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

// EDITAR APARTAMENTO
export const updateApartment = async (id, apartmentData) => {
  try {
    const res = await api.put(`/apartments/${id}`, apartmentData);
    return res.data.data;
  } catch (err) {
    console.error("Error al actualizar apartamento:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

// ELIMINAR APARTAMENTO
export const deleteApartment = async (id) => {
  try {
    const res = await api.delete(`/apartments/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error al eliminar apartamento:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const createPayment = async (paymentData) => {
  try {
    const res = await api.post('/payments', paymentData);
    return res.data.data;
  } catch (err) {
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const getPayments = async (month) => {
  try {
    const res = await api.get(`/payments${month ? `?month=${month}` : ""}`);
    return res.data.data;
  } catch (err) {
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const registerPaymentAsPaid = async (paymentId) => {
  try {
    const res = await api.put(`/payments/${paymentId}/pay`, {});
    return res.data.data;
  } catch (err) {
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const updatePayment = async (id, paymentData) => {
  try {
    const res = await api.put(`/payments/${id}`, paymentData);
    return res.data.data;
  } catch (err) {
    console.error("Error al actualizar pago:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const deletePayment = async (id) => {
  try {
    const res = await api.delete(`/payments/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error al eliminar pago:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const getUsers = async () => {
  try {
    const res = await api.get('/users');
    return res.data.data;
  } catch (err) {
    console.error("Error al obtener usuarios:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const getEvents = async () => {
  try {
    const res = await api.get('/maintenance');
    return res.data.data;
  } catch (err) {
    console.error("Error al obtener eventos:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const createEvent = async (payload) => {
  try {
    const res = await api.post('/maintenance', payload);
    return res.data.data;
  } catch (err) {
    console.error("Error al crear evento:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

// NUEVO: Eliminar mantenimiento por id
export const deleteEvent = async (id) => {
  try {
    const res = await api.delete(`/maintenance/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error al eliminar evento:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

// Editar evento/mantenimiento
export const updateEvent = async (id, payload) => {
  try {
    const res = await api.put(`/maintenance/${id}`, payload);
    return res.data.data;
  } catch (err) {
    console.error("Error al actualizar evento:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

// USUARIOS
export const createUser = async (userData) => {
  try {
    const res = await api.post('/users', userData);
    return res.data.data;
  } catch (err) {
    console.error("Error al crear usuario:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

// NOTIFICACIONES
export const getNotifications = async () => {
  try {
    const res = await api.get('/notifications');
    return res.data.data;
  } catch (err) {
    console.error("Error al obtener notificaciones:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const createNotification = async (notificationData) => {
  try {
    const res = await api.post('/notifications', notificationData);
    return res.data.data;
  } catch (err) {
    console.error("Error al crear notificación:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const updateNotification = async (id, notificationData) => {
  try {
    const res = await api.put(`/notifications/${id}`, notificationData);
    return res.data.data;
  } catch (err) {
    console.error("Error al actualizar notificación:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const deleteNotification = async (id) => {
  try {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error al eliminar notificación:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

// REPORTES DE DAÑOS
export const getDamageReports = async () => {
  try {
    const res = await api.get('/damage-reports/my-reports');
    return res.data.data;
  } catch (err) {
    console.error("Error al obtener reportes de daños:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const createDamageReport = async (reportData) => {
  try {
    const res = await api.post('/damage-reports', reportData);
    return res.data.data;
  } catch (err) {
    console.error("Error al crear reporte de daño:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const updateDamageReport = async (id, reportData) => {
  try {
    const res = await api.put(`/damage-reports/${id}`, reportData);
    return res.data.data;
  } catch (err) {
    console.error("Error al actualizar reporte de daño:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const deleteDamageReport = async (id) => {
  try {
    const res = await api.delete(`/damage-reports/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error al eliminar reporte de daño:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

// AIRBNB GUESTS
export const getAirbnbGuests = async () => {
  try {
    const res = await api.get('/airbnb/guests');
    return res.data.data;
  } catch (err) {
    console.error("Error al obtener huéspedes Airbnb:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const getActiveAirbnbGuests = async () => {
  try {
    const res = await api.get('/airbnb/guests/active');
    return res.data.data;
  } catch (err) {
    console.error("Error al obtener huéspedes activos:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const createAirbnbGuest = async (guestData) => {
  try {
    const res = await api.post('/airbnb/guests', guestData);
    return res.data.data;
  } catch (err) {
    console.error("Error al crear huésped Airbnb:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const updateAirbnbGuest = async (id, guestData) => {
  try {
    const res = await api.put(`/airbnb/guests/${id}`, guestData);
    return res.data.data;
  } catch (err) {
    console.error("Error al actualizar huésped Airbnb:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const checkinAirbnbGuest = async (id) => {
  try {
    const res = await api.put(`/airbnb/guests/${id}/checkin`);
    return res.data.data;
  } catch (err) {
    console.error("Error al hacer check-in:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export const deleteAirbnbGuest = async (id) => {
  try {
    const res = await api.delete(`/airbnb/guests/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error al eliminar huésped Airbnb:", err.response?.data || err.message);
    throw err.response?.data || { error: "Error de conexión" };
  }
};

export default api;
