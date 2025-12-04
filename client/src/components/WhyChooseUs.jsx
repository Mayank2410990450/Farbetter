import { Dumbbell, Leaf, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function WhyChooseUs() {
  const benefits = [
    {
      icon: Dumbbell,
      title: "25g+ Protein",
      description: "Every serving packs a powerful protein punch to fuel your active lifestyle and support muscle recovery.",
    },
    {
      icon: Leaf,
      title: "No Artificial Flavors",
      description: "Made with clean, natural ingredients you can pronounce. No artificial colors, flavors, or preservatives.",
    },
    {
      icon: Award,
      title: "Nutrient-Dense",
      description: "More than just protein - our snacks are packed with vitamins, minerals, and fiber for complete nutrition.",
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
            We're committed to delivering premium protein snacks that taste amazing and fuel your body right
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
