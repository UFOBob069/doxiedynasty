import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doxie Dynasty Order Confirmation',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuccessLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
