import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Alert, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper className="p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              size="large"
            >
              Sign In
            </Button>
          </form>
          <p className="mt-4 text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-800">
              Sign Up
            </Link>
          </p>
        </Paper>
      </motion.div>
    </div>
  );
}