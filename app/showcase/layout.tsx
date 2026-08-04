import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'SHOWCASE — G DEV. F.C.' };

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
