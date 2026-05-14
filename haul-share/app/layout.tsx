import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import Nav from './components/Nav';

export const metadata: Metadata = {
  title: 'Haul | Shopping Comparison',
  description: 'Compare products side by side with Haul.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#7a9e76',
          colorText: '#3d3529',
          colorBackground: '#fafaf7',
          fontFamily: 'Inter, system-ui, sans-serif',
          borderRadius: '12px',
        },
      }}
    >
      <html lang="en">
        <body>
          <Nav />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
