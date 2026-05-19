import { useEffect, useRef, useState } from "react";
import { ReservationOverlay } from "./ReservationOverlay";

type Language = "en" | "pt";

const navItems = [
  { key: "about", href: "#about" },
  { key: "instagram", href: "#instagram" },
  { key: "visit", href: "#visit" },
] as const;

const galleryImages = [
  "/images/gig-brunch-table.jpg",
  "/images/gig-coffee-matcha.jpg",
  "/images/gig-pancakes.jpg",
  "/images/gig-surf-morning.jpg",
];

const menuEN = {
  setMenu: [
    { name: "Entry + Main + Dessert", price: "14.45€" },
    { name: "Main + Dessert", price: "17.95€" },
  ],
  allDayBrunch: {
    paraUm: { label: "For One", price: "17.95€" },
    paraDois: { label: "For Two", price: "33.00€" },
  },
  allDayDishes: [
    { name: "Ovo Beneció Salmão", desc: "2 slices of whole grain toast with olive oil and eggs, goat cheese, sautéed spinach, smoked salmon, toasted almonds and homemade hummus", price: "8.50€", extras: [{ name: "Add smoked salmon", price: "+ 1.95€" }, { name: "Add salmon per tapa", price: "+ 1.00€" }] },
    { name: "Ovo Vegio", desc: "Brioche, beans, goat cheese, eggs with toasted vegetables, avocado and toasted almonds", price: "7.50€", extras: [{ name: "Add goat cheese", price: "+ 0.80€" }, { name: "Add avocado per tapa", price: "+ 0.80€" }, { name: "Add salmon per tapa", price: "+ 1.00€" }] },
    { name: "Omelete", desc: "With omelette or egg, choose 2 ingredients: toasted cherry tomato, fried cherry, toasted almonds, sautéed mushrooms, goat cheese, avocado, whole grain toast, spinach, pesto", price: "6.95€", extras: [{ name: "Add extra goat cheese", price: "+ 1.00€" }, { name: "Add set salad of the day", price: "+ 1.50€" }] },
    { name: "Crostini de Abacate", desc: "2 slices of whole grain toast with avocado and eggs, goat cheese, toasted cherry, rosemary, seeds and homemade mayonnaise", price: "8.60€", extras: [{ name: "Add salmon with whole grain", price: "+ 2.80€" }, { name: "Add whole grain bread", price: "+ 1.35€" }, { name: "Add extra per tapa", price: "+ 1.00€" }] },
    { name: "Crostini Cogumelos", desc: "2 slices of whole grain toast with goat cheese and seasonal mushrooms sautéed in olive oil + extra with homemade mayonnaise", price: "7.15€", extras: [{ name: "Add extra goat cheese", price: "+ 0.80€" }, { name: "Add extra per tapa", price: "+ 1.00€" }, { name: "Add extra mayonnaise", price: "+ 1.50€" }] },
  ],
  soups: [
    { name: "Salada do Pomar", desc: "Mix of green leaves, honey, goji cubes, cucumber, radish, raw carrot, feta cheese, walnuts and avocado with mozzarella or cashew butter", price: "8.00€", extras: [{ name: "Add protein", price: "+ 2.50€" }, { name: "Add fresh cheese", price: "+ 2.00€" }] },
    { name: "Taça Happy", desc: "Mix of quinoa, falafel, roasted pumpkin, hummus, roasted mushrooms, sautéed spinach, walnuts, cherry tomato, mozzarella and micro vegetables", price: "8.25€", extras: [{ name: "Add whole tuna", price: "+ 1.50€" }, { name: "Add fresh cheese", price: "+ 2.50€" }] },
    { name: "Taça de Açaí", desc: "Greek yogurt light 100%, red fruits and banana with granola, fruit, poppy seeds and honey", price: "7.60€", extras: [{ name: "Add avocado and/or salmon", price: "+ 1.00€" }] },
    { name: "Taça de Iogurte", desc: "Greek yogurt light with chia, forest fruits, cherry, fruit, poppy seeds and chia", price: "6.95€", extras: [{ name: "Add avocado and/or salmon", price: "+ 1.00€" }] },
    { name: "Panquecas Fruity", desc: "Avocado, mango, banana and rice ice cream pancakes", price: "5.25€", extras: [{ name: "Add mango and/or peanut", price: "+ 1.00€" }, { name: "Add crunchy granola", price: "+ 0.75€" }] },
    { name: "Panquecas Vogi", desc: "Greek yogurt light, forest fruits and rice ice cream pancakes", price: "5.25€", extras: [{ name: "Add crunchy granola", price: "+ 0.75€" }] },
    { name: "Panquecas Choco Nut", desc: "Cocoa pancakes with cocoa ganache (chocolate and passion fruit or peanut)", price: "6.55€", extras: [{ name: "Add extra raspberry or strawberry", price: "+ 1.20€" }] },
  ],
  infusions: [
    { name: "Basil", desc: "Lemon balm, lemongrass, ginger and rice ice cream", price: "2.65€" },
    { name: "Passion", desc: "Gelatin, lemongrass, honey and rice ice cream", price: "2.95€" },
    { name: "Matcha", desc: "Gelatin", price: "2.95€" },
    { name: "Inverno", desc: "Linden, rosehip, lemongrass, orange pulp and rice ice cream", price: "1.95€" },
    { name: "Ali", desc: "Honey and ginger", price: "1.65€" },
    { name: "Teaquis", desc: "Chamomile, mixed cacao and licorice Snooze Rooibos", price: "1.80€" },
    { name: "Variados", desc: "English Breakfast · Green Tea · Lemon verbena and ginger", price: "1.50€" },
  ],
  juices: [
    { name: "Heart Beet", desc: "Carrot, beetroot, orange, red cabbage, lemon, turmeric", size: [{ label: "Small", price: "4.35€" }, { label: "Large", price: "6.15€" }] },
    { name: "Açaí", desc: "Apple, orange, banana, red fruits", size: [{ label: "Small", price: "3.75€" }, { label: "Large", price: "5.55€" }] },
    { name: "Yellowish", desc: "Carrot, lemon and orange, Ginger", size: [{ label: "Small", price: "3.95€" }, { label: "Large", price: "5.75€" }] },
    { name: "Energy Boost", desc: "Spinach, apple, orange, ginger", size: [{ label: "Small", price: "4.25€" }, { label: "Large", price: "6.05€" }] },
    { name: "Juice Bottle 1L", desc: "Any juice from above", price: "10.95€" },
  ],
  coffee: [
    { name: "Espresso", price: "1.00€" },
    { name: "Double Espresso", price: "2.00€" },
    { name: "Abatanado", price: "1.20€" },
    { name: "Galão", price: "1.45€" },
    { name: "Cappuccino", price: "1.85€" },
    { name: "Flat White", price: "2.25€" },
    { name: "Matcha Latte", price: "2.95€" },
    { name: "Hot Chocolate", price: "2.85€" },
    { name: "Turmeric Milk", price: "3.15€" },
  ],
  alcohol: [
    { name: "Red Wine", desc: "Casa Conca Alentejo 13.5° / Foguete Reserva Douro 14°", price: { copa: "3.25€", taca: "5.95€", garrafa: "14.95€" } },
    { name: "White Wine", desc: "Fogace Reserva Douro 13°", price: { copa: "3.25€", taca: "4.55€", garrafa: "14.95€" } },
    { name: "Gin Matcha", desc: "Gin with matcha note and passion fruit", price: "7.50€" },
    { name: "Expresso Martini", desc: "Vodka, kahlua and coffee", price: "5.90€" },
    { name: "Sparkling Water", price: "1.25€" },
    { name: "Whole Earth Bio", desc: "ginger / lemon", price: "2.65€" },
    { name: "Draft Beer", desc: "Boh Cerve · Pilsner · 4.8%", price: "3.20€" },
  ],
};

const menuPT = {
  setMenu: [
    { name: "Entrada + Principal + Sobremesa", price: "14,45€" },
    { name: "Principal + Sobremesa", price: "17,95€" },
  ],
  allDayBrunch: {
    paraUm: { label: "Para Um", price: "17,95€" },
    paraDois: { label: "Para Dois", price: "33,00€" },
  },
  allDayDishes: [
    { name: "Ovo Beneció Salmão", desc: "2 fatias de pão de centeio torradas com azeite e ovos, caprinos, espinafres salteados, salmão fumado, amêndoas tostadas e húmus caseiro", price: "8,50€", extras: [{ name: "Acresce salmão fumado", price: "+ 1,95€" }, { name: "Acresce salmão por tapas", price: "+ 1,00€" }] },
    { name: "Ovo Vegio", desc: "Brioche, cova-fir, feijão, caprinos, ovos com toasts salteados, abacate com pão, água e amêndoas caseiras", price: "7,50€", extras: [{ name: "Acresce caprinos", price: "+ 0,80€" }, { name: "Acresce abacate por tapas", price: "+ 0,80€" }, { name: "Acresce salmão por tapas", price: "+ 1,00€" }] },
    { name: "Omelete", desc: "Com omelete ou ovo, escolha 2 ingredientes: tomate cherry tostado, cereja frita, amêndoas tostadas, cogumelos salteados, caprinos, abacate, torrado caseiro, espinafres, pesto", price: "6,95€", extras: [{ name: "Acresce caprinos extra", price: "+ 1,00€" }, { name: "Acresce set salada do dia", price: "+ 1,50€" }] },
    { name: "Crostini de Abacate", desc: "2 fatias de pão de centeio torradas com abacate e ovos, caprinos e cereja torrada, rosmaninho, sementes e maionese caseira", price: "8,60€", extras: [{ name: "Acresce salmão com centeio", price: "+ 2,80€" }, { name: "Acresce pão integral", price: "+ 1,35€" }, { name: "Acresce extra por tapas", price: "+ 1,00€" }] },
    { name: "Crostini Cogumelos", desc: "2 fatias de pão de centeio torradas com caprinos e cogumelos da época salteados em azeite + extra com maionese caseira", price: "7,15€", extras: [{ name: "Acresce extra caprinos", price: "+ 0,80€" }, { name: "Acresce extra por tapas", price: "+ 1,00€" }, { name: "Acresce extra maionese", price: "+ 1,50€" }] },
  ],
  soups: [
    { name: "Salada do Pomar", desc: "Mistura de folhas verdes, mel, cubos de goji, pepino, rabanete, cenoura crua, queijo feta, nozes e abacate com queijo mozzarella ou manteiga de caju", price: "8,00€", extras: [{ name: "Adicionar proteína", price: "+ 2,50€" }, { name: "Adicionar queijo fresco", price: "+ 2,00€" }] },
    { name: "Taça Happy", desc: "Mistura de quinoa, falafel, abóbora assada, húmus, cogumelos assados, espinafres salteados, nozes, tomate cherry, mozzarella e micro vegetais", price: "8,25€", extras: [{ name: "Adicionar whole tuna", price: "+ 1,50€" }, { name: "Adicionar queijo fresco", price: "+ 2,50€" }] },
    { name: "Taça de Açaí", desc: "Iogurte grego light 100%, frutos vermelhos e banana com granola, fruta, sementes de papoila e mel", price: "7,60€", extras: [{ name: "Adicionar abacate e/ou salmão", price: "+ 1,00€" }] },
    { name: "Taça de Iogurte", desc: "Iogurte grego light com chia, frutos de floresta, cereja, fruta, sementes de papoila e chia", price: "6,95€", extras: [{ name: "Adicionar abacate e/ou salmão", price: "+ 1,00€" }] },
    { name: "Panquecas Fruity", desc: "Panquecas de abacate, manga, banana e gelado de arroz", price: "5,25€", extras: [{ name: "Adicionar manga e/ou amendoim", price: "+ 1,00€" }, { name: "Adicionar granola casca", price: "+ 0,75€" }] },
    { name: "Panquecas Vogi", desc: "Panquecas de iogurte, iogurte grego light, frutos de floresta e gelado de arroz", price: "5,25€", extras: [{ name: "Adicionar granola casca", price: "+ 0,75€" }] },
    { name: "Panquecas Choco Nut", desc: "Panquecas de cacau, servidas com ganache de cacau (chocolate e maracujá ou amendoim)", price: "6,55€", extras: [{ name: "Adicionar extra framboesa ou morangos", price: "+ 1,20€" }] },
  ],
  infusions: [
    { name: "Basil", desc: "Melissa de limão, capim-limão, gengibre e gelado de arroz", price: "2,65€" },
    { name: "Passion", desc: "Gelatina, capim-limão, mel e gelado de arroz", price: "2,95€" },
    { name: "Matcha", desc: "Gelatina", price: "2,95€" },
    { name: "Inverno", desc: "Tília, rosa mosqueta, capim-limão, polpa de laranja e gelado de arroz", price: "1,95€" },
    { name: "Ali", desc: "Mel e gengibre", price: "1,65€" },
    { name: "Teaquis", desc: "Camomila, cacau misto e alcaçuz Snooze Rooibos", price: "1,80€" },
    { name: "Variados", desc: "English Breakfast · Chá Verde · Erva-príncipe e gengibre", price: "1,50€" },
  ],
  juices: [
    { name: "Heart Beet", desc: "Cenoura, beterraba, laranja, repolho roxo, limão, curcuma", size: [{ label: "Peq", price: "4,35€" }, { label: "Grande", price: "6,15€" }] },
    { name: "Açaí", desc: "Maçã, laranja, banana, frutos vermelhos", size: [{ label: "Peq", price: "3,75€" }, { label: "Grande", price: "5,55€" }] },
    { name: "Yellowish", desc: "Cenoura, limão e laranja, Ginger", size: [{ label: "Peq", price: "3,95€" }, { label: "Grande", price: "5,75€" }] },
    { name: "Energy Boost", desc: "Espinafres, maçã, laranja, gengibre", size: [{ label: "Peq", price: "4,25€" }, { label: "Grande", price: "6,05€" }] },
    { name: "Garrafa de Sumo 1L", desc: "Qualquer sumo de cima", price: "10,95€" },
  ],
  coffee: [
    { name: "Espresso", price: "1,00€" },
    { name: "Duplo", price: "2,00€" },
    { name: "Abatanado", price: "1,20€" },
    { name: "Galão", price: "1,45€" },
    { name: "Cappuccino", price: "1,85€" },
    { name: "Flat White", price: "2,25€" },
    { name: "Matcha Latte", price: "2,95€" },
    { name: "Cacau Quente", price: "2,85€" },
    { name: "Turmeric Milk", price: "3,15€" },
  ],
  alcohol: [
    { name: "Tinto", desc: "Casa Conca Alentejo 13,5° / Foguete Reserva Douro 14°", price: { copa: "3,25€", taca: "5,95€", garrafa: "14,95€" } },
    { name: "Branco", desc: "Fogace Reserva Douro 13°", price: { copa: "3,25€", taca: "4,55€", garrafa: "14,95€" } },
    { name: "Gin Matcha", desc: "Gin com nota de matcha e maracuja", price: "7,50€" },
    { name: "Expresso Martini", desc: "Vodka, kahlua e café", price: "5,90€" },
    { name: "Água com gás", price: "1,25€" },
    { name: "Whole Earth Bio", desc: "gengibre / limão", price: "2,65€" },
    { name: "Cerveja Draft", desc: "Boh Cerve · Pilsner · 4,8%", price: "3,20€" },
  ],
};

const copy = {
  en: {
    seo: {
      title: "GiG - Green is Good | Brunch & Coffee in Ericeira",
      description: "Fresh brunch, specialty coffee, matcha and sunny surf-town vibes in Ericeira, Portugal. Visit GiG - Green is Good.",
    },
    nav: { about: "About", instagram: "Instagram", visit: "Visit", follow: "Follow" },
    hero: {
      kicker: "Ericeira brunch house",
      title: "GiG",
      headline: "Green is Good. Brunch, coffee and good vibes in Ericeira.",
      text: "Fresh plates, specialty coffee and a sunny surf-town mood, served daily by the sea.",
      primary: "See menu",
      secondary: "Reserve a table",
    },
    about: {
      kicker: "About GiG",
      title: "A sunny table before or after the ocean.",
      paragraphs: [
        "GiG - Green is Good is a relaxed brunch spot shaped by fresh plates, good coffee and the rhythm of Ericeira. It feels local, easy and bright, the kind of place where mornings can stretch a little longer.",
        "Think colourful food, matcha, pancakes, eggs, toasts and a beach-town mood that fits right between a surf session and a walk through the village.",
      ],
    },
    menuOverlay: {
      title: "Our Menu",
      closeLabel: "Close",
      setMenuKicker: "Set Menu",
      allDayBrunchKicker: "All Day Brunch",
      allDayDishesKicker: "All Day",
      soupsKicker: "Soups & Bowls",
      drinksKicker: "Drinks",
      infusionsKicker: "Infusions",
      juicesKicker: "Natural Juices",
      coffeeKicker: "Coffee",
      alcoholKicker: "Cocktails & Drinks",
    },
    menuCta: {
      kicker: "Our menu",
      title: "Fresh brunch, coffee and lots of green.",
      text: "Everything made with fresh, seasonal ingredients and a lot of colour.",
    },
    atmosphere: {
      kicker: "Atmosphere",
      title: "Colourful plates, warm light and surf-town energy.",
      alts: ["Brunch plates on a cafe table", "Specialty coffee and matcha", "A stack of pancakes with berries", "Surfers walking through a coastal street"],
    },
    love: {
      kicker: "Why people love GiG",
      title: "Simple reasons to come back.",
      points: ["Fresh colourful brunch", "Specialty coffee and matcha", "Sunny Ericeira surf-town mood"],
    },
    instagram: {
      kicker: "Instagram",
      title: "Follow the good stuff.",
      text: "Keep up with daily plates, coffee moments, surf-town light and the latest from GiG Ericeira.",
      galleryLabel: "Instagram style gallery",
      galleryAlt: "GiG Instagram placeholder",
    },
    visit: {
      kicker: "Visit us",
      title: "Find your table in Ericeira.",
      placeLabel: "Place",
      hoursLabel: "Hours",
      hoursTitle: "Mon – Sun: 10:00 – 16:00",
      hoursText: "Coffee and snacks available all day.",
      maps: "Open in Google Maps",
      contact: "Contact",
    },
    footer: { line: "Green is Good. Brunch is better by the sea." },
    cookies: {
      text: "We use cookies to improve your experience. By continuing to browse, you agree to our use of cookies in accordance with GDPR.",
      accept: "Got it",
      decline: "No thanks",
    },
  },
  pt: {
    seo: {
      title: "GiG - Green is Good | Brunch e Café na Ericeira",
      description: "Brunch fresco, café de especialidade, matcha e vibe solar de surf na Ericeira, Portugal. Visita o GiG - Green is Good.",
    },
    nav: { about: "Sobre", instagram: "Instagram", visit: "Visitar", follow: "Seguir" },
    hero: {
      kicker: "Brunch house na Ericeira",
      title: "GiG",
      headline: "Green is Good. Brunch, café e good vibes na Ericeira.",
      text: "Pratos frescos, café de especialidade e uma vibe solar de surf town, todos os dias junto ao mar.",
      primary: "Ver menu",
      secondary: "Reservar mesa",
    },
    about: {
      kicker: "Sobre o GiG",
      title: "Uma mesa ao sol antes ou depois do mar.",
      paragraphs: [
        "O GiG - Green is Good é um brunch spot descontraído, feito de pratos frescos, bom café e do ritmo da Ericeira. Tem uma energia local, leve e luminosa, daquelas onde as manhãs podem durar mais um pouco.",
        "Pensa em comida colorida, matcha, panquecas, ovos, tostas e uma vibe de praia que encaixa entre uma surf session e um passeio pela vila.",
      ],
    },
    menuOverlay: {
      title: "O Nosso Menu",
      closeLabel: "Fechar",
      setMenuKicker: "Set Menu",
      allDayBrunchKicker: "All Day Brunch",
      allDayDishesKicker: "All Day",
      soupsKicker: "Sopas & Taças",
      drinksKicker: "Bebidas",
      infusionsKicker: "Infusões",
      juicesKicker: "Sumos Naturais",
      coffeeKicker: "Café",
      alcoholKicker: "Cocktails & Bebidas",
    },
    menuCta: {
      kicker: "O nosso menu",
      title: "Brunch fresco, café e muito verde.",
      text: "Tudo feito com ingredientes frescos, sazonais e com muita cor.",
    },
    atmosphere: {
      kicker: "Atmosfera",
      title: "Pratos coloridos, luz quente e energia de surf town.",
      alts: ["Pratos de brunch coloridos", "Café de especialidade e matcha", "Stack de panquecas com frutos vermelhos", "Surfistas numa rua costeira"],
    },
    love: {
      kicker: "Porque voltam ao GiG",
      title: "Razões simples para voltar.",
      points: ["Brunch fresco e colorido", "Café de especialidade e matcha", "Mood solar de surf town na Ericeira"],
    },
    instagram: {
      kicker: "Instagram",
      title: "Segue as coisas boas.",
      text: "Acompanha os pratos do dia, momentos de café, luz de surf town e as novidades do GiG Ericeira.",
      galleryLabel: "Galeria inspirada no Instagram",
      galleryAlt: "Imagem placeholder do Instagram do GiG",
    },
    visit: {
      kicker: "Visita-nos",
      title: "Encontra a tua mesa na Ericeira.",
      placeLabel: "Local",
      hoursLabel: "Horário",
      hoursTitle: "Seg a Dom: 10:00 – 16:00",
      hoursText: "Café e snacks disponíveis todo o dia.",
      maps: "Abrir no Google Maps",
      contact: "Contactar",
    },
    footer: { line: "Green is Good. Brunch sabe melhor junto ao mar." },
    cookies: {
      text: "Usamos cookies para melhorar a tua experiência. Ao continuares a navegar, aceitas o uso de cookies de acordo com o RGPD.",
      accept: "Entendido",
      decline: "Não, obrigado",
    },
  },
};

// ══════════════════════════════════════════════
// SITE LOGIN
// ══════════════════════════════════════════════
function SiteLogin({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === "admin" && pass === "Yanka.2003") {
      onLogin();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#18352a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-6xl text-[#fff8ea] tracking-[-0.04em]">GiG</h1>
          <p className="text-[#6f8f72] mt-2 text-sm font-semibold uppercase tracking-[0.18em]">Green is Good</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-[#f7f0e3] rounded-3xl shadow-2xl p-8 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              Credenciais incorrectas.
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[#6f8f72] mb-1.5">Utilizador</label>
            <input
              type="text"
              required
              value={user}
              onChange={(e) => { setUser(e.target.value); setError(false); }}
              className="w-full rounded-xl border border-[#18352a]/18 px-4 py-3 text-sm outline-none focus:border-[#6f8f72] focus:ring-1 focus:ring-[#6f8f72]/40 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[#6f8f72] mb-1.5">Password</label>
            <input
              type="password"
              required
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(false); }}
              className="w-full rounded-xl border border-[#18352a]/18 px-4 py-3 text-sm outline-none focus:border-[#6f8f72] focus:ring-1 focus:ring-[#6f8f72]/40 bg-white"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-[#18352a] py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-[#fff8ea] transition hover:bg-[#6f8f72]"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// COOKIE BANNER
// ══════════════════════════════════════════════
function CookieBanner({ lang, onAccept, onDecline }: { lang: Language; onAccept: () => void; onDecline: () => void }) {
  const t = copy[lang].cookies;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 sm:p-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl shadow-2xl" style={{ background: "#1a3828" }}>
        <div className="relative flex flex-col sm:flex-row items-center">
          <div className="w-full sm:w-[420px] shrink-0 h-[160px] sm:h-[140px] overflow-hidden">
            <img src="/images/banner-cookies.png" alt="GiG Ericeira car" className="h-full w-full object-cover object-left" />
          </div>
          <div className="flex flex-1 flex-col gap-4 px-6 py-5 sm:py-0">
            <p className="text-sm leading-6 text-[#fff8ea]/85">{t.text}</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={onAccept} className="rounded-full bg-[#f7f0e3] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#18352a] transition hover:bg-[#dbe7c6]">
                {t.accept}
              </button>
              <button onClick={onDecline} className="rounded-full border border-[#f7f0e3]/30 px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#fff8ea]/70 transition hover:border-[#f7f0e3]/60 hover:text-[#fff8ea]">
                {t.decline}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// MENU OVERLAY
// ══════════════════════════════════════════════
function MenuOverlay({ isOpen, onClose, lang }: { isOpen: boolean; onClose: () => void; lang: Language }) {
  const t = copy[lang].menuOverlay;
  const menu = lang === "en" ? menuEN : menuPT;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderSimpleList = (items: { name: string; desc?: string; price: string }[]) => (
    <div className="divide-y divide-[#18352a]/08">
      {items.map((item) => (
        <div key={item.name} className="flex items-baseline justify-between py-1.5">
          <div>
            <span className="text-sm tracking-tight">{item.name}</span>
            {item.desc && <span className="ml-2 text-xs text-[#18352a]/40">{item.desc}</span>}
          </div>
          <span className="shrink-0 font-semibold">{item.price}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true" aria-label={t.title}>
      <div className="absolute inset-0 bg-[#18352a]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 h-full w-full max-w-lg overflow-y-auto bg-[#f7f0e3] shadow-2xl menu-panel">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#18352a]/12 bg-[#f7f0e3] px-6 py-4">
          <h2 className="font-serif text-2xl tracking-[-0.04em] text-[#18352a]">{t.title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[#18352a]/60 transition hover:bg-[#18352a]/10 hover:text-[#18352a]" aria-label={t.closeLabel}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 pb-24 pt-6">
          <section className="mb-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#6f8f72]">{t.setMenuKicker}</p>
            {menu.setMenu.map((item) => (
              <div key={item.name} className="flex items-baseline justify-between py-2">
                <span className="text-base tracking-tight">{item.name}</span>
                <span className="font-semibold">{item.price}</span>
              </div>
            ))}
          </section>
          <section className="mb-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#6f8f72]">{t.allDayBrunchKicker}</p>
            <div className="mb-2 flex flex-wrap gap-6">
              <div className="flex items-baseline justify-between gap-6">
                <span className="text-base tracking-tight">{menu.allDayBrunch.paraUm.label}</span>
                <span className="font-semibold">{menu.allDayBrunch.paraUm.price}</span>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <span className="text-base tracking-tight">{menu.allDayBrunch.paraDois.label}</span>
                <span className="font-semibold">{menu.allDayBrunch.paraDois.price}</span>
              </div>
            </div>
          </section>
          <section className="mb-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#6f8f72]">{t.allDayDishesKicker}</p>
            <div className="divide-y divide-[#18352a]/12 border-y border-[#18352a]/12">
              {menu.allDayDishes.map((item) => (
                <div key={item.name} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-base font-semibold tracking-tight">{item.name}</h3>
                    <span className="shrink-0 font-semibold">{item.price}</span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-[#405a4d]">{item.desc}</p>
                  {item.extras?.map((e) => (
                    <p key={e.name} className="mt-1 text-xs text-[#18352a]/50">{e.name} — <span className="text-[#6f8f72]">{e.price}</span></p>
                  ))}
                </div>
              ))}
            </div>
          </section>
          <section className="mb-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#6f8f72]">{t.soupsKicker}</p>
            <div className="divide-y divide-[#18352a]/12 border-y border-[#18352a]/12">
              {menu.soups.map((item) => (
                <div key={item.name} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-base font-semibold tracking-tight">{item.name}</h3>
                    <span className="shrink-0 font-semibold">{item.price}</span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-[#405a4d]">{item.desc}</p>
                  {item.extras?.map((e) => (
                    <p key={e.name} className="mt-1 text-xs text-[#18352a]/50">{e.name} — <span className="text-[#6f8f72]">{e.price}</span></p>
                  ))}
                </div>
              ))}
            </div>
          </section>
          <section>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#6f8f72]">{t.drinksKicker}</p>
            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#18352a]/70">{t.infusionsKicker}</p>
              {renderSimpleList(menu.infusions)}
            </div>
            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#18352a]/70">{t.juicesKicker}</p>
              <div className="divide-y divide-[#18352a]/08">
                {menu.juices.map((item) => (
                  <div key={item.name} className="py-1.5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-sm tracking-tight">{item.name}</span>
                        {item.desc && <span className="ml-2 text-xs text-[#18352a]/40">{item.desc}</span>}
                      </div>
                      {"size" in item && Array.isArray(item.size) ? (
                        <div className="flex gap-3">
                          {item.size.map((s) => (
                            <span key={s.label} className="text-sm font-semibold">{s.price} <span className="text-[#18352a]/40 font-normal">({s.label})</span></span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-semibold">{item.price}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#18352a]/70">{t.coffeeKicker}</p>
              {renderSimpleList(menu.coffee)}
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#18352a]/70">{t.alcoholKicker}</p>
              <div className="divide-y divide-[#18352a]/08">
                {menu.alcohol.map((item) => (
                  <div key={item.name} className="py-1.5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-sm tracking-tight">{item.name}</span>
                        {item.desc && <span className="ml-2 text-xs text-[#18352a]/40">{item.desc}</span>}
                      </div>
                      {typeof item.price === "string" ? (
                        <span className="font-semibold">{item.price}</span>
                      ) : (
                        <div className="flex gap-3 text-sm">
                          <span className="font-semibold">{item.price.copa}</span>
                          <span className="font-semibold">{item.price.taca}</span>
                          <span className="font-semibold">{item.price.garrafa}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════
export default function App() {
  const [siteAuthed, setSiteAuthed] = useState(() => sessionStorage.getItem("gig-site-auth") === "true");
  const [language, setLanguage] = useState<Language>("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState<boolean>(() => {
    return localStorage.getItem("gig-cookies") !== null;
  });
  const t = copy[language];
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t.seo.title;
    let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = t.seo.description;
  }, [language, t.seo.description, t.seo.title]);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    els.forEach((el) => el.classList.remove("is-visible"));
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("is-visible"); }); },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    els.forEach((el) => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, [language]);

  const handleCookieAccept = () => {
    localStorage.setItem("gig-cookies", "accepted");
    setCookiesAccepted(true);
  };

  const handleCookieDecline = () => {
    localStorage.setItem("gig-cookies", "declined");
    setCookiesAccepted(true);
  };

  if (!siteAuthed) {
    return <SiteLogin onLogin={() => { sessionStorage.setItem("gig-site-auth", "true"); setSiteAuthed(true); }} />;
  }

  return (
    <main className="min-h-screen bg-[#f7f0e3] text-[#18352a] selection:bg-[#b7cdbd] selection:text-[#18352a]">
      {/* NAV */}
      <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <nav className="mx-auto flex max-w-6xl items-center rounded-full border border-white/25 bg-[#f7f0e3]/70 px-4 py-3 text-sm text-[#18352a] shadow-[0_18px_60px_rgba(24,53,42,0.12)] backdrop-blur-xl nav-enter sm:px-5">
          <a href="#top" className="shrink-0 font-semibold uppercase tracking-[0.18em]">GiG</a>
          <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-6">
            <div className="hidden items-center gap-7 md:flex">
              {navItems.map((item) => (
                <a key={item.href} className="transition hover:text-[#6f8f72]" href={item.href}>{t.nav[item.key]}</a>
              ))}
            </div>
            <div className="flex rounded-full border border-[#18352a]/15 bg-white/35 p-1 text-[0.65rem] font-bold uppercase tracking-[0.12em]">
              {(["en", "pt"] as Language[]).map((opt) => (
                <button key={opt} type="button" aria-pressed={language === opt} onClick={() => setLanguage(opt)}
                  className={`rounded-full px-2.5 py-1.5 transition sm:px-3 ${language === opt ? "bg-[#18352a] text-[#fff8ea]" : "text-[#18352a]/65 hover:text-[#18352a]"}`}>
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={() => setReservationOpen(true)}
              className="rounded-full bg-[#18352a] px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#fff8ea] transition hover:-translate-y-0.5 hover:bg-[#6f8f72] sm:px-4 sm:text-xs">
              {t.hero.secondary}
            </button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section id="top" className="relative min-h-screen overflow-hidden">
        <img className="absolute inset-0 h-full w-full object-cover hero-image" src="/images/gig-hero.jpg" alt="Sunny brunch table" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-[#18352a]/70" />
        <div className="relative z-10 flex min-h-screen items-end px-5 pb-14 pt-32 sm:px-8 sm:pb-18 lg:px-12">
          <div className="mx-auto w-full max-w-6xl">
            <div className="max-w-4xl text-[#fff8ea] hero-copy">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#dbe7c6]">{t.hero.kicker}</p>
              <h1 className="font-serif text-[clamp(4.8rem,16vw,13.5rem)] leading-[0.78] tracking-[-0.09em]">{t.hero.title}</h1>
              <p className="mt-5 max-w-2xl text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">{t.hero.headline}</p>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#fff8ea]/85 sm:text-lg">{t.hero.text}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => setMenuOpen(true)}
                  className="inline-flex items-center justify-center rounded-full bg-[#fff8ea] px-7 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[#18352a] transition hover:-translate-y-1 hover:bg-[#dbe7c6]">
                  {t.hero.primary}
                </button>
                <button onClick={() => setReservationOpen(true)}
                  className="inline-flex items-center justify-center rounded-full border border-[#fff8ea]/50 px-7 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[#fff8ea] transition hover:-translate-y-1 hover:border-[#fff8ea] hover:bg-[#fff8ea]/10">
                  {t.hero.secondary}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div data-reveal>
            <p className="section-kicker">{t.about.kicker}</p>
            <h2 className="mt-4 max-w-2xl font-serif text-5xl leading-none tracking-[-0.06em] text-[#18352a] sm:text-7xl">{t.about.title}</h2>
          </div>
          <div data-reveal className="space-y-6 text-lg leading-8 text-[#405a4d]">
            {t.about.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      </section>

      {/* MENU CTA */}
      <section className="px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div data-reveal className="relative overflow-hidden rounded-3xl bg-[#18352a] px-8 py-14 text-center text-[#fff8ea] sm:px-14 sm:py-20 lg:px-20">
            <div className="absolute inset-0 opacity-[0.04]">
              <img className="h-full w-full object-cover" src="/images/gig-brunch-table.jpg" alt="" />
            </div>
            <div className="relative z-10">
              <p className="section-kicker text-[#b7cdbd]">{t.menuCta.kicker}</p>
              <h2 className="mt-3 font-serif text-4xl leading-none tracking-[-0.06em] sm:text-6xl">{t.menuCta.title}</h2>
              <p className="mx-auto mt-5 max-w-md text-[#fff8ea]/70">{t.menuCta.text}</p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <button onClick={() => setMenuOpen(true)}
                  className="inline-flex items-center gap-3 rounded-full bg-[#fff8ea] px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[#18352a] transition hover:-translate-y-1 hover:bg-[#dbe7c6]">
                  {t.hero.primary}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
                <button onClick={() => setReservationOpen(true)}
                  className="inline-flex items-center gap-3 rounded-full border border-[#fff8ea]/40 px-8 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[#fff8ea] transition hover:-translate-y-1 hover:border-[#fff8ea]">
                  {t.hero.secondary}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ATMOSPHERE */}
      <section className="overflow-hidden px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl" data-reveal>
            <p className="section-kicker">{t.atmosphere.kicker}</p>
            <h2 className="mt-4 font-serif text-5xl leading-none tracking-[-0.06em] sm:text-7xl">{t.atmosphere.title}</h2>
          </div>
          <div className="grid min-h-[720px] gap-4 sm:grid-cols-6 sm:grid-rows-6 lg:gap-5">
            {galleryImages.map((image, index) => {
              const layout = ["sm:col-span-4 sm:row-span-4", "sm:col-span-2 sm:row-span-3", "sm:col-span-2 sm:row-span-3", "sm:col-span-4 sm:row-span-2"][index];
              return (
                <figure key={image} data-reveal className={`group min-h-[280px] overflow-hidden ${layout}`}>
                  <img className="h-full w-full object-cover transition duration-700 group-hover:scale-105" src={image} alt={t.atmosphere.alts[index]} />
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY PEOPLE LOVE GiG */}
      <section className="px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div data-reveal>
            <p className="section-kicker">{t.love.kicker}</p>
            <h2 className="mt-4 font-serif text-5xl leading-none tracking-[-0.06em] sm:text-7xl">{t.love.title}</h2>
          </div>
          <div className="space-y-1 border-y border-[#18352a]/18">
            {t.love.points.map((point, index) => (
              <p key={point} data-reveal className="flex items-center justify-between gap-6 border-b border-[#18352a]/18 py-7 text-2xl font-medium tracking-[-0.04em] last:border-b-0 sm:text-4xl">
                <span>{point}</span>
                <span className="text-sm font-semibold tracking-[0.2em] text-[#6f8f72]">0{index + 1}</span>
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM */}
      <section id="instagram" className="bg-[#dbe7c6] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div data-reveal>
            <p className="section-kicker">{t.instagram.kicker}</p>
            <h2 className="mt-4 font-serif text-5xl leading-none tracking-[-0.06em] text-[#18352a] sm:text-7xl">{t.instagram.title}</h2>
            <p className="mt-6 max-w-md text-lg leading-8 text-[#405a4d]">{t.instagram.text}</p>
            <a className="mt-8 inline-flex rounded-full bg-[#18352a] px-7 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[#fff8ea] transition hover:-translate-y-1 hover:bg-[#6f8f72]"
              href="https://www.instagram.com/gigericeira/" target="_blank" rel="noreferrer">@gigericeira</a>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label={t.instagram.galleryLabel}>
            {galleryImages.concat(galleryImages.slice(0, 4)).map((image, index) => (
              <a key={`${image}-${index}`} data-reveal href="https://www.instagram.com/gigericeira/" target="_blank" rel="noreferrer"
                className="group aspect-square overflow-hidden bg-[#18352a]/10" style={{ transitionDelay: `${Math.min(index * 25, 160)}ms` }}>
                <img className="h-full w-full object-cover transition duration-700 group-hover:scale-110" src={image} alt={t.instagram.galleryAlt} />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* VISIT */}
      <section id="visit" className="px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div data-reveal>
            <p className="section-kicker">{t.visit.kicker}</p>
            <h2 className="mt-4 font-serif text-5xl leading-none tracking-[-0.06em] sm:text-7xl">{t.visit.title}</h2>
          </div>
          <div data-reveal className="space-y-8 text-[#405a4d]">
            <div className="grid gap-6 border-y border-[#18352a]/18 py-8 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8f72]">{t.visit.placeLabel}</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#18352a]">GiG - Green is Good</p>
                <p className="mt-1">Ericeira, Portugal</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8f72]">{t.visit.hoursLabel}</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#18352a]">{t.visit.hoursTitle}</p>
                <p className="mt-1">{t.visit.hoursText}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a className="inline-flex items-center justify-center rounded-full bg-[#18352a] px-7 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[#fff8ea] transition hover:-translate-y-1 hover:bg-[#6f8f72]"
                href="https://www.google.com/maps/search/?api=1&query=GiG%20Green%20is%20Good%20Ericeira" target="_blank" rel="noreferrer">{t.visit.maps}</a>
              <a className="inline-flex items-center justify-center rounded-full border border-[#18352a]/28 px-7 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[#18352a] transition hover:-translate-y-1 hover:border-[#18352a]"
                href="https://www.instagram.com/gigericeira/" target="_blank" rel="noreferrer">{t.visit.contact}</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#18352a]/18 px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 text-sm text-[#405a4d] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold uppercase tracking-[0.18em] text-[#18352a]">GiG - Green is Good</p>
            <p className="mt-2">{t.footer.line}</p>
          </div>
          <div className="flex flex-wrap gap-5">
            {navItems.map((item) => (
              <a key={item.href} className="transition hover:text-[#6f8f72]" href={item.href}>{t.nav[item.key]}</a>
            ))}
            <a className="transition hover:text-[#6f8f72]" href="https://www.instagram.com/gigericeira/" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
      </footer>

      {/* OVERLAYS */}
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} lang={language} />
      <ReservationOverlay isOpen={reservationOpen} onClose={() => setReservationOpen(false)} lang={language} />

      {/* COOKIE BANNER */}
      {!cookiesAccepted && (
        <CookieBanner lang={language} onAccept={handleCookieAccept} onDecline={handleCookieDecline} />
      )}
    </main>
  );
}