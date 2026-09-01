import { Suspense } from 'react';
import Frame from '@/components/Frame';
import ScreenHeader from '@/components/ScreenHeader';
import AuthGate from '@/components/AuthGate';
import Gallery from '@/components/Gallery';

export const metadata = { title: 'GALLERY — G DEV. F.C.' };

export default function GalleryPage() {
  return (
    <Frame badge="gallery" header={<ScreenHeader title="갤러리" tone="lime" />}>
      <Suspense fallback={null}>
        <AuthGate>
          <Gallery />
        </AuthGate>
      </Suspense>
    </Frame>
  );
}
