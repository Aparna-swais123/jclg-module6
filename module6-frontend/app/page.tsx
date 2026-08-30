'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
        <span className="text-xs font-semibold text-ink-500">Loading Dashboard...</span>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return <App />;
}
