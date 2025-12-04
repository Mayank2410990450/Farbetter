import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@assets/generated_images/hero_protein_snacks_arrangement.png";

export default function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Assorted protein snacks"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6" data-testid="text-hero-title">
          All Crunch, No Junk
          {/* <span className="block text-primary-foreground"></span> */}
        </h1>

        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
          Delicious, nutrient-dense snacks crafted with clean ingredients and packed with protein to keep you energized
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            size="lg"
            className="text-base px-8 bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-shop-now"
            aria-label="Shop now"
            onClick={() => navigate("/shop")}
          >
            Shop Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-base px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
            data-testid="button-learn-more"
            aria-label="Learn more about our story"
            onClick={() => navigate("/about")}
          >
            Learn More
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap gap-4 justify-center text-sm text-white/90">
          <div className="flex items-center gap-2" data-testid="text-trust-protein">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
            25g Protein Per Serve
          </div>
          <div className="flex items-center gap-2" data-testid="text-trust-sugar">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
            No Added Sugar
          </div>
          <div className="flex items-center gap-2" data-testid="text-trust-ingredients">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
            Clean Ingredients
          </div>
        </div>
      </div>
    </section>
  );
}
