import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Course } from '@/types/course';
import { Trash2, Eye } from 'lucide-react';
import ViewCourseDialog from '@/components/admin/ViewCourseDialog';
import MainLayout from '@/components/layout/MainLayout';
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
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AdminCourses = () => {
  const { t } = useTranslation();

  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const { data: courses, refetch } = useQuery({
    queryKey: ['admin-courses', sortOrder],
    queryFn: async () => {
      const { data } = await axios.get('/api/courses', {
        params: { order: sortOrder },
      });

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url || undefined,
        createdBy: item.created_by,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) as Course[];
    },
  });

  const filteredCourses = courses?.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (courseId: string) => {
    try {
      await axios.delete(`/api/courses/${courseId}`);

      toast({
        title: 'Course deleted successfully',
        description: 'The course has been removed from the system.',
      });
      refetch();
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch (error) {
      toast({
        title: 'Error deleting course',
        description: 'There was a problem deleting the course.',
        variant: 'destructive',
      });
    }
  };

  const handleView = (course: Course) => {
    setSelectedCourse(course);
    setViewDialogOpen(true);
  };

  const openDeleteDialog = (course: Course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="mb-4 text-2xl font-bold">
            {t('courses.courseManagement.courseManagement')}
          </h1>
          <div className="mb-4 flex items-center gap-4">
            <Input
              placeholder={t('courses.courseManagement.searchCourses')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={sortOrder}
              onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={t('courses.courseManagement.sortOrder')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">
                  {t('courses.courseManagement.newestFirst')}
                </SelectItem>
                <SelectItem value="asc">
                  {t('courses.courseManagement.oldestFirst')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('courses.courseManagement.title')}</TableHead>
                <TableHead>
                  {t('courses.courseManagement.description')}
                </TableHead>
                <TableHead>{t('courses.courseManagement.status')}</TableHead>
                <TableHead>{t('courses.courseManagement.createdAt')}</TableHead>
                <TableHead className="text-right">
                  {t('courses.courseManagement.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    {t('courses.courseManagement.noCoursesFound')}
                  </TableCell>
                </TableRow>
              )}
              {filteredCourses?.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {course.description}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                      {t('courses.courseManagement.active')}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(course.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleView(course)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => openDeleteDialog(course)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <ViewCourseDialog
          course={selectedCourse}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('courses.courseManagement.deleteCourse')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('courses.courseManagement.deleteDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCourseToDelete(null)}>
                {t('courses.courseManagement.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  courseToDelete && handleDelete(courseToDelete.id)
                }
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('courses.courseManagement.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default AdminCourses;
// comm
