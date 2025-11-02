import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadImage(url, filepath) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function fixTenaliImage() {
  const publicDir = path.join(__dirname, '..', 'public', 'personas');
  const filepath = path.join(publicDir, 'tenali-raman.jpg');

  // Using a traditional Indian illustration style image
  // This is from Wikimedia Commons - traditional artwork
  const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Tenali_Ramakrishna.jpg/400px-Tenali_Ramakrishna.jpg';

  console.log('📥 Downloading Tenali Raman image from Wikimedia Commons...');

  try {
    await downloadImage(imageUrl, filepath);
    console.log('✅ Successfully downloaded Tenali Raman image');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('Using fallback approach...');

    // Fallback: Try another commons image
    const fallbackUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Traditional_Indian_scholar.svg/400px-Traditional_Indian_scholar.svg.png';

    try {
      await downloadImage(fallbackUrl, filepath);
      console.log('✅ Downloaded fallback image');
    } catch (err) {
      console.error('❌ Fallback also failed:', err.message);
    }
  }
}

fixTenaliImage();
