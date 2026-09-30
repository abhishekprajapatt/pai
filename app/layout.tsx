import './globals.css';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter, Syne, Geist } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { AppContextProvider } from '@/context/AppContext';
import { AIModelsProvider } from '@/context/AIModelsContext';
import { ChatsProvider } from '@/context/ChatsContext';
import { ProjectsProvider } from '@/context/ProjectsContext';
import { SkillsProvider } from '@/context/SkillsContext';
import { ConnectorsProvider } from '@/context/ConnectorsContext';
import { PluginProvider } from '@/context/PluginContext';
import CookieConsent from '@/components/auth/Cookie';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

// Optimized font loading with display: 'swap' for faster rendering
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Prajapatt AI',
  description: 'Prajapatt AI - I Innovate Stuff',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <body className={`${inter.variable} ${syne.variable} antialiased`}>
        <AuthProvider>
          <AIModelsProvider>
            <ChatsProvider>
              <AppContextProvider>
                <ProjectsProvider>
                  <SkillsProvider>
                    <ConnectorsProvider>
                      <PluginProvider>
                        <Toaster
                          toastOptions={{
                            success: {
                              style: { background: 'black', color: 'white' },
                            },
                            error: {
                              style: { background: 'black', color: 'white' },
                            },
                          }}
                        />
                        <Suspense
                          fallback={
                            <div className="w-screen h-screen flex items-center justify-center bg-black">
                              <Spinner className="w-6 h-6" />
                            </div>
                          }
                        >
                          {children}
                        </Suspense>
                        <CookieConsent />
                      </PluginProvider>
                    </ConnectorsProvider>
                  </SkillsProvider>
                </ProjectsProvider>
              </AppContextProvider>
            </ChatsProvider>
          </AIModelsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
