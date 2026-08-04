import Frame from '@/components/Frame';
import SysBar from '@/components/SysBar';
import ModeCarousel from '@/components/ModeCarousel';
import modesData from '@/data/modes.json';

export const metadata = { title: 'SELECT MODE — G DEV. F.C.' };

export default function SelectPage() {
  return (
    <Frame badge="1a" header={<SysBar dot glitch />}>
      <ModeCarousel
        heading={modesData.heading}
        hint={modesData.hint}
        modes={modesData.modes}
      />
    </Frame>
  );
}
