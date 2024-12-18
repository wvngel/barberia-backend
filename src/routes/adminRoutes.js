const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { isAuthenticated, isAdmin, checkSession } = require("../middlewares/sessionConfirmation");
const {
    getAllClientes,
    getClienteById,
    getAllBarberos,
    getBarberoById,
    createCliente,
    createBarbero,
    updateCliente,
    updateBarbero,
    deleteCliente,
    deleteBarbero,
    getAllProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto,
} = require("../controllers/adminController");



// Configuración de multer para manejar imágenes de productos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Construir la ruta absoluta al directorio del frontend
        const rutaFrontend = path.join(__dirname, "../../../barberia-frontend/img/productos/");
        cb(null, rutaFrontend);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname); // Obtener la extensión del archivo
        cb(null, `imagen-${uniqueSuffix}${ext}`); // Crear un nombre único para la imagen
    },
});
const upload = multer({ storage });

// Verificar sesión y datos
router.get("/admin-check-session", isAuthenticated, isAdmin, checkSession);

// Rutas para clientes
router.get("/clientes", isAuthenticated, isAdmin, getAllClientes);
router.post("/clientes", isAuthenticated, isAdmin, createCliente);
router.put("/clientes/:id", isAuthenticated, isAdmin, updateCliente);
router.delete("/clientes/:id", isAuthenticated, isAdmin, deleteCliente);
router.get("/clientes/:id", isAuthenticated, isAdmin, getClienteById);

// Rutas para barberos
router.get("/barberos", isAuthenticated, isAdmin, getAllBarberos);
router.post("/barberos", isAuthenticated, isAdmin, createBarbero);
router.put("/barberos/:id", isAuthenticated, isAdmin, updateBarbero);
router.delete("/barberos/:id", isAuthenticated, isAdmin, deleteBarbero);
router.get("/barberos/:id", isAuthenticated, isAdmin, getBarberoById);

// Rutas para productos
router.get("/productos", isAuthenticated, isAdmin, getAllProductos);

router.put("/productos/:id", isAuthenticated, isAdmin, upload.single("imagen"), updateProducto);
router.delete("/productos/:id", isAuthenticated, isAdmin, deleteProducto);
router.get("/productos/:id", isAuthenticated, isAdmin, getProductoById);

module.exports = router;
