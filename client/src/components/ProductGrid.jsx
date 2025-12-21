import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "./ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductGrid({ products = [] }) {
  const { add, remove, wishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ================= URL STATE ================= */
  const urlSort = searchParams.get("sort") || "popularity";
  const urlCategory = searchParams.get("category");

  const [sortBy, setSortBy] = useState(urlSort);
  const [selectedCategories, setSelectedCategories] = useState(
    urlCategory ? [urlCategory] : []
  );

  /* ========== SYNC WHEN URL CHANGES ========== */
  useEffect(() => {
    setSortBy(urlSort);
    setSelectedCategories(urlCategory ? [urlCategory] : []);
  }, [urlSort, urlCategory]);

  /* ========== UPDATE URL HELPERS ========== */
  const updateParams = (params) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      Object.entries(params).forEach(([key, value]) => {
        if (!value) p.delete(key);
        else p.set(key, value);
      });
      return p;
    });
  };

  /* ========== CATEGORIES ========== */
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const c = p?.category?.slug || p?.category?.name || p?.category;
      if (c) set.add(c);
    });
    return Array.from(set);
  }, [products]);

  /* ========== FILTERING ========== */
  const filteredProducts = products.filter((p) => {
    if (selectedCategories.length === 0) return true;
    const c = p?.category?.slug || p?.category?.name || p?.category;
    return selectedCategories.includes(c);
  });

  /* ========== SORTING ========== */
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];

    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (sortBy === "price-low") {
      list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    }

    if (sortBy === "price-high") {
      list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }

    return list;
  }, [filteredProducts, sortBy]);

  /* ========== HANDLERS ========== */
  const handleSortChange = (value) => {
    setSortBy(value);
    updateParams({ sort: value });
  };

  const toggleCategory = (category) => {
    const next = selectedCategories.includes(category) ? [] : [category];
    setSelectedCategories(next);
    updateParams({ category: next[0] });
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    updateParams({ category: null });
  };

  /* ========== UI ========== */
  const FilterContent = () => (
    <div className="space-y-6">
      <h3 className="font-semibold">Category</h3>
      {categories.map((cat) => (
        <div key={cat} className="flex items-center gap-2">
          <Checkbox
            checked={selectedCategories.includes(cat)}
            onCheckedChange={() => toggleCategory(cat)}
          />
          <Label className="cursor-pointer">{cat}</Label>
        </div>
      ))}

      <Button variant="outline" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 sticky top-24">
          <FilterContent />
        </aside>

        <div className="flex-1">
          <div className="flex justify-between mb-6">
            <p className="text-muted-foreground">
              Showing {sortedProducts.length} products
            </p>

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="price-low">Price: Low → High</SelectItem>
                <SelectItem value="price-high">Price: High → Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((p) => {
              const id = p._id || p.id;
              const isWishlisted = wishlist.some((w) => w.id === id);

              return (
                <ProductCard
                  key={id}
                  product={p}
                  isWishlisted={isWishlisted}
                  onToggleWishlist={() =>
                    isWishlisted ? remove(id) : add(id)
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
