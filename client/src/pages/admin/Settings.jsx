import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { fetchShippingSettings, updateShippingSettings } from '@/api/admin';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [freeThreshold, setFreeThreshold] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await fetchShippingSettings();
      if (res && res.settings) {
        setSettings(res.settings);
        setShippingCost(res.settings.shippingCost || 0);
        setFreeThreshold(res.settings.freeShippingThreshold ? String(res.settings.freeShippingThreshold) : '');
        setDescription(res.settings.description || '');
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      toast({ title: 'Error', description: 'Failed to load shipping settings', variant: 'destructive' });
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      
      // Validate inputs
      const cost = Math.max(0, Number(shippingCost) || 0);
      const threshold = freeThreshold === '' ? null : Math.max(0, Number(freeThreshold) || 0);
      
      const res = await updateShippingSettings({ 
        shippingCost: cost, 
        freeShippingThreshold: threshold, 
        description 
      });
      
      setSettings(res.settings);
      toast({ title: 'Success', description: 'Shipping settings saved successfully' });
    } catch (err) {
      console.error('Error saving settings:', err);
      toast({ title: 'Error', description: 'Failed to save shipping settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-6">Manage global store settings</p>
        
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Shipping Configuration</h2>
            <div className="space-y-4">
              {/* Shipping Cost */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Base Shipping Cost (₹)
                </label>
                <Input 
                  type="number" 
                  min="0" 
                  step="10"
                  value={shippingCost} 
                  onChange={(e) => setShippingCost(e.target.value)}
                  placeholder="e.g., 50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Applied to all orders unless free shipping threshold is met
                </p>
              </div>

              {/* Free Shipping Threshold */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Free Shipping Threshold (₹) - Optional
                </label>
                <Input 
                  type="number" 
                  min="0" 
                  step="100"
                  value={freeThreshold} 
                  onChange={(e) => setFreeThreshold(e.target.value)}
                  placeholder="e.g., 500 (leave empty to disable)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Orders above this amount get free shipping. Leave empty to disable.
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Shipping Description
                </label>
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Standard shipping 5-7 business days"
                  className="min-h-24"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Shown to customers on checkout when applicable
                </p>
              </div>

              {/* Current Settings Display */}
              {settings && (
                <div className="bg-muted/30 p-4 rounded mt-6">
                  <p className="text-sm font-medium mb-2">Current Active Settings:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Base Shipping: ₹{settings.shippingCost || 0}</li>
                    <li>• Free Shipping Threshold: {settings.freeShippingThreshold ? `₹${settings.freeShippingThreshold}` : 'Disabled'}</li>
                    <li>• Last Updated: {new Date(settings.updatedAt).toLocaleDateString()}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-6 flex gap-3">
            <Button onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button variant="outline" onClick={load}>
              Reset
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
