import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { adminLogin, user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        if (user && user.role === 'admin') {
            navigate('/admin/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await adminLogin(email, password);
            
            if (result?.success) {
                toast({
                    title: 'Welcome Admin!',
                    description: 'You have been logged in successfully.',
                });
                
                setTimeout(() => {
                    navigate('/admin/dashboard');
                }, 100);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';

            toast({
                title: 'Login Failed',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-sm sm:max-w-md border-slate-700 shadow-xl">
                <CardHeader className="space-y-1 px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-2 sm:p-3 bg-primary/10 rounded-full">
                            <Shield className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-xl sm:text-2xl text-center">Admin Login</CardTitle>
                    <CardDescription className="text-center text-xs sm:text-sm">
                        Enter your admin credentials to access the dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm">Password</Label>
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
                            {isLoading ? 'Signing in...' : 'Sign in as Admin'}
                        </Button>
                        <p className="text-xs sm:text-sm text-center text-muted-foreground mt-4">
                            Admin accounts must be created by a super admin
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
