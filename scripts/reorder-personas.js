import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic import to get the personas
import('../data/personas.js').then(({ INITIAL_PERSONAS }) => {

  // Indian personas to put at the BOTTOM (as per user request)
  const indianSlugs = new Set([
    // Indian Celebrities (LOWEST priority)
    'narendra-modi',
    'ms-dhoni',
    'virat-kohli',
    'shah-rukh-khan',
    'ranveer-singh',
    'ratan-tata',

    // Indian Freedom Fighters & Political
    'jawaharlal-nehru',
    'subhas-chandra-bose',
    'mahatma-gandhi',
    'sardar-vallabhbhai-patel',

    // Indian Mythology
    'hanuman',
    'lord-ram',
    'arjuna',
    'lord-krishna',

    // Indian Historical
    'rabindranath-tagore',
    'tenali-raman',
    'birbal',
    'aryabhata',
    'chanakya',

    // Indian Spiritual
    'kabir-das',
    'gajanan-maharaj',
    'swami-samarth',
    'swami-vivekananda',
    'j-krishnamurti',
    'paramhansa-yogananda',
    'sri-sri-ravi-shankar',
    'sadhguru',

    // Indian Entertainment
    'shaktiman',
    'shinchan',
    'osho',
  ]);

  // HIGH priority Gen Z personas (top of list)
  const topTierSlugs = [
    // TIER 1: Trending Anime (JJK, CSM, AOT, Demon Slayer)
    'gojo-satoru',
    'makima',
    'ryomen-sukuna',
    'sukuna',
    'toji-fushiguro',
    'power',
    'denji',
    'pochita',
    'himeno',
    'reze',
    'levi-ackerman',
    'levi',
    'eren-yeager',
    'eren',
    'mikasa-ackerman',
    'mikasa',
    'tanjiro-kamado',
    'tanjiro',
    'nezuko-kamado',
    'nezuko',
    'zenitsu-agatsuma',
    'zenitsu',
    'inosuke-hashibira',
    'inosuke',
    'itachi-uchiha',
    'naruto-uzumaki',
    'monkey-d-luffy',
    'luffy',
    'roronoa-zoro',
    'zoro',
    'portgas-d-ace',
    'ace',
    'sabo',
    'nami',
    'sanji',
    'frieren',
    'fern',
    'stark',
    'itadori-yuji',
    'megumi-fushiguro',
    'megumi',
    'choso',
    'son-goku',
    'goku',
    'vegeta',
    'light-yagami',
    'aizen-sosuke',
    'aizen',

    // TIER 2: Genshin/Honkai/Gaming Anime
    'hu-tao',
    'zhongli',
    'kamisato-ayaka',
    'yae-miko',
    'raiden-shogun',
    'scaramouche',
    'albedo',
    'kafka',
    'blade',
    'blade-hsr',
    'firefly',
    'rem',
    'yor-forger',
    'yor',
    'anya-forger',
    'anya',
    'asuna-yuuki',
    'marin-kitagawa',
    'hayase-nagatoro',
    'nagatoro',
    'violet-evergarden',
    'hitori-gotoh-bocchi',
    'bocchi',
    'rebecca',
    'tatsumaki',

    // TIER 3: Meme Culture & Pop Icons
    'walter-white',
    'jesse-pinkman',
    'rick-sanchez',
    'deadpool',
    'tyler-durden',
    'homelander',
    'wednesday-addams',
    'chandler-bing',
    'michael-scott',
    'taylor-swift',
    'barbie',
    'ken',
    'ken-barbie',
    'kendrick-lamar',
    'grok',
    'waluigi',

    // TIER 4: Gaming Characters
    'kratos',
    'doom-slayer',
    'arthur-morgan',
    'glados',

    // TIER 5: Superheroes
    'spider-man',
    'batman',
    'batman-bruce-wayne',
    'iron-man',
    'tony-stark',
    'loki',
    'sherlock-holmes',

    // TIER 6: Roleplay/Fantasy (High engagement)
    'sweet-caring-boyfriend',
    'sweet-bf',
    'yandere-girlfriend',
    'yandere',
    'possessive-boyfriend',
    'flirty-anime-girlfriend',
    'toxic-bad-boy',
    'mafia-boss',
    'edgy-vampire-lord',
    'vampire-lord',
    'e-girl',
    'himbo',
    'kuudere-prince',
    'kuudere',
    'tsundere-best-friend',
    'tsundere',
    'pirate-captain',
    'sigma-male',

    // TIER 7: Fun/Quirky Characters
    'best-friend',
    'drunk-best-friend',
    'drunk-friend',
    'childhood-friend',
    'the-roast-bot',
    'roast-bot',
    'the-debate-bro',
    'debate-bro',
    'drill-sergeant',
    'the-narrator',
    'narrator',
    'jealous-ex',
    'late-night-confidant',
    'confidant',
    'overprotective-big-brother',
    'big-brother',
    'friendly-ghost',
    'ghost',
    'curious-alien',
    'alien',
    'sleep-paralysis-demon',
    'sleep-demon',
    'retired-hero',
    'chill-stoner',
    'stoner',
    'conspiracy-theorist',
    'fairy-godmother',
    'loyal-butler',
    'butler',
    'sentient-ai',

    // TIER 8: Practical Advisors
    'supportive-therapist',
    'therapist',
    'mental-wellness-coach',
    'life-coach',
    'relationship-counselor',
    'tarot-reader',
    'career-mentor',
    'fitness-coach',
    'parenting-coach',
    'home-chef',
    'travel-guide',
    'financial-advisor',
    'money-manager',
    'legal-advisor',
    'medical-advisor',
    'astro-guide',
    'numerology-expert',

    // TIER 9: Western Historical/Business
    'elon-musk',
    'donald-trump',
    'naval-ravikant',
    'steve-jobs',
    'warren-buffett',
    'charlie-munger',
    'albert-einstein',
    'socrates',
    'plato',
    'william-shakespeare',
    'isaac-newton',

    // TIER 10: International Spiritual
    'gautama-buddha',
    'buddha',

    // Misc
    'whiskers',
    'whiskers-cat',
  ];

  // Create priority map
  const priorityMap = new Map();
  topTierSlugs.forEach((slug, index) => {
    priorityMap.set(slug, index);
  });

  // Sort: top tier first, then non-Indian, then Indian at bottom
  const sortedPersonas = [...INITIAL_PERSONAS].sort((a, b) => {
    const aIsIndian = indianSlugs.has(a.slug);
    const bIsIndian = indianSlugs.has(b.slug);

    // Indian personas go to bottom
    if (aIsIndian && !bIsIndian) return 1;
    if (!aIsIndian && bIsIndian) return -1;

    // Both Indian or both non-Indian: sort by priority
    const priorityA = priorityMap.has(a.slug) ? priorityMap.get(a.slug) : 500;
    const priorityB = priorityMap.has(b.slug) ? priorityMap.get(b.slug) : 500;

    return priorityA - priorityB;
  });

  // Generate new file content
  const personasPath = path.join(__dirname, '../data/personas.js');
  const newContent = `export const INITIAL_PERSONAS = ${JSON.stringify(sortedPersonas, null, 2)};
`;

  fs.writeFileSync(personasPath, newContent, 'utf-8');

  console.log('Personas reordered successfully!');
  console.log(`Total personas: ${sortedPersonas.length}`);
  console.log('\nTop 10:');
  sortedPersonas.slice(0, 10).forEach((p, i) => console.log(`${i+1}. ${p.name}`));
  console.log('\nBottom 10 (should be Indian):');
  sortedPersonas.slice(-10).forEach((p, i) => console.log(`${sortedPersonas.length - 9 + i}. ${p.name}`));
});
