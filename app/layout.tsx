import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'FTMO Advisory Platform',
  description: 'FTMO-constrained trading advice dashboard with risk-gated signals.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
