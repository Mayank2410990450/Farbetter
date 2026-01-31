
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import OptimizedImage from "@/components/OptimizedImage";

export default function CompactProductCard({ product, isWishlisted, onToggleWishlist }) {
    const navigate = useNavigate();
    const { add } = useCart();
    const { user } = useAuth();
    const { toast } = useToast();

    const pid = product?.id ?? product?._id;
    const displayName = product?.name ?? product?.title ?? "Product";
    // const displayProtein = product?.protein ?? 0;
    const displayImage = product?.image ?? product?.images?.[0] ?? "";

    const sizes = product?.sizes ?? (product ? [{ label: "Default", price: product.price ?? 0 }] : []);
    const price = (sizes[0]?.price || product?.price || 0);
    const averageRating = product?.averageRating ?? 0;

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (product?.stock === 0 || product?.soldOut) {
            toast({ title: "Out of stock", variant: "destructive" });
            return;
        }
        add(pid, 1);
        toast({ title: "Added to Cart" });
    };

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        onToggleWishlist(pid);
    };

    return (
        <Card
            className="group relative flex flex-col overflow-hidden rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300 bg-card dark:bg-card/40"
            onClick={() => navigate(`/product/${pid}`)}
        >
            {/* Wishlist Button - Absolute Top Right */}
            <button
                onClick={handleWishlistClick}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm text-muted-foreground hover:text-red-500 transition-colors"
            >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
            </button>

            {/* Image Container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-white dark:bg-zinc-900/50">
                <OptimizedImage
                    src={displayImage}
                    alt={displayName}
                    width={300}
                    objectFit="contain"
                    sizes="(max-width: 768px) 160px, (max-width: 1024px) 33vw, 25vw"
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                {(product?.stock === 0 || product?.soldOut) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                        <Badge variant="secondary" className="text-xs font-bold">Sold Out</Badge>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-3">
                {/* Title */}
                <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground/90 mb-1.5 min-h-[2.5em]">
                    {displayName}
                </h3>

                {/* Row 1: Price (Left) | Rating (Right) */}
                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-foreground">₹{price.toFixed(0)}</span>
                        {product?.originalPrice > price && (
                            <span className="text-[10px] text-muted-foreground line-through">
                                ₹{product.originalPrice.toFixed(0)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-medium bg-yellow-400/10 px-1.5 py-0.5 rounded text-yellow-600 dark:text-yellow-400">
                        <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                        <span>{averageRating.toFixed(1)}</span>
                    </div>
                </div>


            </div>
        </Card>
    );
}
