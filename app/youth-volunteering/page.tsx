import PageHero from '@/components/PageHero';
import RegistrationForm from '@/components/RegistrationForm';

const preferences = [
  'Environmental Protection', 'Disaster Relief', 'Community Health',
  'Education Support', 'Rural Development', 'Women Empowerment',
  'Blood Donation Camps', 'Tree Plantation', 'Digital Literacy', 'Sports Coaching',
];

export const metadata = {
  title: 'Youth Volunteering Registration | Youth Welfare, Uttarakhand',
};

export default function YouthVolunteeringPage() {
  return (
    <>
      <PageHero
        hindiTitle="युवा स्वयंसेवा"
        title="Youth Volunteering — Registration"
        subtitle="Join the NYKS Volunteer Program · Serve your Community across Uttarakhand"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Registration', href: '/#registration-section' },
          { label: 'Youth Volunteering' },
        ]}
        stats={[
          { value: '13',    label: 'Districts' },
          { value: '5000+', label: 'Volunteers' },
          { value: '2026',  label: 'Edition' },
        ]}
      />
      <RegistrationForm type="youth-volunteering" sportOptions={preferences} />
    </>
  );
}
