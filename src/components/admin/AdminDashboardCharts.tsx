'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart as RechartsBarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart, Car } from 'lucide-react';

type RevenuePoint = {
  name: string;
  revenue: number;
  bookings: number;
};

type PopularVehiclePoint = {
  name: string;
  bookings: number;
  revenue: number;
};

export default function AdminDashboardCharts({
  monthlyRevenue,
  popularVehicles,
}: {
  monthlyRevenue: RevenuePoint[];
  popularVehicles: PopularVehiclePoint[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Monthly Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={monthlyRevenue}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--secondary))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
              <Bar dataKey="bookings" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} name="Bookings" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Most Popular Vehicles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={popularVehicles} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--secondary))' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                }}
              />
              <Legend />
              <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Total Bookings" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

