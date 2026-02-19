import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth, UserRole } from '../context/AuthContext';
import { motion } from 'motion/react';
import { 
  Eye, EyeOff, Mail, Lock, Heart, 
  Activity, Shield, Stethoscope 
} from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password, role);
      toast.success('Login successful!');
      
      // Small delay to ensure token is saved
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navigate based on role
      switch (role) {
        case 'doctor':
          navigate('/doctor/dashboard');
          break;
        case 'nurse':
          navigate('/nurse/dashboard');
          break;
        case 'patient':
          navigate('/patient/dashboard');
          break;
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="container-fluid h-screen">
        <div className="row h-100">
          {/* Left Side - Medical Illustration */}
          <motion.div 
            className="col-lg-6 d-none d-lg-flex p-0 position-relative overflow-hidden"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <div className="position-absolute w-100 h-100" style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1758101512269-660feabf64fd?w=1080)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.3,
            }} />
            
            <div className="position-relative d-flex flex-column justify-content-center align-items-center w-100 p-5 text-white">
              <motion.div 
                className="mb-5"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Stethoscope size={80} strokeWidth={1.5} />
              </motion.div>
              
              <h1 className="mb-4 text-center" style={{ fontSize: '2.5rem' }}>
                HealthCare AI Platform
              </h1>
              <p className="text-center fs-5 mb-5" style={{ maxWidth: '500px', opacity: 0.9 }}>
                Advanced clinical management system powered by AI for doctors, nurses, and patients
              </p>
              
              <div className="d-flex gap-5 mt-4">
                {[
                  { icon: Heart, label: 'Patient Care' },
                  { icon: Activity, label: 'Real-time Monitoring' },
                  { icon: Shield, label: 'Secure & Private' }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    className="text-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.2 + 0.5 }}
                  >
                    <item.icon size={40} className="mb-2" />
                    <p className="mb-0 small">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div 
            className="col-lg-6 d-flex align-items-center justify-content-center p-4"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ background: '#f8f9fa' }}
          >
            <div className="w-100" style={{ maxWidth: '450px' }}>
              <div className="bg-white rounded-4 shadow-lg p-5" style={{
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.95)',
              }}>
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" 
                    style={{ 
                      width: '70px', 
                      height: '70px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}>
                    <Heart size={35} className="text-white" />
                  </div>
                  <h2 className="mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Welcome Back</h2>
                  <p className="text-muted">Sign in to access your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Mail size={18} className="text-muted" />
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ paddingLeft: '0.5rem' }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Lock size={18} className="text-muted" />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0 ps-0"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ paddingLeft: '0.5rem' }}
                      />
                      <span 
                        className="input-group-text bg-light border-start-0 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: 'pointer' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Select Role</label>
                    <select
                      className="form-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      required
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                    </select>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" id="remember" />
                      <label className="form-check-label small" htmlFor="remember">
                        Remember me
                      </label>
                    </div>
                    <Link to="/forgot-password" className="small text-decoration-none">
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 text-white py-3 mb-3 rounded-3"
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" />
                    ) : null}
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>

                  <div className="text-center">
                    <p className="text-muted mb-0">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-decoration-none fw-semibold" 
                        style={{ color: '#667eea' }}>
                        Register as Patient
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
