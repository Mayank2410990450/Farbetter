import { useState, useEffect } from 'react';
import { Gift } from 'lucide-react';
import { fetchOffers } from '@/api/offer';

export default function OffersCarousel() {
  const [offers, setOffers] = useState([
    {
      id: 1,
      title: 'Free Shipping',
      description: 'On Orders Above ₹599',
      badge: 'FREE SHIPPING',
      icon: true
    }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const data = await fetchOffers();
      if (data && data.length > 0) {
        setOffers(data);
      }
    } catch (err) {
      console.error('Error loading offers:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!offers.length) return null;

  return (
    <div className="bg-primary text-primary-foreground py-3 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap">
        <span className="inline-flex items-center gap-8 text-sm font-medium">
          {[...offers, ...offers, ...offers].map((offer, index) => (
            <span key={index} className="inline-flex items-center gap-2" data-testid={`text-offer-${index}`}>
              {offer.icon && <Gift className="h-4 w-4" />}
              <span className="font-semibold">{offer.badge}</span>
              <span>-</span>
              <span>{offer.title}</span>
              <span className="opacity-80">{offer.description}</span>
              <span className="text-primary-foreground/50">|</span>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
