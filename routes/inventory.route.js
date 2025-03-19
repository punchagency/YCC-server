const express = require("express");
const inventoryRoutes = express.Router();
const {createInventory, getInventory, updateInventory, deleteInventory} = require("../controllers/inventory.controller");

inventoryRoutes.post("/", createInventory);
inventoryRoutes.get("/:id", getInventory);
inventoryRoutes.patch("/:id", updateInventory);
inventoryRoutes.delete("/:id", deleteInventory);

module.exports = inventoryRoutes;
