import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/utils/date';
import { Button } from '@/components/ui/button';
import { Users, FileText, UserMinus } from 'lucide-react';
import { User } from '@/types/user';
import { useTranslation } from 'react-i18next';

type StudentListProps = {
  students: { user: User; enrolledCourses?: number }[];
  showEnrollments?: boolean;
  showViewProgress?: boolean;
  showRemoveAction?: boolean;
  onViewProgress?: (userId: string) => void;
  onRemoveStudent?: (userId: string) => void;
};

const StudentsList = ({
  students,
  showEnrollments = false,
  showViewProgress = false,
  showRemoveAction = false,
  onViewProgress,
  onRemoveStudent,
}: StudentListProps) => {
  const { t } = useTranslation();

  if (!students || students.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/10 p-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <Users className="h-8 w-8 text-muted-foreground" />
          <h3 className="font-medium">{t('students.noStudents')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('students.noStudentsDescription')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">
            {t('students.table.name')}
          </TableHead>
          {showEnrollments && (
            <TableHead>{t('students.table.enrolledCourses')}</TableHead>
          )}
          <TableHead>{t('students.table.lastActive')}</TableHead>
          {(showViewProgress || showRemoveAction) && (
            <TableHead className="text-right">
              {t('students.table.actions')}
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.user.id}>
            <TableCell className="font-medium">
              {student.user.fullName}
            </TableCell>
            {showEnrollments && (
              <TableCell>
                {student.enrolledCourses}{' '}
                {student.enrolledCourses === 1
                  ? t('courses.singular')
                  : t('courses.plural')}
              </TableCell>
            )}
            <TableCell>
              {!student.user.lastActive
                ? formatDate(student.user.lastActive)
                : t('common.notAvailable')}
            </TableCell>
            {(showViewProgress || showRemoveAction) && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {showViewProgress && onViewProgress && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewProgress(student.user.id)}
                    >
                      <FileText className="mr-1 h-4 w-4" />{' '}
                      {t('students.viewProgress')}
                    </Button>
                  )}
                  {showRemoveAction && onRemoveStudent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveStudent(student.user.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <UserMinus className="mr-1 h-4 w-4" />{' '}
                      {t('students.removeStudent')}
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StudentsList;
