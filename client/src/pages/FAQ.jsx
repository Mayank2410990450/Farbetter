import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import SEOHelmet from "@/components/SEOHelmet";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
    const faqs = [
        {
            question: "What makes Farbetter snacks different?",
            answer: "Farbetter snacks are crafted to be the perfect balance of taste and nutrition. We use high-quality plant-based protein, zero palm oil, and no artificial preservatives. Our goal is to provide a crunch that feels indulgent but fuels your body with 20g+ of protein per pack."
        },
        {
            question: "Are your products suitable for vegans?",
            answer: "Yes! All our current snack lines are 100% plant-based and vegan-friendly. We use pea and soy protein isolates to ensure a complete amino acid profile without any animal products."
        },
        {
            question: "Do your snacks contain gluten?",
            answer: "While our ingredients are naturally gluten-free, our snacks are processed in a facility that also handles wheat. Therefore, we cannot currently guarantee they are 100% certified gluten-free for those with severe celiac disease."
        },
        {
            question: "What is the shelf life of your products?",
            answer: "Our snacks stay fresh and crunchy for up to 6 months from the date of manufacture when stored in a cool, dry place. Each pack has a 'Best Before' date printed on the back."
        },
        {
            question: "Where do you ship?",
            answer: "Currently, we ship to all pin codes across India. We are working on expanding to international markets soon!"
        },
        {
            question: "How can I track my order?",
            answer: "Once your order is shipped, you will receive an email and SMS with a tracking link. You can also track your order status by logging into your account on our website."
        },
        {
            question: "What is your return policy?",
            answer: "We accept returns for damaged or defective products within 30 days of delivery. Please check our Refund Policy page for more detailed information on how to initiate a return."
        },
        {
            question: "How much protein is in each pack?",
            answer: "Each standard pack of Farbetter snacks contains between 20g to 25g of protein, depending on the flavor and variety. It's the perfect post-workout snack or midday energy booster."
        }
    ];

    return (
        <>
            <SEOHelmet
                title="Frequently Asked Questions | Farbetter"
                description="Find answers to common questions about Farbetter protein snacks, shipping, returns, and nutritional information."
                canonical="https://farbetter.com/faq"
            />
            <div className="min-h-screen flex flex-col">
                <Header />

                <div className="container mx-auto px-4 pt-4">
                    <BackButton />
                </div>

                <main className="flex-1 py-8 sm:py-12 lg:py-16">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl sm:text-4xl font-bold mb-4" data-testid="heading-faq">Frequently Asked Questions</h1>
                            <p className="text-muted-foreground">
                                Have a question? We're here to help. If you can't find what you're looking for, feel free to contact us.
                            </p>
                        </div>

                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <Accordion type="single" collapsible className="w-full">
                                {faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="text-left font-semibold text-lg">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
