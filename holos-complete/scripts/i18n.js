/* ============================================================
   HOLOS — i18n (Internationalization)
   A simple key → translation map. Use t('key') in templates.
   Falls back to English if a language doesn't have the key.
   ============================================================ */

const I18n = (() => {
  // Translation dictionary. Add more keys as we translate UI.
  const STRINGS = {
    // Onboarding
    'welcome.title': { uz: 'Dunyoni AR’da xarid qiling',
      en: 'Shop the world in AR',
      ur: 'دنیا کو AR میں خریدیں',
      ar: 'تسوق العالم في الواقع المعزز',
      hi: 'AR में दुनिया खरीदें',
      zh: '在AR中购物世界',
      ja: 'ARで世界を買い物',
      fr: 'Achetez le monde en RA',
      de: 'Kaufen Sie die Welt in AR ein',
      es: 'Compra el mundo en RA',
      pt: 'Compre o mundo em RA',
      ru: 'Покупайте мир в AR',
      tr: 'Dünyayı AR\'da alışveriş yapın',
      bn: 'AR এ বিশ্ব কিনুন',
      ko: 'AR에서 세계 쇼핑',
      id: 'Belanja dunia di AR',
    },
    'welcome.subtitle': { uz: 'Sizga mos doʻkonlar, narxlar va tilni koʻrsatishimiz uchun qayerdaligingizni ayting.',
      en: 'Tell us where you are so we can show you the right shops, prices, and language.',
      ur: 'ہمیں بتائیں کہ آپ کہاں ہیں تاکہ ہم آپ کو صحیح دکانیں، قیمتیں، اور زبان دکھا سکیں۔',
      ar: 'أخبرنا أين أنت حتى نتمكن من إظهار المتاجر والأسعار واللغة المناسبة.',
      hi: 'हमें बताएं कि आप कहाँ हैं ताकि हम आपको सही दुकानें, कीमतें और भाषा दिखा सकें।',
      zh: '告诉我们您在哪里,以便我们为您显示合适的商店、价格和语言。',
    },
    'welcome.country': { uz: 'Davlat', en: 'Country', ur: 'ملک', ar: 'الدولة', hi: 'देश', zh: '国家', ja: '国', fr: 'Pays', de: 'Land', es: 'País', pt: 'País', ru: 'Страна', tr: 'Ülke', bn: 'দেশ', ko: '국가', id: 'Negara' },
    'welcome.city': { uz: 'Shahar / hudud', en: 'City / region', ur: 'شہر / علاقہ', ar: 'المدينة / المنطقة', hi: 'शहर / क्षेत्र', zh: '城市/地区', ja: '都市/地域', fr: 'Ville / région', de: 'Stadt / Region', es: 'Ciudad / región', pt: 'Cidade / região', ru: 'Город / регион', tr: 'Şehir / bölge', bn: 'শহর/অঞ্চল', ko: '도시/지역', id: 'Kota / wilayah' },
    'welcome.language': { uz: 'Til', en: 'Language', ur: 'زبان', ar: 'اللغة', hi: 'भाषा', zh: '语言', ja: '言語', fr: 'Langue', de: 'Sprache', es: 'Idioma', pt: 'Idioma', ru: 'Язык', tr: 'Dil', bn: 'ভাষা', ko: '언어', id: 'Bahasa' },
    'welcome.start': { uz: 'Xaridni boshlash', en: 'Start shopping', ur: 'خریداری شروع کریں', ar: 'ابدأ التسوق', hi: 'खरीदारी शुरू करें', zh: '开始购物', ja: 'ショッピングを開始', fr: 'Commencer à magasiner', de: 'Mit dem Einkaufen beginnen', es: 'Comenzar a comprar', pt: 'Começar a comprar', ru: 'Начать покупки', tr: 'Alışverişe başla', bn: 'কেনাকাটা শুরু করুন', ko: '쇼핑 시작', id: 'Mulai berbelanja' },
    'welcome.optional': { uz: 'ixtiyoriy', en: 'optional', ur: 'اختیاری', ar: 'اختياري', hi: 'वैकल्पिक', zh: '可选', ja: 'オプション', fr: 'optionnel', de: 'optional', es: 'opcional', pt: 'opcional', ru: 'необязательно', tr: 'isteğe bağlı', bn: 'ঐচ্ছিক', ko: '선택사항', id: 'opsional' },

    // Marketplace
    'mp.shops': { uz: 'Doʻkonlar', en: 'Shops', ur: 'دکانیں', ar: 'المتاجر', hi: 'दुकानें', zh: '商店', ja: '店舗', fr: 'Boutiques', de: 'Geschäfte', es: 'Tiendas', pt: 'Lojas', ru: 'Магазины', tr: 'Mağazalar', bn: 'দোকান', ko: '상점', id: 'Toko' },
    'mp.categories': { uz: 'Toifalar', en: 'Categories', ur: 'زمرے', ar: 'الفئات', hi: 'श्रेणियाँ', zh: '类别', ja: 'カテゴリー', fr: 'Catégories', de: 'Kategorien', es: 'Categorías', pt: 'Categorias', ru: 'Категории', tr: 'Kategoriler', bn: 'বিভাগ', ko: '카테고리', id: 'Kategori' },
    'mp.trending': { uz: 'Hozir mashhur', en: 'Trending now', ur: 'ابھی مقبول', ar: 'الرائج الآن', hi: 'अभी ट्रेंडिंग', zh: '当前热门', ja: '今のトレンド', fr: 'Tendances actuelles', de: 'Aktuelle Trends', es: 'Tendencias ahora', pt: 'Em alta agora', ru: 'В тренде сейчас', tr: 'Şimdi trend', bn: 'এখন ট্রেন্ডিং', ko: '지금 트렌딩', id: 'Tren sekarang' },
    'mp.featured': { uz: 'Tanlangan doʻkonlar', en: 'Featured shops', ur: 'نمایاں دکانیں', ar: 'المتاجر المميزة', hi: 'चुनिंदा दुकानें', zh: '精选商店', ja: '注目の店舗', fr: 'Boutiques en vedette', de: 'Empfohlene Geschäfte', es: 'Tiendas destacadas', pt: 'Lojas em destaque', ru: 'Рекомендуемые магазины', tr: 'Öne çıkan mağazalar', bn: 'বৈশিষ্ট্যযুক্ত দোকান', ko: '추천 상점', id: 'Toko unggulan' },
    'mp.seeall': { uz: 'Hammasini koʻrish', en: 'See all', ur: 'سب دیکھیں', ar: 'عرض الكل', hi: 'सभी देखें', zh: '查看全部', ja: 'すべて見る', fr: 'Voir tout', de: 'Alle anzeigen', es: 'Ver todo', pt: 'Ver tudo', ru: 'Посмотреть все', tr: 'Tümünü gör', bn: 'সব দেখুন', ko: '모두 보기', id: 'Lihat semua' },


    // Category labels (id keyed)
    'cat.fashion':     { uz: 'Moda', en: 'Fashion',          ur: 'فیشن',          ar: 'أزياء',         hi: 'फैशन',         zh: '时尚',     ja: 'ファッション',  fr: 'Mode',          de: 'Mode',          es: 'Moda',         pt: 'Moda',         ru: 'Мода',         tr: 'Moda',          bn: 'ফ্যাশন',     ko: '패션',     id: 'Mode' },
    'cat.accessories': { uz: 'Aksessuarlar', en: 'Accessories',      ur: 'لوازمات',        ar: 'إكسسوارات',     hi: 'सहायक उपकरण',     zh: '配饰',     ja: 'アクセサリー',   fr: 'Accessoires',   de: 'Zubehör',       es: 'Accesorios',   pt: 'Acessórios',   ru: 'Аксессуары',   tr: 'Aksesuarlar',   bn: 'আনুষাঙ্গিক',  ko: '액세서리',  id: 'Aksesori' },
    'cat.electronics': { uz: 'Elektronika', en: 'Electronics',      ur: 'الیکٹرانکس',     ar: 'إلكترونيات',     hi: 'इलेक्ट्रॉनिक्स',  zh: '电子产品',   ja: '電子機器',      fr: 'Électronique',  de: 'Elektronik',    es: 'Electrónica',  pt: 'Eletrônicos',  ru: 'Электроника',  tr: 'Elektronik',    bn: 'ইলেকট্রনিক্স', ko: '전자제품',  id: 'Elektronik' },
    'cat.home':        { uz: 'Uy va dekor', en: 'Home & Decor',     ur: 'گھر اور سجاوٹ',  ar: 'المنزل والديكور', hi: 'घर और सजावट',    zh: '家居装饰',   ja: 'ホーム＆装飾',  fr: 'Maison & Déco', de: 'Heim & Deko',   es: 'Hogar y deco', pt: 'Casa & Deco',  ru: 'Дом и декор',  tr: 'Ev & Dekor',    bn: 'বাড়ি ও সাজ',  ko: '홈 & 데코',  id: 'Rumah & Deco' },
    'cat.kitchen':     { uz: 'Oshxona', en: 'Kitchen',          ur: 'باورچی خانہ',     ar: 'المطبخ',        hi: 'रसोई',           zh: '厨房',     ja: 'キッチン',      fr: 'Cuisine',       de: 'Küche',         es: 'Cocina',       pt: 'Cozinha',      ru: 'Кухня',        tr: 'Mutfak',        bn: 'রান্নাঘর',     ko: '주방',     id: 'Dapur' },
    'cat.beauty':      { uz: 'Goʻzallik', en: 'Beauty',           ur: 'خوبصورتی',       ar: 'الجمال',        hi: 'सौंदर्य',         zh: '美容',     ja: 'ビューティー',   fr: 'Beauté',        de: 'Schönheit',     es: 'Belleza',      pt: 'Beleza',       ru: 'Красота',      tr: 'Güzellik',      bn: 'সৌন্দর্য',     ko: '뷰티',     id: 'Kecantikan' },
    'cat.grocery':     { uz: 'Oziq-ovqat', en: 'Grocery & Food',   ur: 'گروسری',         ar: 'البقالة',       hi: 'किराना',          zh: '杂货',     ja: '食料品',         fr: 'Épicerie',      de: 'Lebensmittel',  es: 'Comestibles',  pt: 'Mercearia',    ru: 'Продукты',     tr: 'Bakkal',        bn: 'মুদি',        ko: '식료품',    id: 'Bahan makanan' },
    'cat.toys':        { uz: 'Oʻyinchoqlar', en: 'Toys & Gifts',     ur: 'کھلونے',         ar: 'الألعاب',       hi: 'खिलौने',         zh: '玩具',     ja: 'おもちゃ',       fr: 'Jouets',        de: 'Spielzeug',     es: 'Juguetes',     pt: 'Brinquedos',   ru: 'Игрушки',      tr: 'Oyuncaklar',    bn: 'খেলনা',       ko: '장난감',    id: 'Mainan' },
    'cat.sports':      { uz: 'Sport', en: 'Sports & Outdoors',ur: 'کھیل',           ar: 'الرياضة',       hi: 'खेल',            zh: '运动',     ja: 'スポーツ',       fr: 'Sports',        de: 'Sport',         es: 'Deportes',     pt: 'Esportes',     ru: 'Спорт',        tr: 'Spor',          bn: 'খেলাধুলা',    ko: '스포츠',    id: 'Olahraga' },
    'cat.health':      { uz: 'Salomatlik', en: 'Health',           ur: 'صحت',            ar: 'الصحة',         hi: 'स्वास्थ्य',       zh: '健康',     ja: '健康',           fr: 'Santé',         de: 'Gesundheit',    es: 'Salud',        pt: 'Saúde',        ru: 'Здоровье',     tr: 'Sağlık',        bn: 'স্বাস্থ্য',    ko: '건강',     id: 'Kesehatan' },
    'cat.automotive':  { uz: 'Avtomobil', en: 'Automotive',       ur: 'گاڑیاں',         ar: 'سيارات',        hi: 'ऑटोमोटिव',       zh: '汽车',     ja: '自動車',         fr: 'Automobile',    de: 'Automobil',     es: 'Automotor',    pt: 'Automotivo',   ru: 'Авто',         tr: 'Otomotiv',      bn: 'গাড়ি',        ko: '자동차',    id: 'Otomotif' },
    'cat.books':       { uz: 'Kitoblar', en: 'Books',            ur: 'کتابیں',          ar: 'كتب',           hi: 'पुस्तकें',        zh: '书籍',     ja: '本',             fr: 'Livres',        de: 'Bücher',        es: 'Libros',       pt: 'Livros',       ru: 'Книги',        tr: 'Kitaplar',      bn: 'বই',          ko: '도서',     id: 'Buku' },
    'cat.baby':        { uz: 'Chaqaloq', en: 'Baby',             ur: 'بچے',            ar: 'الأطفال',       hi: 'शिशु',           zh: '婴儿',     ja: 'ベビー',         fr: 'Bébé',          de: 'Baby',          es: 'Bebé',         pt: 'Bebê',         ru: 'Малыши',       tr: 'Bebek',         bn: 'শিশু',        ko: '베이비',    id: 'Bayi' },
    'cat.pets':        { uz: 'Uy hayvonlari', en: 'Pets',             ur: 'پالتو',           ar: 'حيوانات',       hi: 'पालतू',          zh: '宠物',     ja: 'ペット',         fr: 'Animaux',       de: 'Haustiere',     es: 'Mascotas',     pt: 'Pets',         ru: 'Питомцы',      tr: 'Evcil',         bn: 'পোষা',        ko: '반려동물',  id: 'Hewan' },

    // Common
    'common.search': { uz: 'Qidirish', en: 'Search', ur: 'تلاش', ar: 'بحث', hi: 'खोज', zh: '搜索', ja: '検索', fr: 'Rechercher', de: 'Suche', es: 'Buscar', pt: 'Pesquisar', ru: 'Поиск', tr: 'Ara', bn: 'অনুসন্ধান', ko: '검색', id: 'Cari' },
    'common.back': { uz: 'Orqaga', en: 'Back', ur: 'پیچھے', ar: 'رجوع', hi: 'वापस', zh: '返回', ja: '戻る', fr: 'Retour', de: 'Zurück', es: 'Atrás', pt: 'Voltar', ru: 'Назад', tr: 'Geri', bn: 'পেছনে', ko: '뒤로', id: 'Kembali' },
    'common.save': { uz: 'Saqlash', en: 'Save', ur: 'محفوظ کریں', ar: 'حفظ', hi: 'सेव', zh: '保存', ja: '保存', fr: 'Enregistrer', de: 'Speichern', es: 'Guardar', pt: 'Salvar', ru: 'Сохранить', tr: 'Kaydet', bn: 'সংরক্ষণ', ko: '저장', id: 'Simpan' },
    'common.cancel': { uz: 'Bekor qilish', en: 'Cancel', ur: 'منسوخ کریں', ar: 'إلغاء', hi: 'रद्द करें', zh: '取消', ja: 'キャンセル', fr: 'Annuler', de: 'Abbrechen', es: 'Cancelar', pt: 'Cancelar', ru: 'Отмена', tr: 'İptal', bn: 'বাতিল', ko: '취소', id: 'Batal' },
  };

  /* Translate a key. Falls back to English, then to the key itself. */
  function t(key) {
    const lang = (window.Locale && Locale.get()?.language) || 'en';
    const entry = STRINGS[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
  }

  /* Right-to-left support */
  const RTL_LANGS = ['ar', 'ur', 'fa', 'he'];
  function isRTL() {
    const lang = (window.Locale && Locale.get()?.language) || 'en';
    return RTL_LANGS.includes(lang);
  }

  /* Apply RTL direction to the document body */
  function applyDirection() {
    document.body.dir = isRTL() ? 'rtl' : 'ltr';
  }

  return { t, isRTL, applyDirection };
})();

window.I18n = I18n;
window.t = I18n.t;  // global shortcut

// Apply direction on load
I18n.applyDirection();
log('I18n', 'ready');
