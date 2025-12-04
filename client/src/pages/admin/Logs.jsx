import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/admin/AdminLayout';
import { fetchOrders, fetchLogs } from '@/api/admin';
import { useToast } from '@/hooks/use-toast';

export default function AdminLogs() {
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterUser, setFilterUser] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, logsData] = await Promise.all([
        fetchOrders(),
        fetchLogs()
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load orders and logs');
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on user and status
  const filteredOrders = orders.filter(order => {
    const userMatch = !filterUser || 
      (order.user?.email?.toLowerCase().includes(filterUser.toLowerCase()) ||
       order.user?.name?.toLowerCase().includes(filterUser.toLowerCase()) ||
       order.shippingAddress?.fullName?.toLowerCase().includes(filterUser.toLowerCase()));
    
    const statusMatch = !filterStatus || order.paymentMethod === filterStatus;
    
    return userMatch && statusMatch;
  });

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Order & Payment Logs</h1>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">{error}</div>}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium">Search User (Name/Email)</label>
            <Input
              placeholder="Filter by user..."
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Payment Method</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">All Methods</option>
              <option value="COD">Cash on Delivery</option>
              <option value="Razorpay">Razorpay</option>
              <option value="Stripe">Stripe</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={loadData} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Orders with Items */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold">Orders ({filteredOrders.length})</h2>
          
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No orders found
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order._id} className="overflow-hidden">
                <CardHeader className="bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Order {order._id?.slice(-8)}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.user?.name || 'Unknown'} ({order.user?.email || 'N/A'})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={order.paymentMethod === 'COD' ? 'secondary' : 'default'}>
                        {order.paymentMethod || 'N/A'}
                      </Badge>
                      <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'outline'}>
                        {order.paymentStatus || 'pending'}
                      </Badge>
                      <Badge variant="outline">{order.orderStatus || 'processing'}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Order Items</h4>
                      <div className="space-y-2">
                        {order.items?.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className="text-sm border-b pb-2">
                              <p className="font-medium">{item.product?.title || 'Product'}</p>
                              <p className="text-muted-foreground">Qty: {item.quantity}</p>
                              <p className="text-sm">₹{item.price?.toFixed(2) || '0.00'} each</p>
                              <p className="font-semibold">₹{(item.price * item.quantity)?.toFixed(2) || '0.00'}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-sm">No items</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Delivery Address</h4>
                      <div className="text-sm space-y-1">
                        <p><strong>{order.shippingAddress?.fullName}</strong></p>
                        <p>{order.shippingAddress?.street}</p>
                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</p>
                        <p>{order.shippingAddress?.country}</p>
                        <p className="text-muted-foreground">{order.shippingAddress?.phone}</p>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Order Date</p>
                        <p className="font-semibold">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">Total Amount</p>
                        <p className="font-bold text-lg">₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Payment Logs Summary */}
        {logs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Payment Activity Logs</h2>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="p-3 text-left">User</th>
                        <th className="p-3 text-left">Amount</th>
                        <th className="p-3 text-left">Method</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, idx) => (
                        <tr key={idx} className="border-b hover:bg-slate-50">
                          <td className="p-3">
                            <div className="font-medium">{log.user?.name || 'Unknown'}</div>
                            <div className="text-xs text-muted-foreground">{log.user?.email}</div>
                          </td>
                          <td className="p-3 font-semibold">₹{log.amount?.toFixed(2)}</td>
                          <td className="p-3">{log.paymentMethod}</td>
                          <td className="p-3">
                            <Badge variant={log.status === 'success' ? 'default' : 'secondary'}>
                              {log.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
