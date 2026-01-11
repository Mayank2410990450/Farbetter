import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, Heart, ShoppingCart, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import SEOHelmet from "@/components/SEOHelmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturedProducts from "@/components/FeaturedProducts";
import { fetchProduct, fetchProducts } from "@/api/product";
import { fetchProductReviews, submitReview } from "@/api/review";
import { getStockStatus, getStockMessage } from "@/lib/stockUtils";
import { SkeletonProductDetails } from "@/components/Skeleton";
import ReviewModal from "@/components/ReviewModal";
import { getOptimizedImageUrl } from "@/lib/utils";

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { add: addToCart } = useCart();
  const { add: addToWishlist, remove: removeFromWishlist, wishlist } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const isWishlisted = wishlist.some((item) => item.id === productId);

  useEffect(() => {
    const loadProductAndReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const prodRes = await fetchProduct(productId);
        const prod = prodRes.data || prodRes.product || prodRes;

        if (!prod || !prod._id) {
          throw new Error("Product not found");
        }

        setProduct(prod);

        // Fetch related products based on category
        if (prod.category) {
          const categoryId = typeof prod.category === 'object' ? prod.category._id : prod.category;
          try {
            // In new API this returns { products: [...], ... } usually
            const relatedData = await fetchProducts({ category: categoryId });
            const list = Array.isArray(relatedData)
              ? relatedData
              : (relatedData.products || []);

            // Filter out current product
            setRelatedProducts(list.filter(p => p._id !== prod._id));
          } catch (e) {
            console.error("Failed to load related products", e);
            setRelatedProducts([]);
          }
        }

        const reviewsRes = await fetchProductReviews(productId, { limit: 100 });
        setReviews(reviewsRes.reviews || []);
      } catch (err) {
        console.error("Error loading product:", err);
        const errorMsg = err?.response?.status === 404
          ? "Product not found. It may have been removed or the ID is invalid."
          : err?.response?.data?.message || "Failed to load product details";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (productId) loadProductAndReviews();
    window.scrollTo(0, 0);
  }, [productId]);

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Not Logged In",
        description: "Please log in to leave a review",
        variant: "destructive",
      });
      return;
    }

    if (userRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await submitReview(productId, userRating, userComment);
      toast({
        title: "Success",
        description: "Review submitted successfully!",
      });
      setUserRating(0);
      setUserComment("");

      // Reload reviews
      const reviewsRes = await fetchProductReviews(productId, { limit: 100 });
      setReviews(reviewsRes.reviews || []);
    } catch (err) {
      console.error("Error submitting review:", err);
      const errorMsg = err?.response?.data?.message || "Failed to submit review";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(productId, quantity);
    toast({
      title: "Success",
      description: "Added to cart!",
    });
  };

  const handleToggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(productId);
      toast({
        title: "Removed",
        description: "Removed from wishlist",
      });
    } else {
      addToWishlist(productId);
      toast({
        title: "Added",
        description: "Added to wishlist",
      });
    }
  };

  if (loading)
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 flex-1">
          <BackButton />
          <SkeletonProductDetails />
        </div>
        <Footer />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 flex-1">
          <BackButton />
          <div className="max-w-md mx-auto mt-8">
            <Card className="p-8 text-center border-destructive bg-destructive/5">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => navigate('/shop')}
                >
                  Browse All Products
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </Button>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );

  if (!product)
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-12 flex-1">
          <BackButton />
          <div className="max-w-md mx-auto mt-8">
            <Card className="p-8 text-center">
              <h2 className="text-xl font-bold mb-4">Product Not Available</h2>
              <p className="text-muted-foreground mb-6">The product you're looking for is no longer available.</p>
              <Button
                className="w-full"
                onClick={() => navigate('/shop')}
              >
                Continue Shopping
              </Button>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );

  const sizes = product?.sizes ?? [{ label: "Default", price: product?.price ?? 0 }];
  const selectedPrice = sizes[selectedSize]?.price || 0;
  const averageRating = product?.averageRating || 0;
  const numReviews = product?.numReviews || 0;
  const productImage = product?.images?.[selectedImage] || product?.image || product?.images?.[0] || "";
  const productTitle = product?.name || product?.title || "Product";
  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${productId}` : '';

  // Build JSON-LD structured data
  const jsonLD = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productTitle,
    "description": product?.description || "",
    "image": productImage,
    "brand": {
      "@type": "Brand",
      "name": product?.brand || "Farbetter"
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "INR",
      "price": selectedPrice.toString(),
      "availability": product?.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": numReviews > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": averageRating.toString(),
      "reviewCount": numReviews.toString()
    } : undefined
  };

  // Remove undefined properties
  Object.keys(jsonLD).forEach(key => jsonLD[key] === undefined && delete jsonLD[key]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SEOHelmet
        title={`${productTitle} | Farbetter - Premium Protein Snacks`}
        description={product?.description ? `${product.description.substring(0, 150)}...` : `Shop ${productTitle} - Healthy protein snacks from Farbetter. 25g+ protein per serving.`}
        canonical={productUrl}
        ogImage={productImage}
        ogType="product"
        jsonLD={jsonLD}
      />
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <BackButton />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
            {/* Product Image Gallery */}
            <div className="flex flex-col gap-6">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-sm group">
                <img
                  src={getOptimizedImageUrl(product?.images?.[selectedImage] || product?.image || product?.images?.[0] || "", 1000)}
                  alt={product?.name}
                  loading="eager"
                  className="w-full h-full object-contain p-6 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                />

                {/* Discount Badge on Image */}
                {(product?.mrp > selectedPrice) && (
                  <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {Math.round(((product.mrp - selectedPrice) / product.mrp) * 100)}% OFF
                  </span>
                )}
              </div>

              {product?.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${selectedImage === idx
                        ? 'border-primary ring-2 ring-primary/20 ring-offset-2'
                        : 'border-transparent bg-slate-50 hover:bg-slate-100'
                        }`}
                    >
                      <img
                        src={getOptimizedImageUrl(img, 160)}
                        alt={`${product?.name} ${idx + 1}`}
                        loading="lazy"
                        className="w-full h-full object-contain p-1 mix-blend-multiply"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Column */}
            <div className="flex flex-col space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  {product?.brand && (
                    <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground border-slate-300">
                      {product.brand}
                    </Badge>
                  )}
                  {product?.stock > 0 && product?.stock < 10 && (
                    <span className="text-xs font-medium text-orange-600 flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3 h-3" />
                      Only {product.stock} left
                    </span>
                  )}
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
                  {product?.name || product?.title}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('reviews')}>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.round(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-slate-100 text-slate-200"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors hover:underline">
                    {numReviews} customer reviews
                  </span>
                </div>
              </div>

              {/* Price Block */}
              <div className="p-6 bg-muted/30 rounded-2xl border space-y-4">
                <div className="flex items-end flex-wrap gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground font-medium mb-1">Total Price</span>
                    <span className="text-5xl font-black text-foreground tracking-tight">₹{selectedPrice.toFixed(0)}</span>
                  </div>
                  {(product?.mrp > selectedPrice) && (
                    <div className="flex flex-col pb-2">
                      <span className="text-lg text-muted-foreground line-through decoration-slate-400">
                        ₹{product.mrp.toFixed(0)}
                      </span>
                      <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-md">
                        Save ₹{(product.mrp - selectedPrice).toFixed(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Size Selector */}
                {/* Assuming 'sizes' is handled but if multiple sizes from prop, reuse logic. Else showing specific size field */}
                {product?.size && (
                  <div className="flex items-center gap-3 pt-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Pack Size:</span>
                    <Badge variant="secondary" className="px-3 py-1 font-medium border shadow-sm">{product.size}</Badge>
                  </div>
                )}
              </div>

              {/* Key Benefits / Bullet Points */}
              {product?.bulletPoints && product.bulletPoints.length > 0 && (
                <div className="space-y-3 py-2">
                  <h3 className="font-semibold text-foreground">Highlights</h3>
                  <ul className="grid grid-cols-1 gap-3">
                    {product.bulletPoints.map((point, i) => point && (
                      <li key={i} className="flex items-start gap-3 text-muted-foreground">
                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                        </div>
                        <span className="text-base leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-4 pt-4">
                {(product?.stock === 0 || product?.soldOut) ? (
                  <div className="w-full py-4 bg-red-50 text-red-600 font-bold text-center rounded-xl border border-red-100">
                    Currently Out of Stock
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white h-14 w-full sm:w-auto min-w-[140px]">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="px-4 h-full text-xl text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
                      >
                        -
                      </button>
                      <div className="flex-1 text-center font-bold text-lg">{quantity}</div>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={quantity >= product?.stock}
                        className="px-4 h-full text-xl text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 h-14 text-lg font-bold shadow-lg shadow-primary/20 rounded-xl"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleToggleWishlist}
                      className="h-14 w-14 p-0 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    >
                      <Heart className={`h-6 w-6 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-slate-400"}`} />
                    </Button>
                  </div>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 mt-4 border-t">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">Authentic<br />Guaranteed</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">Fast<br />Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">Secure<br />Payments</span>
                </div>
              </div>

            </div>
          </div>

          {/* Tabs: Description / Reviews */}
          <div className="space-y-8 mb-20">
            <div className="border-b">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`px-4 py-4 text-lg font-semibold border-b-2 transition-colors ${activeTab === 'description' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  Product Details
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-4 text-lg font-semibold border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  Reviews ({numReviews})
                </button>
              </div>
            </div>

            <div className="py-6 animate-in fade-in duration-300">
              {activeTab === 'description' && (
                <div>
                  {product?.description ? (
                    <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed bg-muted/30 p-8 rounded-lg">
                      {product.description}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-muted/30 rounded-lg text-muted-foreground">
                      No description available.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="max-w-4xl">
                  {/* Reviews List */}
                  <div className="space-y-6 mb-10">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <Card key={review._id} className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                {(review.user?.name?.[0] || "A").toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold">{review.user?.name || "Anonymous"}</p>
                                <div className="flex gap-0.5 mt-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < review.rating
                                        ? "fill-primary text-primary"
                                        : "text-muted-foreground/30"
                                        }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground leading-relaxed pl-[3.25rem]">{review.comment}</p>
                          )}
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-muted/30 rounded-lg">
                        <p className="text-lg font-medium mb-2">No reviews yet</p>
                        <p className="text-muted-foreground">Be the first to share your thoughts!</p>
                      </div>
                    )}
                  </div>

                  {/* Review Form */}
                  <div className="mt-8 border-t pt-8">
                    <h3 className="text-xl font-bold mb-6">Write a Review</h3>
                    {user ? (
                      <Card className="p-6 md:p-8 bg-muted/30 border-none">
                        <div className="space-y-6">
                          {/* Rating Selection */}
                          <div>
                            <p className="font-medium mb-3">Your Rating</p>
                            <div className="flex gap-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setUserRating(i + 1)}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                  type="button"
                                >
                                  <Star
                                    className={`h-10 w-10 cursor-pointer transition-colors ${i < userRating
                                      ? "fill-primary text-primary"
                                      : "text-muted-foreground/30 hover:text-primary/50"
                                      }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Comment */}
                          <div>
                            <p className="font-medium mb-3">Your Review</p>
                            <Textarea
                              value={userComment}
                              onChange={(e) => setUserComment(e.target.value)}
                              placeholder="What did you like or dislike? What did you use this product for?"
                              className="w-full min-h-[120px] bg-background"
                              maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground mt-2 text-right">
                              {userComment.length}/500 characters
                            </p>
                          </div>

                          <Button
                            onClick={handleSubmitReview}
                            disabled={submitting || userRating === 0}
                            size="lg"
                            className="w-full sm:w-auto min-w-[200px]"
                          >
                            {submitting ? "Submitting..." : "Submit Review"}
                          </Button>
                        </div>
                      </Card>
                    ) : (
                      <Card className="p-8 text-center bg-muted/30 border-none">
                        <p className="text-muted-foreground mb-4">
                          Sign in to share your experience with other customers.
                        </p>
                        <Button onClick={() => navigate('/login')} variant="outline">
                          Log In to Review
                        </Button>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* You May Also Like Section */}
          <div className="border-t pt-12">
            <FeaturedProducts
              products={relatedProducts}
              title="You may also like"
            />
          </div>

        </div>
      </main>
      <Footer />
      <ReviewModal open={modalOpen} onOpenChange={setModalOpen} review={selectedReview} />
    </div>
  );
}
