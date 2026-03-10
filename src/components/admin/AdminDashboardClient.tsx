
'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Users,
  Car,
  Bookmark,
  DollarSign,
  Activity,
} from 'lucide-react';
import { getDashboardStats } from '@/services/adminService';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

const AdminDashboardCharts = dynamic(() => import('@/components/admin/AdminDashboardCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="h-[360px] rounded bg-secondary animate-pulse" />
      <div className="h-[360px] rounded bg-secondary animate-pulse" />
    </div>
  ),
});

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


export default function AdminDashboardClient() {
  const { user } = useAuth();
  const token = user?.token;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setStats(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadStats = async () => {
      setLoading(true);
      try {
        const response = await getDashboardStats(token);
        if (isMounted) {
          setStats(response?.data ?? null);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        if (isMounted) {
          setStats(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const formattedMonthlyRevenue = stats?.monthlyRevenue.map((item: any) => ({
    name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    revenue: item.revenue,
    bookings: item.count,
  })) || [];

  const formattedPopularVehicles = stats?.popularVehicles.map((item: any) => ({
    name: `${item.vehicle.brand} ${item.vehicle.model}`,
    bookings: item.count,
    revenue: item.revenue,
  })) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Card key={idx}>
              <CardHeader className="space-y-2 pb-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-[360px] w-full rounded" />
          <Skeleton className="h-[360px] w-full rounded" />
        </div>
      </div>
    );
  }

  if (!stats) return <p>Could not load dashboard data.</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totals.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From all completed bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.users}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.vehicles}</div>
             <p className="text-xs text-muted-foreground">Vehicles in fleet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.reservations}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.activeReservations}</div>
             <p className="text-xs text-muted-foreground">Pending or confirmed</p>
          </CardContent>
        </Card>
      </div>

      <AdminDashboardCharts
        monthlyRevenue={formattedMonthlyRevenue}
        popularVehicles={formattedPopularVehicles}
      />

    </div>
  );
}
