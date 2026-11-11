import React from 'react';
import { RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white border border-[#E8E6E1] rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[#1B1D22] mb-2 font-display">Something went wrong</h2>
            <p className="text-xs text-[#6A6F78] mb-6">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 bg-[#8A4B25] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#6e3b1c] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
