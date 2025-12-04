// src/pages/Shop.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import ProductGrid from "@/components/ProductGrid";
import SEOHelmet from "@/components/SEOHelmet";
import { fetchProducts } from "@/api/product";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get category from URL params (e.g., ?category=protein-puffs)
  const selectedCategory = searchParams.get("category");
  const searchQuery = searchParams.get("search");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts(); // uses your apiClient
      // backend might return { products: [...] } or direct array
      let list = Array.isArray(data) ? data : data?.products ?? [];
      
      // Filter by category if selected
      if (selectedCategory) {
        const catLower = selectedCategory.toLowerCase();
        list = list.filter((product) => {
          // Possible category shapes:
          // - product.category: string
          // - product.category: { name, slug }
          // - product.categories: array of objects or strings
          // - product.categoryId or product.category_id
          const p = product || {};

          // 1) single category as string or object
          const catObj = p.category;
          const candidates = [];

          if (typeof catObj === "string") candidates.push(catObj.toLowerCase());
          if (catObj && typeof catObj === "object") {
            if (catObj.name) candidates.push(String(catObj.name).toLowerCase());
            if (catObj.slug) candidates.push(String(catObj.slug).toLowerCase());
            if (catObj._id) candidates.push(String(catObj._id).toLowerCase());
            if (catObj.id) candidates.push(String(catObj.id).toLowerCase());
          }

          // 2) categories array
          const arr = p.categories || p.categorys || null;
          if (Array.isArray(arr)) {
            arr.forEach((c) => {
              if (!c) return;
              if (typeof c === "string") candidates.push(c.toLowerCase());
              if (typeof c === "object") {
                if (c.name) candidates.push(String(c.name).toLowerCase());
                if (c.slug) candidates.push(String(c.slug).toLowerCase());
                if (c._id) candidates.push(String(c._id).toLowerCase());
              }
            });
          }

          // 3) other possible fields
          if (p.categoryId) candidates.push(String(p.categoryId).toLowerCase());
          if (p.category_id) candidates.push(String(p.category_id).toLowerCase());

          // 4) product-level tags/names
          if (p.name) candidates.push(String(p.name).toLowerCase());
          if (p.title) candidates.push(String(p.title).toLowerCase());

          // Check if any candidate matches the selected category
          return candidates.some((c) => c && (c === catLower || c.includes(catLower)));
        });
      }
      
      // Apply search filtering if provided
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter((p) => {
          const name = (p.name || p.title || "").toString().toLowerCase();
          const desc = (p.description || p.desc || p.summary || "").toString().toLowerCase();
          return name.includes(q) || desc.includes(q);
        });
      }

      setProducts(list);
    } catch (err) {
      console.error("Error loading products:", err);
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const pageTitle = selectedCategory 
    ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} | Shop - Farbetter`
    : "Shop All Products | Farbetter - Premium Protein Snacks";
  
  const pageDescription = selectedCategory
    ? `Shop our collection of ${selectedCategory} protein snacks. High-protein, low-sugar, clean ingredients.`
    : "Browse our complete collection of high-protein snacks. Filter by category, nutrition, and more to find your perfect match.";

  return (
    <>
      <SEOHelmet
        title={pageTitle}
        description={pageDescription}
        canonical={`https://farbetter.com/shop${selectedCategory ? `?category=${selectedCategory}` : ''}`}
      />
      <div className="min-h-screen flex flex-col">
        {/* Fixed Header with Actions */}
        <div className="relative">
          {/* You may want to derive cartCount from useCart() */}
          <Header cartCount={0} wishlistCount={0} />
        </div>

        {/* Back Button */}
        <div className="container mx-auto px-4 pt-4">
          <BackButton />
        </div>

        {/* Page Header */}
        <div className="bg-muted/30 py-6 sm:py-10 lg:py-12 border-b">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4" data-testid="text-shop-title">
              Shop All Products
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl" data-testid="text-shop-subtitle">
              Browse our complete collection of high-protein snacks. Filter by category, nutrition, and more to find your perfect match.
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="py-24 text-center">Loading products...</div>
          ) : (
            <ProductGrid products={products} />
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
