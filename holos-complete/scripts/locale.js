/* ============================================================
   HOLOS — Locale (v2 · comprehensive)
   Complete world coverage: 50+ countries, major cities, 
   15 languages, proper currency conversion.
   ============================================================ */

const Locale = (() => {
  const KEY = 'holos_locale';

  const COUNTRIES = {
    // South Asia
    PK: { name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', symbol: 'Rs.', rate: 1, cities: ['Lahore','Karachi','Islamabad','Rawalpindi','Multan','Faisalabad','Peshawar','Quetta','Sialkot','Gujranwala','Hyderabad','Sukkur'] },
    IN: { name: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹', rate: 0.30, cities: ['Delhi','Mumbai','Bangalore','Chennai','Kolkata','Hyderabad','Pune','Ahmedabad','Jaipur','Lucknow','Chandigarh','Surat'] },
    BD: { name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT', symbol: '৳', rate: 0.43, cities: ['Dhaka','Chittagong','Khulna','Rajshahi','Sylhet'] },
    LK: { name: 'Sri Lanka', flag: '🇱🇰', currency: 'LKR', symbol: 'Rs.', rate: 1.06, cities: ['Colombo','Kandy','Galle','Jaffna'] },
    NP: { name: 'Nepal', flag: '🇳🇵', currency: 'NPR', symbol: 'Rs.', rate: 0.47, cities: ['Kathmandu','Pokhara','Lalitpur','Biratnagar'] },
    // Middle East
    AE: { name: 'UAE', flag: '🇦🇪', currency: 'AED', symbol: 'AED', rate: 0.013, cities: ['Dubai','Abu Dhabi','Sharjah','Ajman','Al Ain','Ras Al Khaimah'] },
    SA: { name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', symbol: 'SAR', rate: 0.013, cities: ['Riyadh','Jeddah','Mecca','Medina','Dammam','Khobar'] },
    QA: { name: 'Qatar', flag: '🇶🇦', currency: 'QAR', symbol: 'QAR', rate: 0.013, cities: ['Doha','Al Wakrah','Al Khor'] },
    KW: { name: 'Kuwait', flag: '🇰🇼', currency: 'KWD', symbol: 'KD', rate: 0.0011, cities: ['Kuwait City','Hawalli','Salmiya'] },
    BH: { name: 'Bahrain', flag: '🇧🇭', currency: 'BHD', symbol: 'BD', rate: 0.0013, cities: ['Manama','Riffa','Muharraq'] },
    OM: { name: 'Oman', flag: '🇴🇲', currency: 'OMR', symbol: 'OMR', rate: 0.0014, cities: ['Muscat','Salalah','Sohar'] },
    IQ: { name: 'Iraq', flag: '🇮🇶', currency: 'IQD', symbol: 'IQD', rate: 4.7, cities: ['Baghdad','Erbil','Basra','Mosul'] },
    JO: { name: 'Jordan', flag: '🇯🇴', currency: 'JOD', symbol: 'JD', rate: 0.0025, cities: ['Amman','Zarqa','Irbid'] },
    LB: { name: 'Lebanon', flag: '🇱🇧', currency: 'USD', symbol: '$', rate: 0.0036, cities: ['Beirut','Tripoli','Sidon'] },
    // East Asia
    CN: { name: 'China', flag: '🇨🇳', currency: 'CNY', symbol: '¥', rate: 0.026, cities: ['Beijing','Shanghai','Shenzhen','Guangzhou','Chengdu','Hangzhou','Wuhan','Nanjing','Xian','Chongqing'] },
    JP: { name: 'Japan', flag: '🇯🇵', currency: 'JPY', symbol: '¥', rate: 0.55, cities: ['Tokyo','Osaka','Kyoto','Yokohama','Nagoya','Sapporo','Fukuoka','Kobe'] },
    KR: { name: 'South Korea', flag: '🇰🇷', currency: 'KRW', symbol: '₩', rate: 4.9, cities: ['Seoul','Busan','Incheon','Daegu','Daejeon'] },
    // Southeast Asia
    MY: { name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', symbol: 'RM', rate: 0.016, cities: ['Kuala Lumpur','Penang','Johor Bahru','Kota Kinabalu'] },
    ID: { name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', symbol: 'Rp', rate: 57, cities: ['Jakarta','Surabaya','Bandung','Medan','Bali'] },
    TH: { name: 'Thailand', flag: '🇹🇭', currency: 'THB', symbol: '฿', rate: 0.13, cities: ['Bangkok','Chiang Mai','Phuket','Pattaya'] },
    PH: { name: 'Philippines', flag: '🇵🇭', currency: 'PHP', symbol: '₱', rate: 0.20, cities: ['Manila','Cebu','Davao','Quezon City'] },
    SG: { name: 'Singapore', flag: '🇸🇬', currency: 'SGD', symbol: 'S$', rate: 0.0048, cities: ['Singapore'] },
    VN: { name: 'Vietnam', flag: '🇻🇳', currency: 'VND', symbol: '₫', rate: 90, cities: ['Ho Chi Minh','Hanoi','Da Nang','Hai Phong'] },
    // Europe
    GB: { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£', rate: 0.0028, cities: ['London','Manchester','Birmingham','Leeds','Glasgow','Edinburgh','Liverpool','Bristol'] },
    DE: { name: 'Germany', flag: '🇩🇪', currency: 'EUR', symbol: '€', rate: 0.0033, cities: ['Berlin','Munich','Hamburg','Frankfurt','Cologne','Stuttgart','Dusseldorf'] },
    FR: { name: 'France', flag: '🇫🇷', currency: 'EUR', symbol: '€', rate: 0.0033, cities: ['Paris','Lyon','Marseille','Toulouse','Nice','Bordeaux','Lille'] },
    IT: { name: 'Italy', flag: '🇮🇹', currency: 'EUR', symbol: '€', rate: 0.0033, cities: ['Rome','Milan','Naples','Turin','Florence','Venice','Bologna'] },
    ES: { name: 'Spain', flag: '🇪🇸', currency: 'EUR', symbol: '€', rate: 0.0033, cities: ['Madrid','Barcelona','Valencia','Seville','Bilbao','Malaga'] },
    NL: { name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', symbol: '€', rate: 0.0033, cities: ['Amsterdam','Rotterdam','The Hague','Utrecht'] },
    SE: { name: 'Sweden', flag: '🇸🇪', currency: 'SEK', symbol: 'kr', rate: 0.038, cities: ['Stockholm','Gothenburg','Malmo'] },
    NO: { name: 'Norway', flag: '🇳🇴', currency: 'NOK', symbol: 'kr', rate: 0.038, cities: ['Oslo','Bergen','Trondheim'] },
    PL: { name: 'Poland', flag: '🇵🇱', currency: 'PLN', symbol: 'zł', rate: 0.014, cities: ['Warsaw','Krakow','Gdansk','Wroclaw'] },
    TR: { name: 'Turkey', flag: '🇹🇷', currency: 'TRY', symbol: '₺', rate: 0.12, cities: ['Istanbul','Ankara','Izmir','Bursa','Antalya'] },
    RU: { name: 'Russia', flag: '🇷🇺', currency: 'RUB', symbol: '₽', rate: 0.35, cities: ['Moscow','St. Petersburg','Novosibirsk','Yekaterinburg','Kazan'] },
    // North America
    US: { name: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$', rate: 0.0036, cities: ['New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio','San Diego','Dallas','San Francisco'] },
    CA: { name: 'Canada', flag: '🇨🇦', currency: 'CAD', symbol: 'C$', rate: 0.005, cities: ['Toronto','Montreal','Vancouver','Calgary','Ottawa','Edmonton'] },
    MX: { name: 'Mexico', flag: '🇲🇽', currency: 'MXN', symbol: 'MX$', rate: 0.062, cities: ['Mexico City','Guadalajara','Monterrey','Cancun','Puebla'] },
    // Africa
    NG: { name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', symbol: '₦', rate: 5.6, cities: ['Lagos','Abuja','Kano','Ibadan','Port Harcourt'] },
    EG: { name: 'Egypt', flag: '🇪🇬', currency: 'EGP', symbol: 'E£', rate: 0.18, cities: ['Cairo','Alexandria','Giza','Luxor','Aswan'] },
    ZA: { name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', symbol: 'R', rate: 0.065, cities: ['Johannesburg','Cape Town','Durban','Pretoria'] },
    KE: { name: 'Kenya', flag: '🇰🇪', currency: 'KES', symbol: 'KSh', rate: 0.46, cities: ['Nairobi','Mombasa','Kisumu'] },
    MA: { name: 'Morocco', flag: '🇲🇦', currency: 'MAD', symbol: 'MAD', rate: 0.036, cities: ['Casablanca','Rabat','Marrakech','Fez','Tangier'] },
    // South America
    BR: { name: 'Brazil', flag: '🇧🇷', currency: 'BRL', symbol: 'R$', rate: 0.020, cities: ['São Paulo','Rio de Janeiro','Brasília','Salvador','Fortaleza'] },
    AR: { name: 'Argentina', flag: '🇦🇷', currency: 'ARS', symbol: 'ARS', rate: 4.2, cities: ['Buenos Aires','Córdoba','Rosario','Mendoza'] },
    CO: { name: 'Colombia', flag: '🇨🇴', currency: 'COP', symbol: 'COP', rate: 15, cities: ['Bogotá','Medellín','Cali','Barranquilla'] },
    // Oceania
    AU: { name: 'Australia', flag: '🇦🇺', currency: 'AUD', symbol: 'A$', rate: 0.0055, cities: ['Sydney','Melbourne','Brisbane','Perth','Adelaide'] },
    NZ: { name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', symbol: 'NZ$', rate: 0.006, cities: ['Auckland','Wellington','Christchurch'] },
    // Central Asia
    UZ: { name: 'Uzbekistan', flag: '🇺🇿', currency: 'UZS', symbol: 'сўм', rate: 45, cities: ['Tashkent','Samarkand','Bukhara','Namangan'] },
    KZ: { name: 'Kazakhstan', flag: '🇰🇿', currency: 'KZT', symbol: '₸', rate: 1.7, cities: ['Almaty','Astana','Shymkent'] },
    AF: { name: 'Afghanistan', flag: '🇦🇫', currency: 'AFN', symbol: '؋', rate: 0.25, cities: ['Kabul','Herat','Kandahar','Mazar-i-Sharif'] },
  };

  const LANGUAGES = {
    en: { name: 'English', native: 'English', dir: 'ltr' },
    ur: { name: 'Urdu', native: 'اردو', dir: 'rtl' },
    ar: { name: 'Arabic', native: 'العربية', dir: 'rtl' },
    hi: { name: 'Hindi', native: 'हिन्दी', dir: 'ltr' },
    zh: { name: 'Chinese', native: '中文', dir: 'ltr' },
    ja: { name: 'Japanese', native: '日本語', dir: 'ltr' },
    ko: { name: 'Korean', native: '한국어', dir: 'ltr' },
    fr: { name: 'French', native: 'Français', dir: 'ltr' },
    de: { name: 'German', native: 'Deutsch', dir: 'ltr' },
    es: { name: 'Spanish', native: 'Español', dir: 'ltr' },
    pt: { name: 'Portuguese', native: 'Português', dir: 'ltr' },
    ru: { name: 'Russian', native: 'Русский', dir: 'ltr' },
    tr: { name: 'Turkish', native: 'Türkçe', dir: 'ltr' },
    id: { name: 'Indonesian', native: 'Bahasa', dir: 'ltr' },
    bn: { name: 'Bengali', native: 'বাংলা', dir: 'ltr' },
  };

  let current = null;

  function load() { try { const r = localStorage.getItem(KEY); if (r) current = JSON.parse(r); } catch(e){} return current; }
  function save(loc) { current = loc; try { localStorage.setItem(KEY, JSON.stringify(loc)); } catch(e){} log('Locale', `set ${loc.country} / ${loc.language} / ${loc.city || 'all'}`); if (window.I18n) I18n.applyDirection(); }
  function get() { return current || load(); }
  function isSet() { return !!get(); }
  function country() { const l = get(); return l ? COUNTRIES[l.country] : COUNTRIES.PK; }
  function language() { const l = get(); return l ? LANGUAGES[l.language] : LANGUAGES.en; }
  function formatPrice(pkrAmount) {
    const c = country();
    const converted = pkrAmount * c.rate;
    let display;
    if (c.currency === 'PKR') display = Math.round(converted).toLocaleString();
    else if (converted >= 100) display = Math.round(converted).toLocaleString();
    else display = converted.toFixed(2);
    return `${c.symbol} ${display}`;
  }
  function reset() { current = null; try { localStorage.removeItem(KEY); } catch(e){} }
  function getCountryList() { return Object.entries(COUNTRIES).map(([code, c]) => ({ code, ...c })); }

  return { COUNTRIES, LANGUAGES, load, save, get, isSet, country, language, formatPrice, reset, getCountryList };
})();
window.Locale = Locale;
