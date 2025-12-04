const Product = require("../models/Product.modal");
const asyncHandler = require("../middlewares/asyncHandler");
const Category = require("../models/category.modal")
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// -----------------------------------------------------
// @desc    Create a new product (ADMIN)
// @route   POST /api/products
// -----------------------------------------------------
// exports.createProduct = asyncHandler(async (req, res) => {
//   const { title, description, category, brand, price, stock } = req.body;

//   if (!title || !price || !category) {
//     return res.status(400).json({
//       message: "Title, price, category, are required.",
//     });
//   }

//  // Validate category exists
//  const categoryExists = await Category.findById(category);
//  if (!categoryExists) {
//    return res.status(400).json({
//      success: false,
//      message: "Invalid category ID"
//    });
//  }


//   const product = await Product.create({
//     title,
//     description,
//     category,
//     brand,
//     price,
//     stock,
//   });

//   res.status(201).json({ message: "Product created successfully", product });
// });

// exports.createProduct = asyncHandler(async (req, res) => {
//   const { title, description, category, brand, price, images, stock } = req.body;

//   if (!title || !category || !price || !images) {
//     return res.status(400).json({
//       success: false,
//       message: "Title, category, price and images are required"
//     });
//   }

//   // Validate category exists
//   const categoryExists = await Category.findById(category);
//   if (!categoryExists) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid category ID"
//     });
//   }

//   const product = await Product.create({
//     title,
//     description,
//     category,
//     brand,
//     price,
//     images,
//     stock
//   });

//   res.status(201).json({
//     success: true,
//     message: "Product created",
//     product
//   });
// });



// -----------------------------------------------------
// Create a new product (ADMIN)
// -----------------------------------------------------
exports.createProduct = asyncHandler(async (req, res) => {
  const { title, description, category, brand, price, stock } = req.body;

  if (!title || !category || !price) {
    return res.status(400).json({
      success: false,
      message: "Title, category and price are required",
    });
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID",
    });
  }

  // Check file
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Image is required",
    });
  }

  // Upload image to Cloudinary
  const uploadImage = () => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "farbetter/products" },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  const result = await uploadImage().catch(err => {
    console.error("Cloudinary upload error:", err);
    throw err; // re-throw for asyncHandler to catch
  });

  // Create product
  const product = await Product.create({
    title,
    description,
    category,
    brand,
    price,
    stock,
    image: result.secure_url, // URL from Cloudinary
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});


// exports.createProduct = asyncHandler(async (req, res) => {
//   const { title, description, category, brand, price, images, stock } = req.body;

//   if (!title || !price || !category || !images?.length) {
//     return res.status(400).json({
//       message: "Title, price, category, and at least one image are required.",
//     });
//   }

//   const product = await Product.create({
//     title,
//     description,
//     category,
//     brand,
//     price,
//     images,
//     stock,
//   });

//   res.status(201).json({ message: "Product created successfully", product });
// });

// -----------------------------------------------------
// @desc    Get all products (search + filter + pagination)
// @route   GET /api/products
// -----------------------------------------------------
// exports.getProducts = asyncHandler(async (req, res) => {
//   const { page = 1, limit = 20, keyword, brand, minPrice, maxPrice, sort } =
//     req.query;

//   const query = {};

//   // Search
//   if (keyword) {
//     query.title = { $regex: keyword, $options: "i" };
//   }

//   // Filter by brand
//   if (brand) {
//     query.brand = brand;
//   }

//   // Price Range
//   if (minPrice || maxPrice) {
//     query.price = {};
//     if (minPrice) query.price.$gte = Number(minPrice);
//     if (maxPrice) query.price.$lte = Number(maxPrice);
//   }

//   // Base query (THIS WAS MISSING)
//   let mongoQuery = Product.find(query)
//     .skip((page - 1) * limit)
//     .limit(Number(limit));

//   // Sorting
//   if (sort === "price_asc") mongoQuery = mongoQuery.sort({ price: 1 });
//   if (sort === "price_desc") mongoQuery = mongoQuery.sort({ price: -1 });
//   if (sort === "newest") mongoQuery = mongoQuery.sort({ createdAt: -1 });

//   // Execute
//   const products = await mongoQuery;
//   const total = await Product.countDocuments(query);

//   res.json({
//     total,
//     page: Number(page),
//   }

//  // Validate category exists
//  const categoryExists = await Category.findById(category);
//  if (!categoryExists) {
//    return res.status(400).json({
//      success: false,
//      message: "Invalid category ID"
//    });
//  }


//   const product = await Product.create({
//     title,
//     description,
//     category,
//     brand,
//     price,
//     stock,
//   });

//   res.status(201).json({ message: "Product created successfully", product });
// });

// exports.createProduct = asyncHandler(async (req, res) => {
//   const { title, description, category, brand, price, images, stock } = req.body;

//   if (!title || !category || !price || !images) {
//     return res.status(400).json({
//       success: false,
//       message: "Title, category, price and images are required"
//     });
//   }

//   // Validate category exists
//   const categoryExists = await Category.findById(category);
//   if (!categoryExists) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid category ID"
//     });
//   }

//   const product = await Product.create({
//     title,
//     description,
//     category,
//     brand,
//     price,
//     images,
//     stock
//   });

//   res.status(201).json({
//     success: true,
//     message: "Product created",
//     product
//   });
// });



// -----------------------------------------------------
// Create a new product (ADMIN)
// -----------------------------------------------------
exports.createProduct = asyncHandler(async (req, res) => {
  const { title, description, category, brand, price, stock } = req.body;

  if (!title || !category || !price) {
    return res.status(400).json({
      success: false,
      message: "Title, category and price are required",
    });
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID",
    });
  }

  // Check file
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Image is required",
    });
  }

  // Upload image to Cloudinary
  const uploadImage = () => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "farbetter/products" },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  const result = await uploadImage().catch(err => {
    console.error("Cloudinary upload error:", err);
    throw err; // re-throw for asyncHandler to catch
  });

  // Create product
  const product = await Product.create({
    title,
    description,
    category,
    brand,
    price,
    stock,
    image: result.secure_url, // URL from Cloudinary
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    product,
  });
});


// exports.createProduct = asyncHandler(async (req, res) => {
//   const { title, description, category, brand, price, images, stock } = req.body;

//   if (!title || !price || !category || !images?.length) {
//     return res.status(400).json({
//       message: "Title, price, category, and at least one image are required.",
//     });
//   }

//   const product = await Product.create({
//     title,
//     description,
//     category,
//     brand,
//     price,
//     images,
//     stock,
//   });

//   res.status(201).json({ message: "Product created successfully", product });
// });

// -----------------------------------------------------
// @desc    Get all products (search + filter + pagination)
// @route   GET /api/products
// -----------------------------------------------------
// exports.getProducts = asyncHandler(async (req, res) => {
//   const { page = 1, limit = 20, keyword, brand, minPrice, maxPrice, sort } =
//     req.query;

//   const query = {};

//   // Search
//   if (keyword) {
//     query.title = { $regex: keyword, $options: "i" };
//   }

//   // Filter by brand
//   if (brand) {
//     query.brand = brand;
//   }

//   // Price Range
//   if (minPrice || maxPrice) {
//     query.price = {};
//     if (minPrice) query.price.$gte = Number(minPrice);
//     if (maxPrice) query.price.$lte = Number(maxPrice);
//   }

//   // Base query (THIS WAS MISSING)
//   let mongoQuery = Product.find(query)
//     .skip((page - 1) * limit)
//     .limit(Number(limit));

//   // Sorting
//   if (sort === "price_asc") mongoQuery = mongoQuery.sort({ price: 1 });
//   if (sort === "price_desc") mongoQuery = mongoQuery.sort({ price: -1 });
//   if (sort === "newest") mongoQuery = mongoQuery.sort({ createdAt: -1 });

//   // Execute
//   const products = await mongoQuery;
//   const total = await Product.countDocuments(query);

//   res.json({
//     total,
//     page: Number(page),
//     pages: Math.ceil(total / limit),
//     products, // You forgot to return them
//   });
// });

exports.getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    keyword,
    brand,
    minPrice,
    maxPrice,
    category, // can be slug or id
    sort
  } = req.query;

  const query = {};

  // Search by title
  if (keyword) {
    query.title = { $regex: keyword, $options: "i" };
  }

  // Filter by brand
  if (brand) {
    query.brand = brand;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Filter by category (ID or SLUG)
  if (category) {
    let categoryId = category;

    // If slug provided → convert to ObjectId
    if (!category.match(/^[0-9a-fA-F]{24}$/)) {
      const cat = await Category.findOne({ slug: category });
      if (cat) categoryId = cat._id;
    }

    query.category = categoryId;
  }

  // Base query
  let mongoQuery = Product.find(query)
    .populate("category", "name slug image")
    .skip((page - 1) * limit)
    .limit(Number(limit));

  // Sorting
  if (sort === "price_asc") mongoQuery = mongoQuery.sort({ price: 1 });
  if (sort === "price_desc") mongoQuery = mongoQuery.sort({ price: -1 });
  if (sort === "newest") mongoQuery = mongoQuery.sort({ createdAt: -1 });
  if (sort === "oldest") mongoQuery = mongoQuery.sort({ createdAt: 1 });

  const [products, total] = await Promise.all([
    mongoQuery,
    Product.countDocuments(query)
  ]);

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    products
  });
});

// --------------------------------------------------
// @desc    Get Single Product (Public)
// --------------------------------------------------
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name slug image"
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }

  res.json({ success: true, product });
});

// --------------------------------------------------
// @desc    Update Product (Admin)
// --------------------------------------------------
exports.updateProduct = asyncHandler(async (req, res) => {
  const { category } = req.body;

  // If category updated → validate
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID"
      });
    }
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  }).populate("category", "name slug image");

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }

  res.json({
    success: true,
    message: "Product updated",
    product
  });
});

// --------------------------------------------------
// @desc    Delete Product (Admin)
// --------------------------------------------------
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }

  res.json({
    success: true,
    message: "Product deleted"
  });
});

// --------------------------------------------------
// @desc    Update Product Stock (Admin)
// --------------------------------------------------
exports.updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;

  if (stock === undefined || stock === null) {
    return res.status(400).json({
      success: false,
      message: "Stock value is required"
    });
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock: Math.max(0, parseInt(stock, 10)) },
    { new: true }
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }

  res.json({
    success: true,
    message: "Stock updated successfully",
    product
  });
});