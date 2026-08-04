import Frame from '@/components/Frame';
import ScreenHeader from '@/components/ScreenHeader';
import CharacterCreator from '@/components/CharacterCreator';
import join from '@/data/join.json';

export const metadata = { title: 'JOIN THE PARTY — G DEV. F.C.' };

export default function JoinPage() {
  return (
    <Frame
      badge={join.badge}
      header={<ScreenHeader title={join.heading} tone="magenta" />}
    >
      <CharacterCreator />
    </Frame>
  );
}
