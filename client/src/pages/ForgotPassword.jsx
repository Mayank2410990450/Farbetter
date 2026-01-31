import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import { forgotPassword } from '@/api/auth';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!email.trim()) {
            toast({
                title: 'Email Required',
                description: 'Please enter your email address',
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        try {
            await forgotPassword(email);
            setIsSent(true);
            toast({
                title: 'Email Sent',
                description: 'If an account exists with this email, you will receive password reset instructions.',
            });
        } catch (error) {
            console.error("Forgot password error:", error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to send reset email. Please try again.',
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
                            <div className="font-serif text-2xl sm:text-3xl font-bold text-primary">Farbetter</div>
                        </div>
                        <CardTitle className="text-xl sm:text-2xl text-center">Reset Password</CardTitle>
                        <CardDescription className="text-center text-xs sm:text-sm">
                            Enter your email to receive reset instructions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                        {!isSent ? (
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
                                <Button type="submit" className="w-full text-sm" disabled={isLoading}>
                                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/login')}
                                        className="text-sm text-primary hover:underline font-semibold"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4 text-center">
                                <div className="bg-green-50 p-4 rounded-md text-green-700 text-sm">
                                    Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full text-sm"
                                    onClick={() => setIsSent(false)}
                                >
                                    Try another email
                                </Button>
                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate('/login')}
                                        className="text-sm text-primary hover:underline font-semibold"
                                    >
                                        Back to Login
                                    </button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
