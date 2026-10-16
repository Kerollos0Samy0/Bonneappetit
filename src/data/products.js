export const BUSINESS_INFO = {
  name: "Bonne Appetit",
  nameAr: "بونابيتي",
  slogan: "أكلات بيتي وتجهيزات فاخرة جاهزة للتسوية الفورية",
  manager: "م/ فاتن كمال",
  phone: "01055083061",
  phoneDisplay: "01055083061",
  whatsapp: "201055083061",
  phone2: "01055082964",
  phone2Display: "01055082964",
  storageTemp: "-18°C في الفريزر",
  shippingPolicy: "شحن مجاني من 20 كجم فأكثر | خصم 50% من 10 كجم",
  defaultWholesaleDiscount: 15, // 15% wholesale discount
  adminCredentials: {
    username: "admin",
    password: "123"
  },
  defaultWholesaleUsers: [
    {
      id: "w1",
      name: "سوبر ماركت كارما - ك.مارمرقس",
      area: "كليوباترا - مصر الجديدة",
      phone: "01282199648",
      username: "karma",
      password: "karma123",
      approved: true,
      discountPct: 15
    },
    {
      id: "w2",
      name: "سوبر ماركت - ك.مارمينا المقر",
      area: "زهراء - مصر القديمة",
      phone: "01285275505",
      username: "mina",
      password: "mina123",
      approved: true,
      discountPct: 15
    },
    {
      id: "w3",
      name: "سوبر ماركت - ك.الانبا بولا",
      area: "ارض الجولف - مدينة نصر",
      phone: "01285275505",
      username: "paula",
      password: "paula123",
      approved: true,
      discountPct: 15
    },
    {
      id: "w4",
      name: "سوبر ماركت - ك.السيدة العذراء (الرحاب)",
      area: "الرحاب - التجمع الاول",
      phone: "01201162335",
      username: "rehab",
      password: "rehab123",
      approved: true,
      discountPct: 15
    },
    {
      id: "w5",
      name: "سوبر ماركت - ك.السيدة العذراء (القناطر)",
      area: "القناطر الخيرية - القليوبية",
      phone: "01207548666",
      username: "qanater",
      password: "qanater123",
      approved: true,
      discountPct: 15
    },
    {
      id: "w6",
      name: "سوبر ماركت - كوكو اوريجينال",
      area: "مسرة - شبرا مصر",
      phone: "01228502804",
      username: "koko",
      password: "koko123",
      approved: true,
      discountPct: 15
    }
  ]
};

// Colors & Order matching the official Bonne Appetit Cover badges:
// 1. SPECIAL (Purple) | 2. FISH (Sky Blue) | 3. CHICKEN (Amber/Orange) | 4. BEEF (Red) | 5. VEGAN (Green)
export const CATEGORIES = [
  {
    id: "all",
    name: "جميع الأصناف",
    colorName: "الكل",
    activeStyle: "bg-stone-900 text-white border-stone-900 shadow-sm",
    badgeStyle: "bg-stone-100 text-stone-700 border-stone-200",
    dotColor: "bg-stone-900"
  },
  {
    id: "special",
    name: "سبشيال",
    label: "SPECIAL",
    activeStyle: "bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-200",
    badgeStyle: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-600"
  },
  {
    id: "fish",
    name: "سمك",
    label: "FISH",
    activeStyle: "bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-200",
    badgeStyle: "bg-sky-50 text-sky-700 border-sky-200",
    dotColor: "bg-sky-600"
  },
  {
    id: "poultry",
    name: "فراخ",
    label: "CHICKEN",
    activeStyle: "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200",
    badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
    dotColor: "bg-amber-500"
  },
  {
    id: "beef",
    name: "لحمة",
    label: "BEEF",
    activeStyle: "bg-red-600 text-white border-red-600 shadow-sm shadow-red-200",
    badgeStyle: "bg-red-50 text-red-700 border-red-200",
    dotColor: "bg-red-600"
  },
  {
    id: "vegetables",
    name: "خضار",
    label: "VEGAN",
    activeStyle: "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200",
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-600"
  }
];

export const PRODUCTS = [
  // ==========================================
  // 1. سبشيال (SPECIAL - Purple) [لفترة محدودة]
  // ==========================================
  {
    id: "sp1",
    name: "رول فراخ محشي لحمة وجبن",
    category: "special",
    price: 150,
    unit: "رول نصف كيلو",
    weightKg: 0.5,
    description: "سبشيال لفترة محدودة: صدور دجاج متبلة ملفوفة ومحشوة بلحم مفروم بلدي مع مكس جبن غني. جاهز للفرن أو التحمير الفوري.",
    isFasting: false,
    isSpecial: true
  },

  // ==========================================
  // 2. سمك (FISH - Sky Blue)
  // ==========================================
  {
    id: "f1",
    name: "كفتة سمك",
    category: "fish",
    price: 120,
    unit: "طبق نصف كيلو مصبع",
    weightKg: 0.5,
    description: "كفتة سمك فيليه طازج مفروم مع خضار وتوابل سمك إسكندرانية، جاهزة للقلي أو الفرن.",
    isFasting: true
  },
  {
    id: "f2",
    name: "شيش طاووق سمك",
    category: "fish",
    price: 130,
    unit: "طبق نصف كيلو بأسياخ خشبية",
    weightKg: 0.5,
    description: "مكعبات سمك فيليه متبلة بالثوم والليمون والكمون والفلفل الألوان، جاهزة للجريل أو الشوي.",
    isFasting: true
  },
  {
    id: "f3",
    name: "جمبري متبل",
    category: "fish",
    price: 195,
    unit: "طبق نصف كيلو مقشر",
    weightKg: 0.5,
    description: "جمبري طازج مقشر ومنظف متبل بالثوم والليمون والكزبرة والكمون، جاهز للقلي أو الطاجن.",
    isFasting: true
  },
  {
    id: "f4",
    name: "فيليه",
    category: "fish",
    price: 140,
    unit: "طبق نصف كيلو",
    weightKg: 0.5,
    description: "قطع سمك فيليه أبيض طازج متبل بالخلطة الإسكندرانية، جاهز للقلي المقرمش أو الفرن.",
    isFasting: true
  },
  {
    id: "f5",
    name: "بلطي سنجاري",
    category: "fish",
    price: 130,
    unit: "طبق سمكتين كبار سنجاري (1 كجم)",
    weightKg: 1.0,
    description: "سمك بلطي طازج مفتوح سنجاري ومتبل بالخلطة الإسكندرانية والطماطم والفلفل، جاهز للفرن فوراً.",
    isFasting: true
  },
  {
    id: "f6",
    name: "بلطي مقلي",
    category: "fish",
    price: 120,
    unit: "طبق 1 كجم (3-4 سمكات)",
    weightKg: 1.0,
    description: "سمك بلطي بلدي متنظف ومتبل بالثوم والكمون والليمون ومبدر بالدقيق جاهز للقلي المباشر.",
    isFasting: true
  },

  // ==========================================
  // 3. فراخ (CHICKEN - Orange / Amber)
  // ==========================================
  {
    id: "p1",
    name: "كوردن بلو",
    category: "poultry",
    price: 115,
    unit: "طبق 400 جم (4 قطع)",
    weightKg: 0.4,
    description: "صدور دجاج متبلة محشوة برومي مدخن وجبن شيدر، مغطاة بطبقة بقسماط مقرمشة جاهزة للقلي.",
    isFasting: false
  },
  {
    id: "p2",
    name: "نجرسكو فراخ",
    category: "poultry",
    price: 135,
    unit: "صينية فويل وسط (850 جم)",
    weightKg: 0.85,
    description: "مكرونة نجرسكو غنية بقطع الدجاج المتبلة والمشروم والفلفل الألوان مع صوص البشاميل والموزاريلا.",
    isFasting: false
  },
  {
    id: "p3",
    name: "شيش طاووق فراخ",
    category: "poultry",
    price: 120,
    unit: "طبق نصف كيلو بأسياخ خشبية",
    weightKg: 0.5,
    description: "مكعبات أوراك دجاج طرية متبلة بخلطة المستردة والزبادي والزعتر، جاهزة للشوي أو الجريل.",
    isFasting: false
  },
  {
    id: "p4",
    name: "بانية متبل",
    category: "poultry",
    price: 130,
    unit: "طبق نصف كيلو",
    weightKg: 0.5,
    description: "شرائح صدور دجاج فيليه طازجة متبلة بالبصل والليمون ومغطاة بطبقة كرسبي ذهبية جاهزة للقلي.",
    isFasting: false
  },
  {
    id: "p5",
    name: "فراخ متبلة",
    category: "poultry",
    price: 145,
    unit: "فرخة كاملة متبلة (1.2 كجم)",
    weightKg: 1.2,
    description: "فرخة بلدي متبلة بخلطة بونابيتي الخاصة بالبصل والطماطم والبهارات للشوي بالفرن أو الفحم.",
    isFasting: false
  },
  {
    id: "p6",
    name: "فراخ كوكي متبلة",
    category: "poultry",
    price: 140,
    unit: "طبق 8 قطع (900 جم)",
    weightKg: 0.9,
    description: "دبابيس وأوراك دجاج متبلة ومقرمشة على طريقة كوكي، جاهزة للقلي السريع المقرمش.",
    isFasting: false
  },

  // ==========================================
  // 4. لحمة (BEEF - Red)
  // ==========================================
  {
    id: "b1",
    name: "ورق عنب باللحمة",
    category: "beef",
    price: 170,
    unit: "طبق 1 كجم",
    weightKg: 1.0,
    description: "ورق عنب بناتي ناعم ملفوف يدوي بحشوة خلطة بونابيتي الخاصة باللحمة المفرومة البلدي. جاهز للتسوية مباشرة.",
    isFasting: false
  },
  {
    id: "b2",
    name: "كرنب باللحمة",
    category: "beef",
    price: 150,
    unit: "طبق 1 كجم",
    weightKg: 1.0,
    description: "أصابع كرنب بلدي مسلوقة ومحشوة بخلطة تسبيكة بيتي ولحم بلدي مفروم.",
    isFasting: false
  },
  {
    id: "b3",
    name: "ممبار بالارز",
    category: "beef",
    price: 115,
    unit: "طبق نصف كيلو",
    weightKg: 0.5,
    description: "ممبار بلدي متنظف ومعقم بعناية فائقة، محشو بخلطة الأرز المبهرة ومسلوق جاهز للتحمير الفوري.",
    isFasting: false
  },
  {
    id: "b4",
    name: "ممبار باللحمة",
    category: "beef",
    price: 125,
    unit: "طبق نصف كيلو",
    weightKg: 0.5,
    description: "ممبار بلدي فاخر محشو بخلطة أرز مدعمة بقطع اللحم المفروم البلدي والبهارات الخاصة.",
    isFasting: false
  },
  {
    id: "b5",
    name: "سجق باللحمة البلدي",
    category: "beef",
    price: 150,
    unit: "طبق نصف كيلو",
    weightKg: 0.5,
    description: "سجق بلدي طازج بتتبيلة شرقية خاصة بدون دهون زائدة أو ألوان صناعية.",
    isFasting: false
  },
  {
    id: "b6",
    name: "كفتة طرب",
    category: "beef",
    price: 160,
    unit: "طبق نصف كيلو (8-10 قطع)",
    weightKg: 0.5,
    description: "كفتة لحم بلدي متبلة بالبصل والبهارات، ملفوفة في منديل ضاني خفيف جاهزة للشوي.",
    isFasting: false
  },
  {
    id: "b7",
    name: "كفتة لحمة",
    category: "beef",
    price: 125,
    unit: "طبق نصف كيلو مصبع",
    weightKg: 0.5,
    description: "كفتة لحم بلدي مصبعة ومتبلة على أصولها، متماسكة وجاهزة للشوي على الجريل أو الفرن.",
    isFasting: false
  },
  {
    id: "b8",
    name: "كفتة داود باشا",
    category: "beef",
    price: 135,
    unit: "طبق نصف كيلو كرات",
    weightKg: 0.5,
    description: "كرات كفتة لحم بلدي ناعمة متبلة بالبهارات، جاهزة للتشويح وإضافة صوص الطماطم الأحمر.",
    isFasting: false
  },
  {
    id: "b9",
    name: "كفتة ارز",
    category: "beef",
    price: 95,
    unit: "طبق 400 جرام مصبع",
    weightKg: 0.4,
    description: "كفتة أرز بلدي باللحم المفروم والخضرة الطازجة، مصبعة ومجهزة للتسوية في الصلصة.",
    isFasting: false
  },
  {
    id: "b10",
    name: "سمبوسك باللحمة",
    category: "beef",
    price: 80,
    unit: "طبق 10 قطع (400 جم)",
    weightKg: 0.4,
    description: "عجينة مقرمشة محشوة بلحم مفروم معصج على الطريقة البيتي مع بصل مكرمل وبهارات مميزة.",
    isFasting: false
  },
  {
    id: "b11",
    name: "كوبيبة باللحمة والذبيب",
    category: "beef",
    price: 100,
    unit: "طبق 10 قطع (400 جم)",
    weightKg: 0.4,
    description: "كبيبة برغل بلحم بلدي مفروم، محشوة بلحم متبل وزبيب ومكسرات، متماسكة ومقرمشة عند القلي.",
    isFasting: false
  },
  {
    id: "b12",
    name: "كانيلوني",
    category: "beef",
    price: 80,
    unit: "طبق فويل 400 جم",
    weightKg: 0.4,
    description: "رولات كانيلوني محشوة باللحم المفروم البلدي وصوص البشاميل الكريمي وجبن الموزاريلا.",
    isFasting: false
  },
  {
    id: "b13",
    name: "برجر لحمة",
    category: "beef",
    price: 140,
    unit: "طبق 5 قطع كبيرة (نصف كجم)",
    weightKg: 0.5,
    description: "برجر لحم بقري بلدي صافي متبل بتوابل البرجر الخاصة، بدون أي إضافات ضارة.",
    isFasting: false
  },
  {
    id: "b14",
    name: "مكرونة بشاميل باللحمة",
    category: "beef",
    price: 120,
    unit: "صينية فويل وسط (850 جم)",
    weightKg: 0.85,
    description: "صينية مكرونة بشاميل فاخرة بحشوة لحم بلدي مفروم وصوص بشاميل غني وجبن موزاريلا.",
    isFasting: false
  },

  // ==========================================
  // 5. خضار (VEGAN / VEGETABLES - Green)
  // ==========================================
  {
    id: "v1",
    name: "ورق عنب نباتي",
    category: "vegetables",
    price: 110,
    unit: "طبق 1 كجم",
    weightKg: 1.0,
    description: "ورق عنب نباتي 100% بزيت الزيتون والليمون ودبس الرمان وخضار نضرة وأرز مصري ممتاز.",
    isFasting: true
  },
  {
    id: "v2",
    name: "كرنب",
    category: "vegetables",
    price: 80,
    unit: "طبق 1 كجم",
    weightKg: 1.0,
    description: "محشي كرنب صيامي خفيف ولذيذ، متبل بتوابل شرقية أصيلة وزيت نباتي نقي.",
    isFasting: true
  },
  {
    id: "v3",
    name: "ملوخية",
    category: "vegetables",
    price: 35,
    unit: "كيس 400 جم مفروم ومجمد",
    weightKg: 0.4,
    description: "ملوخية خضراء طازجة مقطوفة ومغسولة ومفرومة بعناية، خضراء زاهية جاهزة للطهي الفوري.",
    isFasting: true
  },
  {
    id: "v4",
    name: "بامية",
    category: "vegetables",
    price: 45,
    unit: "كيس 400 جم",
    weightKg: 0.4,
    description: "بامية بلدي نمرة واحدة مقمعة يدوي ونظيفة، جاهزة للصلصة أو الطاجن بالفرن.",
    isFasting: true
  },
  {
    id: "v5",
    name: "بامية ويكا",
    category: "vegetables",
    price: 40,
    unit: "كيس 400 جم",
    weightKg: 0.4,
    description: "بامية ويكا صعيدي خضراء طازجة مقطعة شرائح جاهزة للشوربة والتسوية الفورية.",
    isFasting: true
  },
  {
    id: "v6",
    name: "قلقاس + السلق",
    category: "vegetables",
    price: 65,
    unit: "كيس 1 كجم مع باقة السلق والخضرة",
    weightKg: 1.0,
    description: "قلقاس بلدي مقشر ومقطع ومجفف بالطريقة الصحية، مع كيس سلق وخضرة مجهزة للتحمير.",
    isFasting: true
  },
  {
    id: "v7",
    name: "كفتة أرز",
    category: "vegetables",
    price: 60,
    unit: "طبق 400 جم مصبع",
    weightKg: 0.4,
    description: "كفتة أرز صيامي بالعدس والخضرة الطازجة والتوابل، مقلية وجاهزة للتسوية في الصلصة.",
    isFasting: true
  },
  {
    id: "v8",
    name: "بطاطس نصف قلية",
    category: "vegetables",
    price: 50,
    unit: "كيس 1 كجم",
    weightKg: 1.0,
    description: "أصابع بطاطس فارم فريتس مقرمشة نصف مقلية ومجمدة، جاهزة للقلي السريع أو القلاية الهوائية.",
    isFasting: true
  },
  {
    id: "v9",
    name: "سمبوسك بالجبنة",
    category: "vegetables",
    price: 65,
    unit: "طبق 10 قطع (400 جم)",
    weightKg: 0.4,
    description: "عجينة سمبوسك مقرمشة محشوة بمزيج جبن شيدر وموزاريلا وكيري وحبة البركة والنعناع.",
    isFasting: false
  },
  {
    id: "v10",
    name: "سمبوسك بالجبنة الصيامي",
    category: "vegetables",
    price: 55,
    unit: "طبق 10 قطع (400 جم)",
    weightKg: 0.4,
    description: "سمبوسك نباتية 100% محشوة بجبنة صيامية نباتية وحبة البركة والزعتر، مقرمشة وخفيفة.",
    isFasting: true
  },
  {
    id: "v11",
    name: "مكرونة بشاميل صيامي",
    category: "vegetables",
    price: 110,
    unit: "صينية فويل وسط (800 جم)",
    weightKg: 0.8,
    description: "مكرونة بصوص بشاميل صيامي نباتي غني مع حشوة مشروم وخضروات متبلة.",
    isFasting: true
  },
  {
    id: "v12",
    name: "نجرسكو صيامي",
    category: "vegetables",
    price: 120,
    unit: "صينية فويل وسط (800 جم)",
    weightKg: 0.8,
    description: "مكرونة نجرسكو صيامية بخلطة المشروم الفريش والفلفل الألوان مع صوص أبيض نباتي كريمي.",
    isFasting: true
  },
  {
    id: "v13",
    name: "برجر صيامي",
    category: "vegetables",
    price: 95,
    unit: "طبق 5 قطع (نصف كجم)",
    weightKg: 0.5,
    description: "برجر نباتي صيامي 100% من فول الصويا والخضروات والتوابل المميزة، خفيف وصحي.",
    isFasting: true
  },
  {
    id: "v14",
    name: "كوبيبة صيامي",
    category: "vegetables",
    price: 75,
    unit: "طبق 10 قطع (400 جم)",
    weightKg: 0.4,
    description: "كبيبة صيامية بقشرة برغل مقرمشة محشوة بمشروم طازج معصج مع بصل ومكسرات.",
    isFasting: true
  }
];
