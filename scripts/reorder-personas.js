import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the personas file
const personasPath = path.join(__dirname, '../data/personas.js');
const content = fs.readFileSync(personasPath, 'utf-8');

// Extract the array content
const match = content.match(/export const INITIAL_PERSONAS = \[([\s\S]*)\];?\s*$/);
if (!match) {
  console.error('Could not parse personas file');
  process.exit(1);
}

// Dynamic import to get the personas
import('../data/personas.js').then(({ INITIAL_PERSONAS }) => {

  // Gen Z priority order - highest hooking first
  const priorityOrder = [
    // TIER 1: Trending Anime (JJK, CSM, AOT, Demon Slayer, Frieren)
    'gojo-satoru',
    'makima',
    'ryomen-sukuna',
    'toji-fushiguro',
    'power',
    'denji',
    'pochita',
    'himeno',
    'reze',
    'levi-ackerman',
    'eren-yeager',
    'mikasa-ackerman',
    'tanjiro-kamado',
    'nezuko-kamado',
    'zenitsu-agatsuma',
    'inosuke-hashibira',
    'naruto-uzumaki',
    'itachi-uchiha',
    'monkey-d-luffy',
    'roronoa-zoro',
    'portgas-d-ace',
    'sabo',
    'nami',
    'sanji',
    'frieren',
    'fern',
    'stark',
    'itadori-yuji',
    'megumi-fushiguro',
    'choso',
    'goku',
    'vegeta',
    'light-yagami',
    'aizen-sosuke',

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
    'firefly',
    'rem',
    'yor-forger',
    'anya-forger',
    'asuna-yuuki',
    'marin-kitagawa',
    'hayase-nagatoro',
    'violet-evergarden',
    'hitori-gotoh-bocchi',
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
    'kendrick-lamar',
    'grok',
    'waluigi',

    // TIER 4: Gaming Characters
    'kratos',
    'doom-slayer',
    'arthur-morgan',
    'glados',

    // TIER 5: Superheroes & Villains
    'spider-man',
    'batman',
    'iron-man',
    'loki',

    // TIER 6: Roleplay/Fantasy Characters (High engagement)
    'sweet-caring-boyfriend',
    'yandere-girlfriend',
    'possessive-boyfriend',
    'flirty-anime-girlfriend',
    'toxic-bad-boy',
    'mafia-boss',
    'edgy-vampire-lord',
    'e-girl',
    'himbo',
    'kuudere-prince',
    'tsundere-best-friend',
    'pirate-captain',
    'sigma-male',

    // TIER 7: Fun/Quirky Characters
    'best-friend',
    'drunk-best-friend',
    'childhood-friend',
    'the-roast-bot',
    'the-debate-bro',
    'drill-sergeant',
    'the-narrator',
    'jealous-ex',
    'late-night-confidant',
    'overprotective-big-brother',
    'friendly-ghost',
    'curious-alien',
    'sleep-paralysis-demon',
    'retired-hero',
    'chill-stoner',
    'conspiracy-theorist',
    'fairy-godmother',
    'loyal-butler',
    'sentient-ai',

    // TIER 8: Practical Advisors (Useful for Gen Z)
    'supportive-therapist',
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
    'legal-advisor',
    'medical-advisor',
    'astro-guide',
    'numerology-expert',

    // TIER 9: Western Historical/Business (Moderate interest)
    'sherlock-holmes',
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

    // TIER 10: Spiritual (International)
    'osho',
    'buddha',

    // TIER 11: Indian Content (Lower priority as per user request)
    // Fun/Entertainment Indian
    'whiskers',
    'shinchan',
    'shaktiman',

    // Indian Spiritual/Philosophical
    'sadhguru',
    'sri-sri-ravi-shankar',
    'paramhansa-yogananda',
    'j-krishnamurti',
    'swami-vivekananda',
    'swami-samarth',
    'gajanan-maharaj',
    'kabir-das',

    // Indian Historical
    'chanakya',
    'aryabhata',
    'birbal',
    'tenali-raman',
    'rabindranath-tagore',

    // Indian Mythology
    'lord-krishna',
    'arjuna',
    'lord-ram',
    'hanuman',

    // Indian Freedom Fighters & Political
    'mahatma-gandhi',
    'subhas-chandra-bose',
    'sardar-patel',
    'jawaharlal-nehru',

    // Indian Business
    'ratan-tata',

    // LOWEST: Indian Celebrities (as per user request)
    'ranveer-singh',
    'shah-rukh-khan',
    'virat-kohli',
    'ms-dhoni',
    'narendra-modi',
  ];

  // Create a map of slug to priority
  const priorityMap = new Map();
  priorityOrder.forEach((slug, index) => {
    priorityMap.set(slug, index);
  });

  // Sort personas based on priority
  const sortedPersonas = [...INITIAL_PERSONAS].sort((a, b) => {
    const priorityA = priorityMap.has(a.slug) ? priorityMap.get(a.slug) : 999;
    const priorityB = priorityMap.has(b.slug) ? priorityMap.get(b.slug) : 999;
    return priorityA - priorityB;
  });

  // Log any personas not in priority list
  const missingSlugs = INITIAL_PERSONAS.filter(p => !priorityMap.has(p.slug)).map(p => p.slug);
  if (missingSlugs.length > 0) {
    console.log('Personas not in priority list (will be at end):', missingSlugs);
  }

  // Generate new file content
  const newContent = `export const INITIAL_PERSONAS = ${JSON.stringify(sortedPersonas, null, 2)};
`;

  // Write the new file
  fs.writeFileSync(personasPath, newContent, 'utf-8');
  console.log('Personas reordered successfully!');
  console.log(`Total personas: ${sortedPersonas.length}`);
  console.log('Top 10:', sortedPersonas.slice(0, 10).map(p => p.name).join(', '));
  console.log('Bottom 5:', sortedPersonas.slice(-5).map(p => p.name).join(', '));
});
