'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Frame from '@/components/Frame';
import ScreenHeader from '@/components/ScreenHeader';
import IntroScreen from '@/components/play/IntroScreen';
import Leaderboard from '@/components/play/Leaderboard';
import JumpGame from '@/components/jump/JumpGame';
import jump from '@/data/jump.json';

const formatMeters = (m: number) => `${m}m`;

/**
 * 뛰어라 우왕이 — 점프킹식 탑 오르기.
 * 달려라 우왕이와 달리 세로로 오르는 게임이라 휴대폰도 세로로 그대로 플레이한다
 * (가로 회전 안내 없음).
 */
export default function JumpPage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);

  return (
    <Frame
      badge={jump.badge}
      header={<ScreenHeader title={jump.heading} />}
      fullBleedBody
      immersiveMobile={started}
    >
      {started ? (
        <JumpGame onExit={() => router.push('/select')} />
      ) : (
        <IntroScreen
          intro={jump.intro}
          onStart={() => setStarted(true)}
          ranking={<Leaderboard limit={5} table="jump_scores" formatScore={formatMeters} />}
        />
      )}
    </Frame>
  );
}
