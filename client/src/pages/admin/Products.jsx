import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState(null); // 'discount' or 'stock'
  const [discounts, setDiscounts] = useState({});
  const [stocks, setStocks] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productsAPI.getAll({ limit: 100 });
        if (mounted) {
          setProducts(res.products || []);
          // Initialize discounts and stocks from product data
          const discountMap = {};
          const stockMap = {};
          (res.products || []).forEach(p => {
            discountMap[p._id] = p.discount || 0;
            stockMap[p._id] = p.stock || 0;
          });
          setDiscounts(discountMap);
          setStocks(stockMap);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError(err.message || 'Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => (mounted = false);
  }, []);

  const navigate = useNavigate();

  const handleDiscountChange = (productId, value) => {
    const numValue = Math.min(100, Math.max(0, Number(value) || 0));
    setDiscounts(prev => ({ ...prev, [productId]: numValue }));
  };

  const handleStockChange = (productId, value) => {
    const numValue = Math.max(0, Number(value) || 0);
    setStocks(prev => ({ ...prev, [productId]: numValue }));
  };

  const handleSaveDiscount = async (productId) => {
    try {
      await productsAPI.update(productId, { discount: discounts[productId] });
      setProducts(prev =>
        prev.map(p =>
          p._id === productId ? { ...p, discount: discounts[productId] } : p
        )
      );
      setEditingId(null);
      setEditType(null);
      toast({
        title: 'Success',
        description: 'Discount updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update discount',
        variant: 'destructive',
      });
    }
  };

  const handleSaveStock = async (productId) => {
    try {
      await productsAPI.updateStock(productId, { stock: stocks[productId] });
      setProducts(prev =>
        prev.map(p =>
          p._id === productId ? { ...p, stock: stocks[productId] } : p
        )
      );
      setEditingId(null);
      setEditType(null);
      toast({
        title: 'Success',
        description: 'Stock updated successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update stock',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => navigate('/admin/products/new')}>New Product</Button>
          </div>
        </div>

        {loading && <div>Loading products...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && products.length === 0 && (
          <div className="p-6 bg-background border rounded">No products found.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p._id || p.id} className="bg-background border rounded p-4">
              <div className="h-48 mb-4 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                {p.imageUrl ? (
                  // product images are stored as full URLs from cloudinary
                  <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="text-sm text-muted-foreground">No image</div>
                )}
              </div>
              <h3 className="font-semibold text-lg">{p.name}</h3>
              {p.tagline && <p className="text-sm text-muted-foreground">{p.tagline}</p>}
              {p.description && <p className="mt-2 text-sm">{p.description}</p>}
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Discount %:</label>
                  {editingId === p._id && editType === 'discount' ? (
                    <div className="flex gap-2 flex-1">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={discounts[p._id] || 0}
                        onChange={(e) => handleDiscountChange(p._id, e.target.value)}
                        className="flex-1"
                        placeholder="0-100"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveDiscount(p._id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm">{discounts[p._id] || 0}%</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingId(p._id); setEditType('discount'); }}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Stock:</label>
                  {editingId === p._id && editType === 'stock' ? (
                    <div className="flex gap-2 flex-1">
                      <Input
                        type="number"
                        min="0"
                        value={stocks[p._id] || 0}
                        onChange={(e) => handleStockChange(p._id, e.target.value)}
                        className="flex-1"
                        placeholder="0"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveStock(p._id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm">{stocks[p._id] || 0} units</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingId(p._id); setEditType('stock'); }}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" onClick={() => navigate(`/admin/products/${p._id || p.id}/edit`)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={async () => {
                  if (!confirm('Delete this product?')) return;
                  try {
                    await productsAPI.delete(p._id || p.id);
                    setProducts((prev) => prev.filter(x => (x._id || x.id) !== (p._id || p.id)));
                  } catch (err) {
                    alert('Failed to delete product');
                  }
                }}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

