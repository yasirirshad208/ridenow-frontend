
'use server';

import { recommendCars } from '@/ai/flows/car-recommendation';
import { z } from 'zod';
import { format } from 'date-fns';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/api/server';

export type RecommendationState = {
  recommendations?: string[];
  error?: string;
  timestamp?: number;
};

export async function getRecommendations(
  prevState: RecommendationState,
  formData: FormData
): Promise<RecommendationState> {
  const schema = z.object({
    preferences: z.string().min(1, 'Please describe your needs.'),
  });
  const validated = schema.safeParse({ preferences: formData.get('preferences') });

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors.preferences?.[0] };
  }

  try {
    const result = await recommendCars({ preferences: validated.data.preferences });
    if (!result.carRecommendations || result.carRecommendations.length === 0) {
      return { error: "Sorry, we couldn't find any recommendations for your preferences." };
    }
    return { recommendations: result.carRecommendations, timestamp: Date.now() };
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export type BookingState = {
  message?: string;
  error?: string;
  bookingDetails?: {
    car: string;
    dates: string;
    pickupLocation: string;
    dropoffLocation: string;
    specialRequests?: string;
  };
  timestamp?: number;
};

export async function createBooking(prevState: BookingState, formData: FormData): Promise<BookingState> {
  const schema = z.object({
    carId: z.string(),
    carName: z.string(),
    startDate: z.string().min(1, 'Please select a start date.'),
    endDate: z.string().min(1, 'Please select an end date.'),
    pickupLocation: z.string().min(1, 'Please enter a pickup location.'),
    dropoffLocation: z.string().min(1, 'Please enter a dropoffLocation.'),
    specialRequests: z.string().optional(),
    userId: z.string().optional(),
    token: z.string().optional(),
  });

  const data = {
    carId: formData.get('carId'),
    carName: formData.get('carName'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    pickupLocation: formData.get('pickupLocation'),
    dropoffLocation: formData.get('dropoffLocation'),
    specialRequests: formData.get('specialRequests'),
    userId: formData.get('userId'),
    token: formData.get('token'),
  };

  const validated = schema.safeParse(data);

  if (!validated.success) {
    const firstError = Object.values(validated.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || 'Invalid form data. Please check your inputs.' };
  }
  
  if (!validated.data.userId || !validated.data.token) {
    return { error: 'You must be logged in to make a booking.' };
  }


  // Simulate booking by calling the API endpoint
  try {
    await serverApiFetch('/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validated.data.token}`,
      },
      body: JSON.stringify({
        vehicleId: validated.data.carId,
        startDate: validated.data.startDate,
        endDate: validated.data.endDate,
        pickupLocation: validated.data.pickupLocation,
        dropoffLocation: validated.data.dropoffLocation,
        specialRequests: validated.data.specialRequests,
        user: validated.data.userId,
      }),
    });

    const bookingDetails = {
      car: validated.data.carName,
      dates: `${format(new Date(validated.data.startDate), 'PPP')} - ${format(new Date(validated.data.endDate), 'PPP')}`,
      pickupLocation: validated.data.pickupLocation,
      dropoffLocation: validated.data.dropoffLocation,
      specialRequests: validated.data.specialRequests,
    };

    return {
      message: `Booking confirmed for ${validated.data.carName}!`,
      bookingDetails,
      timestamp: Date.now(),
    };

  } catch (error: any) {
    console.error('Booking creation failed:', error);
    return { error: error.message || 'An unexpected error occurred during booking.' };
  }
}

export type ContactFormState = {
  message?: string;
  error?: string;
  timestamp?: number;
}

export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const schema = z.object({
    name: z.string().min(1, 'Please enter your name.'),
    email: z.string().email('Please enter a valid email.'),
    subject: z.string().min(1, 'Please enter a subject.'),
    message: z.string().min(1, 'Please enter a message.'),
  });

  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  };

  const validated = schema.safeParse(data);

  if (!validated.success) {
    const firstError = Object.values(validated.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || 'Invalid form data. Please check your inputs.' };
  }

  // Simulate sending message
  console.log('Contact form submitted:', validated.data);

  return {
    message: 'Thank you for your message! We will get back to you shortly.',
    timestamp: Date.now(),
  };
}

export type NewsletterState = {
  message?: string;
  error?: string;
  timestamp?: number;
}

export async function subscribeToNewsletter(prevState: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const schema = z.object({
    email: z.string().email('Please enter a valid email.'),
  });

  const validated = schema.safeParse({ email: formData.get('email') });

  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors.email?.[0] };
  }

  // Simulate subscription
  console.log('New newsletter subscription:', validated.data.email);

  return {
    message: 'Thank you for subscribing!',
    timestamp: Date.now(),
  };
}


// --- AUTH ACTIONS ---

export type AuthState = {
  user?: any;
  token?: string;
  error?: string;
  message?: string;
};

function getAuthErrorMessage(error: unknown, action: 'login' | 'register') {
  const rawMessage = error instanceof Error ? error.message : '';
  const message = rawMessage.toLowerCase();

  if (message.includes('fetch failed') || message.includes('econnrefused') || message.includes('enotfound')) {
    return 'Server is unavailable right now. Please try again in a moment.';
  }

  if (action === 'register') {
    if (
      message.includes('already exists') ||
      message.includes('already registered') ||
      message.includes('duplicate') ||
      message.includes('e11000') ||
      message.includes('email is taken')
    ) {
      return 'An account with this email already exists. Please sign in instead.';
    }
  }

  if (action === 'login') {
    if (
      message.includes('invalid credentials') ||
      message.includes('invalid email') ||
      message.includes('invalid password') ||
      message.includes('incorrect password') ||
      message.includes('user not found') ||
      message.includes('unauthorized')
    ) {
      return 'Invalid email or password.';
    }
  }

  if (rawMessage && rawMessage.trim().length > 0) {
    return rawMessage;
  }

  return action === 'register'
    ? 'Unable to create account right now. Please try again.'
    : 'Unable to sign in right now. Please try again.';
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function loginUser(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validated = loginSchema.safeParse(Object.fromEntries(formData));

  if (!validated.success) {
    const firstError = Object.values(validated.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || 'Invalid data' };
  }

  try {
    const data = await serverApiFetch<any>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validated.data),
    });

    (await cookies()).set('session', JSON.stringify(data), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
  } catch (error: any) {
    return { error: getAuthErrorMessage(error, 'login') };
  }

  redirect('/');
}

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(10, 'Please enter a valid phone number'),
});

export async function registerUser(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const validated = registerSchema.safeParse(Object.fromEntries(formData));
  
  if (!validated.success) {
    const firstError = Object.values(validated.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError || 'Invalid data' };
  }

  try {
    const data = await serverApiFetch<any>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validated.data, role: 'user' }), // Default role to user
    });

     (await cookies()).set('session', JSON.stringify(data), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
  } catch (error: any) {
    return { error: getAuthErrorMessage(error, 'register') };
  }
  
  redirect('/');
}


export async function logoutUser() {
    (await cookies()).set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
    });

    redirect('/login');
}
