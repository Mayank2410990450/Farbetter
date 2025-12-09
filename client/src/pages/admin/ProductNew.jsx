import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function ProductNew() {
  const { id } = useParams();
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [protein, setProtein] = useState('');
  const [discount, setDiscount] = useState('0');
  const [stock, setStock] = useState('0');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([{ label: 'Default', price: '' }]);
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [catRes, productRes] = await Promise.all([
          categoriesAPI.getAll(),
          id ? productsAPI.getById(id) : Promise.resolve(null)
        ]);

        if (mounted) {
          setCategories(catRes.categories || []);

          if (productRes) {
            const p = productRes.product || productRes;
            setName(p.title || p.name || '');
            setTagline(p.tagline || '');
            setDescription(p.description || '');
            setProtein(p.protein || '');
            setDiscount(p.discount || 0);
            setStock(p.stock || 0);
            setCategory(p.category?._id || p.category || '');
            setSizes(p.sizes && p.sizes.length ? p.sizes : [{ label: 'Default', price: p.price || '' }]);
            setCurrentImageUrl(p.image || p.imageUrl);
          }
        }
      } catch (err) {
        console.error(err);
        if (mounted) toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
      }
    };
    fetchData();
    return () => (mounted = false);
  }, [id, toast]);

  const addSize = () => setSizes((s) => [...s, { label: '', price: '' }]);
  const updateSize = (index, field, value) =>
    setSizes((s) => s.map((si, i) => (i === index ? { ...si, [field]: value } : si)));
  const removeSize = (index) => setSizes((s) => s.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !protein || !category) {
      toast({ title: 'Validation', description: 'Name, protein and category are required', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: name,
        tagline,
        description,
        protein: parseInt(protein, 10),
        discount: Math.min(100, Math.max(0, parseInt(discount, 10) || 0)),
        stock: Math.max(0, parseInt(stock, 10) || 0),
        category,
        brand: 'Farbetter',
        status: 'ACTIVE',
        sizes: sizes.map((s) => ({ label: s.label || 'Default', price: parseFloat(s.price || 0) })),
        price: parseFloat(sizes[0]?.price || 0),
      };

      let product;
      if (id) {
        const res = await productsAPI.update(id, payload);
        product = res.product || res;
        toast({ title: 'Product updated', description: `${product.title} was updated.` });
      } else {
        const res = await productsAPI.create(payload);
        product = res.product || res;
        toast({ title: 'Product created', description: `${product.title} was created.` });
      }

      if (imageFile) {
        try {
          await productsAPI.uploadImage(product._id || product.id, imageFile);
        } catch (imgErr) {
          console.warn('Image upload failed', imgErr);
        }
      }

      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to save product', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">{id ? 'Edit Product' : 'New Product'}</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label>Tagline</Label>
              <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded" rows={6} />
            </div>
            <div>
              <Label>Protein (per serve)</Label>
              <Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} required />
            </div>
            <div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Discount (%)</Label>
                  <Input type="number" min="0" max="100" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                </div>
                <div className="flex-1">
                  <Label>Stock</Label>
                  <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
                </div>
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="mb-4">
              <Label>Sizes & Prices</Label>
              <div className="space-y-2">
                {sizes.map((s, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input placeholder="Label" value={s.label} onChange={(e) => updateSize(idx, 'label', e.target.value)} />
                    <Input placeholder="Price" type="number" value={s.price} onChange={(e) => updateSize(idx, 'price', e.target.value)} />
                    <Button type="button" variant="ghost" onClick={() => removeSize(idx)}>Remove</Button>
                  </div>
                ))}
                <Button type="button" onClick={addSize}>Add size</Button>
              </div>
            </div>

            <div className="mb-4">
              <Label>Image</Label>
              {currentImageUrl && !imageFile && (
                <div className="mb-2 h-32 w-32 bg-gray-100 rounded overflow-hidden">
                  <img src={currentImageUrl} alt="Current" className="h-full w-full object-cover" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>

            <div className="mt-6">
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : (id ? 'Update Product' : 'Create Product')}</Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
