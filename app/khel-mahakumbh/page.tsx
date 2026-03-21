import PageHero from '@/components/PageHero';
import RegistrationForm from '@/components/RegistrationForm';

const sports = [
  'Athletics', 'Basketball', 'Boxing', 'Cricket', 'Cycling',
  'Football', 'Gymnastics', 'Judo', 'Kabaddi', 'Kho-Kho',
  'Swimming', 'Table Tennis', 'Volleyball', 'Weight Lifting', 'Wrestling',
];

export const metadata = {
  title: 'Khel Mahakumbh 2026 Registration | Youth Welfare, Uttarakhand',
};

export default function KhelMahakumbhPage() {
  return (
    <>
      <PageHero
        hindiTitle="खेल महाकुम्भ 2026"
        title="Khel Mahakumbh 2026 — Official Participant Registration"
        subtitle="Uttarakhand's Premier Multi-Sport Competition · Official Participant Registration"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Registration', href: '/#registration-section' },
          { label: 'Khel Mahakumbh 2026' },
        ]}
        stats={[
          { value: '13',   label: 'Districts' },
          { value: '40+',  label: 'Sports' },
          { value: '2026', label: 'Edition' },
        ]}
      />
      <RegistrationForm type="khel-mahakumbh" sportOptions={sports} />
    </>
  );
}
