import { Component, type ReactNode } from 'react';
import { copy } from '../content/copy';

/** Filet de sécurité : jamais d'écran blanc. Les données restent intactes sur le téléphone. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto max-w-md px-4 py-10 space-y-4 text-center">
        <p className="text-5xl" aria-hidden>🐯</p>
        <h1 className="text-2xl font-extrabold">{copy.error.title}</h1>
        <p>{copy.error.body}</p>
        <button
          type="button"
          onClick={() => { location.hash = '#/'; location.reload(); }}
          className="min-h-touch w-full rounded-2xl px-5 py-3 text-lg font-bold bg-c-primary text-c-on-primary"
        >
          {copy.error.cta}
        </button>
      </main>
    );
  }
}
