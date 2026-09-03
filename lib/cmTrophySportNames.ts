/**
 * Hindi translations for Sport names, keyed by the exact English name
 * stored in the database (Sport model has no hindiName field — this is
 * a frontend-only lookup so the CM Trophy sport dropdown can show
 * bilingual "English / Hindi" options without a backend migration).
 * A sport not present here just renders English-only.
 */
export const CM_TROPHY_SPORT_NAME_HI: Record<string, string> = {
  Archery: 'तीरंदाजी',
  Athletics: 'एथलेटिक्स',
  Badminton: 'बैडमिंटन',
  Baseball: 'बेसबॉल',
  Basketball: 'बास्केटबॉल',
  Boxing: 'मुक्केबाजी',
  Chess: 'शतरंज',
  Cricket: 'क्रिकेट',
  Cycling: 'साइकिलिंग',
  Fencing: 'तलवारबाजी',
  Football: 'फुटबॉल',
  'Goli Block': 'गोली ब्लॉक',
  Gymnastics: 'जिमनास्टिक',
  Handball: 'हैंडबॉल',
  Hockey: 'हॉकी',
  Judo: 'जूडो',
  Kabaddi: 'कबड्डी',
  Karate: 'कराटे',
  'Kho-Kho': 'खो-खो',
  'Lawn Tennis': 'लॉन टेनिस',
  Mallakhamb: 'मल्लखंब',
  'Murga Jhapat': 'मुर्गा झपट',
  'Pencak Silat': 'पेंचक सिलाट',
  Pitthu: 'पिट्ठू',
  Powerlifting: 'पावरलिफ्टिंग',
  Rowing: 'रोइंग',
  Shooting: 'निशानेबाजी',
  Swimming: 'तैराकी',
  'Table Tennis': 'टेबल टेनिस',
  Taekwondo: 'ताइक्वांडो',
  Tennis: 'टेनिस',
  'Tug Of War': 'रस्साकशी',
  Volleyball: 'वॉलीबॉल',
  Weightlifting: 'भारोत्तोलन',
  Wrestling: 'कुश्ती',
  Yogasan: 'योगासन',
};

export function sportDisplayName(name: string): string {
  const hi = CM_TROPHY_SPORT_NAME_HI[name];
  return hi ? `${name} / ${hi}` : name;
}
