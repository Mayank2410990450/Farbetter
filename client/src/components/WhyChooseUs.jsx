import { Dumbbell, Leaf, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function WhyChooseUs() {
  const benefits = [
    {
      icon: Dumbbell,
      title: "🌿 Palm Oil Free",
      description: "Made without harmful refined oils, ensuring cleaner digestion and long-term heart health.",
    },
    {
      icon: Leaf,
      title: "💪 No Trans Fat",
      description: "Zero industrial fats that cause inflammation and cholesterol spikes — just safe, guilt-free crunch.",
    },
    {
      icon: Award,
      title: "🌱 Plant Protein",
      description: "Natural protein from plant sources to keep you full, energized, and nutritionally supported with every bite.",
    },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4" data-testid="text-why-title">
            Why Choose Farbetter?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto" data-testid="text-why-subtitle">
            At Farbetter store, we make clean, palm-oil-free, guilt-free snacks that fit modern lifestyles without compromising taste, crunch, or purity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="p-6 text-center hover-elevate" data-testid={`card-benefit-${index}`}>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2" data-testid={`text-benefit-title-${index}`}>
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground" data-testid={`text-benefit-desc-${index}`}>
                  {benefit.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
