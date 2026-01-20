import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createCoupon, getAllCoupons, deleteCoupon } from "@/api/coupon";

export default function Coupons() {
    const { toast } = useToast();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        minPurchaseAmount: "",
        expirationDate: "",
        usageLimit: "",
    });

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const data = await getAllCoupons();
            setCoupons(data.coupons || []);
        } catch (error) {
            console.error("Failed to load coupons:", error);
            toast({
                title: "Error",
                description: "Failed to load coupons",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createCoupon(formData);
            toast({ title: "Success", description: "Coupon created successfully" });
            setIsDialogOpen(false);
            setFormData({
                code: "",
                discountType: "PERCENTAGE",
                discountValue: "",
                minPurchaseAmount: "",
                expirationDate: "",
                usageLimit: "",
            });
            loadCoupons();
        } catch (error) {
            console.error("Create coupon error:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to create coupon",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await deleteCoupon(id);
            toast({ title: "Success", description: "Coupon deleted" });
            loadCoupons();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete coupon",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Coupons Management</h2>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Coupon
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Coupon</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <Label>Coupon Code</Label>
                            <Input
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="e.g. SUMMER20"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Type</Label>
                                <Select
                                    value={formData.discountType}
                                    onValueChange={(val) => setFormData({ ...formData, discountType: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                        <SelectItem value="FIXED">Fixed Amount (₹)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Value</Label>
                                <Input
                                    type="number"
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                    placeholder={formData.discountType === "PERCENTAGE" ? "10" : "100"}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Min Purchase (₹)</Label>
                                <Input
                                    type="number"
                                    value={formData.minPurchaseAmount}
                                    onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <Label>Usage Limit</Label>
                                <Input
                                    type="number"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    placeholder="Unlimited"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Expiration Date</Label>
                            <Input
                                type="date"
                                value={formData.expirationDate}
                                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full">Create Coupon</Button>
                    </form>
                </DialogContent>
            </Dialog>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Min Purchase</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : coupons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No coupons found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                coupons.map((coupon) => (
                                    <TableRow key={coupon._id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-primary" />
                                            {coupon.code}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.discountType === "PERCENTAGE"
                                                ? `${coupon.discountValue}%`
                                                : `₹${coupon.discountValue}`}
                                        </TableCell>
                                        <TableCell>₹{coupon.minPurchaseAmount}</TableCell>
                                        <TableCell>{new Date(coupon.expirationDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {coupon.usedCount} / {coupon.usageLimit ? coupon.usageLimit : "∞"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(coupon._id)}>
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
