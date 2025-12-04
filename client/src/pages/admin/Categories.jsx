import { useEffect, useState } from 'react';
import { categoriesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await categoriesAPI.getAll();
        if (mounted) setCategories(res.categories || []);
      } catch (err) {
        console.error(err);
        if (mounted) setError('Failed to load categories');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => (mounted = false);
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const res = await categoriesAPI.create({ name });
      setCategories((prev) => [res.category, ...prev]);
      setName('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoriesAPI.delete(id);
      setCategories((prev) => prev.filter((c) => (c._id || c.id) !== id));
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Categories</h1>
          <div className="w-full max-w-xs">
            <div className="flex gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New category name" />
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </div>
        </div>

        {loading && <div>Loading categories...</div>}
        {error && <div className="text-red-600">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c._id || c.id} className="p-4 bg-background border rounded flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-muted-foreground">{c.slug || ''}</div>
              </div>
              <div>
                <Button size="sm" variant="outline" onClick={() => handleDelete(c._id || c.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
