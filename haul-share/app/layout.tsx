import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import Nav from './components/Nav';

export const metadata: Metadata = {
  title: 'Haul',
  description: 'Style, saved.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#7a9e76',
          colorText: '#181512',
          colorBackground: '#f9f7f3',
          fontFamily: 'DM Sans, system-ui, sans-serif',
          borderRadius: '10px',
        },
      }}
    >
      <html lang="en">
        <body>
          <Nav />
          <main className="min-h-[calc(100vh-56px)]">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
