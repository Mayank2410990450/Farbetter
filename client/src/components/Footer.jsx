import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { label: "All Products", href: "/shop" },
      { label: "Best Sellers", href: "/shop" },
      { label: "New Arrivals", href: "/shop" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
    ],
    support: [
      { label: "Help Center", href: "/contact" },
      { label: "Shipping Info", href: "/refund" },
      { label: "Returns & Exchanges", href: "/refund" },
      { label: "FAQ", href: "/contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: " https://www.facebook.com/profile.php?id=61584085876822 ", label: "Facebook", testId: "facebook" },
    { icon: Instagram, href: "https://www.instagram.com/farbetterstore.in?igsh=MWhuazBpc2U0OWpqeQ%3D%3D&utm_source=qr ", label: "Instagram", testId: "instagram" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/farbetterstore-in/about/?viewAsMember=true ", label: "LinkedIn", testId: "linkedin" },
  ];

  return (
    <footer className="bg-secondary dark:bg-slate-900 border-t border-primary/20">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-1">
            <Link to="/" className="inline-block mb-4">
              <div className="font-serif text-2xl font-bold text-foreground hover:text-foreground/80 transition-colors">
                Farbetter
              </div>
            </Link>
            <p className="text-sm text-foreground/90 mb-2 font-semibold">
              All Crunch, No Junk
            </p>
            <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
              Premium protein-rich snacks crafted with clean ingredients to fuel your active lifestyle.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label, testId }) => (
                <a
                  key={testId}
                  href={href}
                  aria-label={label}
                  className="text-foreground hover:text-foreground/80 transition-colors"
                  data-testid={`button-social-${testId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link to={link.href}>
                    <span className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.href}>
                    <span className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link to={link.href}>
                    <span className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-foreground flex-shrink-0 mt-0.5" />
                <a href="mailto:Farbetterstore@gmail.com" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  Farbetterstore@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-foreground flex-shrink-0 mt-0.5" />
                <a href="tel:+1234567890" className="text-sm text-foreground/80 hover:text-foreground transition-colors">
                  +91 9872471066
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/80">
                  khanna<br />
                  Punjab, india
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-foreground/20 my-8"></div>

        {/* Bottom Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <p className="text-sm text-foreground/80 flex items-center justify-center md:justify-start gap-1">
            © {currentYear} Farbetter. All rights reserved. Made with <Heart className="h-4 w-4 text-red-500" /> for your health.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-end">
            {footerLinks.legal.map((link) => (
              <Link key={link.label} to={link.href}>
                <span className="text-xs text-foreground/80 hover:text-foreground transition-colors">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
