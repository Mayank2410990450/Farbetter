import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/context/WishlistContext";
import QuickViewModal from "@/components/QuickViewModal";
import { getStockStatus } from "@/lib/stockUtils";
import { getOptimizedImageUrl } from "@/lib/utils";

export default function ProductCard({
  product,
  onToggleWishlist,
}) {
  const [selectedSize, setSelectedSize] = useState(0);
  // Cart context exposes `add(productId, quantity)`; use that here.
  const navigate = useNavigate();
  const { add } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { wishlist, add: addToWishlist, remove: removeFromWishlist } = useWishlist();

  // Ensure sizes is always an array to avoid runtime `map` errors.
  const sizes = product?.sizes ?? (product ? [{ label: "Default", price: product.price ?? 0 }] : []);

  const pid = product?.id ?? product?._id;
  const displayName = product?.name ?? product?.title ?? "Product";
  const displayTagline = product?.tagline ?? product?.category?.name ?? "";
  const displayProtein = product?.protein ?? 0;
  const displayImage = product?.image ?? product?.images?.[0] ?? "";
  const optimizedImage = getOptimizedImageUrl(displayImage, 500);

  // Rating and review stats from backend
  const averageRating = product?.averageRating ?? 0;
  const numReviews = product?.numReviews ?? 0;

  const isWishlisted = wishlist.some((w) => w.id === pid);
  const handleWishlistToggle = async () => {
    try {
      if (isWishlisted) {
        // optimistic remove
        removeFromWishlist(pid);
      } else {
        addToWishlist(pid);
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  };

  const handleAddToCart = () => {
    // Prevent adding when out of stock
    if (product?.stock === 0 || product?.soldOut) {
      toast({ title: "Out of stock", description: `${displayName} is currently out of stock`, variant: "destructive" });
      return;
    }

    // If user is not logged in, add to guest cart (CartContext handles guest storage)
    if (!user) {
      add(pid, 1);
      toast({
        title: "Saved for later",
        description: `${displayName} was added to your device cart. It will be merged when you log in.`,
      });
      return;
    }

    // Authenticated users: use server cart
    add(pid, 1);
    toast({ title: "Added to Cart", description: `${displayName} has been added to your cart` });
  };

  const [quickOpen, setQuickOpen] = useState(false);

  const isOnSale = product?.originalPrice && product.originalPrice > ((sizes[selectedSize] && sizes[selectedSize].price) || product.price || 0);
  const discountPercent = isOnSale
    ? Math.round(
      ((product.originalPrice - ((sizes[selectedSize] && sizes[selectedSize].price) || product.price || 0)) / product.originalPrice) * 100
    )
    : 0;

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="overflow-hidden hover-elevate group relative h-full flex flex-col rounded-none">
      {/* Wishlist Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm transition-transform transform ${isWishlisted ? "scale-110 text-destructive" : "hover:scale-105"}`}
        onClick={handleWishlistToggle}
        data-testid={`button-wishlist-${pid}`}
        aria-label={isWishlisted ? `Remove ${displayName} from wishlist` : `Add ${displayName} to wishlist`}
      >
        <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? "fill-current" : ""}`} fill={isWishlisted ? "currentColor" : "none"} />
      </Button>

      {/* Top-right badges */}
      <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-2">
        {isOnSale && (
          <Badge className="bg-destructive text-destructive-foreground" data-testid={`badge-sale-${pid}`}>
            -{discountPercent}%
          </Badge>
        )}
        {displayProtein ? (
          <Badge className="bg-primary text-primary-foreground" data-testid={`badge-protein-${pid}`}>
            {displayProtein}% Protein
          </Badge>
        ) : null}
        {/* stock count intentionally hidden; Sold Out overlay handles out-of-stock state */}
      </div>

      {/* Product Image */}
      <div className="relative overflow-hidden bg-white cursor-pointer group" onClick={() => navigate(`/product/${pid}`)}>
        <div className="w-full aspect-[3/4] relative overflow-hidden bg-white dark:bg-card rounded-none">
          <img
            src={optimizedImage}
            alt={displayName}
            loading="lazy"
            className="w-full h-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-300"
            data-testid={`img-product-${pid}`}
          />
        </div>

        {/* Hover overlay with quick actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/10">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); setQuickOpen(true); }}
            aria-label={`Quick view for ${displayName}`}
            title="Quick view"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
            aria-label={`Add ${displayName} to cart`}
            title="Add to cart"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sold Out Overlay */}
      {(product?.stock === 0 || product?.soldOut) && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
          <Badge variant="secondary" className="text-base px-6 py-2" data-testid={`badge-soldout-${pid}`}>
            Sold Out
          </Badge>
        </div>
      )}

      {/* Product Info */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="cursor-pointer" onClick={() => navigate(`/product/${pid}`)}>
          <h3 className="text-lg font-semibold line-clamp-2 hover:text-primary transition-colors" data-testid={`text-name-${pid}`}>
            {displayName}
          </h3>
        </div>

        {/* Always show rating (0.0 when none) */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {renderStars(averageRating)}
          <span className="font-medium">{(averageRating || 0).toFixed(1)}</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold" data-testid={`text-price-${pid}`}>
            ₹{((sizes[selectedSize] && sizes[selectedSize].price) || 0).toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${pid}`}>
              ₹{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={product?.stock === 0 || product?.soldOut}
          data-testid={`button-add-to-cart-${pid}`}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
      <QuickViewModal open={quickOpen} onOpenChange={setQuickOpen} product={product} />
    </Card>
  );
}
