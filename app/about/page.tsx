import Image from 'next/image';
import PageHero from '@/components/PageHero';

const keyOfficials = [
  {
    name: 'SHRI PUSHKAR SINGH DHAMI',
    role: 'Chief Minister, Uttarakhand',
    desc: "Hon'ble Chief Minister of Uttarakhand, overseeing the development and welfare of youth across the state under the Department of Youth Welfare and PRD.",
    photo: '/images/cm.jpg',
    phone: '+91-1234567890',
    email: 'cm.uk@gov.in',
  },
  {
    name: 'SMT. REKHA ARYA',
    role: 'Sports Minister, Uttarakhand',
    desc: "Hon'ble Sports Minister of Uttarakhand, responsible for promoting sports culture, youth empowerment and physical education programmes across Uttarakhand.",
    photo: '/images/sm.jpg',
    phone: '+91-1234567891',
    email: 'sportsminister.uk@gov.in',
  },
  {
    name: 'Shri Amit Kumar Sinha (IPS)',
    role: 'Special Principal Secretary — Youth Welfare & PRD',
    desc: 'Heading the administrative and policy functions of the Department of Youth Welfare and PRD, coordinating between government bodies and youth welfare programmes.',
    photo: '/images/amitSinha.jpeg',
    phone: '+91-1234567892',
    email: 'sps.ywprd.uk@gov.in',
  },
  {
    name: 'Dr. Ashish Chauhan (IAS)',
    role: 'Director — Department of Youth Welfare and PRD',
    desc: 'Responsible for the day-to-day operations, implementation of schemes, and coordination of youth welfare activities across all districts of Uttarakhand.',
    photo: '/images/ashishChauhan.jpeg',
    phone: '+91-9634312465',
    email: 'ywprd.uk@gmail.com',
  },
];

const directorateOfficials = [
  { name: 'Shri. Bhaskarananda Pandey', role: 'Finance Controller', email: 'ykprd.uk@gmail.com' },
  { name: 'Shri. Rakesh Chandra Dimri', role: 'Additional Director',  email: 'rakeshdimri.ywprd@uk.gov.in' },
  { name: 'Shri. Ajay Aggarwal',        role: 'Joint Director',       email: 'ajayagarwal.ywprd@uk.gov.in' },
  { name: 'Shri Shakti Singh',          role: 'Deputy Director',      email: 'shaktisingh.ywprd@uk.gov.in' },
  { name: 'Shri Sravendra Kumar Jayaraj', role: 'Deputy Director',    email: 'skjairaj.ywprd@uk.gov.in' },
  { name: 'Smt. Deepti Joshi',          role: 'Deputy Director',      email: 'deepti.joshi.ywprd@uk.gov.in' },
  { name: 'Shri Neeraj Gupta',          role: 'Assistant Director',   email: 'neerajgupta.ywprd@uk.gov.in' },
  { name: 'Smt. Himani Bhatt',          role: 'Assistant Director',   email: 'himanibhatt.ywprd@uk.gov.in' },
  { name: 'Shri Ajay Kumar',            role: 'Assistant Director',   email: 'ajaykumar.ywprd@uk.gov.in' },
];

export const metadata = {
  title: 'About Us | Youth Welfare & PRD, Uttarakhand',
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        hindiTitle="हमारे बारे में"
        title="About Us — Department of Youth Welfare & PRD"
        subtitle="Uttarakhand's Premier Youth Development Department · Serving Youth Across All 13 Districts"
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'About Us' }]}
        stats={[
          { value: '13', label: 'Districts' },
          { value: '118+', label: 'Schemes' },
          { value: '12.5L+', label: 'Youth Registered' },
        ]}
      />

      <main className="max-w-[1500px] mx-auto px-10 py-[50px] pb-15">
        {/* Key Officials */}
        <div className="mb-10 pb-4 border-b-2 border-[#e2e8f0]">
          <h2 className="text-[28px] font-bold text-[#1e3a8a] mt-0 mb-1.5">Key Officials</h2>
          <p className="text-[15px] text-[#6b7280] m-0">Department of Youth Welfare and PRD, Uttarakhand</p>
        </div>

        <div className="grid grid-cols-2 gap-7">
          {keyOfficials.map((official) => (
            <div
              key={official.name}
              className="flex flex-row items-stretch border border-[#e2e8f0] rounded-xl overflow-hidden bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.14)] hover:-translate-y-1"
            >
              <div className="flex-none w-[150px] min-h-[160px] overflow-hidden bg-[#eef2f7] flex items-center justify-center">
                <Image
                  src={official.photo}
                  alt={official.name}
                  width={150}
                  height={160}
                  className="w-full h-full object-contain object-center"
                />
              </div>
              <div className="flex-1 p-4 flex flex-col gap-1.5 justify-start">
                <h3 className="text-base font-bold text-[#1a202c] m-0 tracking-wide uppercase">
                  {official.name}
                </h3>
                <p className="text-[13px] italic text-[#4a5568] m-0 font-medium">{official.role}</p>
                <p className="text-xs text-[#6b7280] mt-0.5 leading-relaxed">{official.desc}</p>
                <div className="flex flex-col gap-1.5 mt-2.5 pt-2.5 border-t border-[#e2e8f0]">
                  <span className="flex items-start gap-1.5 text-xs text-[#4a5568]">
                    <i className="fas fa-phone-alt text-[#1e3a8a] w-3.5 text-center mt-0.5" />
                    <a href={`tel:${official.phone}`} className="text-[#4a5568] no-underline hover:text-[#1e3a8a] hover:underline">
                      {official.phone}
                    </a>
                  </span>
                  <span className="flex items-start gap-1.5 text-xs text-[#4a5568]">
                    <i className="fas fa-envelope text-[#1e3a8a] w-3.5 text-center mt-0.5" />
                    <a href={`mailto:${official.email}`} className="text-[#4a5568] no-underline hover:text-[#1e3a8a] hover:underline break-all">
                      {official.email}
                    </a>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Directorate Officials */}
        <div className="mt-[52px] pt-9 border-t-2 border-[#e2e8f0]">
          <div className="mb-7 pb-4 border-b-2 border-[#e2e8f0]">
            <h2 className="text-[28px] font-bold text-[#1e3a8a] mt-0 mb-1.5">Directorate Officials</h2>
            <p className="text-[15px] text-[#6b7280] m-0">
              Department of Youth Welfare and PRD — Directorate, Dehradun
            </p>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {directorateOfficials.map((off) => (
              <div
                key={off.name}
                className="flex flex-row items-stretch border border-[#e2e8f0] rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.13)] hover:-translate-y-1"
              >
                <div
                  className="flex-none w-[72px] flex flex-col items-center justify-center rounded-l-xl text-white/30 text-3xl"
                  style={{ background: 'linear-gradient(135deg,#0d7e6b 0%,#15a589 100%)' }}
                >
                  <i className="fas fa-user-tie" />
                </div>
                <div className="flex-1 p-3 flex flex-col gap-1">
                  <h4 className="text-[12.5px] font-bold text-[#1a202c] m-0 leading-snug break-words">
                    {off.name}
                  </h4>
                  <p className="text-[11px] font-semibold text-[#1e3a8a] m-0 italic break-words">{off.role}</p>
                  <p className="text-[11px] text-[#6b7280] mt-0.5 flex items-center gap-1">
                    <i className="fas fa-map-marker-alt text-[#9ca3af] text-[10px]" /> Directorate
                  </p>
                  <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-[#e2e8f0]">
                    <span className="flex items-start gap-1.5 text-xs text-[#4a5568]">
                      <i className="fas fa-envelope text-[#1e3a8a] text-[10px] w-3.5 mt-0.5" />
                      <a href={`mailto:${off.email}`} className="text-[#4a5568] no-underline hover:text-[#1e3a8a] text-[11px] break-all">
                        {off.email}
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
