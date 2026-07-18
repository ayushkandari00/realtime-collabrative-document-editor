import { useNavigate } from 'react-router-dom';
import { MessageSquare, Home } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 dark:bg-gray-950 px-4">
      <div className="text-center">
        <p className="text-8xl font-black text-indigo-600 dark:text-indigo-400 leading-none">404</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">Page not found</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={() => navigate(-1)} variant="secondary" size="md">
          Go Back
        </Button>
        <Button onClick={() => navigate('/')} size="md">
          <Home className="w-4 h-4" />
          Home
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
