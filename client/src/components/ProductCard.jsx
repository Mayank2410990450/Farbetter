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
import OptimizedImage from "@/components/OptimizedImage";

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
          <OptimizedImage
            src={displayImage}
            alt={displayName}
            width={300} // Approximate width for grid item
            height={400} // Aspect 3:4
            objectFit="contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
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
      <div className="p-3 pb-4 space-y-2 flex-1 flex flex-col bg-card dark:bg-zinc-950/50">
        <div className="cursor-pointer" onClick={() => navigate(`/product/${pid}`)}>
          <h3 className="text-base font-medium line-clamp-2 hover:text-primary transition-colors leading-tight" data-testid={`text-name-${pid}`}>
            {displayName}
          </h3>
        </div>

        {/* Row 1: Price (Left) | Rating (Right) */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold" data-testid={`text-price-${pid}`}>
              ₹{((sizes[selectedSize] && sizes[selectedSize].price) || 0).toFixed(0)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through" data-testid={`text-original-price-${pid}`}>
                ₹{product.originalPrice.toFixed(0)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs font-medium bg-yellow-400/10 px-1.5 py-0.5 rounded text-yellow-600 dark:text-yellow-400">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{(averageRating || 0).toFixed(1)}</span>
          </div>
        </div>


      </div>
      <QuickViewModal open={quickOpen} onOpenChange={setQuickOpen} product={product} />
    </Card>
  );
}
