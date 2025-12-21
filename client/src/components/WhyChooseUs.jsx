import { Droplet, Heart, Sprout } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function WhyChooseUs() {
  const benefits = [
    {
      icon: Droplet,
      title: "Palm Oil Free",
      description: "Made without harmful refined oils, ensuring cleaner digestion and long-term heart health.",
    },
    {
      icon: Heart,
      title: "No Trans Fat",
      description: "Zero industrial fats that cause inflammation and cholesterol spikes — just safe, guilt-free crunch.",
    },
    {
      icon: Sprout,
      title: "Plant Protein",
      description: "Natural protein from prout sources to keep you full, energized, and nutritionally supported with every bite.",
    },
  ];

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            Why Choose Farbetter?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            At Farbetter store, we make clean, palm-oil-free, guilt-free snacks that fit modern lifestyles without compromising taste, crunch, or purity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={index}
                className="p-8 text-center border border-transparent rounded-xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 hover:scale-105"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
