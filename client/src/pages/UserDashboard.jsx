import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { fetchAddresses, addAddress as apiAddAddress, setDefaultAddress as apiSetDefault, deleteAddress as apiDeleteAddress } from '@/api/address';
import { useOrders } from '@/context/OrdersContext';
import { useWishlist } from '@/context/WishlistContext';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
        const { user, logout, authLoading } = useAuth();
        const navigate = useNavigate();
        const { orders, loading: ordersLoading, loadOrders } = useOrders();
        const { wishlist, loading: wishlistLoading, loadWishlist } = useWishlist();
        const { toast } = useToast();

        const [tab, setTab] = useState('profile');

        // Profile form
        const [name, setName] = useState(user?.name || '');
        const [email, setEmail] = useState(user?.email || '');
        const [saving, setSaving] = useState(false);

        // Addresses
        const [addresses, setAddresses] = useState([]);
        const [addrLoading, setAddrLoading] = useState(false);
        const [newAddress, setNewAddress] = useState({ fullName: '', street: '', city: '', state: '', postalCode: '', country: '', phone: '' });

        useEffect(() => {
            setName(user?.name || '');
            setEmail(user?.email || '');
        }, [user]);

        // Sync tab with URL hash and load data when tab changes
        useEffect(() => {
            // Initialize tab from hash if present
            const applyHash = () => {
                const h = (window.location.hash || '').replace('#', '') || 'profile';
                setTab(h);
            };
            applyHash();

            const onHash = () => {
                const h = (window.location.hash || '').replace('#', '') || 'profile';
                setTab(h);
            };
            window.addEventListener('hashchange', onHash);
            return () => window.removeEventListener('hashchange', onHash);
        }, []);

        useEffect(() => {
            if (tab === 'orders') loadOrders();
            if (tab === 'wishlist') loadWishlist();
            if (tab === 'addresses') loadAddressList();
        }, [tab]);

        const goToTab = (t) => {
            if (!t) return;
            // update hash (this will also trigger hashchange handler)
            try { window.location.hash = `#${t}`; } catch (e) { /* ignore */ }
            setTab(t);
        };

        const saveProfile = async () => {
            setSaving(true);
            try {
                // updateProfile is available via auth API; call directly
                const { updateProfile } = await import('@/api/auth');
                await updateProfile({ name, email });
                // refresh page or re-fetch profile by logging in again via context, but we'll keep it simple
                alert('Profile updated');
            } catch (err) {
                console.error(err);
                alert('Failed to update profile');
            } finally {
                setSaving(false);
            }
        };

        const loadAddressList = async () => {
            setAddrLoading(true);
            try {
                const data = await fetchAddresses();
                const list = Array.isArray(data) ? data : data?.addresses ?? [];
                setAddresses(list);
            } catch (err) {
                console.error('Failed to load addresses', err);
                setAddresses([]);
            }
            setAddrLoading(false);
        };

        const addAddress = async ()=>{
            try{
                // basic client-side validation for required backend fields
                if(!newAddress.fullName || !newAddress.street || !newAddress.postalCode){
                    toast({
                        title: "Validation Error",
                        description: "Please provide full name, street and postal code",
                        variant: "destructive"
                    })
                    return
                }

                setAddrLoading(true)
                // send payload matching backend schema
                const payload = {
                    fullName: newAddress.fullName,
                    street: newAddress.street,
                    city: newAddress.city,
                    state: newAddress.state,
                    postalCode: newAddress.postalCode,
                    country: newAddress.country,
                    phone: newAddress.phone,
                }

                const res = await apiAddAddress(payload)
                toast({
                    title: "Success",
                    description: "Address added successfully"
                })
                await loadAddressList()
                setNewAddress({ fullName: '', street: '', city: '', state: '', postalCode: '', country: '', phone: '' })
            }catch(err){
                console.error("Error adding address:", err)
                toast({
                    title: "Error",
                    description: err?.response?.data?.message || 'Failed to add address',
                    variant: "destructive"
                })
            }finally{setAddrLoading(false)}
        }

        const makeDefault = async (id) => {
            try {
                await apiSetDefault(id);
                toast({
                    title: "Success",
                    description: "Default address updated"
                })
                await loadAddressList();
            } catch (err) {
                console.error(err);
                toast({
                    title: "Error",
                    description: "Failed to set default address",
                    variant: "destructive"
                })
            }
        };

        const removeAddress = async (id) => {
            try {
                await apiDeleteAddress(id);
                toast({
                    title: "Success",
                    description: "Address deleted"
                })
                await loadAddressList();
            } catch (err) {
                console.error(err);
                toast({
                    title: "Error",
                    description: "Failed to delete address",
                    variant: "destructive"
                })
            }
        };

        return (
                <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                        <div className="mb-4">
                                <BackButton />
                        </div>
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                            <aside className="w-full lg:w-64 flex-shrink-0">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg">Account</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <nav className="flex flex-col space-y-2">
                                            <button className={`text-left text-sm sm:text-base px-2 py-1 rounded hover:bg-muted transition ${tab==='profile'?'font-semibold bg-muted':''}`} onClick={() => goToTab('profile')}>Profile</button>
                                            <button className={`text-left text-sm sm:text-base px-2 py-1 rounded hover:bg-muted transition ${tab==='addresses'?'font-semibold bg-muted':''}`} onClick={() => goToTab('addresses')}>Addresses</button>
                                            <button className={`text-left text-sm sm:text-base px-2 py-1 rounded hover:bg-muted transition ${tab==='orders'?'font-semibold bg-muted':''}`} onClick={() => goToTab('orders')}>Orders</button>
                                            <button className={`text-left text-sm sm:text-base px-2 py-1 rounded hover:bg-muted transition ${tab==='wishlist'?'font-semibold bg-muted':''}`} onClick={() => goToTab('wishlist')}>Wishlist</button>
                                            <button className="text-left text-destructive text-sm sm:text-base px-2 py-1 rounded hover:bg-destructive/10 transition mt-4" onClick={async () => { await logout(); navigate('/'); }}>Logout</button>
                                        </nav>
                                    </CardContent>
                                </Card>
                            </aside>

                            <main className="flex-1 w-full">
                                {tab === 'profile' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Profile</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium">Name</label>
                                                <input className="mt-1 block w-full" value={name} onChange={(e)=>setName(e.target.value)} />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium">Email</label>
                                                <input className="mt-1 block w-full" value={email} onChange={(e)=>setEmail(e.target.value)} />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button onClick={saveProfile} disabled={saving}>{saving? 'Saving...' : 'Save'}</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {tab === 'addresses' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Addresses</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {addrLoading ? <div>Loading addresses...</div> : (
                                                <div>
                                                    {addresses.length === 0 ? <div>No addresses yet.</div> : (
                                                        <ul className="space-y-2">
                                                            {addresses.map(a=> (
                                                                <li key={a._id || a.id} className="border p-3 rounded">
                                                                    <div className="flex justify-between">
                                                                        <div>
                                                                            <div className="font-medium">{a.fullName}</div>
                                                                            <div className="text-sm text-muted-foreground">{a.street}</div>
                                                                            <div className="text-sm text-muted-foreground">{a.city}, {a.state} {a.postalCode}</div>
                                                                            <div className="text-sm text-muted-foreground">{a.country}</div>
                                                                            <div className="text-sm text-muted-foreground">Phone: {a.phone}</div>
                                                                        </div>
                                                                        <div className="flex flex-col items-end gap-2">
                                                                            {!a.isDefault && <button className="text-sm underline" onClick={()=>makeDefault(a._id || a.id)}>Set default</button>}
                                                                            {a.isDefault && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Default</span>}
                                                                            <button className="text-sm text-destructive" onClick={()=>removeAddress(a._id || a.id)}>Delete</button>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}

                                                        <div className="mt-4">
                                                                <h4 className="font-medium mb-2">Add address</h4>
                                                                <div className="grid grid-cols-1 gap-2">
                                                                    <input 
                                                                        type="text"
                                                                        placeholder="Full name" 
                                                                        value={newAddress.fullName} 
                                                                        onChange={(e)=>setNewAddress({...newAddress,fullName:e.target.value})}
                                                                        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                                    />
                                                                    <input 
                                                                        type="text"
                                                                        placeholder="Street / Address line 1" 
                                                                        value={newAddress.street} 
                                                                        onChange={(e)=>setNewAddress({...newAddress,street:e.target.value})}
                                                                        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                                    />
                                                                    <input 
                                                                        type="text"
                                                                        placeholder="City" 
                                                                        value={newAddress.city} 
                                                                        onChange={(e)=>setNewAddress({...newAddress,city:e.target.value})}
                                                                        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                                    />
                                                                    <input 
                                                                        type="text"
                                                                        placeholder="State" 
                                                                        value={newAddress.state} 
                                                                        onChange={(e)=>setNewAddress({...newAddress,state:e.target.value})}
                                                                        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                                    />
                                                                    <input 
                                                                        type="text"
                                                                        placeholder="Postal Code" 
                                                                        value={newAddress.postalCode} 
                                                                        onChange={(e)=>setNewAddress({...newAddress,postalCode:e.target.value})}
                                                                        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                                    />
                                                                    <input 
                                                                        type="text"
                                                                        placeholder="Country" 
                                                                        value={newAddress.country} 
                                                                        onChange={(e)=>setNewAddress({...newAddress,country:e.target.value})}
                                                                        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                                    />
                                                                    <input 
                                                                        type="tel"
                                                                        placeholder="Phone" 
                                                                        value={newAddress.phone} 
                                                                        onChange={(e)=>setNewAddress({...newAddress,phone:e.target.value})}
                                                                        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                                                    />
                                                                    <div className="mt-2"><Button onClick={addAddress} disabled={addrLoading} className="w-full">Add Address</Button></div>
                                                                </div>
                                                        </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {tab === 'orders' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Your Orders</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {ordersLoading ? <div>Loading orders...</div> : (
                                                <ul className="space-y-2">
                                                    {orders.length === 0 ? <li>No orders yet.</li> : orders.map(o => (
                                                            <li key={o._id || o.id} className="border p-3 rounded">
                                                                <div className="flex justify-between">
                                                                    <div>
                                                                        <div className="font-medium">Order #{o._id || o.id}</div>
                                                                        <div className="text-sm text-muted-foreground">Status: {o.status || o.orderStatus || 'N/A'}</div>
                                                                        <div className="mt-2">
                                                                            <ul className="space-y-2">
                                                                                {Array.isArray(o.items) && o.items.map((it) => (
                                                                                    <li key={it.product?._id || it.product} className="flex items-center justify-between">
                                                                                        <div>
                                                                                            <div className="font-medium">{it.product?.title || it.product?.name || 'Product'}</div>
                                                                                            <div className="text-xs text-muted-foreground">Qty: {it.quantity} • Price: ₹{Number(it.price || it.product?.price || 0).toFixed(2)}</div>
                                                                                        </div>
                                                                                        <div className="text-sm font-semibold">₹{Number((it.price || it.product?.price || 0) * (it.quantity || 1)).toFixed(2)}</div>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="font-semibold">{o.totalAmount ? `₹${o.totalAmount}` : (o.amount? `₹${o.amount}` : '')}</div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                </ul>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {tab === 'wishlist' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Your Wishlist</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {wishlistLoading ? <div>Loading wishlist...</div> : (
                                                <ul className="space-y-2">
                                                    {wishlist.length === 0 ? <li>No wishlist items.</li> : wishlist.map(p => (
                                                        <li key={p.id || p._id} className="border p-3 rounded flex justify-between items-center">
                                                            <div>
                                                                <div className="font-medium">{p.name}</div>
                                                                <div className="text-sm text-muted-foreground">{p.price ? `₹${p.price}` : ''}</div>
                                                            </div>
                                                            <div>
                                                                {/* Optionally add remove button - uses context remove */}
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </main>
                        </div>
                </div>
        );
}
