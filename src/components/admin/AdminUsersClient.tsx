
'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAllUsers, updateUserRole } from '@/services/adminService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


type UserData = {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    createdAt: string;
    phone: string;
    avatar?: string;
}

export default function AdminUsersClient() {
  const { user } = useAuth();
  const token = user?.token;
  const currentUserEmail = user?.data?.user?.email;
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchUsers = useCallback(async (page = 1) => {
    if (!token) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await getAllUsers(token, page);
      setUsers(res.data || []);
      setPagination(res.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch users.',
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await updateUserRole(token, userId, newRole);
      setUsers((prevUsers) => prevUsers.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      toast({
        title: 'Success',
        description: 'User role updated successfully.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Failed to update user role.',
      });
    }
  };
  
  const getInitials = (name = '') => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('');
  }
  
  const renderSkeleton = () => (
     Array.from({ length: 5 }).map((_, i) => (
      <Card key={i} className="md:hidden">
        <CardContent className="p-4 flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-grow">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </CardContent>
      </Card>
    ))
  );

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email & Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  </TableRow>
                ))
              : users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <Avatar>
                              <AvatarImage src={u.avatar} />
                              <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                              <p className="font-medium">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u._id}</p>
                          </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div>
                          <p>{u.email}</p>
                          <p className="text-sm text-muted-foreground">{u.phone}</p>
                       </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={u.role}
                        onValueChange={(newRole: 'user' | 'admin') =>
                          handleRoleChange(u._id, newRole)
                        }
                        disabled={u.email === currentUserEmail}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{format(new Date(u.createdAt), 'PPP')}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

       {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {loading 
          ? renderSkeleton()
          : users.map((u) => (
            <Card key={u._id}>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-base">{u.name}</CardTitle>
                            <CardDescription className="text-xs">{u._id}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm border-t pt-3">
                        <span className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" /> Email</span>
                        <span>{u.email}</span>
                    </div>
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" /> Phone</span>
                        <span>{u.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Joined</span>
                        <span>{format(new Date(u.createdAt), 'PPP')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm border-t pt-3">
                      <span className="font-medium">Role</span>
                      <Select
                        defaultValue={u.role}
                        onValueChange={(newRole: 'user' | 'admin') =>
                          handleRoleChange(u._id, newRole)
                        }
                        disabled={u.email === currentUserEmail}
                      >
                        <SelectTrigger className="w-[110px] h-8 text-xs">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
      
      {!loading && users.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          No users found.
        </Card>
      )}

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (pagination.page > 1) fetchUsers(pagination.page - 1);
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
                if (pagination.page < pagination.totalPages) fetchUsers(pagination.page + 1);
              }}
              className={pagination.page >= pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
