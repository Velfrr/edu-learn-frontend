import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  footer?: ReactNode;
  className?: string;
  link?: string;
  children: ReactNode;
}

const DashboardCard = ({
  title,
  description,
  icon,
  footer,
  className,
  link,
  children,
}: DashboardCardProps) => {
  const cardContent = (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className="flex-grow">{children}</CardContent>
      {footer && <CardFooter className="border-t pt-4">{footer}</CardFooter>}
    </Card>
  );

  if (link) {
    return (
      <Link to={link} className="block h-full no-underline">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default DashboardCard;
