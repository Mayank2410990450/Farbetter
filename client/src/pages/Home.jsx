
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import OffersCarousel from "@/components/OffersCarousel";
import FeaturedProducts from "@/components/FeaturedProducts";
import WhyChooseUs from "@/components/WhyChooseUs";
import CustomerReviews from "@/components/CustomerReviews";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import SEOHelmet from "@/components/SEOHelmet";
import { SkeletonGrid } from "@/components/Skeleton";

import { fetchProducts } from "@/api/product";
import api from "@/api/apiClient";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [featuredData, newArrivalsRes] = await Promise.all([
        fetchProducts(),
        api.get('/products?sort=newest&limit=6')
      ]);

      const featured = Array.isArray(featuredData) ? featuredData : featuredData.products || [];
      const newArrivals = newArrivalsRes.data.products || (Array.isArray(newArrivalsRes.data) ? newArrivalsRes.data : []);

      setFeaturedProducts(featured);
      setNewArrivals(newArrivals);
    } catch (err) {
      console.error("Error loading products", err);
    } finally {
      setLoading(false);
    }
  };

  const organizationJSON = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Farbetter",
    "url": "https://farbetter.com",
    "description": "Premium protein snacks with 25g+ protein per serving. Clean ingredients, no added sugar.",
    "sameAs": [
      "https://www.facebook.com/farbetter",
      "https://www.instagram.com/farbetter",
      "https://www.twitter.com/farbetter"
    ]
  };

  return (
    <>
      <SEOHelmet
        title="Farbetter - Premium Protein Snacks | Healthy Snacking Redefined"
        description="Discover Farbetter's protein-rich snacks with 25g+ protein per serving. Clean ingredients, no added sugar, and delicious flavors. Free shipping on orders $50+."
        canonical="https://farbetter.com"
        jsonLD={organizationJSON}
      />
      <div className="min-h-screen flex flex-col">
        <Header cartCount={0} wishlistCount={0} />

        <Hero />
        <OffersCarousel />

        <main className="flex-1">
          {loading ? (
            <div className="space-y-16 py-8 md:py-16 container mx-auto px-4">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                </div>
                <SkeletonGrid count={4} />
              </div>
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                </div>
                <SkeletonGrid count={4} />
              </div>
            </div>
          ) : (
            <>
              <FeaturedProducts products={featuredProducts} title="Best Sellers" />

              <WhyChooseUs />
              <FeaturedProducts products={newArrivals} title="New Arrivals" />
              <CustomerReviews />

            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
