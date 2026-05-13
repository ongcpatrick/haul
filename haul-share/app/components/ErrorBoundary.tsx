'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    if (typeof window !== 'undefined') {
      // Surface to monitoring in production; swallow noisy console in dev.
      window.dispatchEvent(new CustomEvent('haul:error', { detail: { message: error.message } }));
    }
  }

  reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="max-w-md mx-auto my-12 p-6 bg-white border border-[var(--border)] rounded-2xl text-center">
            <h2 className="text-lg font-bold text-[var(--text)]">Something went wrong</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{this.state.error.message}</p>
            <button
              onClick={this.reset}
              className="mt-4 px-4 py-2 rounded-full bg-[var(--primary)] text-white text-sm font-semibold"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
