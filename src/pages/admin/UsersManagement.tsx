import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllUsers, deleteUser, toggleUserBanStatus } from '@/api/user';
import { User } from '@/types/user';
import { UserRole } from '@/enums/roles';
import { toast } from '@/components/ui/use-toast';
import { Users, UserMinus, Ban, CheckCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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

const UsersManagement: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [banningId, setBanningId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [nameFilter, setNameFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'banned' | 'all'>(
    'all',
  );
  const [sortBy, setSortBy] = useState<'created' | 'lastActive'>('created');

  const fetchUsers = async () => {
    setIsLoading(true);
    const { users: allUsers, error } = await getAllUsers();
    if (error) {
      toast({ title: 'Failed to load users', description: error.message });
    }
    setUsers(allUsers);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const result = users.filter((user) => {
      const nameMatch = nameFilter
        ? user.fullName.toLowerCase().includes(nameFilter.toLowerCase())
        : true;

      const roleMatch = roleFilter !== 'all' ? user.role === roleFilter : true;

      const statusMatch =
        statusFilter !== 'all'
          ? statusFilter === 'active'
            ? !user.isBanned
            : user.isBanned
          : true;

      return nameMatch && roleMatch && statusMatch;
    });

    if (sortBy === 'created') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sortBy === 'lastActive') {
      result.sort((a, b) => {
        const dateA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
        const dateB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
        return dateB - dateA;
      });
    }

    setFilteredUsers(result);
  }, [users, nameFilter, roleFilter, statusFilter, sortBy]);

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setDeletingId(userToDelete.id);
    setShowDeleteDialog(false);

    const { error } = await deleteUser(userToDelete.id);
    if (error) {
      toast({
        title: t('admin.usersManagement.toast.deleteError'),
        description: error.message,
      });
    } else {
      toast({ title: t('admin.usersManagement.toast.deleteSuccess') });
      fetchUsers();
    }
    setDeletingId(null);
    setUserToDelete(null);
  };

  const handleToggleBan = async (id: string, currentBanStatus: boolean) => {
    setBanningId(id);
    const { error } = await toggleUserBanStatus(id, !currentBanStatus);
    if (error) {
      toast({
        title: currentBanStatus
          ? t('admin.usersManagement.toast.unbanError')
          : t('admin.usersManagement.toast.banError'),
        description: error.message,
      });
    } else {
      toast({
        title: currentBanStatus
          ? t('admin.usersManagement.toast.unbanSuccess')
          : t('admin.usersManagement.toast.banSuccess'),
      });
      fetchUsers();
    }
    setBanningId(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Users className="text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">
            {t('admin.usersManagement.title')}
          </h1>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            placeholder={t('admin.usersManagement.filters.name')}
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
          <Select
            value={roleFilter}
            onValueChange={(value: UserRole | 'all') => setRoleFilter(value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={t('admin.usersManagement.filters.role')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('admin.usersManagement.filters.allRoles')}
              </SelectItem>
              <SelectItem value={UserRole.STUDENT}>
                {t('auth.student')}
              </SelectItem>
              <SelectItem value={UserRole.TEACHER}>
                {t('auth.teacher')}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value: 'active' | 'banned' | 'all') =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder={t('admin.usersManagement.filters.status')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('admin.usersManagement.filters.allUsers')}
              </SelectItem>
              <SelectItem value="active">
                {t('admin.usersManagement.filters.active')}
              </SelectItem>
              <SelectItem value="banned">
                {t('admin.usersManagement.filters.banned')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <span>{t('admin.usersManagement.sort.label')}</span>
          <Select
            value={sortBy}
            onValueChange={(value: 'created' | 'lastActive') =>
              setSortBy(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={t('admin.usersManagement.sort.label')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">
                {t('admin.usersManagement.sort.created')}
              </SelectItem>
              <SelectItem value="lastActive">
                {t('admin.usersManagement.sort.lastActive')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-auto rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.usersManagement.table.name')}</TableHead>
                <TableHead>{t('admin.usersManagement.table.email')}</TableHead>
                <TableHead>{t('admin.usersManagement.table.role')}</TableHead>
                <TableHead>
                  {t('admin.usersManagement.table.created')}
                </TableHead>
                <TableHead>
                  {t('admin.usersManagement.table.lastActive')}
                </TableHead>
                <TableHead>{t('admin.usersManagement.table.status')}</TableHead>
                <TableHead className="text-right">
                  {t('admin.usersManagement.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    {t('admin.usersManagement.noUsers')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.fullName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {t(`auth.${user.role.toLowerCase()}`)}
                    </TableCell>
                    <TableCell>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {user.lastActive
                        ? new Date(user.lastActive).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          user.isBanned ? 'text-destructive' : 'text-green-600'
                        }
                      >
                        {t(
                          user.isBanned
                            ? 'admin.usersManagement.status.banned'
                            : 'admin.usersManagement.status.active',
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleToggleBan(user.id, user.isBanned || false)
                        }
                        disabled={
                          banningId === user.id || deletingId === user.id
                        }
                        className={
                          user.isBanned
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-destructive hover:bg-destructive/10'
                        }
                        title={
                          user.isBanned
                            ? t('admin.usersManagement.actions.unban')
                            : t('admin.usersManagement.actions.ban')
                        }
                      >
                        {user.isBanned ? (
                          <>
                            <CheckCircle className="mr-1 h-4 w-4" />{' '}
                            {t('admin.usersManagement.actions.unban')}
                          </>
                        ) : (
                          <>
                            <Ban className="mr-1 h-4 w-4" />{' '}
                            {t('admin.usersManagement.actions.ban')}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(user)}
                        disabled={deletingId === user.id}
                        title={t('admin.usersManagement.actions.delete')}
                      >
                        <UserMinus className="mr-1 h-4 w-4" />{' '}
                        {t('admin.usersManagement.actions.delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('admin.usersManagement.deleteConfirm.title')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('admin.usersManagement.deleteConfirm.description', {
                  name: userToDelete?.fullName,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {t('admin.usersManagement.deleteConfirm.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('admin.usersManagement.deleteConfirm.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default UsersManagement;
