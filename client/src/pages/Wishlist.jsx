import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import SEOHelmet from "@/components/SEOHelmet";
import { SkeletonGrid } from "@/components/Skeleton";

export default function Wishlist() {
    const { wishlist, loading } = useWishlist();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <SEOHelmet
                title="My Wishlist"
                description="View your saved items on Farbetter. Keep track of products you love."
            />
            <Header />

            <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-8">My Wishlist</h1>

                {loading ? (
                    <SkeletonGrid count={8} />
                ) : wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/30">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Heart className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Explore our collection and add items you love to your wishlist for later.
                        </p>
                        <Link to="/shop">
                            <Button size="lg">Start Shopping</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlist.map((product) => (
                            <ProductCard key={product._id || product.id} product={product} />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
