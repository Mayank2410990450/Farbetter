import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  Search,
  Grid3x3,
  ArrowLeft,
  Gift,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
  createCategory,
  fetchOrders,
  updateOrderStatus,
  fetchLogs,
  updatePaymentLogStatus,
} from '@/api/admin';
import {
  fetchAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from '@/api/offer';

export default function AdminDashboard() {
  const { user, logout, authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingOffer, setEditingOffer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', image: '' });

  // Form states
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    stock: '',
  });
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    badge: '',
    backgroundColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
    icon: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Don't redirect while loading - wait for user state to be set/cleared
    if (authLoading) return;
    
    if (user?.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [productsData, categoriesData, ordersData, logsData, offersData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchOrders(),
        fetchLogs(),
        fetchAllOffers(),
      ]);

      // Sort orders by timestamp (newest first)
      const sortedOrders = Array.isArray(ordersData) 
        ? [...ordersData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];

      // Sort logs by timestamp (newest first)
      const sortedLogs = Array.isArray(logsData)
        ? [...logsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];

      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setOrders(sortedOrders);
      setLogs(sortedLogs);
      setOffers(Array.isArray(offersData) ? offersData : []);
    } catch (error) {
      console.error('🔴 AdminDashboard.loadData: Error -', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', productForm.title);
      formData.append('description', productForm.description);
      formData.append('category', productForm.category);
      formData.append('brand', productForm.brand);
      formData.append('price', productForm.price);
      formData.append('stock', productForm.stock);
      
      // Append image file if selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingProduct) {
        // Update
        await updateProduct(editingProduct._id, formData);
        toast({ title: 'Success', description: 'Product updated' });
      } else {
        // Create
        await createProduct(formData);
        toast({ title: 'Success', description: 'Product created' });
      }

      setProductForm({
        title: '',
        description: '',
        category: '',
        brand: '',
        price: '',
        stock: '',
      });
      setImageFile(null);
      setImagePreview(null);
      setEditingProduct(null);
      loadData();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save product',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteProduct(id);
      toast({ title: 'Success', description: 'Product deleted' });
      loadData();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title || product.name,
      description: product.description,
      category: product.category?._id || product.category,
      brand: product.brand,
      price: product.price,
      stock: product.stock,
    });
    setImageFile(null);
    setImagePreview(product.image || null);
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast({ title: 'Success', description: 'Order status updated' });
      loadData();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive',
      });
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      if (!categoryForm.name.trim()) {
        toast({ title: 'Error', description: 'Category name is required', variant: 'destructive' });
        return;
      }

      await createCategory({ name: categoryForm.name, image: categoryForm.image });
      toast({ title: 'Success', description: 'Category created' });
      setCategoryForm({ name: '', image: '' });
      setEditingCategory(null);
      loadData();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create category',
        variant: 'destructive',
      });
    }
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    try {
      if (!offerForm.title.trim() || !offerForm.description.trim()) {
        toast({ title: 'Error', description: 'Title and description are required', variant: 'destructive' });
        return;
      }

      if (editingOffer) {
        await updateOffer(editingOffer, offerForm);
        toast({ title: 'Success', description: 'Offer updated' });
      } else {
        await createOffer(offerForm);
        toast({ title: 'Success', description: 'Offer created' });
      }

      setOfferForm({ title: '', description: '', badge: '', backgroundColor: 'bg-gradient-to-r from-blue-500 to-blue-600', icon: true });
      setEditingOffer(null);
      loadData();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save offer',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      await deleteOffer(id);
      toast({ title: 'Success', description: 'Offer deleted' });
      loadData();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete offer',
        variant: 'destructive',
      });
    }
  };

  const filteredProducts = Array.isArray(products) 
    ? products.filter((p) =>
        (p.title || p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Overview tab stats
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const totalRevenue = Array.isArray(orders)
    ? orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    : 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate("/")} 
              variant="ghost" 
              size="sm"
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="p-2 bg-primary/10 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">Manage your store</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{user?.email}</span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'categories', label: 'Categories', icon: Grid3x3 },
              { id: 'offers', label: 'Offers', icon: Gift },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'logs', label: 'Logs', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-4 border-b-2 font-medium text-sm transition flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    Total Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalProducts}</div>
                  <p className="text-xs text-muted-foreground">Active products</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-green-500" />
                    Total Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalOrders}</div>
                  <p className="text-xs text-muted-foreground">All orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₹{totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">From all orders</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3 flex-wrap">
                <Button onClick={() => setActiveTab('products')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('orders')}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  View Orders
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('logs')}>
                  <FileText className="w-4 h-4 mr-2" />
                  View Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Products Management</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingProduct(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? 'Edit' : 'Add'} Product</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={productForm.title}
                          onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Brand</Label>
                        <Input
                          value={productForm.brand}
                          onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select value={productForm.category} onValueChange={(val) => setProductForm({ ...productForm, category: val })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(categories) && categories.map((cat) => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Stock</Label>
                        <Input
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Image</Label>
                      <div className="flex gap-3 items-start">
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setImageFile(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setImagePreview(reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                        {imagePreview && (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded border"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      {editingProduct ? 'Update' : 'Create'} Product
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <div className="grid gap-4">
              {filteredProducts.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  No products found
                </Card>
              ) : (
                filteredProducts.map((product) => (
                  <Card key={product._id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.title || product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.brand}</p>
                          <div className="flex gap-3 mt-2">
                            <Badge>₹{product.price}</Badge>
                            <Badge variant="outline">Stock: {product.stock || 0}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              handleEditProduct(product);
                              setActiveTab('products');
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Offers Tab */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Offers</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => { setOfferForm({ title: '', description: '', badge: '', backgroundColor: 'bg-gradient-to-r from-blue-500 to-blue-600', icon: true }); setEditingOffer(null); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Offer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingOffer ? 'Edit Offer' : 'Add New Offer'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => handleSaveOffer(e)} className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        placeholder="e.g., Free Shipping"
                        value={offerForm.title}
                        onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        placeholder="e.g., On Orders Above ₹599"
                        value={offerForm.description}
                        onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Badge Text</Label>
                      <Input
                        placeholder="e.g., FREE SHIPPING"
                        value={offerForm.badge}
                        onChange={(e) => setOfferForm({ ...offerForm, badge: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Background Color (Tailwind class)</Label>
                      <Input
                        placeholder="e.g., bg-gradient-to-r from-blue-500 to-blue-600"
                        value={offerForm.backgroundColor}
                        onChange={(e) => setOfferForm({ ...offerForm, backgroundColor: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="icon"
                        checked={offerForm.icon}
                        onChange={(e) => setOfferForm({ ...offerForm, icon: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="icon">Show Gift Icon</Label>
                    </div>
                    <Button type="submit" className="w-full">
                      {editingOffer ? 'Update Offer' : 'Create Offer'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {Array.isArray(offers) && offers.length > 0 ? (
                offers.map((offer) => (
                  <Card key={offer._id} className="border">
                    <CardContent className="pt-6">
                      <div className={`${offer.backgroundColor} text-white p-6 rounded mb-4 flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          {offer.icon && <Gift className="h-5 w-5" />}
                          <div>
                            <div className="font-bold text-lg">{offer.title}</div>
                            <div className="text-sm opacity-90">{offer.description}</div>
                          </div>
                        </div>
                        <Badge className="bg-white text-black">{offer.badge}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setOfferForm({
                              title: offer.title,
                              description: offer.description,
                              badge: offer.badge,
                              backgroundColor: offer.backgroundColor,
                              icon: offer.icon,
                            });
                            setEditingOffer(offer._id);
                          }}
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteOffer(offer._id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No offers yet. Create one to get started!</p>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Orders Management</h2>
            <div className="grid gap-4">
              {orders.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  No orders yet
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order._id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <p className="font-semibold">Order #{order._id?.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            User: {order.user?.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Total: ₹{order.totalAmount?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              order.orderStatus === 'delivered'
                                ? 'default'
                                : order.orderStatus === 'shipped'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {order.orderStatus}
                          </Badge>
                          <Select
                            value={order.orderStatus}
                            onValueChange={(status) => handleUpdateOrderStatus(order._id, status)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Products in Order */}
                      <div className="border-t pt-4">
                        <p className="font-semibold text-sm mb-2">Products:</p>
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="bg-muted p-2 rounded text-sm">
                              <p className="font-medium">{item.product?.title || 'Unknown Product'}</p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × ₹{item.price?.toFixed(2) || '0.00'} = ₹{(item.quantity * item.price)?.toFixed(2) || '0.00'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Payment & Activity Logs</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center mb-4">
                  Manage order and payment activities. Update payment status below.
                </p>
                <div className="mt-6 space-y-3">
                  {logs.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">No logs yet</p>
                  ) : (
                    logs.map((log, idx) => {
                      // normalize shape: payment log vs fallback order-log
                      const logId = log._id;
                      const orderId = log.order?._id || log._id;
                      const user = log.user?.email || log.user?.name || (log.user && log.user.email) || 'Unknown';
                      const amount = log.amount || log.order?.totalAmount || 0;
                      const method = log.paymentMethod || 'COD';
                      const paymentId = log.paymentId || '—';
                      const status = log.status || log.orderStatus || 'pending';
                      const created = log.createdAt ? new Date(log.createdAt).toLocaleString() : '';
                      
                      // Determine status badge color
                      const getStatusColor = (status) => {
                        if (status === 'success') return 'bg-green-100 text-green-800 border-green-300';
                        if (status === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
                        if (status === 'failed') return 'bg-red-100 text-red-800 border-red-300';
                        if (status === 'refunded') return 'bg-blue-100 text-blue-800 border-blue-300';
                        return 'bg-gray-100 text-gray-800 border-gray-300';
                      };

                      // Determine available status options based on current status and method
                      const getAvailableStatuses = (currentStatus, method) => {
                        if (method === 'COD') {
                          // COD: pending -> success -> refunded
                          if (currentStatus === 'pending') return ['pending', 'success', 'failed'];
                          if (currentStatus === 'success') return ['success', 'refunded'];
                          if (currentStatus === 'failed') return ['failed', 'pending'];
                          return ['refunded'];
                        } else {
                          // Online payment (Razorpay, Stripe): success -> refunded
                          if (currentStatus === 'success') return ['success', 'refunded'];
                          if (currentStatus === 'failed') return ['failed'];
                          return ['pending', 'success', 'failed'];
                        }
                      };

                      const availableStatuses = getAvailableStatuses(status, method);
                      const canChangeStatus = availableStatuses.length > 1;

                      return (
                        <div key={idx} className={`p-4 rounded border ${getStatusColor(status)}`}>
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-sm">Order #{String(orderId).slice(-8)}</p>
                              <p className="text-xs opacity-90">User: {user}</p>
                              <p className="text-xs opacity-90">Amount: ₹{Number(amount).toFixed(2)}</p>
                              <p className="text-xs opacity-90">
                                Method: <span className="font-medium">{method}</span>
                                {paymentId !== '—' && ` • ID: ${paymentId}`}
                              </p>
                              <p className="text-xs opacity-75 mt-1">{created}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold mb-2 capitalize">{status}</p>
                              {canChangeStatus ? (
                                <Select
                                  value={status}
                                  onValueChange={async (newStatus) => {
                                    if (newStatus === status) return;
                                    try {
                                      await updatePaymentLogStatus(logId, newStatus);
                                      toast({ 
                                        title: 'Success', 
                                        description: `Payment status updated to ${newStatus}` 
                                      });
                                      // Refresh logs
                                      const updatedLogs = await fetchLogs();
                                      setLogs(updatedLogs);
                                    } catch (err) {
                                      toast({ 
                                        title: 'Error', 
                                        description: 'Failed to update status', 
                                        variant: 'destructive' 
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-32 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableStatuses.map((s) => (
                                      <SelectItem key={s} value={s}>
                                        <span className="capitalize">{s}</span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <p className="text-xs text-opacity-75">Final Status</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Categories</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={() => { setCategoryForm({ name: '', image: '' }); setEditingCategory(null); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                      <Label>Category Name</Label>
                      <Input
                        placeholder="e.g., Protein Bars"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Image URL (optional)</Label>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={categoryForm.image}
                        onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">Create Category</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                {Array.isArray(categories) && categories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                      <div key={cat._id} className="p-4 border rounded-lg">
                        {cat.image && (
                          <img 
                            src={cat.image} 
                            alt={cat.name}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                        )}
                        <h3 className="font-semibold">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground mb-3">ID: {cat._id}</p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setCategoryForm({ name: cat.name, image: cat.image || '' });
                              setEditingCategory(cat._id);
                            }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No categories yet. Create one to get started!</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Settings</h2>
            
            {/* Shipping Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Manage global shipping costs, thresholds, and free shipping policies
                </p>
                <Button onClick={() => navigate('/admin/settings')}>
                  Configure Shipping
                </Button>
              </CardContent>
            </Card>

            {/* Admin Account Card */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email} disabled />
                </div>
                <div>
                  <Label>Name</Label>
                  <Input value={user?.name} disabled />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={user?.role} disabled />
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
