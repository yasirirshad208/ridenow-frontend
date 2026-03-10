import { Header } from '@/components/Header';
import { ContactFormIsland } from '@/components/ContactFormIsland';
import { MapPin, Phone, MessageSquare, Send, Twitter } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold font-headline mb-4 text-foreground">
                Contact our team
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Got any questions about the product or scaling on our platform? We're here to help. Chat to our friendly team 24/7 and get onboard in less than 5 minutes.
              </p>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:gap-0 gap-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              {/* Contact Form Section */}
              <div className="flex-1 w-full order-2 md:order-1">
                <ContactFormIsland />
              </div>

              {/* Contact Info Section */}
              <div className="flex-1 w-full order-1 md:order-2 md:flex md:items-center md:flex-col space-y-12">
                {/* Chat Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Chat with us</h3>
                  <p className="text-muted-foreground mb-4">Speak to our friendly team via live chat.</p>
                  <div className="space-y-3">
                    <Link href="#" className="flex items-center gap-3 group">
                      <MessageSquare className="h-5 w-5 text-foreground" />
                      <span className="font-medium text-foreground group-hover:text-primary">Start a live chat</span>
                    </Link>
                    <Link href="#" className="flex items-center gap-3 group">
                      <Send className="h-5 w-5 text-foreground" />
                      <span className="font-medium text-foreground group-hover:text-primary">Shoot us an email</span>
                    </Link>
                    <Link href="#" className="flex items-center gap-3 group">
                      <Twitter className="h-5 w-5 text-foreground" />
                      <span className="font-medium text-foreground group-hover:text-primary">Message us on X</span>
                    </Link>
                  </div>
                </div>

                {/* Call Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Call us</h3>
                  <p className="text-muted-foreground mb-4">Call our team Mon–Fri from 8am to 5pm.</p>
                  <div className="space-y-3">
                    <Link href="tel:+15550000000" className="flex items-center gap-3 group">
                      <Phone className="h-5 w-5 text-foreground" />
                      <span className="font-medium text-foreground group-hover:text-primary">+1 (555) 000-0000</span>
                    </Link>
                  </div>
                </div>

                {/* Visit Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Visit us</h3>
                  <p className="text-muted-foreground mb-4">Chat to us in person at our Melbourne HQ.</p>
                  <div className="space-y-3">
                    <Link href="#" className="flex items-center gap-3 group">
                      <MapPin className="h-5 w-5 text-foreground" />
                      <span className="font-medium text-foreground group-hover:text-primary">
                        100 Smith Street, Collingwood VIC 3066
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>



          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
