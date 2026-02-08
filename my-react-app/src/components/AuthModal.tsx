/* AuthModal.tsx */
import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, MapPin, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios, { isAxiosError } from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import 'react-toastify/dist/ReactToastify.css';
import './AuthModal.css';

const authSchema = z.object({
  fullName: z.string().optional().or(z.literal('')),
  cityName: z.string().optional().or(z.literal('')),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { fullName: '', email: '', password: '', cityName: '' }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    try {
      if (isLogin) {
        // --- LOGIN ---
        const res = await axios.post('http://localhost:3000/api/auth/login', {
          email: data.email,
          password: data.password
        });

        // Save user and token (res.data contains {user, token})
        setAuth(res.data.user, res.data.token);

        toast.success(`Welcome back!`);
        setTimeout(() => {
          onClose();
          setLoading(false);
        }, 1500);

      } else {
        // --- SIGNUP ---
        const res = await axios.post('http://localhost:3000/api/auth/signup', {
          fullName: data.fullName,
          cityName: data.cityName,
          email: data.email,
          password: data.password
        });

        toast.success(res.data.message || "Account created! Please log in.");
        setIsLogin(true); // Switch to login view as requested
        setLoading(false);
      }
      reset();
    } catch (err) {
      setLoading(false);
      if (isAxiosError(err)) {
        const serverError = err.response?.data?.error || "Connection to server failed";
        toast.error(serverError);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <ToastContainer position="top-center" autoClose={1500} theme="colored" style={{ zIndex: 99999 }} />
      <div className="auth-glass-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} type="button"><X size={20} /></button>
        <div className="auth-header">
          <div className="auth-logo-badge"><ShieldCheck size={28} className="icon-emerald" /></div>
          <h2 className="text-gradient">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          {!isLogin && (
            <>
              <div className="auth-input-group">
                <label>Full Name</label>
                <div className={`auth-input-wrapper ${errors.fullName ? 'error-border' : ''}`}>
                  <User size={18} /><input {...register('fullName')} placeholder="Name" />
                </div>
                {errors.fullName && <span className="error-text">{errors.fullName.message}</span>}
              </div>
              <div className="auth-input-group">
                <label>Home City</label>
                <div className={`auth-input-wrapper ${errors.cityName ? 'error-border' : ''}`}>
                  <MapPin size={18} /><input {...register('cityName')} placeholder="e.g. London" />
                </div>
                {errors.cityName && <span className="error-text">{errors.cityName.message}</span>}
              </div>
            </>
          )}

          <div className="auth-input-group">
            <label>Email Address</label>
            <div className={`auth-input-wrapper ${errors.email ? 'error-border' : ''}`}>
              <Mail size={18} /><input {...register('email')} type="email" placeholder="name@example.com" />
            </div>
            {errors.email && <span className="error-text">{errors.email.message}</span>}
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <div className={`auth-input-wrapper ${errors.password ? 'error-border' : ''}`}>
              <Lock size={18} /><input {...register('password')} type="password" placeholder="••••••••" />
            </div>
            {errors.password && <span className="error-text">{errors.password.message}</span>}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? <Loader2 className="spinner" size={18} /> : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "New to AirAware?" : "Already have an account?"}
            <button className="auth-switch-btn" onClick={() => setIsLogin(!isLogin)} type="button">
              {isLogin ? 'Create one' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;