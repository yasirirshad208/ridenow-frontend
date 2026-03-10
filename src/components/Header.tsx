
'use client';

import { usePathname } from 'next/navigation';
import { Car, User, Menu, X, LogOut, LayoutDashboard, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { logoutUser } from '@/app/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';


export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const isTransparentPage = (pathname === '/' || pathname === '/fleet') && !pathname.startsWith('/admin');
  const userData = user?.data?.user;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/fleet', label: 'Fleet' },
  ];

  if (userData) {
    navLinks.push({ href: '/reservations', label: 'Reservations' });
  }
  
  navLinks.push({ href: '/contact', label: 'Contact' });


  const isTransparent = isTransparentPage;

  const getInitials = (name = '') => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('');
  }


  return (
    <header
      className={cn(
        'absolute left-0 right-0 top-0 z-50 transition-all duration-300',
        isTransparent ? 'bg-transparent' : 'bg-background shadow-md'
      )}
    >
      <div className="container mx-auto flex h-20 items-center justify-between">
        <Link href="/" prefetch className="flex items-center">
          <h1
            className={cn(
              'text-3xl font-headline font-bold transition-colors',
              isTransparent ? 'text-white' : 'text-foreground'
            )}
          >
            RideNow
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <ul
            className={cn(
              'flex items-center gap-8 transition-colors',
              isTransparent ? 'text-white' : 'text-foreground'
            )}
          >
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  prefetch
                  className="hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="hidden md:flex items-center gap-2">
           {userData ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={cn("relative h-10 w-10 rounded-full", isTransparent ? 'text-white hover:bg-white/10 hover:text-white' : '')}>
                  <Avatar>
                    <AvatarImage src={userData.avatar || ''} alt={userData.name} />
                    <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userData.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userData.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/reservations" prefetch>
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>My Reservations</span>
                  </Link>
                </DropdownMenuItem>
                 {userData.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" prefetch>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <form action={logoutUser}>
                    <DropdownMenuItem asChild>
                      <button type="submit" className='w-full'>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
           ) : (
             <>
                <Button asChild variant="ghost" className={cn(isTransparent ? "text-white hover:bg-white/10 hover:text-white" : "text-foreground")}>
                  <Link href="/login" prefetch>
                    Sign In
                  </Link>
                </Button>
                 <Button asChild className={cn(isTransparent ? "bg-white text-primary hover:bg-white/90" : "")}>
                  <Link href="/register" prefetch>
                    Register
                  </Link>
                </Button>
            </>
           )}
        </div>


        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={cn(isTransparent ? "text-white hover:bg-white/10 hover:text-white" : "text-foreground", "h-10 w-10")}>
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background p-6" hideClose>
              <div className="flex flex-col h-full">
                <div className='flex justify-between items-center mb-8'>
                    <Link href="/" prefetch className="flex items-center">
                        <h1 className="text-3xl font-headline font-bold text-foreground">RideNow</h1>
                    </Link>
                     <SheetClose asChild>
                        <Button variant="ghost" size="icon">
                            <X className="h-6 w-6" />
                        </Button>
                    </SheetClose>
                </div>
              
                <nav className="flex flex-col gap-6 text-lg">
                  {navLinks.map((link) => (
                     <SheetClose asChild key={link.href}>
                        <Link
                            href={link.href}
                            prefetch
                            className="text-foreground hover:text-primary transition-colors"
                        >
                            {link.label}
                        </Link>
                    </SheetClose>
                  ))}
                  {userData?.role === 'admin' && (
                    <SheetClose asChild>
                      <Link href="/admin/dashboard" prefetch className="text-foreground hover:text-primary transition-colors">
                        Dashboard
                      </Link>
                    </SheetClose>
                  )}
                </nav>
                 <div className="mt-auto border-t pt-6">
                    {userData ? (
                         <form action={logoutUser}>
                            <Button type="submit" className="w-full">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </form>
                    ): (
                        <div className='flex flex-col gap-4'>
                            <SheetClose asChild>
                                <Button asChild className="w-full" variant="outline">
                                    <Link href="/login" prefetch>
                                        <User className="mr-2 h-4 w-4" />
                                        Sign In
                                    </Link>
                                </Button>
                            </SheetClose>
                             <SheetClose asChild>
                                 <Button asChild className="w-full">
                                    <Link href="/register" prefetch>
                                        Register
                                    </Link>
                                </Button>
                            </SheetClose>
                        </div>
                    )}
                 </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
