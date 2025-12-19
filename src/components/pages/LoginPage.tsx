import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layers, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface User {
  id: number;
  role: string;
  email: string;
  password: string;
  status: string;
}

interface ApiResponse {
  status: number;
  message: string;
  data: User[];
  errors: null;
}

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';
const API_ENDPOINTS = {
  getAllUsers: `${API_BASE_URL}/user-controller/getAllUsers`,
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('[LoginPage] Fetching users...');
      const response = await fetch(API_ENDPOINTS.getAllUsers, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors'
      });

      console.log('[LoginPage] Response status:', response.status);

      if (!response.ok) {
        console.error('[LoginPage] HTTP error:', response.status);
        // Continue to fallback
      } else {
        const data: ApiResponse = await response.json();
        console.log('[LoginPage] Data received:', data);

        if (data.status === 200 && data.data) {
          const activeUsers = data.data.filter(user => user.status === 'ACTIVE');
          console.log('[LoginPage] Active users found:', activeUsers.length);
          setUsers(activeUsers);
          setUsersLoaded(true);
          return;
        }
      }

      // Fallback to demo data
      console.log('[LoginPage] Using fallback demo data');
      const fallbackUsers = [
        { id: 1, role: 'ADMIN', email: 'admin@franchiseintel.com', password: 'Admin@123', status: 'ACTIVE' },
        { id: 2, role: 'STORE_MANAGER', email: 'manager1@franchiseintel.com', password: 'Manager@123', status: 'ACTIVE' },
        { id: 4, role: 'STAFF', email: 'staff1@franchiseintel.com', password: 'Staff@123', status: 'ACTIVE' }
      ];
      setUsers(fallbackUsers);
      setUsersLoaded(true);
    } catch (err) {
      console.error('[LoginPage] Error fetching users:', err);
      console.log('[LoginPage] Using fallback demo data');
      const fallbackUsers = [
        { id: 1, role: 'ADMIN', email: 'admin@franchiseintel.com', password: 'Admin@123', status: 'ACTIVE' },
        { id: 2, role: 'STORE_MANAGER', email: 'manager1@franchiseintel.com', password: 'Manager@123', status: 'ACTIVE' },
        { id: 4, role: 'STAFF', email: 'staff1@franchiseintel.com', password: 'Staff@123', status: 'ACTIVE' }
      ];
      setUsers(fallbackUsers);
      setUsersLoaded(true);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    // Check if users have been loaded
    if (!usersLoaded) {
      setError('Loading user data, please wait...');
      return;
    }

    setLoading(true);

    try {
      console.log('[LoginPage] Login attempt:', { email });

      // Search for user in the fetched users array
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        console.log('[LoginPage] Login successful for user:', user.email, 'with role:', user.role);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userRole', user.role);

        // Role-based redirection
        let dashboardPath = '/';
        switch(user.role) {
          case 'ADMIN':
            dashboardPath = '/admin/dashboard';
            console.log('[LoginPage] Redirecting ADMIN to:', dashboardPath);
            break;
          case 'STORE_MANAGER':
            dashboardPath = '/store/dashboard';
            console.log('[LoginPage] Redirecting STORE_MANAGER to:', dashboardPath);
            break;
          case 'STAFF':
            dashboardPath = '/store/dashboard';
            console.log('[LoginPage] Redirecting STAFF to:', dashboardPath);
            break;
          default:
            dashboardPath = '/';
            console.warn('[LoginPage] Unknown role:', user.role, 'redirecting to home');
        }

        navigate(dashboardPath);
      } else {
        console.log('[LoginPage] Login failed - credentials not found in user list');

        // Check if email exists but password is wrong
        const emailExists = users.find(u => u.email === email);
        if (emailExists) {
          setError('Invalid password');
        } else {
          setError('Email not found in system');
        }
      }
    } catch (err) {
      console.error('[LoginPage] Error during login:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const styles = `
    .soft-gradient {
      background: linear-gradient(135deg, #F9FAFA 0%, #F3F4F6 100%);
    }
  `;

  return (
    <div className="min-h-screen bg-background font-paragraph text-foreground overflow-x-hidden selection:bg-soft-gold selection:text-white">
      <style>{styles}</style>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 py-4">
        <div className="container mx-auto px-6 max-w-[120rem] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft size={20} className="text-primary" />
            <span className="text-sm font-medium text-secondary hover:text-primary transition-colors">Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-soft-gold rounded-sm flex items-center justify-center text-white">
              <Layers size={20} />
            </div>
            <span className="font-heading text-2xl font-bold tracking-tight text-primary">Franchise<span className="text-soft-gold">OS</span></span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-soft-gold/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-gray-200/20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/4" />
        </div>

        <div className="w-full max-w-md mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <h1 className="font-heading text-3xl text-primary mb-2">Welcome Back</h1>
              <p className="text-secondary">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-primary">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-primary">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-white hover:bg-primary/90 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-secondary text-center">
                Demo credentials available for testing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
