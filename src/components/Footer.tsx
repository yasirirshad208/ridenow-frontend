
'use client';

import { useActionState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Twitter, Facebook, Instagram, Linkedin, LoaderCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { subscribeToNewsletter, type NewsletterState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useFormStatus } from 'react-dom';

const brands = ['Audi', 'BMW', 'Ford', 'Mercedes-Benz', 'Tesla', 'Toyota', 'Mazda', 'Honda'];
const vehicleTypes = ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Sports', 'Van', 'Truck'];
const initialState: NewsletterState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6">
      {pending ? <LoaderCircle className="animate-spin" /> : 'Sign Up'}
    </Button>
  );
}

export function Footer() {
  const { toast } = useToast();
  const [state, formAction] = useActionState(subscribeToNewsletter, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      toast({
        title: 'Success!',
        description: state.message,
      });
      formRef.current?.reset();
    }
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Oops!',
        description: state.error,
      });
    }
  }, [state, toast]);


  return (
    <footer className="bg-footer text-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        
        {/* Newsletter Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8 pb-8 border-b border-gray-700/50">
            <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2 text-white">Join RideNow</h2>
                <p className="text-gray-400">Receive pricing updates, shopping tips & more!</p>
            </div>
            <form ref={formRef} action={formAction} className="w-full max-w-md">
              <div className="flex items-center bg-gray-800/50 border border-gray-700 rounded-full p-1">
                <Input 
                  type="email" 
                  name="email"
                  placeholder="Your e-mail address" 
                  className="bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0 flex-grow" 
                  required
                />
                <SubmitButton />
              </div>
            </form>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
          
          {/* Our Brands */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Our Brands</h3>
            <ul className="space-y-2">
                {brands.map(brand => (
                    <li key={brand}><Link href={`/fleet?brand=${brand}`} prefetch className="text-gray-400 hover:text-primary transition-colors">{brand}</Link></li>
                ))}
            </ul>
          </div>

          {/* Vehicle Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Vehicles Type</h3>
            <ul className="space-y-2">
                {vehicleTypes.map(type => (
                    <li key={type}><Link href={`/fleet?type=${type.toLowerCase()}`} prefetch className="text-gray-400 hover:text-primary transition-colors">{type}</Link></li>
                ))}
            </ul>
          </div>
          
           {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
                <li><Link href="/" prefetch className="text-gray-400 hover:text-primary transition-colors">Home</Link></li>
                <li><Link href="/fleet" prefetch className="text-gray-400 hover:text-primary transition-colors">Fleet</Link></li>
                <li><Link href="/reservations" prefetch className="text-gray-400 hover:text-primary transition-colors">Reservations</Link></li>
                <li><Link href="/contact" prefetch className="text-gray-400 hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>


          {/* App & Social */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Connect With Us</h3>
                <div className="flex items-center gap-4">
                    <Link href="#" className="text-gray-400 hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                    <Link href="#" className="text-gray-400 hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                    <Link href="#" className="text-gray-400 hover:text-primary"><Instagram className="h-5 w-5" /></Link>
                    <Link href="#" className="text-gray-400 hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                </div>
            </div>
          </div>

        </div>

      </div>
      <div className="bg-black/20 py-4">
        <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} RideNow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
