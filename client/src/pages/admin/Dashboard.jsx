import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, LayoutDashboard, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/admin/users', {
                withCredentials: true,
            });
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-muted/30">
            <header className="bg-white border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6" />
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{user?.email}</span>
                        <Button onClick={handleLogout} variant="outline" size="sm">
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{users.length}</div>
                            <p className="text-xs text-muted-foreground">Registered users</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">Active products</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Role</CardTitle>
                            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">{user?.role}</div>
                            <p className="text-xs text-muted-foreground">Access level</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p>Loading users...</p>
                        ) : users.length === 0 ? (
                            <p className="text-muted-foreground">No users found</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Email</th>
                                            <th className="text-left p-2">Name</th>
                                            <th className="text-left p-2">Role</th>
                                            <th className="text-left p-2">Created At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user._id} className="border-b">
                                                <td className="p-2">{user.email}</td>
                                                <td className="p-2">{user.name || '-'}</td>
                                                <td className="p-2">
                                                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-2">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
