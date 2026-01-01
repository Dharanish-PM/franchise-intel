import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layers, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

interface LoginResponse {
  status: string;
  message: string;
  data: {
    userId: number;
    username: string;
    email: string;
    role: string;
    brandId: number;
    franchiseId: number | null;
    isActive: boolean;
  };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (data.status === 'success' && data.data.isActive) {
        const userData = {
          ...data.data,
          storeId: data.data.franchiseId
        };
        setUser(userData);
        
        console.log('Login successful, user data:', userData);
        const dashboardPath = data.data.role === 'ADMIN' || data.data.role === 'BRAND_MANAGER' ? '/admin/dashboard' : 
                              data.data.role === 'SALES' ? '/sales/dashboard' : '/store/dashboard';
        console.log('Navigating to:', dashboardPath);
        navigate(dashboardPath);
      } else {
        setError('Invalid credentials or inactive account');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
    
    setLoading(false);
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
