export default function PromoBanner() {
  const promos = [
    "Free Shipping on Orders $50+",
    "15% Off First Order",
    "Subscribe & Save 20%",
  ];

  return (
    <div className="bg-primary text-primary-foreground py-3 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap">
        <span className="inline-flex items-center gap-8 text-sm font-medium">
          {[...promos, ...promos, ...promos].map((promo, index) => (
            <span key={index} className="inline-flex items-center gap-2" data-testid={`text-promo-${index}`}>
              {promo}
              <span className="text-primary-foreground/50">|</span>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
