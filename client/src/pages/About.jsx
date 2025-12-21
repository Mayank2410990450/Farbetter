import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card } from "@/components/ui/card";
import { Target, Heart, Leaf, Users } from "lucide-react";
import SEOHelmet from "@/components/SEOHelmet";

export default function About() {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To make healthy, protein-rich snacking accessible and delicious for everyone pursuing an active lifestyle."
    },
    {
      icon: Heart,
      title: "Quality First",
      description: "We source only the finest ingredients, ensuring every bite delivers premium nutrition and taste."
    },
    {
      icon: Leaf,
      title: "Natural Ingredients",
      description: "No artificial flavors, colors, or preservatives. Just real, wholesome ingredients you can trust."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Built by fitness enthusiasts, for fitness enthusiasts. We listen to our community's needs."
    }
  ];

  return (
    <>
      <SEOHelmet
        title="About Us | Farbetter - Premium Protein Snacks"
        description="Learn about Farbetter's mission to revolutionize healthy snacking. We create delicious, protein-packed treats with clean ingredients."
        canonical="https://farbetter.com/about"
      />
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          <div className="container mx-auto px-4 pt-4">
            <BackButton />
          </div>
          {/* Hero Section */}
          <section className="bg-primary/5 py-8 sm:py-12 lg:py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6" data-testid="heading-about">About Farbetter</h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground" data-testid="text-about-intro">
                  We are on a mission to make healthy snacking easy and enjoyable. We create palm-oil-free, protein-rich snacks that you can trust, so you can enjoy every bite and feel good about what you eat one better snack at a time.
                </p>
              </div>
            </div>
          </section>

          {/* Our Story */}
          <section className="py-8 sm:py-12 lg:py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center" data-testid="heading-story">Our Story</h2>
                <div className="prose prose-sm sm:prose-base prose-lg max-w-none text-sm sm:text-base text-muted-foreground">
                  <p className="mb-4" data-testid="text-story-p1">
                    Farbetter started with one problem: it was hard to find healthy snacks that were high in protein and actually tasty. We were tired of choosing between good flavor and good nutrition.

                  </p>
                  <p className="mb-4" data-testid="text-story-p2">
                    So in 2025, we began experimenting in a small kitchen, testing recipes until we finally created snacks we were proud of—clean, protein-rich, and genuinely delicious.

                  </p>
                  <p data-testid="text-story-p3">
                    Today, Farbetter is not just a brand, but a community of people who care about eating better without giving up taste. Every pack is made with honest ingredients and a promise to keep your snacking simple, healthy, and far better.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Our Values */}
    <section className="py-8 sm:py-12 lg:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center" data-testid="heading-values">
          Our Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card
              key={index}
              className="p-6 sm:p-8 flex flex-col items-center text-center rounded-2xl shadow-md
                        hover:shadow-lg hover:scale-105 transition-transform transition-shadow duration-300
                        bg-gradient-to-br from-primary/10 to-secondary/10"
              data-testid={`card-value-${index}`}
            >
              <value.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">{value.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{value.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
          {/* Stats */}
          {/* <section className="py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div data-testid="stat-products">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">10+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Products</div>
              </div>
              <div data-testid="stat-customers">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div data-testid="stat-protein">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">20g</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Average Protein Per Serving</div>
              </div>
            </div>
          </div>
        </section> */}
        </main>

        <Footer />
      </div>
    </>
  );
}
