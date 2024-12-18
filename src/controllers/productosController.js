const pool = require("../config/database");

// Obtener todos los productos
const getProductos = async (req, res) => {
  try {
    const [productos] = await pool.query("SELECT * FROM productos");
    res.status(200).json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
};

// Obtener un producto por su ID
const getProductoById = async (req, res) => {
  const { id } = req.params;
  try {
    const [producto] = await pool.query("SELECT * FROM productos WHERE id_producto = ?", [id]);
    if (producto.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(producto[0]);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
};

// Crear un nuevo producto
const createProducto = async (req, res) => {
  const { nombre, descripcion, id_categoria, precio, stock, imagen_url } = req.body;
  try {
    const fecha_creacion = new Date(); // Fecha actual
    await pool.query(
      "INSERT INTO productos (nombre, descripcion, id_categoria, precio, stock, imagen_url, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [nombre, descripcion, id_categoria, precio, stock, imagen_url, fecha_creacion]
    );
    res.status(201).json({ message: "Producto creado exitosamente" });
  } catch (error) {
    console.error("Error al crear el producto:", error);
    res.status(500).json({ error: "Error al crear el producto" });
  }
};

// Actualizar un producto
const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, id_categoria, precio, stock, imagen_url } = req.body;
  try {
    const [producto] = await pool.query("SELECT * FROM productos WHERE id_producto = ?", [id]);
    if (producto.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await pool.query(
      "UPDATE productos SET nombre = ?, descripcion = ?, id_categoria = ?, precio = ?, stock = ?, imagen_url = ? WHERE id_producto = ?",
      [nombre, descripcion, id_categoria, precio, stock, imagen_url, id]
    );
    res.status(200).json({ message: "Producto actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

// Eliminar un producto
const deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const [producto] = await pool.query("SELECT * FROM productos WHERE id_producto = ?", [id]);
    if (producto.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    await pool.query("DELETE FROM productos WHERE id_producto = ?", [id]);
    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
};
