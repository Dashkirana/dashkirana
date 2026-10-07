import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'DashKirana — Your Local Kirana, Online.', description: 'Fast local grocery ordering for DashKirana.', manifest: '/manifest.json', themeColor: '#047857' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
