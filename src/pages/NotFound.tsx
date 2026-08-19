import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="text-sm text-muted-foreground">Redirecting to Click2Ration Portal...</p>
        <Link
          to="/login"
          className="inline-block px-4 py-2 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go to Login Page
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
