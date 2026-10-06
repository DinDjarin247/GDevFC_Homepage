import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'JUMP — G DEV. F.C.' };

export default function JumpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
