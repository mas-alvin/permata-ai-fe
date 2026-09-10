<?jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authService.login(email, password);
      dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
      navigate('/chat/new', { replace: true });
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-surface border border-surface-border rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Welcome back</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" className="w-full bg-background border border-surface-border rounded-lg px-4 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" className="w-full bg-background border border-surface-border rounded-lg px-4 py-2" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-primary-500 text-on-primary py-2 rounded-lg">Login</button>
        <p className="text-center text-sm">Don't have an account? <Link to="/register" className="text-primary-500">Register</Link></p>
      </form>
    </div>
  );
}
