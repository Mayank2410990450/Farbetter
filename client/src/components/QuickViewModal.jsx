import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function QuickViewModal({ open, onOpenChange, product }) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const sizes = product?.sizes ?? [{ label: "Default", price: product?.price ?? 0 }];
  const [selectedSize, setSelectedSize] = useState(0);

  if (!product) return null;

  const price = sizes[selectedSize]?.price || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <img src={product?.images?.[0] || product.image || ""} alt={product.name} className="w-full h-auto rounded" />
          </div>
          <div className="md:w-1/2 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {product.tagline || product.brand || "Product Details"}
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" aria-label="Close quick view">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold">₹{price.toFixed(2)}</span>
              {product.originalPrice && <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice.toFixed(2)}</span>}
            </div>

            <div className="flex gap-2">
              {sizes.map((s, i) => (
                <Button key={i} variant={i === selectedSize ? "default" : "outline"} onClick={() => setSelectedSize(i)}>
                  {s.label}
                </Button>
              ))}
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded">
                <button className="px-3" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease">-</button>
                <div className="px-4">{quantity}</div>
                <button className="px-3" onClick={() => setQuantity(quantity + 1)} aria-label="Increase">+</button>
              </div>

              <Button onClick={() => { add(product._id || product.id, quantity); onOpenChange(false); }}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>

              <Button variant="outline">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
