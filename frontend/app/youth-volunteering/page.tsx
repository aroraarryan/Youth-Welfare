import PageHero from '@/components/PageHero';
import ComingSoon from '@/components/ComingSoon';

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
      <ComingSoon label="Youth Volunteering" />
    </>
  );
}
