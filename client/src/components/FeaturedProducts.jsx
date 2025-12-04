import ProductCard from "./ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FeaturedProducts({
  products = [],
  title = "Best Sellers",
}) {
  const { add: addToWishlist, remove: removeFromWishlist, wishlist } = useWishlist();
  const navigate = useNavigate();
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold" data-testid="text-featured-title">
            {title}
          </h2>
          <Button variant="outline" data-testid="button-view-all" onClick={() => navigate("/shop")}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">No products available yet.</p>
              <p className="text-sm text-muted-foreground">Products added via the admin panel will appear here.</p>
            </div>
          ) : (
            products.slice(0, 4).map((product, idx) => {
              const pid = product.id ?? product._id ?? idx;
              const isWishlisted = wishlist.some((item) => item.id === pid);
              return (
                <ProductCard
                  key={pid}
                  product={product}
                  isWishlisted={isWishlisted}
                  onToggleWishlist={(productId) => {
                    if (isWishlisted) {
                      removeFromWishlist(productId);
                    } else {
                      addToWishlist(productId);
                    }
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
