import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import { validatePassword } from '@/lib/passwordValidator';
import BackButton from '@/components/BackButton';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  // Redirect if already logged in
  useEffect(() => {
    if (user && user.role === 'user') {
      navigate('/user/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!name.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your full name',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (!email.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: 'Weak Password',
        description: passwordValidation.errors.join('. '),
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Please make sure both passwords are identical',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting registration with:", { name, email });
      const response = await register(name, email, password);
      console.log("Registration response:", response);

      if (response.success) {
        toast({
          title: 'Account Created!',
          description: 'Your account has been created successfully. Welcome to Farbetter!',
        });
        navigate('/user/dashboard');
      } else {
        console.error("Registration failed with response:", response);
        toast({
          title: 'Error',
          description: response.message || 'Registration failed. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error("Unexpected registration error:", error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
            <CardTitle className="text-xl sm:text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center text-xs sm:text-sm">
              Join Farbetter and start shopping healthy snacks
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              {/* Email */}
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

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="text-sm"
                />
                {password && <PasswordStrengthIndicator password={password} />}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="text-sm"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-600">Passwords do not match</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-sm text-green-600">✓ Passwords match</p>
                )}
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                className="w-full text-sm"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Sign In Link */}
              <p className="text-sm text-center text-muted-foreground mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-primary hover:underline font-semibold"
                >
                  Sign In
                </button>
              </p>
            </form>

            {/* Terms & Privacy */}
            <div className="text-xs text-center text-muted-foreground mt-6 space-y-1">
              <p>
                By creating an account, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => navigate('/terms')}
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </button>
              </p>
              <p>
                and{' '}
                <button
                  type="button"
                  onClick={() => navigate('/privacy')}
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
