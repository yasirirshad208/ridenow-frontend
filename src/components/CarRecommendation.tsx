'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { getRecommendations, type RecommendationState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Car, LoaderCircle, AlertCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const initialState: RecommendationState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <LoaderCircle className="mr-2 animate-spin" />
          Getting Recommendations...
        </>
      ) : (
        <>
          <Wand2 className="mr-2" />
          Get Recommendations
        </>
      )}
    </Button>
  );
}

export function CarRecommendation() {
  const [state, formAction] = useActionState(getRecommendations, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.recommendations) {
      toast({
        title: 'We found some cars for you!',
        description: 'Check out the recommendations below.',
      });
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
          <Wand2 className="text-primary" />
          AI Car Recommender
        </CardTitle>
        <CardDescription>
          Not sure what to choose? Describe your trip, and we'll suggest the best cars for you.
        </CardDescription>
      </CardHeader>
      <form action={formAction} ref={formRef}>
        <CardContent>
          <Textarea
            name="preferences"
            placeholder="e.g., 'I need a fuel-efficient car for a long road trip with 4 people and lots of luggage.'"
            className="min-h-[100px]"
            required
          />
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-4">
          <SubmitButton />
          {state?.error && (
            <div className="text-destructive text-sm flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>{state.error}</p>
            </div>
          )}
        </CardFooter>
      </form>
      {state?.recommendations && (
        <CardContent className="border-t pt-4 mt-4">
          <h3 className="mb-2 font-headline font-semibold">Our Recommendations:</h3>
          <ul className="space-y-2">
            {state.recommendations.map((rec, index) => (
              <li key={index} className="flex items-center gap-2 rounded-md bg-secondary p-2">
                <Car className="h-5 w-5 text-primary" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
