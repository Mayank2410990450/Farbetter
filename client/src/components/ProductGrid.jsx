// src/components/ProductGrid.jsx
import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductGrid({ products = [] }) {
  const { add: addToWishlist, remove: removeFromWishlist, wishlist } = useWishlist();
  const [sortBy, setSortBy] = useState("popularity");
  const [selectedCategories, setSelectedCategories] = useState([]);

  // derive categories from products
  const categories = useMemo(() => {
    const cats = new Set();
    (products || []).forEach((p) => {
      const c = p?.category?.name ?? p?.category ?? "Uncategorized";
      cats.add(c);
    });
    return ["All", ...Array.from(cats)];
  }, [products]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // filter only by category (nutrition removed)
  const filteredProducts = (products || []).filter((product) => {
    if (selectedCategories.length > 0) {
      const prodCategory = product?.category?.name ?? product?.category ?? "Uncategorized";
      if (!selectedCategories.includes(prodCategory)) return false;
    }
    return true;
  });

  const sortedProducts = useMemo(() => {
    const copy = [...filteredProducts];
    if (sortBy === "price-low") copy.sort((a, b) => (a?.price ?? a?.sizes?.[0]?.price ?? 0) - (b?.price ?? b?.sizes?.[0]?.price ?? 0));
    if (sortBy === "price-high") copy.sort((a, b) => (b?.price ?? b?.sizes?.[0]?.price ?? 0) - (a?.price ?? a?.sizes?.[0]?.price ?? 0));
    if (sortBy === "newest") copy.sort((a, b) => new Date(b?.createdAt) - new Date(a?.createdAt));
    return copy;
  }, [filteredProducts, sortBy]);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* CATEGORY ONLY (Nutrition removed) */}
      <div>
        <h3 className="font-semibold mb-4">Category</h3>
        <div className="space-y-3">
          {categories.slice(1).map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => setSelectedCategories([])}
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <h2 className="font-semibold text-lg mb-6">Filters</h2>
            <FilterContent />
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <p className="text-muted-foreground">Showing {sortedProducts.length} products</p>

            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription className="sr-only">
                      Filter products by category and other options
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-muted-foreground text-lg mb-2">No products found</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCategories.length > 0
                    ? "Try adjusting your filters or browse all products"
                    : "Products added via the admin panel will appear here"}
                </p>
                {selectedCategories.length > 0 && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSelectedCategories([])}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              sortedProducts.map((product) => {
                const pid = product._id ?? product.id;
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
      </div>
    </div>
  );
}
