import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const personas = [
  { name: 'Elon Musk', filename: 'elon-musk.jpg', query: 'elon+musk+professional' },
  { name: 'Ratan Tata', filename: 'ratan-tata.jpg', query: 'ratan+tata' },
  { name: 'Shah Rukh Khan', filename: 'shah-rukh-khan.jpg', query: 'shah+rukh+khan' },
  { name: 'Deepika Padukone', filename: 'deepika-padukone.jpg', query: 'deepika+padukone' },
  { name: 'Virat Kohli', filename: 'virat-kohli.jpg', query: 'virat+kohli+cricket' },
  { name: 'PV Sindhu', filename: 'pv-sindhu.jpg', query: 'pv+sindhu+badminton' },
  { name: 'APJ Abdul Kalam', filename: 'apj-abdul-kalam.jpg', query: 'apj+abdul+kalam' },
  { name: 'Swami Vivekananda', filename: 'swami-vivekananda.jpg', query: 'swami+vivekananda' },
  { name: 'Tenali Raman', filename: 'tenali-raman.jpg', query: 'indian+traditional+man' },
  { name: 'Birbal', filename: 'birbal.jpg', query: 'mughal+advisor' }
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

async function downloadPersonaImages() {
  console.log('🖼️  Downloading persona images...\n');

  for (const persona of personas) {
    try {
      const filepath = path.join(publicDir, persona.filename);

      // Using Lorem Picsum (reliable placeholder images)
      // We use a seed based on the name to get consistent images
      const seed = persona.name.replace(/\s+/g, '-').toLowerCase();
      const url = `https://picsum.photos/seed/${seed}/400/400`;

      console.log(`📥 Downloading ${persona.name}...`);
      await downloadImage(url, filepath);
      console.log(`✅ Saved ${persona.filename}`);

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error downloading ${persona.name}:`, error.message);
    }
  }

  console.log('\n✨ Done! All persona images downloaded.');
}

downloadPersonaImages();
