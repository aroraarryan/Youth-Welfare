import PageHero from '@/components/PageHero';
import KhelMahakumbhRegistrationForm from '@/components/KhelMahakumbhRegistrationForm';

export const metadata = {
  title: 'CM Championship Trophy 2026 Registration | Youth Welfare, Uttarakhand',
};

export default function KhelMahakumbhPage() {
  return (
    <>
      <PageHero
        hindiTitle="सीएम चैंपियनशिप ट्रॉफी 2026"
        title="CM Championship Trophy 2026 — Official Participant Registration"
        subtitle="Uttarakhand's Premier Multi-Sport Competition · Official Participant Registration"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Registration', href: '/#registration-section' },
          { label: 'CM Championship Trophy 2026' },
        ]}
        stats={[
          { value: '13',   label: 'Districts' },
          { value: '20+',  label: 'Sports' },
          { value: '2026', label: 'Edition' },
        ]}
      />
      <KhelMahakumbhRegistrationForm />
    </>
  );
}
