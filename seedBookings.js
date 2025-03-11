const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Booking = require("./models/booking.model");
const Vendor = require("./models/vendor.model");
const Service = require("./models/service.model");

dotenv.config();

const seedBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const vendors = await Vendor.find();
    const services = await Service.find();

    if (vendors.length === 0 || services.length === 0) {
      console.log("No vendors or services found. Add them first.");
      process.exit(1);
    }

    const bookings = [
      {
        guestName: "John Doe",
        guestEmail: "johndoe@example.com",
        guestPhone: "123-456-7890",
        vendor: vendors[0]._id,
        services: [
          { service: services[0]._id, quantity: 2 },
          { service: services[1]._id, quantity: 1 },
        ],
        totalPrice: 150, // Calculate dynamically if needed
        status: "pending",
        paymentStatus: "pending",
        bookingDate: new Date(),
      },
      {
        guestName: "Jane Smith",
        guestEmail: "janesmith@example.com",
        guestPhone: "987-654-3210",
        vendor: vendors[1]._id,
        services: [{ service: services[2]._id, quantity: 3 }],
        totalPrice: 250,
        status: "confirmed",
        paymentStatus: "paid",
        bookingDate: new Date(),
      },
    ];

    await Booking.deleteMany();
    await Booking.insertMany(bookings);

    console.log("✅ Booking seeding successful!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding bookings:", error);
    process.exit(1);
  }
};

seedBookings();
