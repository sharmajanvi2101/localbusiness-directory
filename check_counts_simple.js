
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'server/.env') });

async function check() {
    const client = new MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db();
        const b = await db.collection('businesses').countDocuments({ isVerified: true });
        const u = await db.collection('users').countDocuments({ role: 'customer' });
        const ci = await db.collection('cities').countDocuments();
        const ca = await db.collection('categories').countDocuments();
        console.log(JSON.stringify({ businesses: b, customers: u, cities: ci, categories: ca }));
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

check();
