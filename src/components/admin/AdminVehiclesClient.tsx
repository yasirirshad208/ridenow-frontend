
'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Car } from '@/lib/types';
import { fetchVehicles } from '@/services/vehicleService';
import { deleteVehicle as deleteVehicleService } from '@/services/adminService';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Car as CarIcon, Edit, Trash2, PlusCircle, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { resolveImageUrl } from '@/lib/image-url';
import { useAuth } from '@/context/AuthContext';

const VehicleForm = dynamic(() => import('@/components/admin/VehicleForm').then((mod) => mod.VehicleForm), {
  ssr: false,
  loading: () => (
    <div className="space-y-3 py-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  ),
});

export default function AdminVehiclesClient() {
  const { user } = useAuth();
  const token = user?.token;
  const [vehicles, setVehicles] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Car | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Car | null>(null);

  const fetchVehicleData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetchVehicles({ page, limit: 10, sort: '-createdAt' });
      setVehicles(res.data || []);
      setPagination(res.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch vehicles.',
      });
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVehicleData(1);
  }, [fetchVehicleData]);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingVehicle(null);
    fetchVehicleData(pagination.page); // Refresh current page
    toast({
        title: 'Success!',
        description: `Vehicle has been ${editingVehicle ? 'updated' : 'created'} successfully.`,
    });
  };

  const handleEdit = (vehicle: Car) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingVehicle(null);
    setIsFormOpen(true);
  }

  const openDeleteDialog = (vehicle: Car) => {
    setVehicleToDelete(vehicle);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!vehicleToDelete || !token) return;

    try {
      await deleteVehicleService(token, vehicleToDelete._id);
      setIsDeleteDialogOpen(false);
      setVehicleToDelete(null);
      fetchVehicleData(pagination.page);
      toast({
        title: 'Vehicle Deleted',
        description: `${vehicleToDelete.name} has been removed.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: error.message || 'Could not delete the vehicle.',
      });
    }
  };
  
  const renderSkeleton = () => (
     Array.from({ length: 5 }).map((_, i) => (
       <Card key={i} className="md:hidden">
          <CardHeader className="p-0">
             <Skeleton className="h-40 w-full rounded-t-lg" />
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <Skeleton className="h-6 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </CardFooter>
        </Card>
     ))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Vehicles</h2>
         <Dialog open={isFormOpen} onOpenChange={(isOpen) => { setIsFormOpen(isOpen); if (!isOpen) setEditingVehicle(null); }}>
            <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Vehicle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Create New Vehicle'}</DialogTitle>
                </DialogHeader>
                <VehicleForm 
                  vehicle={editingVehicle} 
                  onSuccess={handleFormSuccess}
                />
            </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price/Day</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="space-y-1">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
                  </TableRow>
                ))
              : vehicles.map((vehicle) => (
                  <TableRow key={vehicle._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-secondary">
                          {vehicle.images?.[0] ? (
                            <Image
                              src={resolveImageUrl(vehicle.images[0]) || 'https://picsum.photos/seed/car-placeholder/600/400'}
                              alt={vehicle.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <CarIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{vehicle.brand} {vehicle.model}</p>
                          <p className="text-xs text-muted-foreground capitalize">{vehicle.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{vehicle.type}</TableCell>
                    <TableCell>${vehicle.pricePerDay.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.availability ? 'default' : 'destructive'} className={vehicle.availability ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {vehicle.availability ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => openDeleteDialog(vehicle)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
         : vehicles.map((vehicle) => (
          <Card key={vehicle._id} className="overflow-hidden">
            <CardHeader className="p-0">
               <div className="relative h-40 w-full bg-secondary">
                  {vehicle.images?.[0] ? (
                    <Image
                      src={resolveImageUrl(vehicle.images[0]) || 'https://picsum.photos/seed/car-placeholder/600/400'}
                      alt={vehicle.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <CarIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold capitalize">{vehicle.brand} {vehicle.model}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{vehicle.name}</p>
                  </div>
                  <Badge variant={vehicle.availability ? 'default' : 'destructive'} className={vehicle.availability ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {vehicle.availability ? 'Available' : 'Unavailable'}
                  </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm pt-2">
                <span className="capitalize">{vehicle.type}</span>
                &bull;
                 <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> {vehicle.pricePerDay.toFixed(2)}/day</span>
              </div>
            </CardContent>
            <CardFooter className="bg-secondary/50 p-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(vehicle)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(vehicle)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {!loading && vehicles.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          No vehicles found.
        </Card>
      )}


      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (pagination.page > 1) fetchVehicleData(pagination.page - 1);
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
                if (pagination.page < pagination.totalPages) fetchVehicleData(pagination.page + 1);
              }}
               className={pagination.page >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vehicle
              "{vehicleToDelete?.name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
