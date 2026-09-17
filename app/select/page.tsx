import Frame from '@/components/Frame';
import SysBar from '@/components/SysBar';
import ModePlaza from '@/components/ModePlaza';
import modesData from '@/data/modes.json';
import site from '@/data/site.json';

export const metadata = { title: 'SELECT MODE — G DEV. F.C.' };

export default function SelectPage() {
  return (
    <Frame badge={site.badge} header={<SysBar dot glitch />}>
      <ModePlaza
        heading={modesData.heading}
        hint={modesData.hint}
        modes={modesData.modes}
        comingSoonLabel={modesData.comingSoonLabel}
      />
    </Frame>
  );
}
