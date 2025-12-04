import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 pt-4">
        <BackButton />
      </div>
      
      <main className="flex-1 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8" data-testid="heading-terms">Terms & Conditions</h1>
          
          <div className="prose prose-sm sm:prose-base prose-lg max-w-none space-y-6">
            <p className="text-xs sm:text-sm text-muted-foreground" data-testid="text-updated">
              Last updated: November 21, 2024
            </p>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-intro">Agreement to Terms</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                By accessing and using Farbetter's website and services, you accept and agree to be bound 
                by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-products">Products and Services</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 text-xs sm:text-sm text-muted-foreground space-y-2">
                <li>Modify or discontinue products without notice</li>
                <li>Limit quantities of products available for purchase</li>
                <li>Refuse service to anyone for any reason</li>
                <li>Update product information and pricing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-orders">Orders and Payments</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                All orders are subject to acceptance and availability. We reserve the right to refuse or 
                cancel any order for any reason. Payment must be received before order processing begins. 
                We accept major credit cards and other payment methods as displayed at checkout.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" data-testid="heading-pricing">Pricing</h2>
              <p className="text-muted-foreground">
                All prices are in USD and are subject to change without notice. We strive to display 
                accurate pricing information, but errors may occur. If we discover an error in the price 
                of a product you have ordered, we will inform you and give you the option to continue 
                with the order at the correct price or cancel it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" data-testid="heading-shipping">Shipping and Delivery</h2>
              <p className="text-muted-foreground">
                We ship to addresses within the United States. Shipping times and costs vary based on 
                location and shipping method selected. Title and risk of loss pass to you upon delivery 
                to the carrier. We are not responsible for delays caused by shipping carriers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" data-testid="heading-intellectual">Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content on this website, including text, graphics, logos, images, and software, is 
                the property of Farbetter and is protected by copyright and trademark laws. You may 
                not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" data-testid="heading-liability">Limitation of Liability</h2>
              <p className="text-muted-foreground">
                To the fullest extent permitted by law, Farbetter shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages arising out of or related to your 
                use of our products or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" data-testid="heading-governing">Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms and Conditions are governed by and construed in accordance with the laws of 
                the United States, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" data-testid="heading-changes">Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to update these Terms and Conditions at any time. Changes will be 
                posted on this page with an updated revision date. Your continued use of our services 
                after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" data-testid="heading-contact">Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms and Conditions, please contact us at legal@farbetter.com
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
