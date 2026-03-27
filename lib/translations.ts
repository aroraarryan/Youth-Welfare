export type Lang = 'EN' | 'HI';

export type TranslationKey =
  | 'gov_name'
  | 'dept_name'
  | 'dept_sub'
  | 'nav_home'
  | 'nav_about'
  | 'nav_gallery'
  | 'nav_rti'
  | 'nav_downloads'
  | 'nav_contact'
  | 'join_community';

const translations: Record<TranslationKey, Record<Lang, string>> = {
  gov_name:       { EN: 'Government of Uttarakhand',                   HI: 'उत्तराखंड सरकार' },
  dept_name:      { EN: 'Department of Youth Welfare and PRD',         HI: 'युवा कल्याण एवं पी.आर.डी. विभाग' },
  dept_sub:       { EN: 'Uttarakhand Government',                      HI: 'उत्तराखंड सरकार' },
  nav_home:       { EN: 'Home',                                         HI: 'होम' },
  nav_about:      { EN: 'About Us',                                     HI: 'हमारे बारे में' },
  nav_gallery:    { EN: 'Gallery',                                      HI: 'गैलरी' },
  nav_rti:        { EN: 'RTI',                                          HI: 'आरटीआई' },
  nav_downloads:  { EN: 'Downloads',                                    HI: 'डाउनलोड' },
  nav_contact:    { EN: 'Contact Us',                                   HI: 'संपर्क करें' },
  join_community: { EN: 'Join the Community',                           HI: 'समुदाय से जुड़ें' },
};

export function translate(key: TranslationKey, lang: Lang): string {
  return translations[key][lang];
}
