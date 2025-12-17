import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import ReviewModal from "@/components/ReviewModal";
import "@/components/CustomerReviews.css";
import { fetchTestimonials } from "@/api/testimonial";


export default function CustomerReviews() {
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [displayReviews, setDisplayReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setLoading(true);
        const data = await fetchTestimonials();
        if (data.testimonials && data.testimonials.length > 0) {
          setDisplayReviews(data.testimonials);
        }
      } catch (error) {
        console.error("Failed to load testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTestimonials();
  }, []);

  // Don't render the section if there are no testimonials
  if (!loading && displayReviews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 overflow-hidden bg-slate-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4 mb-10 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
          Trusted by Thousands
        </h2>
        <div className="flex items-center justify-center gap-2 text-yellow-500 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
          </div>
          <span className="text-foreground font-semibold text-lg">4.9/5 Average Rating</span>
        </div>
        <p className="text-muted-foreground">
          See what our verified customers are saying about Farbetter updates.
        </p>
      </div>

      {/* Marquee Container */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading testimonials...</p>
        </div>
      ) : (
        <div className="relative w-full">
          <div className="flex gap-6 animate-scroll hover:[animation-play-state:paused] w-max px-4">
            {/* Duplicate list to create seamless infinite scroll effect */}
            {[...displayReviews, ...displayReviews].map((review, idx) => {
              const key = `${review._id}-${idx}`;
              const name = review.name || review.user?.name || "Customer";
              const comment = review.content || review.comment || "";
              const role = review.role || review.date || "Verified Customer";
              const rating = review.rating || 5;
              const image = review.image || null;

              const initials = name.split(" ").map(n => n[0]).join("");

              return (
                <Card key={key} className="w-[300px] md:w-[350px] p-6 shrink-0 bg-zinc-900/95 dark:bg-zinc-900/95 shadow-lg hover:shadow-xl transition-all border border-zinc-800 dark:border-zinc-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-zinc-800 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-300">
                        {image ? (
                          <AvatarImage src={image} className="object-cover" />
                        ) : null}
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm text-white dark:text-white">{name}</p>
                        <div className="flex items-center gap-1 text-xs text-green-400 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex text-yellow-400">
                      {Array.from({ length: rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-zinc-300 dark:text-zinc-300 leading-relaxed">
                    "{comment}"
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <ReviewModal open={modalOpen} onOpenChange={setModalOpen} review={selectedReview} />
    </section>
  );
}
