const mongoose = require("mongoose");
const Service = require("./models/service.model.js"); // Adjust the path if necessary

const services = [
  { name: "maintenance", description: "General maintenance services for vessels." },
  { name: "provisioning", description: "Supplying food and essentials for ships." },
  { name: "repairs", description: "Mechanical and structural repairs for boats." },
  { name: "catering", description: "Onboard catering and meal preparation services." },
  { name: "cleaning", description: "Deep cleaning services for yachts and ships." },
  { name: "security", description: "Maritime security and protection services." },
  { name: "transportation", description: "Logistics and transport solutions for crew and cargo." }
];

const seedServices = async () => {
  try { 
    await mongoose.connect("mongodb+srv://emmanuelnnachi:uRMEoTcD5TOxRyiu@cluster0.byhxx.mongodb.net/test", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await Service.deleteMany(); // Clears existing services
    await Service.insertMany(services);

    console.log("✅ Services seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding services:", error);
    mongoose.connection.close();
  }
};

seedServices();
