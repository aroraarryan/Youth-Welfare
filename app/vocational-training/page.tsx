import PageHero from '@/components/PageHero';
import RegistrationForm from '@/components/RegistrationForm';

const courses = [
  'Computer Hardware & Networking', 'Beauty & Wellness', 'Electrical Installation',
  'Plumbing', 'Construction Technology', 'Apparel & Garments',
  'Food Processing', 'Hospitality', 'Healthcare Assistance', 'Automotive Service',
];

export const metadata = {
  title: 'Vocational Training Enrollment | Youth Welfare, Uttarakhand',
};

export default function VocationalTrainingPage() {
  return (
    <>
      <PageHero
        hindiTitle="व्यावसायिक प्रशिक्षण"
        title="Vocational Training — Enrollment"
        subtitle="PMKVY Skill Development Programs · Build Your Career with Government-Certified Courses"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Registration', href: '/#registration-section' },
          { label: 'Vocational Training' },
        ]}
        stats={[
          { value: '13',   label: 'Districts' },
          { value: '50+',  label: 'Courses' },
          { value: '2026', label: 'Batch' },
        ]}
      />
      <RegistrationForm type="vocational-training" sportOptions={courses} />
    </>
  );
}
