import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Mail, Check } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      // TODO: Add newsletter API endpoint
      // For now, just show success
      setSubscribed(true);
      toast({
        title: "Success",
        description: "Thanks for subscribing! Check your email for your 10% discount code.",
      });
      setEmail("");
      
      // Reset after 3 seconds
      setTimeout(() => setSubscribed(false), 3000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Mail className="h-12 w-12 opacity-80" />
          </div>
          
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2">
            Stay Updated
          </h2>
          <p className="mb-8 text-primary-foreground/90 max-w-lg mx-auto">
            Subscribe to our newsletter for exclusive deals, new product launches, and nutrition tips delivered to your inbox.
          </p>

          {subscribed ? (
            <div className="bg-white/20 border border-white/30 rounded-lg p-6 flex items-center justify-center gap-3 mb-4">
              <Check className="h-6 w-6 text-green-300" />
              <div className="text-left">
                <p className="font-semibold">Subscription Confirmed!</p>
                <p className="text-sm opacity-90">Check your email for your welcome offer</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-white text-foreground flex-1 placeholder:text-gray-400"
                data-testid="input-newsletter-email"
              />
              <Button
                type="submit"
                disabled={loading}
                className="bg-white text-primary hover:bg-white/90 font-semibold whitespace-nowrap"
                data-testid="button-newsletter-submit"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          )}
          
          <p className="text-xs text-primary-foreground/70">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}

