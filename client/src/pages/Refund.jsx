import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";

export default function Refund() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 pt-4">
        <BackButton />
      </div>
      
      <main className="flex-1 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8" data-testid="heading-refund">Refund Policy</h1>
          
          <div className="prose prose-sm sm:prose-base prose-lg max-w-none space-y-6">
            <p className="text-xs sm:text-sm text-muted-foreground" data-testid="text-updated">
              Last updated: November 21, 2024
            </p>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-satisfaction">Our Commitment</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                At Farbetter, your satisfaction is our top priority. We stand behind the quality of our 
                products and want you to be completely satisfied with your purchase. If you're not happy 
                with your order, we're here to help.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-timeframe">Refund Timeframe</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                You may request a refund within 30 days of receiving your order. To be eligible for a refund, 
                the product must be unopened and in its original packaging. For opened products, we offer 
                refunds on a case-by-case basis if there's a quality issue.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-process">Refund Process</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">To request a refund:</p>
              <ol className="list-decimal pl-6 text-xs sm:text-sm text-muted-foreground space-y-2">
                <li>Contact our customer service team at Farbetterstore@gmail.com</li>
                <li>Provide your order number and reason for the refund</li>
                <li>Wait for our team to review and approve your request</li>
                <li>Ship the product back to us (if required) using the provided return label</li>
                <li>Receive your refund within 5-10 business days after we receive the return</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" data-testid="heading-shipping">Return Shipping</h2>
              <p className="text-muted-foreground">
                For defective or damaged products, we will cover the return shipping costs. For other 
                returns, the customer is responsible for return shipping fees. We recommend using a 
                trackable shipping service as we cannot guarantee receipt of your returned item.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" data-testid="heading-non-refundable">Non-Refundable Items</h2>
              <p className="text-muted-foreground mb-3">The following items are not eligible for refund:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Products on sale or clearance</li>
                <li>Gift cards</li>
                <li>Downloadable products or digital content</li>
                <li>Products marked as "final sale"</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" data-testid="heading-damaged">Damaged or Defective Products</h2>
              <p className="text-muted-foreground">
                If you receive a damaged or defective product, please contact us immediately with photos 
                of the damage. We will arrange for a replacement or full refund, including shipping costs, 
                at no charge to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" data-testid="heading-exchanges">Exchanges</h2>
              <p className="text-muted-foreground">
                We currently replace items only if they are defective or damaged. If you need to exchange 
                a product for the same item, please contact our customer service team and we'll assist you 
                with the process.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" data-testid="heading-processing">Refund Processing</h2>
              <p className="text-muted-foreground">
                Once we receive your returned item, we will inspect it and process your refund. The refund 
                will be credited to your original payment method within 5-10 business days. You will receive 
                an email confirmation once the refund has been processed.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" data-testid="heading-late">Late or Missing Refunds</h2>
              <p className="text-muted-foreground">
                If you haven't received your refund after 10 business days, please first check your bank 
                account, then contact your credit card company. If you still haven't received your refund, 
                please contact us at Farbetterstore@gmail.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4" data-testid="heading-questions">Questions</h2>
              <p className="text-muted-foreground">
                If you have any questions about our refund policy, please don't hesitate to contact us at 
                Farbetterstore@gmail.com or call us at +1 (555) 123-4567.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
