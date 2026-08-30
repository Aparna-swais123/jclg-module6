import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'SWAIS Demo Junior College | Progress Monitoring',
  description: 'Progress monitoring and AI alerts dashboard',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
