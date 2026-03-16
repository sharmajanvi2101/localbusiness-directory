import mongoose from 'mongoose';
import Business from './server/src/models/Business.js';
import City from './server/src/models/City.js';
import Category from './server/src/models/Category.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

async function findSlug() {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/business-directory';
        await mongoose.connect(mongoUri);
        const b = await Business.findOne({ slug: { $exists: true, $ne: '' } });
        if (b) {
            console.log('SLUG_FOUND:' + b.slug);
            console.log('NAME:' + b.name);
        } else {
            console.log('NO_SLUG_FOUND');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findSlug();
