const Inventory = require("../models/inventory.model");
const Product = require("../models/product.model");


const getInventory = async (req, res) => {
  const { id } = req.params;
  const inventory = await Inventory.find({ supplier: id }).populate("product");
  res.status(200).json({ message: "Inventory fetched successfully", data: inventory });
};

const createInventory = async (req, res) => {
  try {

    
    const { supplierId, quantity, price, serviceArea, category, productName } = req.body;

    // Check if a product with the same name and category exists
    let product = await Product.findOne({ name: productName, category });

    if (!product) {
      // Create new product if it doesn't exist
      product = new Product({
        name: productName,
        category,
        serviceArea
      });
      await product.save();
    }

    // Create a new inventory entry
    const inventory = new Inventory({
      supplier: supplierId,
      product: product._id,
      quantity,
      price
    });

    await inventory.save();

    // Populate product details before sending response
    const populatedInventory = await Inventory.findById(inventory._id).populate("product");

    res.status(201).json({ message: "Inventory created successfully", data: populatedInventory });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, price, serviceArea, category, productName } = req.body;

    let inventory = await Inventory.findById(id).populate("product");

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    const product = inventory.product;
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    Object.assign(product, {
      ...(productName && { name: productName }),
      ...(serviceArea && { serviceArea }),
      ...(category && { category })
    });

    Object.assign(inventory, {
      ...(quantity && { quantity }),
      ...(price && { price })
    });

    await Promise.all([product.save(), inventory.save()]);

    inventory = await Inventory.findById(id).populate("product");

    res.status(200).json({ message: "Inventory updated successfully", data: inventory });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const deleteInventory = async (req, res) => {
  const { id } = req.params;
  const deletedInventory = await Inventory.findByIdAndDelete(id);
  if (!deletedInventory) {
    return res.status(404).json({ message: "Inventory not found" });
  }
  const deletedProduct = await Product.findByIdAndDelete(deletedInventory.product);
  if (!deletedProduct) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json({ message: "Inventory deleted successfully", data: deletedInventory._id });
};

module.exports = { createInventory, getInventory, updateInventory, deleteInventory };






