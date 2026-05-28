import React from 'react';

export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.group('Route Error Boundary');
    console.error('Route error:', error);
    console.error('Component stack:', errorInfo?.componentStack);
    console.error('Route props:', this.props);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{ padding: '2rem' }}>
          <h2>Something went wrong</h2>
          <p>The page could not be rendered safely.</p>
        </div>
      );
    }

    return this.props.children;
  }
}