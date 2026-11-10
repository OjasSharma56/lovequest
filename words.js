/* Choti's Hindi class — the word bank.
   hi = Devanagari, rm = how to read it, en = meaning, e = emoji for the answer buttons.
   Every word has a recording at audio/<rm>.m4a so the Listen button never depends on the phone's own voices.
   Add a word: add a line here, then run the audio generator (see README note in chat). */
const WORDS = [
  /* the basics */
  { hi:"हाँ",       rm:"haan",       en:"yes",          e:"✅" },
  { hi:"नहीं",      rm:"nahi",       en:"no",           e:"🚫" },
  { hi:"नमस्ते",    rm:"namaste",    en:"hello",        e:"🙏" },
  { hi:"धन्यवाद",   rm:"dhanyavaad", en:"thank you",    e:"😊" },
  { hi:"अच्छा",     rm:"achha",      en:"good",         e:"👍" },
  { hi:"चलो",       rm:"chalo",      en:"let's go",     e:"🚶" },
  { hi:"आओ",        rm:"aao",        en:"come",         e:"👋" },

  /* food & drink */
  { hi:"पानी",      rm:"paani",      en:"water",        e:"💧" },
  { hi:"चाय",       rm:"chai",       en:"tea",          e:"☕" },
  { hi:"दूध",       rm:"doodh",      en:"milk",         e:"🥛" },
  { hi:"रोटी",      rm:"roti",       en:"flatbread",    e:"🫓" },
  { hi:"चावल",      rm:"chaawal",    en:"rice",         e:"🍚" },
  { hi:"दाल",       rm:"daal",       en:"lentils",      e:"🍲" },
  { hi:"सेब",       rm:"seb",        en:"apple",        e:"🍎" },
  { hi:"केला",      rm:"kela",       en:"banana",       e:"🍌" },
  { hi:"आम",        rm:"aam",        en:"mango",        e:"🥭" },
  { hi:"मिठाई",     rm:"mithai",     en:"sweets",       e:"🍬" },
  { hi:"नमक",       rm:"namak",      en:"salt",         e:"🧂" },
  { hi:"खाना",      rm:"khaana",     en:"food",         e:"🍽️" },
  { hi:"मीठा",      rm:"meetha",     en:"sweet",        e:"🍯" },
  { hi:"गरम",       rm:"garam",      en:"hot",          e:"🔥" },
  { hi:"ठंडा",      rm:"thanda",     en:"cold",         e:"🧊" },

  /* people & feelings */
  { hi:"माँ",       rm:"maa",        en:"mother",       e:"👩" },
  { hi:"पापा",      rm:"papa",       en:"dad",          e:"👨" },
  { hi:"भाई",       rm:"bhai",       en:"brother",      e:"👦" },
  { hi:"बहन",       rm:"behen",      en:"sister",       e:"👧" },
  { hi:"दोस्त",     rm:"dost",       en:"friend",       e:"🧑‍🤝‍🧑" },
  { hi:"बच्चा",     rm:"bachcha",    en:"child",        e:"👶" },
  { hi:"घर",        rm:"ghar",       en:"home",         e:"🏠" },
  { hi:"प्यार",     rm:"pyaar",      en:"love",         e:"❤️" },
  { hi:"दिल",       rm:"dil",        en:"heart",        e:"💓" },
  { hi:"छोटी",      rm:"choti",      en:"little",       e:"🐭", after:"…and that's you ♥" },
  { hi:"बड़ा",      rm:"bada",       en:"big",          e:"🦕" },
  { hi:"सुंदर",     rm:"sundar",     en:"beautiful",    e:"✨" },
  { hi:"नया",       rm:"naya",       en:"new",          e:"🆕" },

  /* colors */
  { hi:"लाल",       rm:"laal",       en:"red",          e:"🔴" },
  { hi:"नीला",      rm:"neela",      en:"blue",         e:"🔵" },
  { hi:"पीला",      rm:"peela",      en:"yellow",       e:"🟡" },
  { hi:"हरा",       rm:"hara",       en:"green",        e:"🟢" },
  { hi:"काला",      rm:"kaala",      en:"black",        e:"⚫" },
  { hi:"सफ़ेद",     rm:"safed",      en:"white",        e:"⚪" },

  /* numbers */
  { hi:"एक",        rm:"ek",         en:"one",          e:"1️⃣" },
  { hi:"दो",        rm:"do",         en:"two",          e:"2️⃣" },
  { hi:"तीन",       rm:"teen",       en:"three",        e:"3️⃣" },
  { hi:"चार",       rm:"chaar",      en:"four",         e:"4️⃣" },
  { hi:"पाँच",      rm:"paanch",     en:"five",         e:"5️⃣" },

  /* animals */
  { hi:"बिल्ली",    rm:"billi",      en:"cat",          e:"🐱" },
  { hi:"कुत्ता",    rm:"kutta",      en:"dog",          e:"🐶" },
  { hi:"गाय",       rm:"gaay",       en:"cow",          e:"🐄" },
  { hi:"हाथी",      rm:"haathi",     en:"elephant",     e:"🐘" },
  { hi:"चिड़िया",   rm:"chidiya",    en:"bird",         e:"🐦" },
  { hi:"मछली",      rm:"machhli",    en:"fish",         e:"🐟" },
  { hi:"बंदर",      rm:"bandar",     en:"monkey",       e:"🐵" },
  { hi:"घोड़ा",     rm:"ghoda",      en:"horse",        e:"🐴" },

  /* nature & things */
  { hi:"सूरज",      rm:"sooraj",     en:"sun",          e:"☀️" },
  { hi:"चाँद",      rm:"chaand",     en:"moon",         e:"🌙" },
  { hi:"तारा",      rm:"taara",      en:"star",         e:"⭐" },
  { hi:"फूल",       rm:"phool",      en:"flower",       e:"🌸" },
  { hi:"पेड़",      rm:"ped",        en:"tree",         e:"🌳" },
  { hi:"बारिश",     rm:"baarish",    en:"rain",         e:"🌧️" },
  { hi:"किताब",     rm:"kitaab",     en:"book",         e:"📚" },
  { hi:"गाड़ी",     rm:"gaadi",      en:"car",          e:"🚗" },

  /* time of day */
  { hi:"सुबह",      rm:"subah",      en:"morning",      e:"🌅" },
  { hi:"शाम",       rm:"shaam",      en:"evening",      e:"🌇" },
  { hi:"रात",       rm:"raat",       en:"night",        e:"🌃" },
  { hi:"दिन",       rm:"din",        en:"day",          e:"🌤️" },

  /* body */
  { hi:"आँख",       rm:"aankh",      en:"eye",          e:"👁️" },
  { hi:"हाथ",       rm:"haath",      en:"hand",         e:"✋" },
  { hi:"नाक",       rm:"naak",       en:"nose",         e:"👃" },
  { hi:"कान",       rm:"kaan",       en:"ear",          e:"👂" },
  { hi:"मुँह",      rm:"munh",       en:"mouth",        e:"👄" },

  /* me & you */
  { hi:"मैं",       rm:"main",       en:"I",            e:"🙋" },
  { hi:"तुम",       rm:"tum",        en:"you",          e:"👉" }
];
