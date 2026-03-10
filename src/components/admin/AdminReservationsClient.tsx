
'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAllReservations, updateReservationStatus } from '@/services/adminService';
import type { Reservation } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Filter, X, User, Car, DollarSign } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useAuth } from '@/context/AuthContext';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  completed: 'bg-blue-100 text-blue-800 border-blue-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const statusOptions: Reservation['status'][] = ['pending', 'confirmed', 'completed', 'cancelled'];


export default function AdminReservationsClient() {
  const { user } = useAuth();
  const token = user?.token;
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ status: '', dateRange: undefined as DateRange | undefined });

  const fetchReservations = useCallback(async (page = 1) => {
    if (!token) {
      setReservations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const apiFilters = {
      page,
      status: filters.status || undefined,
      startDate: filters.dateRange?.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : undefined,
      endDate: filters.dateRange?.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : undefined,
    };

    try {
      const res = await getAllReservations(token, apiFilters);
      setReservations(res.data || []);
      setPagination(res.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch reservations.',
      });
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [
    filters.status,
    filters.dateRange?.from?.getTime(),
    filters.dateRange?.to?.getTime(),
    token,
    toast,
  ]);

  useEffect(() => {
    fetchReservations(1);
  }, [fetchReservations]);

  const handleStatusChange = async (reservationId: string, newStatus: Reservation['status']) => {
    if (!token) {
      return;
    }

    try {
        await updateReservationStatus(token, reservationId, newStatus);
        setReservations(prev => 
            prev.map(r => r._id === reservationId ? { ...r, status: newStatus } : r)
        );
        toast({
            title: 'Success',
            description: `Reservation status updated to ${newStatus}.`,
        });
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to update status.',
        });
    }
  };


  const handleClearFilters = () => {
    setFilters({ status: '', dateRange: undefined });
  };
  
  const renderSkeleton = () => (
    Array.from({ length: 5 }).map((_, i) => (
      <Card key={i} className="md:hidden">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>
    ))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center p-4 bg-card rounded-lg border">
        <Filter className="w-5 h-5 mr-2" />
        <h3 className="text-md font-semibold mr-4">Filters</h3>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({...prev, status: value === 'all' ? '' : value}))}
        >
          <SelectTrigger className="w-full sm:w-[150px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map(status => (
                <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className="w-full sm:w-[280px] justify-start text-left font-normal bg-background"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange?.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, 'LLL dd, y')} - {format(filters.dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(filters.dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="range"
              selected={filters.dateRange}
              onSelect={(range) => setFilters(prev => ({...prev, dateRange: range}))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {(filters.status || filters.dateRange) && (
            <Button variant="ghost" onClick={handleClearFilters} className="w-full sm:w-auto">
                <X className="w-4 h-4 mr-2" />
                Clear
            </Button>
        )}
      </div>

      {!loading && reservations.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          No reservations found.
        </Card>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-28" /></TableCell>
                  </TableRow>
                ))
              : reservations.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-mono text-xs">{r._id}</TableCell>
                    <TableCell>{r.user.name}</TableCell>
                    <TableCell className="capitalize">{r.vehicle.brand} {r.vehicle.model}</TableCell>
                    <TableCell>
                      {format(new Date(r.startDate), 'MM/dd/yy')} - {format(new Date(r.endDate), 'MM/dd/yy')}
                    </TableCell>
                    <TableCell>${r.totalCost.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select value={r.status} onValueChange={(newStatus: Reservation['status']) => handleStatusChange(r._id, newStatus)}>
                          <SelectTrigger hideIcon className={`w-auto h-auto capitalize border rounded-full px-2.5 py-0.5 text-xs font-semibold focus:ring-0 ${statusStyles[r.status]}`}>
                              <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                              {statusOptions.map(status => (
                                  <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {loading 
         ? renderSkeleton()
         : reservations.map((r) => (
          <Card key={r._id}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base font-bold capitalize">{r.vehicle.brand} {r.vehicle.model}</CardTitle>
                  <CardDescription className="font-mono text-xs">{r._id}</CardDescription>
                </div>
                 <Badge className={`capitalize self-start ${statusStyles[r.status]}`}>{r.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
               <div className="flex items-center justify-between text-sm border-t pt-3">
                  <span className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> User</span>
                  <span>{r.user.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Dates</span>
                  <span>{format(new Date(r.startDate), 'MM/dd/yy')} - {format(new Date(r.endDate), 'MM/dd/yy')}</span>
                </div>
                 <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" /> Cost</span>
                  <span className="font-semibold">${r.totalCost.toFixed(2)}</span>
                </div>
                 <div className="flex items-center justify-between text-sm border-t pt-3">
                  <span className="text-muted-foreground">Update Status</span>
                   <Select value={r.status} onValueChange={(newStatus: Reservation['status']) => handleStatusChange(r._id, newStatus)}>
                      <SelectTrigger className="w-[130px] h-8 text-xs capitalize">
                          <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                          {statusOptions.map(status => (
                              <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>


       <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (pagination.page > 1) fetchReservations(pagination.page - 1);
              }}
              className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          <PaginationItem>
             <span className="p-2 text-sm">{`Page ${pagination.page} of ${pagination.totalPages}`}</span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (pagination.page < pagination.totalPages) fetchReservations(pagination.page + 1);
              }}
              className={pagination.page >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
