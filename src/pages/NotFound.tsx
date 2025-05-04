import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';

const NotFound = () => {
  return (
    <MainLayout>
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4 text-center">
        <h1 className="mb-4 text-7xl font-bold text-primary">404</h1>
        <h2 className="mb-6 text-2xl font-medium">Page Not Found</h2>
        <p className="mb-8 max-w-md text-lg text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button size="lg" asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </MainLayout>
  );
};

export default NotFound;
