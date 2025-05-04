import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Line,
  Tooltip,
  Legend,
} from 'recharts';

interface LessonPerformanceCardProps {
  data: {
    lessonName: string;
    completionRate: number;
    averageScore: number;
  }[];
}

const LessonPerformanceCard = ({ data }: LessonPerformanceCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{t('analytics.lessonPerformance.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-muted-foreground">
            {t('analytics.noData')}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <XAxis dataKey="lessonName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="completionRate"
                stroke="#2563eb"
                name={t('analytics.lessonPerformance.completionRate')}
              />
              <Line
                type="monotone"
                dataKey="averageScore"
                stroke="#10b981"
                name={t('analytics.lessonPerformance.averageScore')}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default LessonPerformanceCard;
