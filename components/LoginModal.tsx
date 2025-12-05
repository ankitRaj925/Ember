import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, AlertCircle, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import { User as UserType } from '../types';
import { API_BASE } from "../constants";

fetch(`${API_BASE}/menu`)
  .then(res => res.json())
  .then(data => console.log(data));


interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserType) => void;
  checkoutMessage?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, checkoutMessage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay for realism
    setTimeout(() => {
      try {
        // --- ADMIN LOGIN CHECK ---
        if (formData.email === 'admin@ember.com' && formData.password === 'admin123') {
          onLogin({
            name: 'Head Chef',
            email: 'admin@ember.com',
            isAuthenticated: true,
            isAdmin: true
          });
          setLoading(false);
          resetAndClose();
          return;
        }

        const usersDb = JSON.parse(localStorage.getItem('ember_users_db') || '[]');
        
        if (isForgotPassword) {
          // --- FORGOT PASSWORD LOGIC ---
          setResetSent(true);
          setLoading(false);
          return;
        }

        if (isLogin) {
          // --- USER LOGIN LOGIC ---
          const user = usersDb.find((u: any) => u.email === formData.email && u.password === formData.password);
          
          if (user) {
            onLogin({
              name: user.name,
              email: user.email,
              isAuthenticated: true,
              isAdmin: false
            });
            resetAndClose();
          } else {
            setError('Invalid email or password. Please try again.');
          }
        } else {
          // --- SIGN UP LOGIC ---
          const existingUser = usersDb.find((u: any) => u.email === formData.email);
          
          if (existingUser) {
            setError('An account with this email already exists.');
          } else {
            const newUser = {
              name: formData.name,
              email: formData.email,
              password: formData.password
            };
            
            // Save new user to mock DB
            localStorage.setItem('ember_users_db', JSON.stringify([...usersDb, newUser]));
            
            onLogin({
              name: newUser.name,
              email: newUser.email,
              isAuthenticated: true,
              isAdmin: false
            });
            resetAndClose();
          }
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
      } finally {
        if (!isForgotPassword) setLoading(false);
      }
    }, 1000);
  };

  const resetAndClose = () => {
    setFormData({ name: '', email: '', password: '' });
    setError('');
    setIsForgotPassword(false);
    setResetSent(false);
    onClose();
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setIsForgotPassword(false);
    setResetSent(false);
    setFormData({ name: '', email: '', password: '' });
  };

  const handleForgotPasswordClick = () => {
    setIsForgotPassword(true);
    setError('');
    setResetSent(false);
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetSent(false);
    setError('');
  };

  // Determine title and description based on state
  let title = isLogin ? 'Welcome Back' : 'Join the Table';
  let description = isLogin 
    ? 'Sign in to access your reservations and order history.' 
    : 'Create an account for a personalized dining experience.';
  
  if (isForgotPassword) {
    title = 'Reset Password';
    description = 'Enter your email address and we’ll send you a link to reset your password.';
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-brand-950/90 transition-opacity backdrop-blur-sm" 
          aria-hidden="true"
          onClick={resetAndClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Panel */}
        <div className="inline-block align-bottom bg-brand-900 rounded-2xl text-left overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full border border-brand-800">
          
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-transparent rounded-md text-brand-400 hover:text-white focus:outline-none transition-colors"
              onClick={resetAndClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          <div className="px-8 pt-8 pb-6">
            <div className="text-center mb-8">
              <h3 className="text-3xl leading-6 font-bold text-white font-serif" id="modal-title">
                {title}
              </h3>
              
              {!resetSent && (
                <div className="mt-2">
                   {checkoutMessage ? (
                      <div className="bg-brand-500/10 border border-brand-500/50 rounded-xl p-3 flex items-start text-left mt-2">
                         <AlertCircle className="w-5 h-5 text-brand-500 mt-0.5 mr-3 flex-shrink-0" />
                         <p className="text-sm text-brand-100">{checkoutMessage}</p>
                      </div>
                   ) : (
                      <p className="text-sm text-brand-200/60">
                        {description}
                      </p>
                   )}
                </div>
              )}
            </div>

            {resetSent ? (
              <div className="text-center animate-fade-in py-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900/30 mb-6 border border-green-700/50">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h4 className="text-lg font-medium text-white mb-2">Check your inbox</h4>
                <p className="text-sm text-brand-200/60 mb-8">
                  We've sent a password reset link to <span className="text-brand-100 font-medium">{formData.email}</span>
                </p>
                <button
                  onClick={handleBackToLogin}
                  className="w-full flex justify-center items-center py-3 px-4 border border-brand-700 rounded-xl text-sm font-bold text-brand-100 hover:bg-brand-800 transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Error Message */}
                {error && (
                  <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-xl flex items-center text-sm animate-fade-in">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {!isLogin && !isForgotPassword && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-brand-500/70 group-focus-within:text-brand-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      required={!isLogin}
                      className="block w-full pl-10 pr-3 py-3 border border-brand-800 rounded-xl leading-5 bg-brand-950/50 text-brand-50 placeholder-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all text-white"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-brand-500/70 group-focus-within:text-brand-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-brand-800 rounded-xl leading-5 bg-brand-950/50 text-brand-50 placeholder-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all text-white"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                {!isForgotPassword && (
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-brand-500/70 group-focus-within:text-brand-500 transition-colors" />
                    </div>
                    <input
                      type="password"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-brand-800 rounded-xl leading-5 bg-brand-950/50 text-brand-50 placeholder-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all text-white"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                )}

                {isLogin && !isForgotPassword && (
                  <div className="flex items-center justify-end">
                    <button 
                      type="button" 
                      onClick={handleForgotPasswordClick}
                      className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-brand-950 bg-brand-500 hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      {isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Create Account')}
                      {!isForgotPassword && <ArrowRight className="ml-2 h-4 w-4" />}
                    </>
                  )}
                </button>

                {isForgotPassword && (
                   <button 
                    type="button"
                    onClick={handleBackToLogin}
                    className="w-full text-center text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors mt-4"
                  >
                    Back to Login
                  </button>
                )}
              </form>
            )}
          </div>
          
          {!resetSent && (
            <div className="bg-brand-950/50 px-8 py-4 border-t border-brand-800 text-center">
              {isForgotPassword ? (
                <p className="text-sm text-brand-200/60">
                   Remember your password?{' '}
                  <button
                    onClick={handleBackToLogin}
                    className="font-medium text-brand-500 hover:text-brand-400 transition-colors"
                  >
                    Log in
                  </button>
                </p>
              ) : (
                <p className="text-sm text-brand-200/60">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={handleSwitchMode}
                    className="font-medium text-brand-500 hover:text-brand-400 transition-colors"
                  >
                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;