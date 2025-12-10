import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, Heart, ShoppingCart, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import SEOHelmet from "@/components/SEOHelmet";
import { fetchProduct } from "@/api/product";
import { fetchProductReviews, submitReview } from "@/api/review";
import { getStockStatus, getStockMessage } from "@/lib/stockUtils";
import { SkeletonProductDetails } from "@/components/Skeleton";
import ReviewModal from "@/components/ReviewModal";

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { add: addToCart } = useCart();
  const { add: addToWishlist, remove: removeFromWishlist, wishlist } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
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
      <div className="container mx-auto px-4 py-12">
        <BackButton />
        <SkeletonProductDetails />
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto px-4 py-12">
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
    );

  if (!product)
    return (
      <div className="container mx-auto px-4 py-12">
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
    <>
      <SEOHelmet
        title={`${productTitle} | Farbetter - Premium Protein Snacks`}
        description={product?.description ? `${product.description.substring(0, 150)}...` : `Shop ${productTitle} - Healthy protein snacks from Farbetter. 25g+ protein per serving.`}
        canonical={productUrl}
        ogImage={productImage}
        ogType="product"
        jsonLD={jsonLD}
      />
      <div className="container mx-auto px-4 py-12">
        <BackButton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="flex flex-col gap-4">
            <div className="w-full rounded-lg overflow-hidden bg-muted">
              <img
                src={product?.images?.[selectedImage] || product?.image || product?.images?.[0] || ""}
                alt={product?.name}
                loading="lazy"
                className="w-full h-auto object-cover max-h-[480px]"
              />
            </div>

            {product?.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`rounded-md overflow-hidden border ${selectedImage === idx ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={img} alt={`${product?.name} ${idx + 1}`} loading="lazy" className="h-20 w-28 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {product?.name || product?.title}
              </h1>
              <p className="text-muted-foreground text-lg">
                {product?.tagline || product?.brand}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                      }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({numReviews} {numReviews === 1 ? "review" : "reviews"})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold">₹{selectedPrice.toFixed(2)}</span>
              {product?.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ₹{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Quantity selector and stock status */}
            <div className="space-y-4">
              {/* Only show Out of Stock when unavailable; hide stock counts for cleaner UI */}
              {(product?.stock === 0 || product?.soldOut) && (
                <div>
                  <Badge variant="destructive">Out of Stock</Badge>
                </div>
              )}

              {/* Quantity and Actions */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product?.stock === 0}
                    className="px-3 py-2 disabled:opacity-50"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <div className="px-4 text-lg">{quantity}</div>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product?.stock === 0 || quantity >= product?.stock}
                    className="px-3 py-2 disabled:opacity-50"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div>
                  {(product?.stock === 0 || product?.soldOut) && (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {product?.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            {/* Protein Badge */}
            <div className="flex gap-2">
              {product?.protein && (
                <Badge className="bg-primary">{product.protein}% Protein</Badge>
              )}
              {product?.soldOut && <Badge variant="destructive">Sold Out</Badge>}
            </div>

            {/* Size Selection */}
            {sizes.length > 1 && (
              <div>
                <p className="font-semibold mb-3">Select Size:</p>
                <div className="flex gap-2">
                  {sizes.map((size, index) => (
                    <Button
                      key={index}
                      variant={selectedSize === index ? "default" : "outline"}
                      onClick={() => setSelectedSize(index)}
                    >
                      {size.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart & Wishlist */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product?.stock === 0 || product?.soldOut}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product?.stock === 0 ? 'Out of Stock' : `Add ${quantity} to Cart`}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleWishlist}
              >
                <Heart
                  className={`h-5 w-5 ${isWishlisted ? "fill-current text-destructive" : ""}`}
                />
              </Button>
            </div>
          </div>
        </div>
        {/* Tabs: Description / Reviews */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">{activeTab === 'description' ? 'Product Details' : 'Customer Reviews'}</h2>
              <div className="flex gap-2">
                <button onClick={() => setActiveTab('description')} className={`px-4 py-2 rounded ${activeTab === 'description' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  Description
                </button>
                <button onClick={() => setActiveTab('reviews')} className={`px-4 py-2 rounded ${activeTab === 'reviews' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  Reviews ({numReviews})
                </button>
              </div>
            </div>

            {activeTab === 'description' && (
              <div>
                {product?.description ? (
                  <Card className="p-6 mb-8">
                    <div className="prose max-w-none text-muted-foreground">{product.description}</div>
                  </Card>
                ) : (
                  <Card className="p-6 mb-8 text-muted-foreground">No description available.</Card>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* Review Form */}
                {user && (
                  <Card className="p-6 mb-8">
                    <h3 className="font-semibold mb-4">Leave a Review</h3>

                    <div className="space-y-4">
                      {/* Rating Selection */}
                      <div>
                        <p className="text-sm font-medium mb-2">Your Rating</p>
                        <div className="flex gap-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setUserRating(i + 1)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-8 w-8 cursor-pointer transition ${i < userRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30 hover:text-yellow-300"
                                  }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <p className="text-sm font-medium mb-2">Your Comment (Optional)</p>
                        <Textarea
                          value={userComment}
                          onChange={(e) => setUserComment(e.target.value)}
                          placeholder="Share your thoughts about this product..."
                          className="w-full"
                          rows={4}
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {userComment.length}/500
                        </p>
                      </div>

                      <Button
                        onClick={handleSubmitReview}
                        disabled={submitting || userRating === 0}
                        className="w-full"
                      >
                        {submitting ? "Submitting..." : "Submit Review"}
                      </Button>
                    </div>
                  </Card>
                )}

                {!user && (
                  <Card className="p-6 mb-8 bg-muted">
                    <p className="text-muted-foreground">
                      Please{" "}
                      <a href="/login" className="underline font-semibold">
                        log in
                      </a>{" "}
                      to leave a review.
                    </p>
                  </Card>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <Card key={review._id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold">{review.user?.name || "Anonymous"}</p>
                            <div className="flex gap-0.5 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground/30"
                                    }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground">{review.comment}</p>
                        )}
                      </Card>
                    ))
                  ) : (
                    <Card className="p-6 text-center text-muted-foreground">
                      No reviews yet. Be the first to review this product!
                    </Card>
                  )}
                </div>
                <ReviewModal open={modalOpen} onOpenChange={setModalOpen} review={selectedReview} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
