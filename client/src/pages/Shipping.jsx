import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import SEOHelmet from "@/components/SEOHelmet";
import { fetchShippingSettings } from "@/api/admin";

export default function Shipping() {
  const [shipping, setShipping] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShipping = async () => {
      try {
        const res = await fetchShippingSettings();
        setShipping(res?.settings || null);
      } catch (err) {
        console.error("Failed to fetch shipping settings", err);
      } finally {
        setLoading(false);
      }
    };

    loadShipping();
  }, []);

  return (
    <>
      <SEOHelmet
        title="Shipping Policy | Farbetter - Premium Protein Snacks"
        description="Learn about Farbetter delivery charges and free shipping threshold."
        canonical="https://farbetter.com/shipping"
      />

      <div className="min-h-screen flex flex-col">
        <Header />

        <div className="container mx-auto px-4 pt-4">
          <BackButton />
        </div>

        <main className="flex-1 py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">
              Shipping Policy
            </h1>

            <div className="prose prose-sm sm:prose-base max-w-none space-y-6">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Last updated: December 09, 2025
              </p>

              {/* Processing Time */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-3">
                  Order Processing
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Orders are processed within 1–2 business days. Orders are not
                  shipped on weekends or public holidays.
                </p>
              </section>

              {/* Shipping Charges */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-3">
                  Delivery Charges
                </h2>

                {loading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading shipping details...
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr>
                          <th className="border-b py-2 pr-4 font-semibold">
                            Condition
                          </th>
                          <th className="border-b py-2 font-semibold">
                            Charges
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2 pr-4 border-b">
                            Orders below ₹{shipping?.freeShippingThreshold}
                          </td>
                          <td className="py-2 border-b">
                            ₹{shipping?.shippingCost ?? 0}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 border-b">
                            Orders above ₹{shipping?.freeShippingThreshold}
                          </td>
                          <td className="py-2 border-b font-semibold text-green-600">
                            FREE
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Tracking */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-3">
                  Order Tracking
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Once your order is shipped, you will receive tracking details
                  via email or SMS.
                </p>
              </section>

              {/* Damages */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-3">
                  Damaged or Lost Orders
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Farbetter is not responsible for damages or loss during
                  shipping. Please contact the courier partner directly for
                  assistance.
                </p>
              </section>

              {/* International */}
              <section>
                <h2 className="text-lg sm:text-xl font-semibold mb-3">
                  International Shipping
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Currently, we ship only within India.
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