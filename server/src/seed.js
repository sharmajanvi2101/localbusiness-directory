import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Category from './models/Category.js';
import City from './models/City.js';
import Business from './models/Business.js';
import User from './models/User.js';
import Review from './models/Review.js';

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
    { name: 'Flower Shop', icon: 'Flower2', description: 'Fresh flowers and bouquets' },
    { name: 'Restaurants', icon: 'Utensils', description: 'Quality food and dining experiences' },
    { name: 'Doctor', icon: 'Stethoscope', description: 'Medical clinics and healthcare services' },
    { name: 'Gym', icon: 'Dumbbell', description: 'Fitness centers and health clubs' },
    { name: 'Electrician', icon: 'Zap', description: 'Electrical repairs and installations' }
];

const cities = [
    { name: 'Palanpur', state: 'Gujarat', country: 'India', lat: 24.1722, lng: 72.4333 },
    { name: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lng: 72.5714 },
    { name: 'Surat', state: 'Gujarat', country: 'India', lat: 21.1702, lng: 72.8311 },
    { name: 'Rajkot', state: 'Gujarat', country: 'India', lat: 22.3039, lng: 70.8022 },
    { name: 'Vadodara', state: 'Gujarat', country: 'India', lat: 22.3072, lng: 73.1812 }
];

const fakeReviewComments = [
    "Amazing service and very professional!",
    "One of the best in the city. Highly recommended.",
    "Quality is top-notch. Worth every penny.",
    "Responsive staff and great atmosphere.",
    "Good experience overall, will visit again.",
    "Fair pricing and honest work.",
    "I was impressed by their attention to detail.",
    "Reliable and trustworthy. Five stars!",
    "Bit expensive but the quality justifies it.",
    "Friendly owners and very helpful staff."
];

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        console.log('🗑️ Clearing old data...');
        await Business.deleteMany({});
        await Category.deleteMany({});
        await City.deleteMany({});
        await Review.deleteMany({});

        // Get an owner user
        let owner = await User.findOne({ role: { $in: ['admin', 'owner'] } });
        if (!owner) {
            console.log('👤 Creating temporary owner user...');
            owner = await User.create({
                name: 'System Admin',
                email: 'admin@bizdirect.com',
                password: 'password123',
                phone: '9999999999',
                role: 'admin'
            });
        }

        // Create some reviewer users if they don't exist
        console.log('👥 Ensuring reviewer users exist...');
        const reviewerEmails = ['rahul@gmail.com', 'priya@gmail.com', 'amit@gmail.com', 'sneha@gmail.com'];
        const reviewers = [];
        for (let i = 0; i < reviewerEmails.length; i++) {
            const email = reviewerEmails[i];
            let u = await User.findOne({ email });
            if (!u) {
                u = await User.create({
                    name: email.split('@')[0],
                    email,
                    password: 'password123',
                    phone: `888888888${i}`,
                    role: 'customer'
                });
            }
            reviewers.push(u);
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

        // Add spotlight businesses specifically for Palanpur
        const palanpur = createdCities.find(c => c.name === 'Palanpur');
        const restaurantCat = createdCategories.find(c => c.name === 'Restaurants');
        const doctorCat = createdCategories.find(c => c.name === 'Doctor');
        const gymCat = createdCategories.find(c => c.name === 'Gym');
        const electricianCat = createdCategories.find(c => c.name === 'Electrician');

        if (palanpur) {
            // Existing ones
            businesses.push({
                name: 'Palanpur Rasoi',
                description: 'Authentic Gujarati and North Indian cuisine. Best thali in town!',
                category: restaurantCat?._id,
                city: palanpur._id,
                slug: 'palanpur-rasoi',
                address: 'Highway Cross Road, Palanpur',
                phone: '+91 9876543210',
                email: 'info@palanpurrasoi.com',
                website: 'https://palanpurrasoi.com',
                owner: owner._id,
                isVerified: true,
                location: { type: 'Point', coordinates: [72.4333, 24.1722] }
            });

            businesses.push({
                name: 'Arogya Hospital',
                description: 'Multi-speciality hospital with 24/7 emergency services.',
                category: doctorCat?._id,
                city: palanpur._id,
                slug: 'arogya-hospital',
                address: 'Near Railway Station, Palanpur',
                phone: '+91 9876543211',
                email: 'contact@arogyahospital.com',
                website: 'https://arogyahospital.com',
                owner: owner._id,
                isVerified: true,
                location: { type: 'Point', coordinates: [72.4350, 24.1750] }
            });

            businesses.push({
                name: 'PowerZone Fitness',
                description: 'Modern gym with latest equipment and personal training.',
                category: gymCat?._id,
                city: palanpur._id,
                slug: 'powerzone-fitness',
                address: 'Suraj Plaza, 3rd Floor, Palanpur',
                phone: '+91 9876543212',
                email: 'gym@powerzone.com',
                owner: owner._id,
                isVerified: true,
                location: { type: 'Point', coordinates: [72.4300, 24.1700] }
            });

            // New ones for other categories
            const groceryCat = createdCategories.find(c => c.name.includes('Grocery'));
            businesses.push({
                name: 'Krishna Kirana Store',
                description: 'Complete range of groceries, spices, and daily household needs.',
                category: groceryCat?._id,
                city: palanpur._id,
                slug: 'krishna-kirana-store',
                address: 'Main Bazaar, Palanpur',
                phone: '+91 9876543214',
                owner: owner._id,
                isVerified: true,
                location: { type: 'Point', coordinates: [72.4340, 24.1730] }
            });

            const teaCat = createdCategories.find(c => c.name.includes('Tea Stall'));
            businesses.push({
                name: 'Janta Tea Post',
                description: 'Famous ginger tea and maska bun. Best spot for evening snacks.',
                category: teaCat?._id,
                city: palanpur._id,
                slug: 'janta-tea-post',
                address: 'Station Road, Palanpur',
                phone: '+91 9876543215',
                owner: owner._id,
                isVerified: true,
                location: { type: 'Point', coordinates: [72.4360, 24.1760] }
            });

            const bakeryCat = createdCategories.find(c => c.name.includes('Bakery'));
            businesses.push({
                name: 'Modern Bakery',
                description: 'Freshly baked cakes, cookies, and local bakery items since 1995.',
                category: bakeryCat?._id,
                city: palanpur._id,
                slug: 'modern-bakery-palanpur',
                address: 'Vidyamandir Road, Palanpur',
                phone: '+91 9876543216',
                owner: owner._id,
                isVerified: true,
                location: { type: 'Point', coordinates: [72.4320, 24.1710] }
            });

            const pharmacyCat = createdCategories.find(c => c.name.includes('Pharmacy'));
            businesses.push({
                name: 'City Medical Store',
                description: '24-hour pharmacy with wide availability of all general medicines.',
                category: pharmacyCat?._id,
                city: palanpur._id,
                slug: 'city-medical-store',
                address: 'Civil Hospital Road, Palanpur',
                phone: '+91 9876543217',
                owner: owner._id,
                isVerified: true,
                location: { type: 'Point', coordinates: [72.4370, 24.1770] }
            });

            const dairyCat = createdCategories.find(c => c.name.includes('Dairy'));
            businesses.push({
                name: 'Umiya Dairy Parlour',
                description: 'Fresh milk, curd, paneer, and authentic Amul products.',
                category: dairyCat?._id,
                city: palanpur._id,
                slug: 'umiya-dairy-parlour',
                address: 'Gathaman Gate, Palanpur',
                phone: '+91 9876543218',
                owner: owner._id,
                isVerified: true,
                location: { type: 'Point', coordinates: [72.4310, 24.1740] }
            });

            const mobileCat = createdCategories.find(c => c.name.includes('Mobile'));
            businesses.push({
                name: 'Royal Mobile Care',
                description: 'Expert smartphone repairs and latest mobile accessories.',
                category: mobileCat?._id,
                city: palanpur._id,
                slug: 'royal-mobile-care',
                address: 'Suraj Plaza, Ground Floor, Palanpur',
                phone: '+91 9876543219',
                owner: owner._id,
                isVerified: true,
                location: { type: 'Point', coordinates: [72.4305, 24.1705] }
            });

            businesses.push({
                name: 'Bhavani Electricals',
                description: 'Expert electrical repairs and all types of wiring services.',
                category: electricianCat?._id,
                city: palanpur._id,
                slug: 'bhavani-electricals',
                address: 'Market Yard Road, Palanpur',
                phone: '+91 9876543213',
                owner: owner._id,
                isVerified: true,
                location: { type: 'Point', coordinates: [72.4400, 24.1800] }
            });
        }

        for (const city of createdCities) {
            for (const category of createdCategories) {
                const count = Math.floor(Math.random() * 3) + 2; 
                for (let i = 1; i <= count; i++) {
                    businesses.push({
                        name: `${city.name} ${category.name.split('/')[0].trim()} ${i > 1 ? '#' + i : ''}`,
                        description: `Best ${category.name} in ${city.name}. We provide high-quality items and excellent service.`,
                        category: category._id,
                        city: city._id,
                        slug: `${city.name.toLowerCase()}-${category.name.split('/')[0].trim().toLowerCase()}-${city._id.toString().slice(-4)}-${i}`.replace(/\s+/g, '-'),
                        address: `${i * 10}, Main Market area, ${city.name}`,
                        phone: `+91 ${Math.floor(7000000000 + Math.random() * 2000000000)}`,
                        email: `${category.name.split(' ')[0].toLowerCase()}${i}@${city.name.toLowerCase()}.com`,
                        website: `https://www.${category.name.split(' ')[0].toLowerCase()}${city.name.toLowerCase()}.com`,
                        owner: owner._id,
                        isVerified: true,
                        location: {
                            type: 'Point',
                            coordinates: [
                                city.lng + (Math.random() - 0.5) * 0.01,
                                city.lat + (Math.random() - 0.5) * 0.01
                            ]
                        }
                    });
                }
            }
        }

        console.log('🏁 Bulk inserting businesses...');
        const savedBusinesses = await Business.insertMany(businesses);

        // Seed Reviews
        console.log('⭐ Generating reviews for all businesses...');
        const reviews = [];
        for (const biz of savedBusinesses) {
            const reviewCount = Math.floor(Math.random() * 5) + 3; // 3-7 reviews per business
            for (let i = 0; i < reviewCount; i++) {
                const reviewer = reviewers[Math.floor(Math.random() * reviewers.length)];
                reviews.push({
                    user: reviewer._id,
                    business: biz._id,
                    rating: Math.floor(Math.random() * 2) + 4, // Mostly 4-5 stars for "premium" feel
                    comment: fakeReviewComments[Math.floor(Math.random() * fakeReviewComments.length)]
                });
            }
        }

        console.log('📥 Inserting reviews...');
        await Review.insertMany(reviews);

        // Update Business stats manually since insertMany doesn't trigger hooks
        console.log('📊 Updating business reputation stats...');
        for (const biz of savedBusinesses) {
            const bizReviews = reviews.filter(r => r.business.toString() === biz._id.toString());
            const avg = bizReviews.reduce((acc, curr) => acc + curr.rating, 0) / bizReviews.length;
            await Business.findByIdAndUpdate(biz._id, {
                averageRating: avg.toFixed(1),
                reviewCount: bizReviews.length
            });
        }

        console.log('✅ Data Seeding Completed Successfully!');
        console.log(`- Categories: ${createdCategories.length}`);
        console.log(`- Cities: ${createdCities.length}`);
        console.log(`- Businesses: ${savedBusinesses.length}`);
        console.log(`- Reviews: ${reviews.length}`);

        process.exit();
    } catch (error) {
        console.error(`❌ Error seeding data: ${error.message}`);
        process.exit(1);
    }
};

seedData();
