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
  | 'nav_news'
  | 'nav_contact'
  | 'join_community'
  | 'a11y_skip_main'
  | 'a11y_font_decrease'
  | 'a11y_font_normal'
  | 'a11y_font_increase'
  | 'a11y_high_contrast'
  | 'a11y_toolbar_label';

const translations: Record<TranslationKey, Record<Lang, string>> = {
  gov_name:       { EN: 'Government of Uttarakhand',                   HI: 'उत्तराखंड सरकार' },
  dept_name:      { EN: 'Department of Youth Welfare and PRD',         HI: 'युवा कल्याण एवं पी.आर.डी. विभाग' },
  dept_sub:       { EN: 'Uttarakhand Government',                      HI: 'उत्तराखंड सरकार' },
  nav_home:       { EN: 'Home',                                         HI: 'होम' },
  nav_about:      { EN: 'About Us',                                     HI: 'हमारे बारे में' },
  nav_gallery:    { EN: 'Gallery',                                      HI: 'गैलरी' },
  nav_rti:        { EN: 'RTI',                                          HI: 'आरटीआई' },
  nav_downloads:  { EN: 'Downloads',                                    HI: 'डाउनलोड' },
  nav_news:       { EN: 'News',                                         HI: 'समाचार' },
  nav_contact:    { EN: 'Contact Us',                                   HI: 'संपर्क करें' },
  join_community: { EN: 'Join the Community',                           HI: 'समुदाय से जुड़ें' },
  a11y_skip_main: { EN: 'Skip to main content',                         HI: 'मुख्य सामग्री पर जाएं' },
  a11y_font_decrease: { EN: 'Decrease text size',                       HI: 'टेक्स्ट आकार घटाएं' },
  a11y_font_normal: { EN: 'Normal text size',                           HI: 'सामान्य टेक्स्ट आकार' },
  a11y_font_increase: { EN: 'Increase text size',                       HI: 'टेक्स्ट आकार बढ़ाएं' },
  a11y_high_contrast: { EN: 'High Contrast',                            HI: 'उच्च कंट्रास्ट' },
  a11y_toolbar_label: { EN: 'Accessibility Options',                   HI: 'सुलभता विकल्प' },
};

export function translate(key: TranslationKey, lang: Lang): string {
  return translations[key][lang];
}
