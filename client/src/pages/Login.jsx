import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // Handle OAuth redirect with token or error
  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('❌ OAuth Error:', error);
      let errorMessage = 'Authentication failed';

      switch (error) {
        case 'auth_failed':
          errorMessage = 'Google authentication failed. Please try again.';
          break;
        case 'token_failed':
          errorMessage = 'Failed to generate authentication token. Please try again.';
          break;
        default:
          errorMessage = 'An error occurred during authentication. Please try again.';
      }

      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      // Clear the error parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (token) {
      console.log('✅ OAuth token received, storing...');
      try {
        localStorage.setItem('token', token);

        // Verify token was actually stored
        const storedToken = localStorage.getItem('token');
        console.log('✅ Token stored successfully:', storedToken ? 'Yes' : 'No');

        // Clear the URL parameter to prevent re-extraction
        window.history.replaceState({}, document.title, window.location.pathname);

        // Dispatch event to trigger profile fetch
        window.dispatchEvent(new Event('token-updated'));

        toast({ title: 'Login Successful', description: 'Logged in with your Google account' });
      } catch (err) {
        console.error('❌ Failed to store token:', err);
        toast({ title: 'Login Error', description: 'Failed to store authentication token', variant: 'destructive' });
      }
    }
  }, [searchParams, toast]);

  // Redirect if already logged in (including after OAuth login)
  useEffect(() => {
    if (user && user.role === 'user') {
      navigate('/user/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simple validation - just check both fields are filled
    if (!email.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      toast({
        title: 'Password Required',
        description: 'Please enter your password',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(email, password);

      if (response.success) {
        toast({
          title: 'Welcome Back!',
          description: 'You have been logged in successfully.',
        });
        navigate('/user/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: response.message || 'Invalid email or password. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      toast({
        title: 'Login Failed',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    window.location.href = `${serverUrl}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 sm:p-6">
      <div className="w-full max-w-sm sm:max-w-md">
        <BackButton />
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex justify-center mb-4">
              <img
                src="/logo.png"
                alt="Farbetter"
                className="h-20 w-auto object-contain"
              />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-center">User Login</CardTitle>
            <CardDescription className="text-center text-xs sm:text-sm">
              Enter your email and password to login
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>
              <Button type="submit" className="w-full text-sm" disabled={isLoading}>
                {isLoading ? 'Please wait...' : 'Sign In'}
              </Button>

              {/* Social Auth Buttons */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300"></span>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">Or login with</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>

              <p className="text-sm text-center text-muted-foreground mt-4">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-primary hover:underline font-semibold"
                >
                  Create one here
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
