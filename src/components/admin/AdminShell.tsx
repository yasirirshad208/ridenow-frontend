'use client';

import { useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Car,
  Bookmark,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { logoutUser } from '@/app/actions';
import { primeDashboardStats } from '@/services/adminService';

type AdminShellUser = {
  name: string;
  email: string;
  avatar?: string;
};

const ADMIN_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { href: '/admin/reservations', label: 'Reservations', icon: Bookmark },
];

export function AdminShell({
  user,
  token,
  children,
}: {
  user: AdminShellUser;
  token?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const getInitials = (name = '') => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  useEffect(() => {
    for (const link of ADMIN_LINKS) {
      router.prefetch(link.href);
    }

    if (token) {
      primeDashboardStats(token);
    }
  }, [router, token]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="mb-8">
          <Link href="/" className="flex items-center gap-2" prefetch>
            <span className="text-xl font-headline font-bold">RideNow</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {ADMIN_LINKS.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton asChild isActive={pathname === link.href}>
                  <Link href={link.href} prefetch>
                    <link.icon />
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || ''} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
          <form action={logoutUser} className="w-full">
            <SidebarMenuButton type="submit">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </form>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-lg font-semibold capitalize">
              {pathname.split('/').pop()?.replace('-', ' ')}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-secondary/40">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
