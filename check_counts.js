
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const Business = mongoose.model('Business', new mongoose.Schema({ isVerified: Boolean }));
const User = mongoose.model('User', new mongoose.Schema({ role: String }));
const City = mongoose.model('City', new mongoose.Schema({}));
const Category = mongoose.model('Category', new mongoose.Schema({}));

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const b = await Business.countDocuments({ isVerified: true });
        const u = await User.countDocuments({ role: 'customer' });
        const ci = await City.countDocuments();
        const ca = await Category.countDocuments();
        console.log({ businesses: b, customers: u, cities: ci, categories: ca });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
