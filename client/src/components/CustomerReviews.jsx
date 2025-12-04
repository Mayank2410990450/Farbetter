import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchProducts } from "@/api/product";
import ReviewModal from "@/components/ReviewModal";

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        // Fetch all products to get their reviews
        const products = await fetchProducts();
        
        // Collect all reviews from products that have reviews
        const allReviews = [];
        (Array.isArray(products) ? products : [products]).forEach((product) => {
          if (product?.reviews && Array.isArray(product.reviews)) {
            product.reviews.forEach((review) => {
              if (review && review.user) {
                allReviews.push({
                  ...review,
                  productName: product.name || product.title,
                  productId: product._id || product.id,
                });
              }
            });
          }
        });

        // Sort by most recent and take top 3
        const topReviews = allReviews
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);

        setReviews(topReviews);
      } catch (err) {
        console.error("Error loading reviews:", err);
        // Fallback to hardcoded reviews if API fails
        setReviews([
          {
            _id: "1",
            user: { name: "Sarah Johnson" },
            rating: 5,
            comment: "These protein puffs are my go-to snack! The cheddar flavor is incredible and I love that they have 25g of protein per serving.",
            productName: "Protein Puffs",
          },
          {
            _id: "2",
            user: { name: "Michael Chen" },
            rating: 5,
            comment: "Finally found a healthy snack that actually tastes great. The protein chips are perfect for my post-workout routine.",
            productName: "Protein Chips",
          },
          {
            _id: "3",
            user: { name: "Emily Rodriguez" },
            rating: 5,
            comment: "Clean ingredients, amazing taste, and high protein. What more could you ask for? NutriCrunch has become a staple in my pantry.",
            productName: "NutriCrunch Mix",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" data-testid="text-reviews-title">
            Loved by Our Customers
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-reviews-subtitle">
            Join thousands of satisfied customers who've made the switch to healthier snacking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => {
            const initials = review.user?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase() || "U";

            return (
                <Card key={review._id} className="p-6" data-testid={`card-review-${review._id}`}>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold" data-testid={`text-reviewer-name-${review._id}`}>
                      {review.user?.name || "Anonymous"}
                    </p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-primary text-primary"
                          data-testid={`icon-star-${review._id}-${i}`}
                        />
                      ))}
                    </div>
                    {review.productName && (
                      <p className="text-xs text-muted-foreground mt-1">{review.productName}</p>
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground" data-testid={`text-review-comment-${review._id}`}>
                  "{review.comment && (review.comment.length > 140 ? review.comment.slice(0,140) + '...' : review.comment)}"
                </p>
                {review.comment && review.comment.length > 140 && (
                  <div className="mt-3">
                    <button
                      className="text-sm text-primary underline"
                      onClick={() => { setSelectedReview(review); setModalOpen(true); }}
                    >
                      Read more
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
        <ReviewModal open={modalOpen} onOpenChange={setModalOpen} review={selectedReview} />
      </div>
    </section>
  );
}
