const mongoose = require("mongoose");
const Order = require("./models/order.model.js"); // Adjust path as needed
const Vendor = require("./models/vendor.model.js");
const Service = require("./models/service.model.js");

const seedOrders = async () => {
  try {
    await mongoose.connect("mongodb+srv://emmanuelnnachi:uRMEoTcD5TOxRyiu@cluster0.byhxx.mongodb.net/test", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Fetch random vendors and services
    const vendors = await Vendor.find().limit(3);
    const services = await Service.find().limit(3);

    if (vendors.length === 0 || services.length === 0) {
      console.log("❌ No vendors or services found. Seed them first.");
      mongoose.connection.close();
      return;
    }

    // Dummy orders
    const orders = [
      {
        guest: {
          fullName: "John Doe",
          email: "john.doe@example.com",
          phone: "+1-555-1234",
        },
        vendor: vendors[0]._id,
        service: services[0]._id,
        quantity: 2,
        totalPrice: 200,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: "credit_card",
        notes: "Need this service urgently.",
      },
      {
        guest: {
          fullName: "Jane Smith",
          email: "jane.smith@example.com",
          phone: "+1-555-5678",
        },
        vendor: vendors[1]._id,
        service: services[1]._id,
        quantity: 1,
        totalPrice: 150,
        status: "confirmed",
        paymentStatus: "paid",
        paymentMethod: "paypal",
        notes: "Please provide extra materials.",
      },
      {
        guest: {
          fullName: "Michael Johnson",
          email: "michael.johnson@example.com",
          phone: "+1-555-9876",
        },
        vendor: vendors[2]._id,
        service: services[2]._id,
        quantity: 3,
        totalPrice: 300,
        status: "in-progress",
        paymentStatus: "paid",
        paymentMethod: "bank_transfer",
        notes: "No rush, but quality service is a must.",
      },
    ];

    await Order.deleteMany(); // Clears existing orders
    await Order.insertMany(orders);

    console.log("✅ Orders seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding orders:", error);
    mongoose.connection.close();
  }
};

seedOrders();
