import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const personas = [
  { name: 'Elon Musk', filename: 'elon-musk.jpg', wikipediaTitle: 'Elon_Musk' },
  { name: 'Ratan Tata', filename: 'ratan-tata.jpg', wikipediaTitle: 'Ratan_Tata' },
  { name: 'Shah Rukh Khan', filename: 'shah-rukh-khan.jpg', wikipediaTitle: 'Shah_Rukh_Khan' },
  { name: 'Deepika Padukone', filename: 'deepika-padukone.jpg', wikipediaTitle: 'Deepika_Padukone' },
  { name: 'Virat Kohli', filename: 'virat-kohli.jpg', wikipediaTitle: 'Virat_Kohli' },
  { name: 'PV Sindhu', filename: 'pv-sindhu.jpg', wikipediaTitle: 'P._V._Sindhu' },
  { name: 'APJ Abdul Kalam', filename: 'apj-abdul-kalam.jpg', wikipediaTitle: 'A._P._J._Abdul_Kalam' },
  { name: 'Swami Vivekananda', filename: 'swami-vivekananda.jpg', wikipediaTitle: 'Swami_Vivekananda' },
  { name: 'Tenali Raman', filename: 'tenali-raman.jpg', wikipediaTitle: 'Tenali_Ramakrishna' },
  { name: 'Birbal', filename: 'birbal.jpg', wikipediaTitle: 'Birbal' }
];

const publicDir = path.join(__dirname, '..', 'public', 'personas');

// Ensure directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function downloadImage(url, filepath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function getWikipediaImage(wikipediaTitle) {
  try {
    // First, get the page info with the main image
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${wikipediaTitle}&prop=pageimages&format=json&pithumbsize=400`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];

    if (pages[pageId].thumbnail) {
      return pages[pageId].thumbnail.source;
    }

    // If no thumbnail, try to get the original image
    const apiUrl2 = `https://en.wikipedia.org/w/api.php?action=query&titles=${wikipediaTitle}&prop=pageimages&format=json&piprop=original`;

    const response2 = await fetch(apiUrl2);
    const data2 = await response2.json();

    const pages2 = data2.query.pages;
    const pageId2 = Object.keys(pages2)[0];

    if (pages2[pageId2].original) {
      return pages2[pageId2].original.source;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching Wikipedia image:`, error.message);
    return null;
  }
}

async function downloadWikipediaImages() {
  console.log('🖼️  Downloading persona images from Wikipedia...\n');

  for (const persona of personas) {
    try {
      const filepath = path.join(publicDir, persona.filename);

      console.log(`📥 Fetching ${persona.name} from Wikipedia...`);
      const imageUrl = await getWikipediaImage(persona.wikipediaTitle);

      if (imageUrl) {
        console.log(`   Found image: ${imageUrl.substring(0, 60)}...`);
        await downloadImage(imageUrl, filepath);
        console.log(`✅ Saved ${persona.filename}`);
      } else {
        console.log(`❌ No image found for ${persona.name}`);
      }

      // Small delay to be respectful to Wikipedia's servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Error downloading ${persona.name}:`, error.message);
    }
  }

  console.log('\n✨ Done! All persona images downloaded from Wikipedia.');
}

downloadWikipediaImages();
