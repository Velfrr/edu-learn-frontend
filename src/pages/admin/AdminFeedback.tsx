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
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getAllFeedback, updateFeedbackStatus } from '@/api/feedback';
import { Feedback } from '@/types/feedback';
import { FeedbackStatus } from '@/enums/feedback-types';
import { toast } from '@/components/ui/use-toast';
import { Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import axios from 'axios';

async function getProfilesDict(
  userIds: string[],
): Promise<Record<string, { fullName: string; email: string }>> {
  if (!userIds.length) return {};
  try {
    const { data } = await axios.post('/api/profiles/by-ids', { ids: userIds });
    const dict: Record<string, { fullName: string; email: string }> = {};
    data.forEach((p: any) => {
      dict[p.id] = {
        fullName: p.full_name || 'Unknown',
        email: p.email || '',
      };
    });
    return dict;
  } catch {
    return {};
  }
}

const AdminFeedback: React.FC = () => {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'ALL'>(
    'ALL',
  );
  const [profiles, setProfiles] = useState<
    Record<string, { fullName: string; email: string }>
  >({});

  const fetchAndSetFeedback = async () => {
    setIsLoading(true);
    const { feedback: allFeedback, error } = await getAllFeedback();
    if (error) {
      toast({
        title: t('feedback.admin.actions.updateFailed'),
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    setFeedback(allFeedback);
    setFilteredFeedback(allFeedback);

    const uniqueUserIds = Array.from(
      new Set(allFeedback.map((fb) => fb.userId).filter(Boolean)),
    );
    const dict = await getProfilesDict(uniqueUserIds.slice(0, 20));
    setProfiles(dict);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAndSetFeedback();
  }, []);

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredFeedback(feedback);
    } else {
      setFilteredFeedback(feedback.filter((fb) => fb.status === statusFilter));
    }
  }, [statusFilter, feedback]);

  const handleStatusChange = async (id: string, newStatus: FeedbackStatus) => {
    const fb = feedback.find((f) => f.id === id);
    if (!fb) return;

    if (fb.status === newStatus) return;

    const result = await updateFeedbackStatus(id, newStatus);
    if (result.error) {
      toast({
        title: t('feedback.admin.actions.updateFailed'),
        description: result.error.message,
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: t('feedback.admin.actions.statusChanged'),
      description: t('feedback.admin.actions.statusChangedDesc', {
        status: t(`feedback.admin.status.${newStatus.toLowerCase()}`),
      }),
    });

    setFeedback(
      feedback.map((f) =>
        f.id === id
          ? { ...f, status: newStatus, updatedAt: new Date().toISOString() }
          : f,
      ),
    );
  };

  const openMail = (userId: string, subject: string) => {
    const email = profiles[userId]?.email || '';
    const name = profiles[userId]?.fullName || 'User';
    const mailTo = email
      ? `mailto:${email}?subject=Re: ${encodeURIComponent(subject)}&body=Hi ${name},%0D%0A%0D%0A`
      : `mailto:?subject=Re: ${encodeURIComponent(subject)}&body=Hi ${name},%0D%0A%0D%0A`;
    window.location.href = mailTo;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Mail className="text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">
            {t('feedback.admin.title')}
          </h1>
        </div>
        <div className="mb-4">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as FeedbackStatus | 'ALL')
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue
                placeholder={t('feedback.admin.filters.statusPlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t('feedback.admin.filters.allStatuses')}
              </SelectItem>
              {Object.values(FeedbackStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`feedback.admin.status.${status.toLowerCase()}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-auto rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('feedback.admin.table.user')}</TableHead>
                <TableHead>{t('feedback.admin.table.email')}</TableHead>
                <TableHead>{t('feedback.admin.table.subject')}</TableHead>
                <TableHead>{t('feedback.admin.table.type')}</TableHead>
                <TableHead>{t('feedback.admin.table.status')}</TableHead>
                <TableHead>{t('feedback.admin.table.date')}</TableHead>
                <TableHead>{t('feedback.admin.table.message')}</TableHead>
                <TableHead className="text-right">
                  {t('feedback.admin.table.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredFeedback.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    {t('feedback.admin.noFeedback')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeedback.map((fb) => (
                  <TableRow key={fb.id}>
                    <TableCell>
                      {profiles[fb.userId]?.fullName || (
                        <span className="text-muted-foreground">
                          {t('feedback.admin.loading')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {profiles[fb.userId]?.email || (
                        <span className="text-muted-foreground">
                          {t('common.notAvailable')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{fb.subject}</TableCell>
                    <TableCell>
                      {t(`feedback.types.${fb.type.toLowerCase()}`)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="min-w-[120px] capitalize"
                            size="sm"
                          >
                            {t(
                              `feedback.admin.status.${fb.status.toLowerCase()}`,
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {Object.values(FeedbackStatus).map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => handleStatusChange(fb.id, status)}
                              disabled={fb.status === status}
                              className="flex items-center capitalize"
                            >
                              {fb.status === status && (
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                              )}
                              {t(
                                `feedback.admin.status.${status.toLowerCase()}`,
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      {fb.createdAt
                        ? new Date(fb.createdAt).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-pre-wrap">
                      {fb.message}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openMail(fb.userId, fb.subject)}
                        title={t('feedback.admin.actions.reply')}
                        disabled={!profiles[fb.userId]?.email}
                      >
                        <Mail className="mr-1 h-4 w-4" />{' '}
                        {t('feedback.admin.actions.reply')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminFeedback;
