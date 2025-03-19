const mongoose = require('mongoose');


const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: false },
    serviceArea: { type: String, required: true },
    sku: { type: String, unique: true, required: false },  //auto generated  Unique Stock Keeping Unit
  },
  { timestamps: true }
);

ProductSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); 

  const categoryPrefix = this.category.toUpperCase().slice(0, 4); 
  const nameAbbreviation = this.name.toUpperCase().slice(0, 3); 

  const lastProduct = await mongoose
    .model("Product")
    .findOne({ sku: new RegExp(`^${categoryPrefix}-${nameAbbreviation}-\\d{3}$`) })
    .sort({ sku: -1 });

  let nextNumber = 1;
  if (lastProduct) {
    const lastNumber = parseInt(lastProduct.sku.split("-").pop(), 10);
    nextNumber = lastNumber + 1;
  }

  this.sku = `${categoryPrefix}-${nameAbbreviation}-${String(nextNumber).padStart(3, "0")}`;

  next();
});
const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;