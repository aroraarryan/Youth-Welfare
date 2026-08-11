import PageHero from '@/components/PageHero';
import ComingSoon from '@/components/ComingSoon';

export const metadata = {
  title: 'Adventure Training Program | Youth Welfare, Uttarakhand',
};

export default function AdventureTrainingPage() {
  return (
    <>
      <PageHero
        hindiTitle="साहसिक प्रशिक्षण कार्यक्रम"
        title="Adventure Training Program — Registration"
        subtitle="Experience the Himalayas · Youth Adventure Training by Uttarakhand Government"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Registration', href: '/#registration-section' },
          { label: 'Adventure Training' },
        ]}
        stats={[
          { value: '13',  label: 'Districts' },
          { value: '10+', label: 'Activities' },
          { value: '2026', label: 'Batch' },
        ]}
      />
      <ComingSoon label="Adventure Training Program" />
    </>
  );
}
