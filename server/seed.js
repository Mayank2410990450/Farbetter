/**
 * Database Seeding Script
 * Creates sample products and categories for testing
 * Run with: npm run seed
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Product = require("./models/Product.modal");
const Category = require("./models/category.modal");
const User = require("./models/User.modal");

const MONGO_URI = process.env.MONGO_URI;

const sampleCategories = [
  {
    name: "Protein Puffs",
    slug: "protein-puffs",
    description: "Crispy, protein-packed puffs in various flavors"
  },
  {
    name: "Protein Bars",
    slug: "protein-bars",
    description: "Convenient on-the-go protein bars"
  },
  {
    name: "Protein Chips",
    slug: "protein-chips",
    description: "Guilt-free, high-protein chips"
  },
  {
    name: "Cookies",
    slug: "cookies",
    description: "Protein-rich cookies with natural ingredients"
  }
];

const sampleProducts = [
  {
    title: "BBQ Protein Puffs",
    description: "Delicious BBQ-flavored puffs with 25g of protein per serving. Made with clean ingredients and zero added sugar.",
    category: "Protein Puffs",
    brand: "Farbetter",
    price: 299,
    stock: 100,
    protein: 25,
    image: "https://via.placeholder.com/400x400?text=BBQ+Puffs"
  },
  {
    title: "Salted Caramel Protein Bar",
    description: "A perfect combination of salted caramel flavor with 30g of protein. No artificial sweeteners.",
    category: "Protein Bars",
    brand: "Farbetter",
    price: 199,
    stock: 150,
    protein: 30,
    image: "https://via.placeholder.com/400x400?text=Caramel+Bar"
  },
  {
    title: "Cheese & Onion Protein Chips",
    description: "Classic cheese and onion flavor with 15g of protein per serving. Baked, not fried.",
    category: "Protein Chips",
    brand: "Farbetter",
    price: 249,
    stock: 80,
    protein: 15,
    image: "https://via.placeholder.com/400x400?text=Cheese+Chips"
  },
  {
    title: "Double Chocolate Protein Cookie",
    description: "Rich chocolate cookie with 20g of protein. No artificial flavors or colors.",
    category: "Cookies",
    brand: "Farbetter",
    price: 179,
    stock: 120,
    protein: 20,
    image: "https://via.placeholder.com/400x400?text=Chocolate+Cookie"
  },
  {
    title: "Masala Munch Puffs",
    description: "Indian-inspired masala flavored puffs with 25g protein. Perfect for snacking anytime.",
    category: "Protein Puffs",
    brand: "Farbetter",
    price: 289,
    stock: 90,
    protein: 25,
    image: "https://via.placeholder.com/400x400?text=Masala+Puffs"
  },
  {
    title: "Almond Protein Bar",
    description: "Crunchy almonds with smooth protein coating. 28g protein per bar.",
    category: "Protein Bars",
    brand: "Farbetter",
    price: 219,
    stock: 110,
    protein: 28,
    image: "https://via.placeholder.com/400x400?text=Almond+Bar"
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Product.deleteMany({});
    // await Category.deleteMany({});
    // console.log("🗑️  Cleared existing products and categories");

    // Insert categories
    const createdCategories = await Category.insertMany(sampleCategories, { ordered: false }).catch(err => {
      console.log("⚠️  Some categories may already exist (duplicates skipped)");
      return [];
    });
    console.log(`✅ Inserted/verified ${sampleCategories.length} categories`);

    // Get all categories to map names to IDs
    const allCategories = await Category.find();
    const categoryMap = {};
    allCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Prepare products with category IDs
    const productsToInsert = sampleProducts.map(product => ({
      ...product,
      category: categoryMap[product.category]
    }));

    // Insert products
    const createdProducts = await Product.insertMany(productsToInsert, { ordered: false }).catch(err => {
      console.log("⚠️  Some products may already exist (duplicates skipped)");
      return [];
    });
    console.log(`✅ Inserted/verified ${sampleProducts.length} products`);

    // Check final counts
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();

    console.log("\n📊 Database Summary:");
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Products: ${productCount}`);

    // List all products
    const allProducts = await Product.find().populate("category", "name");
    console.log("\n📦 Products in Database:");
    allProducts.forEach(p => {
      console.log(`   - ${p.title} (₹${p.price}) - Category: ${p.category?.name}`);
    });

    console.log("\n✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
