'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="mx-auto max-w-lg rounded-xl border border-gray-800/80 bg-black/50 p-8 text-center shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-red-500/10 p-3">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <h2 className="mb-2 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-2xl font-bold text-transparent">
          Something went wrong
        </h2>

        <p className="mb-6 text-gray-400">
          We encountered an unexpected error. This has been reported to our
          team.
        </p>

        {isDevelopment && (
          <div className="mb-6 rounded-lg bg-gray-900/50 p-4 text-left">
            <p className="mb-2 text-sm font-semibold text-red-400">
              Development Error:
            </p>
            <pre className="whitespace-pre-wrap break-words text-xs text-gray-300">
              {error.message}
            </pre>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={resetError}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 px-6 py-2 text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
          >
            <RefreshCw className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
            Try Again
          </Button>

          <Button
            className="group relative overflow-hidden rounded-full border border-gray-800 bg-black px-6 py-2 text-white transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]"
            asChild
          >
            <Link href="/" className="flex items-center">
              <Home className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
              Go Home
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Report to error tracking service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  override render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary;
