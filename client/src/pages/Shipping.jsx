import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import SEOHelmet from "@/components/SEOHelmet";

export default function Shipping() {
    return (
        <>
            <SEOHelmet
                title="Shipping Policy | Farbetter - Premium Protein Snacks"
                description="Farbetter's Shipping Policy. Learn about our shipping rates, delivery times, and tracking information."
                canonical="https://farbetter.com/shipping"
            />
            <div className="min-h-screen flex flex-col">
                <Header />

                <div className="container mx-auto px-4 pt-4">
                    <BackButton />
                </div>

                <main className="flex-1 py-8 sm:py-12 lg:py-16">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8" data-testid="heading-shipping">Shipping Policy</h1>

                        <div className="prose prose-sm sm:prose-base prose-lg max-w-none space-y-6">
                            <p className="text-xs sm:text-sm text-muted-foreground" data-testid="text-updated">
                                Last updated: December 09, 2025
                            </p>

                            <section>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-processing">Shipment Processing Time</h2>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                                    If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery. If there will be a significant delay in shipment of your order, we will contact you via email or telephone.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-rates">Shipping Rates & Delivery Estimates</h2>
                                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                                    Shipping charges for your order will be calculated and displayed at checkout.
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-xs sm:text-sm text-muted-foreground border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="border-b py-2 pr-4 font-semibold">Shipping Method</th>
                                                <th className="border-b py-2 pr-4 font-semibold">Estimated Delivery Time</th>
                                                <th className="border-b py-2 font-semibold">Shipment Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="py-2 pr-4 border-b">Standard Shipping</td>
                                                <td className="py-2 pr-4 border-b">3-5 business days</td>
                                                <td className="py-2 border-b">Free for orders over ₹500</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 pr-4 border-b">Express Shipping</td>
                                                <td className="py-2 pr-4 border-b">1-2 business days</td>
                                                <td className="py-2 border-b">₹100</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-3 italic">
                                    * Delivery delays can occasionally occur.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-confirmation">Shipment Confirmation & Order Tracking</h2>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-customs">Customs, Duties and Taxes</h2>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Farbetter is not responsible for any customs and taxes applied to your order. All fees imposed during or after shipping are the responsibility of the customer (tariffs, taxes, etc.).
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-damages">Damages</h2>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Farbetter is not liable for any products damaged or lost during shipping. If you received your order damaged, please contact the shipment carrier to file a claim.
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                                    Please save all packaging materials and damaged goods before filing a claim.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4" data-testid="heading-international">International Shipping Policy</h2>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    We currently do not ship outside of India.
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
