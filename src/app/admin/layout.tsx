import { AdminShell } from '@/components/admin/AdminShell';
import { requireAdminSession } from '@/lib/auth/session';
import { AuthProvider } from '@/context/AuthContext';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession('/login');

  return (
    <AuthProvider initialData={session}>
      <AdminShell
        user={{
          name: session.data.user.name,
          email: session.data.user.email,
          avatar: session.data.user.avatar,
        }}
        token={session.token}
      >
        {children}
      </AdminShell>
    </AuthProvider>
  );
}
