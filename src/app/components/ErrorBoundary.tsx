import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f8f9fa' }}>
          <div className="text-center p-5">
            <div className="mb-4">
              <AlertCircle size={64} className="text-danger" />
            </div>
            <h2 className="mb-3">Oops! Something went wrong</h2>
            <p className="text-muted mb-4">
              We're sorry for the inconvenience. The application encountered an unexpected error.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="alert alert-danger text-start mb-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <strong>Error Details:</strong>
                <pre className="mt-2 mb-0 small">{this.state.error.toString()}</pre>
              </div>
            )}
            <div className="d-flex gap-3 justify-content-center">
              <button 
                className="btn btn-primary"
                onClick={this.handleReload}
              >
                Reload Page
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => window.location.href = '/'}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
