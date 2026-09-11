import api from './api';

export const authService = {
  register: (name, email, password, password_confirmation) => 
    api.post('/register', { name, email, password, password_confirmation }),
  
  login: (email, password) => 
    api.post('/login', { email, password }),
  
  logout: () => 
    api.post('/logout'),
  
  me: () => 
    api.get('/me'),
};
