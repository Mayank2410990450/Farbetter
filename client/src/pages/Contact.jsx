import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import SEOHelmet from "@/components/SEOHelmet";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function Contact() {
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/contact/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: "We'll get back to you as soon as possible.",
        });
        form.reset();
      } else {
        throw new Error('Failed to send email');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: 'destructive'
      });
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "Farbetterstore@gmail.com",
      link: "mailto:Farbetterstore@gmail.com"
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+91 9872471066",
      link: "tel:+919872471066"
    },
    {
      icon: MapPin,
      title: "Address",
      content: "Khanna, Punjab, India",
      link: null
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "Mon-Fri: 10AM-6PM IST",
      link: null
    }
  ];

  return (
    <>
      <SEOHelmet
        title="Contact Us | Farbetter - Premium Protein Snacks"
        description="Get in touch with Farbetter. We're here to answer your questions about our protein snacks, orders, and more."
        canonical="https://farbetter.com/contact"
      />
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1">
          <div className="container mx-auto px-4 pt-4">
            <BackButton />
          </div>
          {/* Hero Section */}
          <section className="bg-primary/5 py-8 sm:py-12 lg:py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6" data-testid="heading-contact">Get In Touch</h1>
                <p className="text-base sm:text-lg text-muted-foreground" data-testid="text-contact-intro">
                  Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Form & Info */}
          <section className="py-8 sm:py-12 lg:py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-12 max-w-6xl mx-auto">
                {/* Contact Info Cards */}
                <div className="md:col-span-2 lg:col-span-1 space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold mb-6" data-testid="heading-contact-info">Contact Information</h2>
                  {contactInfo.map((info, index) => (
                    <Card key={index} className="p-6" data-testid={`card-info-${index}`}>
                      <div className="flex items-start gap-4">
                        <info.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold mb-1" data-testid={`heading-info-${index}`}>{info.title}</h3>
                          {info.link ? (
                            <a href={info.link} className="text-muted-foreground hover:text-primary" data-testid={`link-info-${index}`}>
                              {info.content}
                            </a>
                          ) : (
                            <p className="text-muted-foreground" data-testid={`text-info-${index}`}>{info.content}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Contact Form */}
                <div className="md:col-span-2 lg:col-span-2">
                  <Card className="p-4 sm:p-6 lg:p-8">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" data-testid="heading-contact-form">Send Us a Message</h2>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} data-testid="input-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="your@email.com" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input placeholder="How can we help?" {...field} data-testid="input-subject" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us more about your inquiry..."
                                  className="min-h-32"
                                  {...field}
                                  data-testid="input-message"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" size="lg" className="w-full" data-testid="button-submit">
                          Send Message
                        </Button>
                      </form>
                    </Form>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
