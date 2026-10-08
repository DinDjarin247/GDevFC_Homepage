'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Frame from '@/components/Frame';
import ScreenHeader from '@/components/ScreenHeader';
import IntroScreen from '@/components/play/IntroScreen';
import RotateGate from '@/components/play/RotateGate';
import CharacterSelect from '@/components/run/CharacterSelect';
import RunGame from '@/components/run/RunGame';
import ScoreGuide from '@/components/run/ScoreGuide';
import { characterById, type CharacterId } from '@/lib/run/characters';
import play from '@/data/play.json';

type Step = 'intro' | 'select' | 'run';

/** 달려라 우왕이 V2 — 소개 → 캐릭터 고르기 → 달리기 */
export default function PlayPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('intro');
  const [who, setWho] = useState<CharacterId>('woowang');

  return (
    <Frame
      badge={play.badge}
      header={<ScreenHeader title={play.heading} />}
      fullBleedBody
      immersiveMobile={step === 'run'}
    >
      <RotateGate>
        {step === 'intro' && <IntroScreen onStart={() => setStep('select')} extra={<ScoreGuide />} />}
        {step === 'select' && (
          <CharacterSelect
            onPick={(id) => {
              setWho(id);
              setStep('run');
            }}
          />
        )}
        {step === 'run' && (
          <RunGame
            key={who}
            character={characterById(who)}
            onExit={() => router.push('/select')}
            onChangeCharacter={() => setStep('select')}
          />
        )}
      </RotateGate>
    </Frame>
  );
}
