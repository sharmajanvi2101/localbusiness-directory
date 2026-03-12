import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Category from './models/Category.js';
import City from './models/City.js';
import Business from './models/Business.js';
import User from './models/User.js';

dotenv.config();

const categories = [
    { name: 'Kirana / Grocery Store', icon: 'ShoppingBag', description: 'Daily essentials and grocery items' },
    { name: 'Tea Stall (Chai Shop)', icon: 'Coffee', description: 'Local tea, coffee and snacks' },
    { name: 'Bakery Shop', icon: 'Utensils', description: 'Cakes, pastries, and bread' },
    { name: 'Medical Store / Pharmacy', icon: 'Stethoscope', description: 'Medicines and healthcare products' },
    { name: 'Vegetable Shop', icon: 'Leaf', description: 'Fresh vegetables' },
    { name: 'Fruit Shop', icon: 'Apple', description: 'Fresh seasonal fruits' },
    { name: 'Mobile Repair Shop', icon: 'Smartphone', description: 'Mobile repairing and accessories' },
    { name: 'Barber Shop / Hair Salon', icon: 'Scissors', description: 'Hair cutting and grooming services' },
    { name: 'Tailor Shop', icon: 'Pocket', description: 'Stitching and garment alteration' },
    { name: 'Stationery Shop', icon: 'Book', description: 'Books, pens, and office supplies' },
    { name: 'Clothing Shop', icon: 'Shirt', description: 'Ready-made garments and fabrics' },
    { name: 'Footwear Shop', icon: 'Footprints', description: 'Shoes, sandals and boots' },
    { name: 'Hardware Shop', icon: 'Hammer', description: 'Tools and building materials' },
    { name: 'Electronics Repair Shop', icon: 'Zap', description: 'Repairing home appliances and gadgets' },
    { name: 'Dairy / Milk Shop', icon: 'Droplets', description: 'Milk, curd, and dairy products' },
    { name: 'Sweet Shop (Mithai Shop)', icon: 'Cookie', description: 'Traditional sweets and desserts' },
    { name: 'Pan Shop', icon: 'Wind', description: 'Betel leaves and tobacco products' },
    { name: 'Auto Repair / Bike Garage', icon: 'Wrench', description: 'Vehicle servicing and repairs' },
    { name: 'Gift Shop', icon: 'Gift', description: 'Gifts and decorative items' },
    { name: 'Flower Shop', icon: 'Flower2', description: 'Fresh flowers and bouquets' }
];

const cities = [
    { name: 'Palanpur', state: 'Gujarat', country: 'India' },
    { name: 'Ahmedabad', state: 'Gujarat', country: 'India' },
    { name: 'Surat', state: 'Gujarat', country: 'India' },
    { name: 'Rajkot', state: 'Gujarat', country: 'India' },
    { name: 'Vadodara', state: 'Gujarat', country: 'India' }
];

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('🗑️ Clearing old data...');
        await Business.deleteMany({});
        await Category.deleteMany({});
        await City.deleteMany({});

        // Get an owner user
        const owner = await User.findOne({ role: { $in: ['admin', 'owner'] } });
        if (!owner) {
            console.error('❌ No owner/admin user found. Please create a user first.');
            process.exit(1);
        }

        // Seed Categories
        console.log('🌱 Seeding categories...');
        const createdCategories = await Category.insertMany(categories);

        // Seed Cities
        console.log('🌆 Seeding cities...');
        const createdCities = await City.insertMany(cities);

        // Seed Businesses
        console.log('🏪 Generating local businesses...');
        const businesses = [];

        for (const city of createdCities) {
            // Add a few businesses for each category in each city
            for (const category of createdCategories) {
                const count = Math.floor(Math.random() * 2) + 1; // 1-2 businesses per category per city
                for (let i = 1; i <= count; i++) {
                    businesses.push({
                        name: `${city.name} ${category.name.split('/')[0].trim()} ${i > 1 ? '#' + i : ''}`,
                        description: `Best ${category.name} in ${city.name}. We provide high-quality items and excellent service.`,
                        category: category._id,
                        city: city._id,
                        address: `${i * 10}, Main Market area, ${city.name}`,
                        phone: `+91 ${Math.floor(7000000000 + Math.random() * 2000000000)}`,
                        email: `${category.name.split(' ')[0].toLowerCase()}${i}@${city.name.toLowerCase()}.com`,
                        website: `https://www.${category.name.split(' ')[0].toLowerCase()}${city.name.toLowerCase()}.com`,
                        owner: owner._id,
                        isVerified: true,
                        averageRating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
                        reviewCount: Math.floor(Math.random() * 50) + 10,
                        location: {
                            type: 'Point',
                            coordinates: [
                                72.0 + Math.random() * 2, // Lng
                                23.0 + Math.random() * 2  // Lat
                            ]
                        },
                        workingHours: {
                            'Monday': '09:00 - 21:00',
                            'Tuesday': '09:00 - 21:00',
                            'Wednesday': '09:00 - 21:00',
                            'Thursday': '09:00 - 21:00',
                            'Friday': '09:00 - 21:00',
                            'Saturday': '09:00 - 22:00',
                            'Sunday': '10:00 - 18:00'
                        }
                    });
                }
            }
        }

        await Business.insertMany(businesses);

        console.log('✅ Data Seeding Completed Successfully!');
        console.log(`- Categories: ${createdCategories.length}`);
        console.log(`- Cities: ${createdCities.length}`);
        console.log(`- Businesses: ${businesses.length}`);

        process.exit();
    } catch (error) {
        console.error(`❌ Error seeding data: ${error.message}`);
        process.exit(1);
    }
};

seedData();
