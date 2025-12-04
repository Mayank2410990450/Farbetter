// Clean fake data from MongoDB database
// Run this with: node cleanDatabase.js

require('dotenv').config();
const mongoose = require('mongoose');

async function cleanDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get all collections
        const Product = require('./models/Product.modal');
        const Category = require('./models/Category.model');

        // Delete products with placeholder images
        console.log('\n🗑️  Deleting products with placeholder images...');
        const deletedProducts = await Product.deleteMany({
            image: { $regex: /placeholder|via\.placeholder/i }
        });
        console.log(`✅ Deleted ${deletedProducts.deletedCount} fake products`);

        // Delete products with fake names
        const fakeProductNames = [
            'BBQ Puffs', 'Masala Puffs', 'Cheese Chips',
            'Chocolate Cookie', 'Caramel Bar', 'Almond Bar',
            'Sample Product', 'Test Product', 'Demo Product'
        ];

        const deletedByName = await Product.deleteMany({
            name: { $in: fakeProductNames }
        });
        console.log(`✅ Deleted ${deletedByName.deletedCount} products by name`);

        // Show remaining products
        const remainingProducts = await Product.countDocuments();
        console.log(`\n📦 Remaining products in database: ${remainingProducts}`);

        if (remainingProducts > 0) {
            const products = await Product.find().select('name image').limit(10);
            console.log('\n📋 Current products:');
            products.forEach(p => {
                console.log(`  - ${p.name} (${p.image ? 'has image' : 'no image'})`);
            });
        } else {
            console.log('\n⚠️  No products in database. Add products via admin panel.');
        }

        console.log('\n✅ Database cleaned successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

cleanDatabase();
