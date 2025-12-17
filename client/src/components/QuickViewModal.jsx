import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function QuickViewModal({ open, onOpenChange, product }) {
  const { add } = useCart();
  const { add: addToWishlist, remove: removeFromWishlist, wishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);

  const sizes = product?.sizes ?? [{ label: "Default", price: product?.price ?? 0 }];
  const [selectedSize, setSelectedSize] = useState(0);

  if (!product) return null;

  const isWishlisted = wishlist.some((item) => item.id === (product._id || product.id));

  const handleToggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product._id || product.id);
    } else {
      addToWishlist(product._id || product.id);
    }
  };

  const price = sizes[selectedSize]?.price || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <img src={product?.images?.[0] || product.image || ""} alt={product.name} className="w-full h-auto rounded" />
          </div>
          <div className="md:w-1/2 flex flex-col gap-5">
            <div className="relative">
              <div className="flex justify-between items-start">
                <div>
                  {product.brand && (
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {product.brand}
                    </span>
                  )}
                  <DialogTitle className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                    {product.name}
                  </DialogTitle>
                  {product.tagline && (
                    <DialogDescription className="text-sm text-slate-500 mt-1">
                      {product.tagline}
                    </DialogDescription>
                  )}
                </div>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 rounded-full hover:bg-slate-100" aria-label="Close">
                    <X className="h-5 w-5 text-slate-500" />
                  </Button>
                </DialogClose>
              </div>
            </div>

            <div className="space-y-4">
              {/* Price Block */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">₹{price.toFixed(0)}</span>
                    {(product.mrp > price) && (
                      <span className="text-sm text-muted-foreground line-through">₹{product.mrp.toFixed(0)}</span>
                    )}
                  </div>
                  {product.mrp > price && (
                    <div className="text-xs font-bold text-green-600 mt-0.5">
                      You save ₹{(product.mrp - price).toFixed(0)}
                    </div>
                  )}
                </div>
                {(product.mrp > price) && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    {Math.round(((product.mrp - price) / product.mrp) * 100)}% OFF
                  </Badge>
                )}
              </div>

              {/* Size Selector */}
              {sizes.length > 1 ? (
                <div>
                  <span className="text-sm font-semibold text-slate-900 mb-2 block">Select Size</span>
                  <div className="flex gap-2">
                    {sizes.map((s, i) => (
                      <Button
                        key={i}
                        variant={i === selectedSize ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSize(i)}
                        className={i === selectedSize ? "ring-2 ring-primary ring-offset-1" : ""}
                      >
                        {s.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                product.size && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">Pack Size:</span>
                    <Badge variant="outline" className="text-slate-600 bg-slate-50">{product.size}</Badge>
                  </div>
                )
              )}

              {/* Description */}
              <p className="text-sm text-slate-600 leading-relaxed max-h-[100px] overflow-y-auto pr-2 scrollbar-thin">
                {product.description}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex gap-3 h-12">
                <div className="flex items-center border border-slate-200 rounded-lg bg-white w-32">
                  <button
                    className="px-3 h-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-l-lg transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center font-bold text-slate-900">{quantity}</div>
                  <button
                    className="px-3 h-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-r-lg transition-colors"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <Button
                  className="flex-1 h-full text-base font-bold shadow-md"
                  onClick={() => { add(product._id || product.id, quantity); onOpenChange(false); }}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>

              <div className="flex justify-center">
                <Button
                  variant="link"
                  size="sm"
                  className={`text-xs h-auto p-0 ${isWishlisted ? 'text-red-600 hover:text-red-700' : 'text-muted-foreground hover:text-primary'}`}
                  onClick={handleToggleWishlist}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-3 h-3 mr-1 ${isWishlisted ? 'fill-current' : ''}`} />
                  {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
