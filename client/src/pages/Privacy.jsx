import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import SEOHelmet from "@/components/SEOHelmet";

export default function Privacy() {
  return (
    <>
      <SEOHelmet
        title="Privacy Policy | Farbetter - Premium Protein Snacks"
        description="Farbetter's Privacy Policy. Learn how we collect, use, and protect your personal information."
        canonical="https://farbetter.com/privacy"
      />
      <div className="min-h-screen flex flex-col">
        <Header />

        <div className="container mx-auto px-4 pt-4">
          <BackButton />
        </div>

        <main className="flex-1 py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8" data-testid="heading-privacy">Privacy Policy</h1>

            <div className="prose prose-sm sm:prose-base prose-lg max-w-none space-y-6">
              <p className="text-xs sm:text-sm text-muted-foreground" data-testid="text-updated">
                Last updated: November 21, 2024
              </p>

              <section>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-intro">Introduction</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  At Farbetter, we take your privacy seriously. This Privacy Policy explains how we collect,
                  use, disclose, and safeguard your information when you visit our website and make purchases.
                </p>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-collection">Information We Collect</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc pl-6 text-xs sm:text-sm text-muted-foreground space-y-2">
                  <li>Name, email address, and contact information</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely through our payment provider)</li>
                  <li>Order history and preferences</li>
                  <li>Communications with our customer service team</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-usage">How We Use Your Information</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">We use the information we collect to:</p>
                <ul className="list-disc pl-6 text-xs sm:text-sm text-muted-foreground space-y-2">
                  <li>Process and fulfill your orders</li>
                  <li>Send you order confirmations and shipping updates</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Send you marketing communications (with your consent)</li>
                  <li>Improve our products and services</li>
                  <li>Prevent fraud and ensure security</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" data-testid="heading-sharing">Information Sharing</h2>
                <p className="text-muted-foreground">
                  We do not sell, trade, or rent your personal information to third parties. We may share your
                  information with trusted service providers who assist us in operating our website, conducting
                  our business, or servicing you, as long as they agree to keep this information confidential.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" data-testid="heading-security">Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational security measures to protect your
                  personal information. However, no method of transmission over the internet is 100% secure,
                  and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" data-testid="heading-rights">Your Rights</h2>
                <p className="text-muted-foreground mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Rectify inaccurate personal data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to or restrict processing of your data</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" data-testid="heading-cookies">Cookies</h2>
                <p className="text-muted-foreground">
                  We use cookies and similar tracking technologies to track activity on our website and hold
                  certain information. You can instruct your browser to refuse all cookies or to indicate when
                  a cookie is being sent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4" data-testid="heading-contact">Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at privacy@farbetter.com
                </p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
