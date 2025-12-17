import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import ReviewModal from "@/components/ReviewModal";
import "@/components/CustomerReviews.css";
import { fetchTestimonials } from "@/api/testimonial";

const FAKE_REVIEWS = [
  {
    _id: "1",
    user: { name: "Sarah J." },
    rating: 5,
    comment: "These protein snacks are an absolute game changer! Finally something that tastes good and hits my macros.",
    date: "Verified Purchase"
  },
  {
    _id: "2",
    user: { name: "Mike D." },
    rating: 5,
    comment: "Shipping was super fast. The BBQ flavor is legit the best protein chip I've ever had.",
    date: "Verified Purchase"
  },
  {
    _id: "3",
    user: { name: "Emily R." },
    rating: 5,
    comment: "Love the clean ingredients. No weird aftertaste like other brands.",
    date: "Verified Purchase"
  },
  {
    _id: "4",
    user: { name: "Chris P." },
    rating: 4,
    comment: "Great texture and crunch. A bit pricey but worth it for the quality.",
    date: "Verified Purchase"
  },
  {
    _id: "5",
    user: { name: "Amanda L." },
    rating: 5,
    comment: "My kids even love them! A healthy snack I don't feel guilty about giving them.",
    date: "Verified Purchase"
  },
  {
    _id: "6",
    user: { name: "David K." },
    rating: 5,
    comment: "Perfect for post-workout. 25g of protein is huge for a snack bag.",
    date: "Verified Purchase"
  },
  {
    _id: "7",
    user: { name: "Jessica M." },
    rating: 5,
    comment: "Obsessed with the branding and the taste matches the hype. 10/10 recommend.",
    date: "Verified Purchase"
  },
  {
    _id: "8",
    user: { name: "Ryan T." },
    rating: 5,
    comment: "I've tried every protein chip on the market. These are by far the best texture.",
    date: "Verified Purchase"
  },
  {
    _id: "9",
    user: { name: "Olivia W." },
    rating: 5,
    comment: "Low carb and high protein. Fits perfectly into my keto diet.",
    date: "Verified Purchase"
  },
  {
    _id: "10",
    user: { name: "Daniel H." },
    rating: 4,
    comment: "Good flavor, wish the bags were a little bigger, but very filling.",
    date: "Verified Purchase"
  },
  {
    _id: "11",
    user: { name: "Sophia G." },
    rating: 5,
    comment: "The variety pack is the way to go. Loved trying all the flavors!",
    date: "Verified Purchase"
  },
  {
    _id: "12",
    user: { name: "James B." },
    rating: 5,
    comment: "Finally a snack that doesn't taste like cardboard. The cheddar is amazing.",
    date: "Verified Purchase"
  }
];

export default function CustomerReviews() {
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [displayReviews, setDisplayReviews] = useState(FAKE_REVIEWS);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await fetchTestimonials();
        if (data.testimonials && data.testimonials.length > 0) {
          setDisplayReviews(data.testimonials);
        }
      } catch (error) {
        console.error("Failed to load testimonials:", error);
        // Keep fake reviews on error
      }
    };
    loadTestimonials();
  }, []);

  return (
    <section className="py-16 overflow-hidden bg-slate-50 dark:bg-black">
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
      <div className="relative w-full">
        <div className="flex gap-6 animate-scroll hover:[animation-play-state:paused] w-max px-4">
          {/* Duplicate list to create seamless infinite scroll effect */}
          {[...displayReviews, ...displayReviews].map((review, idx) => {
            const key = `${review._id} -${idx} `;
            // Handle both Testimonial model (flat) and FAKE_REVIEWS structure (nested user)
            const name = review.name || review.user?.name || "Customer";
            const comment = review.content || review.comment || "";
            const role = review.role || review.date || "Verified Customer";
            const rating = review.rating || 5;
            const image = review.image || null;

            const initials = name.split(" ").map(n => n[0]).join("");

            return (
              <Card key={key} className="w-[300px] md:w-[350px] p-6 shrink-0 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow border border-transparent dark:border-slate-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {image ? (
                        <AvatarImage src={image} className="object-cover" />
                      ) : null}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{name}</p>
                      <div className="flex items-center gap-1 text-xs text-green-600">
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

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  "{comment}"
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      <ReviewModal open={modalOpen} onOpenChange={setModalOpen} review={selectedReview} />
    </section>
  );
}
