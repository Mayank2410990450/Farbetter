import CompactProductCard from "./CompactProductCard";
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
    <section className="py-8 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl md:text-2xl font-normal" data-testid="text-featured-title">
            {title}
          </h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={() => navigate("/shop")}>
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Mobile: Horizontal Scroll | Desktop: Grid */}
        <div className="
          flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory 
          md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible md:pb-0
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        ">
          {products.length === 0 ? (
            <div className="col-span-full w-full text-center py-12 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground text-sm">No products available.</p>
            </div>
          ) : (
            products.slice(0, 8).map((product, idx) => {
              const pid = product.id ?? product._id ?? idx;
              const isWishlisted = wishlist.some((item) => item.id === pid);
              return (
                <div key={pid} className="snap-start shrink-0 w-[160px] md:w-auto">
                  <CompactProductCard
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
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
