/* =====================================================================
   ARAÇARI SHOP DATA
   Everything the shop sells lives here. Change a price, add a flavour or
   adjust shipping in this one object; nothing else needs editing.

   - Prices are in euro cents, VAT included. 895 = €8,95.
   - Every price below is a PLACEHOLDER: a rough estimate from Dutch retail
     prices and typical costs (Oct 2026), not a decided price. The site shows
     a [TBD] tag next to every price while `pricesConfirmed` is false. Set it
     to true once the real prices are in.
   - Text fields marked [TBD] are shown on the site as visible placeholders.
   - To add a flavour: copy one entry in `flavours`, give it a new `id`,
     its pack colours and its three pack images (pouch front, pouch back,
     tube; 600 px webp in src/assets/), then run `npm run build`.
   ===================================================================== */
const DATA = {
  brand: 'Araçari',              // name is still being surveyed; change it here
  tagline: 'Wildly good pecans',
  // El Porvenir is the family's own farm, but not every pecan comes from it: partner farms
  // with the same practices supply the rest. Never present El Porvenir as the producer of all products.
  // Do not use "organic", "bio" or "eco" anywhere until the EU organic certificate is in place.
  farm: 'El Porvenir, Monte Alverne, Santa Cruz do Sul, Brazil',   // [VERIFY]
  partnerFarms: '[TBD]',          // names and regions of the partner farms
  origin: 'Brazil',
  currency: 'EUR',
  pricesConfirmed: false,        // false = show a [TBD] tag on every price

  /* ---------------- Shipping (Netherlands first, Europe later) ------- */
  shipping: {
    country: 'NL',
    standardCents: 495,          // [TBD] placeholder
    freeFromCents: 3500,         // [TBD] placeholder: free shipping from €35
    deliveryDays: '1–2',         // [TBD] working days
    carrier: '[TBD]',
    laterCountries: ['BE', 'DE', 'FR'], // shown as "coming later"
  },
  vat: { foodRatePercent: 9, note: '[VERIFY] 9% is the Dutch VAT rate for food' },

  /* ---------------- Formats (v3 packaging, design/packs/v3) ----------
     Every flavour comes in both. Sizes and materials are from the pack
     brief; the supplier is not chosen yet, so all of it is [VERIFY].   */
  formats: {
    pouch: { g: 100, name: { en: '100 g pouch', nl: 'zak van 100 g' } },
    tube: { g: 250, name: { en: '250 g tube', nl: 'koker van 250 g' } },
  },

  /* ---------------- Flavours ----------------------------------------
     Colours, notes and taglines come from design/packs/v3/flavours-v3.json:
       body = pack colour, strip = the dark strip, band = bottom swirl band,
       name = colour of the flavour name on the front.
     note = the handwritten note on the pack; tagline = the line on the back.
     allergen = what the card and product page say; recipes are not final.
     img = 600 px webp cut-outs in src/assets/ (pouch front, pouch back, tube) and
       label = the tube's flat label (front + back) that wraps the 3D tube.
     price = euro cents per format. taste is used by the upsell and pairing. */
  flavours: [
    { id: 'salted-caramel', taste: 'salty-sweet',
      name: { en: 'Salted caramel', nl: 'Gezouten karamel' },
      colors: { body: '#dd6c22', strip: '#13333a', band: '#c1d04a', name: '#13333a' },
      note: { en: 'sweet, salty & crunchy', nl: 'zoet, zout & knapperig' },
      tagline: { en: 'Sweet · Salty · Crunchy', nl: 'Zoet · Zout · Knapperig' },
      allergen: { en: 'Contains tree nuts (pecans).', nl: 'Bevat noten (pecannoten).' },
      img: { front: 'assets/salted-caramel-pouch-front.webp', back: 'assets/salted-caramel-pouch-back.webp', tube: 'assets/salted-caramel-tube.webp', label: 'assets/salted-caramel-tube-label.webp' },
      price: { pouch: 599, tube: 1295 } },
    { id: 'chocolate', taste: 'rich',
      name: { en: 'Chocolate', nl: 'Chocolade' },
      colors: { body: '#4a221a', strip: '#2b1611', band: '#b4472b', name: '#fbefd6' },
      note: { en: 'rich dark chocolate', nl: 'volle pure chocolade' },
      tagline: { en: 'Rich · Dark · Crunchy', nl: 'Vol · Puur · Knapperig' },
      allergen: { en: 'Contains tree nuts (pecans). Milk and soy in the chocolate: [VERIFY].', nl: 'Bevat noten (pecannoten). Melk en soja in de chocolade: [VERIFY].' },
      img: { front: 'assets/chocolate-pouch-front.webp', back: 'assets/chocolate-pouch-back.webp', tube: 'assets/chocolate-tube.webp', label: 'assets/chocolate-tube-label.webp' },
      price: { pouch: 599, tube: 1295 } },
    { id: 'chocolate-sea-salt', taste: 'salty-rich',
      name: { en: 'Chocolate & sea salt', nl: 'Chocolade & zeezout' },
      colors: { body: '#1f5a5c', strip: '#113a3c', band: '#63d8da', name: '#ffffff' },
      note: { en: 'dark chocolate, a pinch of salt', nl: 'pure chocolade, een snufje zout' },
      tagline: { en: 'Dark · Salty · Crunchy', nl: 'Puur · Zout · Knapperig' },
      allergen: { en: 'Contains tree nuts (pecans). Milk and soy in the chocolate: [VERIFY].', nl: 'Bevat noten (pecannoten). Melk en soja in de chocolade: [VERIFY].' },
      img: { front: 'assets/chocolate-sea-salt-pouch-front.webp', back: 'assets/chocolate-sea-salt-pouch-back.webp', tube: 'assets/chocolate-sea-salt-tube.webp', label: 'assets/chocolate-sea-salt-tube-label.webp' },
      price: { pouch: 599, tube: 1295 } },
    { id: 'caramel', taste: 'sweet',
      name: { en: 'Caramel', nl: 'Karamel' },
      colors: { body: '#e6d2a8', strip: '#4b2a1a', band: '#e17c20', name: '#6b1d14' },
      note: { en: 'golden caramel, extra crunchy', nl: 'goudgele karamel, extra knapperig' },
      tagline: { en: 'Golden · Sweet · Crunchy', nl: 'Goudgeel · Zoet · Knapperig' },
      allergen: { en: 'Contains tree nuts (pecans).', nl: 'Bevat noten (pecannoten).' },
      img: { front: 'assets/caramel-pouch-front.webp', back: 'assets/caramel-pouch-back.webp', tube: 'assets/caramel-tube.webp', label: 'assets/caramel-tube-label.webp' },
      price: { pouch: 599, tube: 1295 } },
    { id: 'doce-de-leite', taste: 'sweet',
      name: { en: 'Doce de leite', nl: 'Doce de leite' },
      colors: { body: '#c08243', strip: '#5a2f17', band: '#f2dfb6', name: '#4a2511' },
      note: { en: 'creamy doce de leite', nl: 'romige doce de leite' },
      tagline: { en: 'Creamy · Sweet · Crunchy', nl: 'Romig · Zoet · Knapperig' },
      allergen: { en: 'Contains tree nuts (pecans) and milk.', nl: 'Bevat noten (pecannoten) en melk.' },
      img: { front: 'assets/doce-de-leite-pouch-front.webp', back: 'assets/doce-de-leite-pouch-back.webp', tube: 'assets/doce-de-leite-tube.webp', label: 'assets/doce-de-leite-tube-label.webp' },
      price: { pouch: 599, tube: 1295 } },
    { id: 'cinnamon-sugar', taste: 'spiced',
      name: { en: 'Cinnamon sugar', nl: 'Kaneelsuiker' },
      colors: { body: '#93301f', strip: '#4a1410', band: '#f2b46a', name: '#fbefd6' },
      note: { en: 'warm cinnamon, sugar crust', nl: 'warme kaneel, suikerkorstje' },
      tagline: { en: 'Warm · Spiced · Crunchy', nl: 'Warm · Kruidig · Knapperig' },
      allergen: { en: 'Contains tree nuts (pecans).', nl: 'Bevat noten (pecannoten).' },
      img: { front: 'assets/cinnamon-sugar-pouch-front.webp', back: 'assets/cinnamon-sugar-pouch-back.webp', tube: 'assets/cinnamon-sugar-tube.webp', label: 'assets/cinnamon-sugar-tube-label.webp' },
      price: { pouch: 599, tube: 1295 } },
    { id: 'coffee-chocolate', taste: 'rich',
      name: { en: 'Coffee & chocolate', nl: 'Koffie & chocolade' },
      colors: { body: '#33201a', strip: '#a67a3c', band: '#7d4a2c', name: '#fbefd6' },
      note: { en: 'coffee kick, dark chocolate', nl: 'koffiekick, pure chocolade' },
      tagline: { en: 'Bold · Dark · Crunchy', nl: 'Krachtig · Puur · Knapperig' },
      allergen: { en: 'Contains tree nuts (pecans). Milk and soy in the chocolate: [VERIFY].', nl: 'Bevat noten (pecannoten). Melk en soja in de chocolade: [VERIFY].' },
      img: { front: 'assets/coffee-chocolate-pouch-front.webp', back: 'assets/coffee-chocolate-pouch-back.webp', tube: 'assets/coffee-chocolate-tube.webp', label: 'assets/coffee-chocolate-tube-label.webp' },
      price: { pouch: 599, tube: 1295 } },
    { id: 'honey-sea-salt', taste: 'salty-sweet',
      name: { en: 'Honey & sea salt', nl: 'Honing & zeezout' },
      colors: { body: '#e0a00c', strip: '#6a4208', band: '#fff0b0', name: '#5a3806' },
      note: { en: 'golden honey, a pinch of salt', nl: 'goudgele honing, een snufje zout' },
      tagline: { en: 'Golden · Salty · Crunchy', nl: 'Goudgeel · Zout · Knapperig' },
      allergen: { en: 'Contains tree nuts (pecans).', nl: 'Bevat noten (pecannoten).' },
      img: { front: 'assets/honey-sea-salt-pouch-front.webp', back: 'assets/honey-sea-salt-pouch-back.webp', tube: 'assets/honey-sea-salt-tube.webp', label: 'assets/honey-sea-salt-tube-label.webp' },
      price: { pouch: 599, tube: 1295 } },
  ],

  /* Shown on every product. Ingredients and traces are not known yet. */
  productInfo: {
    allergen: { en: 'Contains tree nuts (pecans).', nl: 'Bevat noten (pecannoten).' },
    ingredients: '[TBD]',
    traces: '[TBD]',
    storage: '[TBD]',
    shelfLife: '[TBD]',
    // per 100 g; values not supplied yet
    nutrition: [
      ['energy', '[TBD] kJ / [TBD] kcal'], ['fat', '[TBD] g'], ['saturates', '[TBD] g'],
      ['carbs', '[TBD] g'], ['sugars', '[TBD] g'], ['fibre', '[TBD] g'], ['protein', '[TBD] g'], ['salt', '[TBD] g'],
    ],
  },

  /* Subscription: a fresh pack (in the chosen format) every month. Discount is a placeholder. */
  subscription: { enabled: true, discountPercent: 10 /* [TBD] */ },

  /* ---------------- Bundles (100 g pouches) ------------------------ */
  bundles: [
    { id: 'tasting-box', kind: 'tasting',
      name: { en: 'The tasting box', nl: 'De proefdoos' },
      blurb: { en: 'One pouch of every flavour. Eight colours, eight moods, one table.', nl: 'Eén zak van elke smaak. Acht kleuren, acht stemmingen, één tafel.' },
      contents: 'all',            // every flavour above
      priceCents: 4395 },         // [TBD] placeholder (8 × €5,99 = €47,92)
    { id: 'wine-night', kind: 'wine',
      name: { en: 'Wine night box', nl: 'Wijnavond-box' },
      blurb: { en: 'Three flavours picked to sit next to a glass of red, a glass of white and something sweet, with a pairing card.', nl: 'Drie smaken naast een glas rood, een glas wit en iets zoets, met een pairingkaart.' },
      contents: ['chocolate-sea-salt', 'salted-caramel', 'honey-sea-salt'],
      priceCents: 1649 },         // [TBD] placeholder (3 × €5,99 = €17,97)
    { id: 'gift-box', kind: 'gift',
      name: { en: 'The gift box', nl: 'De cadeaudoos' },
      blurb: { en: 'Four pouches in a box, with a handwritten-style card carrying your own message.', nl: 'Vier zakken in een doos, met een kaartje met jouw eigen boodschap.' },
      contents: ['salted-caramel', 'chocolate', 'caramel', 'cinnamon-sugar'],
      giftMessage: true,
      priceCents: 2495 },         // [TBD] placeholder (4 × €5,99 = €23,96, plus the box)
  ],

  /* ---------------- Flavour finder (the quiz in the "nut" section) ----
     Each answer gives points to flavours (by id). The flavour with the
     most points wins; ties go to the one listed first in `flavours`.
     `you` is the line shown with the result.                           */
  quiz: {
    questions: [
      { q: { en: 'Sweet or salty?', nl: 'Zoet of zout?' }, options: [
        { t: { en: 'Sweet tooth', nl: 'Zoetekauw' }, pts: { caramel: 2, 'doce-de-leite': 2, 'cinnamon-sugar': 2, chocolate: 1, 'coffee-chocolate': 1 } },
        { t: { en: 'A bit of both', nl: 'Een beetje van allebei' }, pts: { 'salted-caramel': 2, 'honey-sea-salt': 2, 'chocolate-sea-salt': 2 } },
        { t: { en: 'Salty, always', nl: 'Zout, altijd' }, pts: { 'chocolate-sea-salt': 2, 'salted-caramel': 1, 'honey-sea-salt': 1 } },
      ] },
      { q: { en: 'Which texture do you love?', nl: 'Van welke textuur houd je?' }, options: [
        { t: { en: 'A glassy crunch', nl: 'Een glazen krak' }, pts: { 'salted-caramel': 2, caramel: 2 } },
        { t: { en: 'Smooth and rich', nl: 'Zacht en vol' }, pts: { chocolate: 2, 'chocolate-sea-salt': 1, 'coffee-chocolate': 1, 'doce-de-leite': 1 } },
        { t: { en: 'A sugary crust', nl: 'Een suikerkorstje' }, pts: { 'cinnamon-sugar': 3 } },
        { t: { en: 'Light, so the nut comes through', nl: 'Licht, zodat je de noot proeft' }, pts: { 'honey-sea-salt': 2, 'doce-de-leite': 1 } },
      ] },
      { q: { en: 'When do you reach for a snack?', nl: 'Wanneer pak je iets lekkers?' }, options: [
        { t: { en: 'With my morning coffee', nl: 'Bij mijn ochtendkoffie' }, pts: { 'coffee-chocolate': 3, 'cinnamon-sugar': 1 } },
        { t: { en: 'With wine or cheese', nl: 'Bij wijn of kaas' }, pts: { 'chocolate-sea-salt': 1, 'salted-caramel': 1, 'honey-sea-salt': 1, chocolate: 1 } },
        { t: { en: 'An afternoon treat', nl: 'Als middagtraktatie' }, pts: { 'doce-de-leite': 2, caramel: 1, 'cinnamon-sugar': 1 } },
        { t: { en: 'Film night on the sofa', nl: 'Filmavond op de bank' }, pts: { 'salted-caramel': 2, chocolate: 1 } },
      ] },
      { q: { en: 'Which flavour pulls you in?', nl: 'Welke smaak trekt je aan?' }, options: [
        { t: { en: 'Toffee and caramel', nl: 'Toffee en karamel' }, pts: { caramel: 2, 'salted-caramel': 2 } },
        { t: { en: 'Dark and a little bitter', nl: 'Donker en een beetje bitter' }, pts: { chocolate: 2, 'coffee-chocolate': 2, 'chocolate-sea-salt': 1 } },
        { t: { en: 'Warm spice', nl: 'Warme specerijen' }, pts: { 'cinnamon-sugar': 3 } },
        { t: { en: 'Golden honey', nl: 'Goudgele honing' }, pts: { 'honey-sea-salt': 3 } },
        { t: { en: 'Soft and milky', nl: 'Zacht en romig' }, pts: { 'doce-de-leite': 3 } },
      ] },
    ],
    you: {
      'salted-caramel': { en: 'Sweet and salty at once, with a glassy crunch. Made for film nights and a glass of tawny.', nl: 'Zoet en zout tegelijk, met een glazen krak. Gemaakt voor filmavonden en een glas tawny.' },
      chocolate: { en: 'Deep, dark and rich. You like your treats grown-up.', nl: 'Diep, donker en vol. Jij houdt van volwassen lekkers.' },
      'chocolate-sea-salt': { en: 'Dark chocolate with a pinch of salt: rich, but never too sweet.', nl: 'Pure chocolade met een snufje zout: vol, maar nooit te zoet.' },
      caramel: { en: 'Golden caramel and a crisp shell. A classic, done properly.', nl: 'Goudkleurige karamel en een knapperig laagje. Een klassieker, goed gedaan.' },
      'doce-de-leite': { en: 'Soft, milky and warm, like Brazil’s favourite caramel.', nl: 'Zacht, romig en warm, zoals Brazilië’s favoriete karamel.' },
      'cinnamon-sugar': { en: 'Warm cinnamon and a sugary crust. Cosy in a pouch.', nl: 'Warme kaneel en een suikerkorstje. Gezelligheid in een zakje.' },
      'coffee-chocolate': { en: 'Coffee and dark chocolate. Your morning, in a nut.', nl: 'Koffie en pure chocolade. Je ochtend, in een noot.' },
      'honey-sea-salt': { en: 'Golden honey with a little sea salt. Bright, light and easy to love.', nl: 'Goudgele honing met een beetje zeezout. Fris, licht en makkelijk om van te houden.' },
    },
  },

  /* ---------------- Pairing ritual --------------------------------
     For each wine or cheese: the flavour it suggests and why.
     These are our suggestions, to be confirmed at a real tasting [TBD]. */
  pairings: {
    wine: [
      { id: 'tawny', name: { en: 'Tawny port', nl: 'Tawny port' }, color: '#9b4a1f', pick: 'salted-caramel',
        why: { en: 'Tawny already tastes of nuts and toffee. The sea salt in the caramel cuts through the sweetness so both stay bright.', nl: 'Tawny smaakt al naar noten en toffee. Het zeezout in de karamel snijdt door de zoetheid, zodat beide fris blijven.' } },
      { id: 'malbec', name: { en: 'Malbec', nl: 'Malbec' }, color: '#5b1a2e', pick: 'chocolate',
        why: { en: 'Dark fruit and soft tannins want something bitter and rich next to them. Dark chocolate is that.', nl: 'Donker fruit en zachte tannines vragen om iets bitters en vols. Pure chocolade is dat.' } },
      { id: 'bubbles', name: { en: 'Champagne or cava', nl: 'Champagne of cava' }, color: '#e9d48a', pick: 'honey-sea-salt',
        why: { en: 'Bubbles love salt. Honey rounds off the acidity so the glass feels softer.', nl: 'Bubbels houden van zout. Honing rondt de zuren af, waardoor het glas zachter voelt.' } },
      { id: 'riesling', name: { en: 'Off-dry riesling', nl: 'Halfdroge riesling' }, color: '#d8d26b', pick: 'cinnamon-sugar',
        why: { en: 'A little sweetness and a lot of acidity: the warm spice of cinnamon gives the wine something to lean on.', nl: 'Een beetje zoet en veel zuur: de warme kaneel geeft de wijn iets om op te leunen.' } },
      { id: 'px', name: { en: 'Pedro Ximénez sherry', nl: 'Pedro Ximénez-sherry' }, color: '#3a1a10', pick: 'coffee-chocolate',
        why: { en: 'Raisins, coffee and dark sugar in the glass. Coffee and chocolate on the nut, so they finish each other’s sentences.', nl: 'Rozijnen, koffie en donkere suiker in het glas. Koffie en chocolade op de noot: ze maken elkaars zinnen af.' } },
      { id: 'chardonnay', name: { en: 'Oaked chardonnay', nl: 'Chardonnay op hout' }, color: '#e7c35a', pick: 'caramel',
        why: { en: 'Butter and vanilla from the oak meet golden caramel halfway.', nl: 'Boter en vanille van het hout ontmoeten goudkleurige karamel halverwege.' } },
    ],
    cheese: [
      { id: 'oude-kaas', name: { en: 'Aged Gouda (oude kaas)', nl: 'Oude Goudse kaas' }, color: '#e9b44c', pick: 'caramel',
        why: { en: 'Old Gouda already has caramel crystals of its own. A glassy caramel shell makes that taste louder.', nl: 'Oude kaas heeft zelf al karamelachtige kristallen. Een glazen karamellaagje maakt die smaak luider.' } },
      { id: 'blue', name: { en: 'Blue cheese', nl: 'Blauwe kaas' }, color: '#9fb3c8', pick: 'honey-sea-salt',
        why: { en: 'Blue cheese and honey is a classic for a reason: sweet calms the sharp, salt keeps it awake.', nl: 'Blauwe kaas met honing is niet voor niets een klassieker: zoet tempert het scherpe, zout houdt het wakker.' } },
      { id: 'brie', name: { en: 'Brie or camembert', nl: 'Brie of camembert' }, color: '#f3ead2', pick: 'doce-de-leite',
        why: { en: 'Soft, milky cheese with milky caramel. Gentle on gentle, with the crunch of the pecan in between.', nl: 'Zachte, melkachtige kaas met melkkaramel. Zacht op zacht, met de knapperige pecan ertussen.' } },
      { id: 'goat', name: { en: 'Fresh goat cheese', nl: 'Verse geitenkaas' }, color: '#f7f4ea', pick: 'cinnamon-sugar',
        why: { en: 'Tangy goat cheese needs warmth. Cinnamon sugar brings it, like a dessert you can serve before dinner.', nl: 'Frisse geitenkaas heeft warmte nodig. Kaneelsuiker brengt die, als een dessert dat je voor het eten serveert.' } },
      { id: 'manchego', name: { en: 'Manchego', nl: 'Manchego' }, color: '#e8d08a', pick: 'chocolate-sea-salt',
        why: { en: 'Nutty, firm and a little salty. Dark chocolate and sea salt bring depth without hiding the cheese.', nl: 'Nootachtig, stevig en een beetje zout. Pure chocolade met zeezout geeft diepte zonder de kaas te verbergen.' } },
      { id: 'parmigiano', name: { en: 'Parmigiano Reggiano', nl: 'Parmigiano Reggiano' }, color: '#f0d27a', pick: 'salted-caramel',
        why: { en: 'Big savoury crystals and a sweet-salty nut: the same contrast, from two directions.', nl: 'Grote hartige kristallen en een zoetzoute noot: hetzelfde contrast, van twee kanten.' } },
    ],
  },
};
