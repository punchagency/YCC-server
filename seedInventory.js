const mongoose = require("mongoose");
const Product = require("./models/product.model.js"); // Adjust path as needed
const Supplier = require("./models/supplier.model.js"); // Adjust path as needed
const Inventory = require("./models/inventory.model.js"); // Adjust path as needed

const seedInventory = async () => {
  try {
    await mongoose.connect("mongodb+srv://emmanuelnnachi:uRMEoTcD5TOxRyiu@cluster0.byhxx.mongodb.net/test", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const products = await Product.find();
    const suppliers = await Supplier.find();

    if (products.length === 0 || suppliers.length === 0) {
      console.log("No products or suppliers found. Please seed them first.");
      mongoose.connection.close();
      return;
    }

    const inventoryData = [];

    products.forEach((product) => {
      // Randomly assign 1-3 suppliers per product
      const assignedSuppliers = suppliers
        .sort(() => 0.5 - Math.random()) // Shuffle array
        .slice(0, Math.floor(Math.random() * 3) + 1); // Pick 1-3 suppliers

      assignedSuppliers.forEach((supplier) => {
        inventoryData.push({
          supplier: supplier._id,
          product: product._id,
          quantity: Math.floor(Math.random() * 100) + 10, // Random quantity between 10-100
          price: parseFloat((Math.random() * 50 + 5).toFixed(2)), // Random price between 5-50
          warehouseLocation: `Warehouse-${Math.floor(Math.random() * 5) + 1}`, // Random warehouse
          lastUpdated: new Date()
        });
      });
    });

    await Inventory.insertMany(inventoryData);
    console.log("Inventory data seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding inventory:", error);
    mongoose.connection.close();
  }
};

seedInventory();
