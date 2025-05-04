import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
} from 'recharts';

interface EnrollmentCardProps {
  data: {
    courseName: string;
    enrollments: number;
  }[];
}

const EnrollmentCard = ({ data }: EnrollmentCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{t('analytics.coursePerformance.enrollments')}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground">
            {t('analytics.noData')}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="courseName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="enrollments" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default EnrollmentCard;
