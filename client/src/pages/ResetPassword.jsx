import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import { validatePassword } from '@/lib/passwordValidator';
import { resetPassword } from '@/api/auth';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

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
            await resetPassword(token, password);
            toast({
                title: 'Password Reset Successful',
                description: 'You can now login with your new password.',
            });
            navigate('/login');
        } catch (error) {
            console.error("Reset password error:", error);
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to reset password. The link may be expired.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 sm:p-6">
            <div className="w-full max-w-sm sm:max-w-md">
                <Card className="shadow-lg">
                    <CardHeader className="space-y-1 px-4 sm:px-6 py-4 sm:py-6">
                        <div className="flex justify-center mb-4">
                            <div className="font-serif text-2xl sm:text-3xl font-bold text-primary">Farbetter</div>
                        </div>
                        <CardTitle className="text-xl sm:text-2xl text-center">Set New Password</CardTitle>
                        <CardDescription className="text-center text-xs sm:text-sm">
                            Please enter your new password below
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="text-sm"
                                />
                                {password && <PasswordStrengthIndicator password={password} />}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="text-sm"
                                />
                            </div>
                            <Button type="submit" className="w-full text-sm" disabled={isLoading}>
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
