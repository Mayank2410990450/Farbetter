import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console and potentially to a logging service
    console.error('Error caught by boundary:', error, errorInfo);

    // Only log errors that aren't known safe errors
    if (error.message && !error.message.includes('Cannot find module')) {
      this.setState((prevState) => ({
        error,
        errorInfo,
        errorCount: prevState.errorCount + 1,
      }));

      // Optional: Send error to monitoring service (Sentry, LogRocket, etc.)
      // this.reportError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // Optionally reload the page
    // window.location.reload();
  };

  reportError = (error, errorInfo) => {
    // This is where you would send errors to a monitoring service like Sentry
    // Example:
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { react: errorInfo } });
    // }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              {/* Error Icon */}
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-red-100 p-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-gray-600 mb-6">
                We're sorry for the inconvenience. A technical error occurred while processing your request. Our team has been notified.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-gray-50 rounded-md text-left border border-gray-200">
                  <p className="text-xs font-mono text-gray-700 break-words">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2 text-xs text-gray-600">
                      <summary className="cursor-pointer font-semibold mb-1">
                        Stack Trace
                      </summary>
                      <pre className="text-xs overflow-auto max-h-40 text-gray-700">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Error Count Warning */}
              {this.state.errorCount > 2 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800">
                    Multiple errors detected. Try refreshing the page or clearing your browser cache.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={() => (window.location.href = '/')}
                  variant="outline"
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>

              {/* Support Text */}
              <p className="text-xs text-gray-500 mt-6">
                If this problem persists, please contact us at Farbetterstore@gmail.com
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
