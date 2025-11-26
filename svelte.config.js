import adapter from '@sveltejs/adapter-node';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
 
export default {
  kit: {
    adapter: adapter(),
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
};