<?jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match');
    setError('');
    try {
      const res = await authService.register(name, email, password);
      dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
      navigate('/chat/new', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-surface border border-surface-border rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">Create account</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input type="text" className="w-full bg-background border border-surface-border rounded-lg px-4 py-2" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" className="w-full bg-background border border-surface-border rounded-lg px-4 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" className="w-full bg-background border border-surface-border rounded-lg px-4 py-2" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input type="password" className="w-full bg-background border border-surface-border rounded-lg px-4 py-2" value={confirm} onChange={e => setConfirm(e.target.value)} required />
        </div>
        <button type="submit" className="w-full bg-primary-500 text-on-primary py-2 rounded-lg">Register</button>
        <p className="text-center text-sm">Already have an account? <Link to="/login" className="text-primary-500">Login</Link></p>
      </form>
    </div>
  );
}
