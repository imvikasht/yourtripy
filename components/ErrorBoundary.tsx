import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        // Check if the error is a FirestoreErrorInfo JSON string
        const errInfo = JSON.parse(this.state.error?.message || '');
        if (errInfo.error && errInfo.operationType) {
          errorMessage = `Firestore ${errInfo.operationType} error: ${errInfo.error}`;
        }
      } catch (e) {
        // Not a JSON string, use the default message or the error message
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-deep p-4">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center border border-brand-primary/10">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-brand-heading mb-4">Oops!</h2>
            <p className="text-brand-slate font-medium mb-8">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-brand-primary text-white font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-[#FF9A3C] transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
