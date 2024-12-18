const express = require("express");
const router = express.Router();
const {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
} = require("../controllers/productosController");

// Rutas para productos
router.get("/", getProductos); // Obtener todos los productos
router.get("/:id", getProductoById); // Obtener un producto por ID
router.post("/", createProducto); // Crear un nuevo producto
router.put("/:id", updateProducto); // Actualizar un producto por ID
router.delete("/:id", deleteProducto); // Eliminar un producto por ID

module.exports = router;
