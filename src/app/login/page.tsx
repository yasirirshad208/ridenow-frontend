
'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { loginUser, type AuthState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialState: AuthState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <LoaderCircle className="animate-spin" /> : 'Sign In'}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginUser, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
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
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className='flex-col gap-4'>
            <SubmitButton />
            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="underline text-primary">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
