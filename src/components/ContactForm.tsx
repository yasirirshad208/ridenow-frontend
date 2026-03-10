
'use client';

import { useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitContactForm, type ContactFormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const initialState: ContactFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-blue-600 hover:bg-blue-700">
      {pending ? <><LoaderCircle className="animate-spin mr-2" /> Sending...</> : 'Send Message'}
    </Button>
  );
}

const services = [
  { id: 'website-design', label: 'Website design' },
  { id: 'content-creation', label: 'Content creation' },
  { id: 'ux-design', label: 'UX design' },
  { id: 'strategy-consulting', label: 'Strategy & consulting' },
  { id: 'user-research', label: 'User research' },
  { id: 'other', label: 'Other' },
]

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      toast({
        title: 'Message Sent!',
        description: state.message,
      });
      formRef.current?.reset();
    }
     if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} ref={formRef} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="first-name">First name</Label>
          <Input id="first-name" name="first-name" placeholder="First name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last-name">Last name</Label>
          <Input id="last-name" name="last-name" placeholder="Last name" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="you@company.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <div className="flex gap-2">
            <Select defaultValue="US">
                <SelectTrigger className="w-[80px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="US">US</SelectItem>
                    <SelectItem value="CA">CA</SelectItem>
                    <SelectItem value="UK">UK</SelectItem>
                </SelectContent>
            </Select>
            <Input id="phone" name="phone" placeholder="+1 (555) 000-0000" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" placeholder="Leave us a message..." required className="min-h-[120px]" />
      </div>
      
      <SubmitButton />

      {state.error && (
        <div className="text-destructive text-sm flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>{state.error}</p>
        </div>
      )}
    </form>
  );
}
