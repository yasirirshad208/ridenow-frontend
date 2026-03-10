
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { registerUser, type AuthState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialState: AuthState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <LoaderCircle className="animate-spin" /> : 'Create Account'}
    </Button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerUser, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
        <div className="absolute top-8 left-8">
         <Link href="/" className="flex items-center">
          <h1 className={'text-3xl font-headline font-bold text-foreground'}>
            RideNow
          </h1>
        </Link>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Enter your details below to get started.</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" placeholder="e.g. 123-456-7890" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className='flex-col gap-4'>
            <SubmitButton />
             <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline text-primary">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
