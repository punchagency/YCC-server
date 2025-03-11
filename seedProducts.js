const mongoose = require("mongoose");
const Product = require("./models/product.model.js"); // Adjust path as needed

const products = [
  {
    name: "Fresh Apples",
    category: "Food Provisions",
    description: "High-quality fresh apples sourced from organic farms.",
    serviceArea: "North America",
    sku: "FOOD-APL-001"
  },
  {
    name: "Marine Rope",
    category: "Marine Equipment",
    description: "Heavy-duty marine rope for ship docking and mooring.",
    serviceArea: "Global",
    sku: "MARINE-ROPE-002"
  },
  {
    name: "Multipurpose Cleaner",
    category: "Cleaning Supplies",
    description: "Powerful disinfectant for kitchens and bathrooms.",
    serviceArea: "Europe",
    sku: "CLEAN-MPC-003"
  },
  {
    name: "Diesel Fuel",
    category: "Fuel",
    description: "High-quality diesel fuel suitable for marine vessels.",
    serviceArea: "Asia-Pacific",
    sku: "FUEL-DIESEL-004"
  },
  {
    name: "Canned Tuna",
    category: "Food Provisions",
    description: "Premium canned tuna packed in olive oil.",
    serviceArea: "South America",
    sku: "FOOD-TUNA-005"
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect("mongodb+srv://emmanuelnnachi:uRMEoTcD5TOxRyiu@cluster0.byhxx.mongodb.net/test", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await Product.insertMany(products);
    console.log("Products added successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error inserting products:", error);
    mongoose.connection.close();
  }
};

seedProducts();
