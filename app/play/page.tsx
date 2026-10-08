'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Frame from '@/components/Frame';
import ScreenHeader from '@/components/ScreenHeader';
import IntroScreen from '@/components/play/IntroScreen';
import RunGame from '@/components/run/RunGame';
import RotateGate from '@/components/play/RotateGate';
import play from '@/data/play.json';

export default function PlayPage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);

  return (
    <Frame
      badge={play.badge}
      header={<ScreenHeader title={play.heading} />}
      fullBleedBody
      immersiveMobile={started}
    >
      <RotateGate>
        {started ? (
          <RunGame onExit={() => router.push('/select')} />
        ) : (
          <IntroScreen onStart={() => setStarted(true)} />
        )}
      </RotateGate>
    </Frame>
  );
}
