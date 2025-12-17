// src/pages/Shop.jsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import ProductGrid from "@/components/ProductGrid";
import SEOHelmet from "@/components/SEOHelmet";
import { fetchProducts } from "@/api/product";
import { Button } from "@/components/ui/button";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const selectedCategory = searchParams.get("category");
  const searchQuery = searchParams.get("search");

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", { category: selectedCategory, keyword: searchQuery, page }],
    queryFn: () => fetchProducts({
      category: selectedCategory,
      keyword: searchQuery,
      page,
      limit: 12
    }),
    placeholderData: keepPreviousData, // Keep previous data while fetching new page
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const products = data?.products || (Array.isArray(data) ? data : []);
  const pagination = data?.page ? { page: data.page, pages: data.pages, total: data.total } : null;

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
          {isLoading ? (
            <div className="py-24 text-center">Loading products...</div>
          ) : isError ? (
            <div className="py-24 text-center text-red-500">Error loading products: {error.message}</div>
          ) : (
            <>
              <ProductGrid products={products} />

              {/* Pagination Controls */}
              {pagination && pagination.pages > 1 && (
                <div className="container mx-auto px-4 py-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
