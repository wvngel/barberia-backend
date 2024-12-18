const pool = require("../config/database");
const bcrypt = require("bcryptjs");


//------------------------------------------------CRUD CLIENTES -----------------------------------------------
// Obtener todos los clientes
const getAllClientes = async (req, res) => {
  try {
    const [clientes] = await pool.query("SELECT * FROM usuarios_clientes");
    res.status(200).json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener los clientes." });
  }
};

// Obtener un cliente por ID
const getClienteById = async (req, res) => {
  const { id } = req.params;

  try {
    const [cliente] = await pool.query("SELECT * FROM usuarios_clientes WHERE id_cliente = ?", [id]);

    if (cliente.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.status(200).json(cliente[0]);
  } catch (error) {
    console.error("Error al obtener el cliente:", error);
    res.status(500).json({ error: "Error al obtener el cliente" });
  }
};

// Crear un cliente
// Función para validar RUT en el backend

// Validar RUT
const validarRut = (rut, dv) => {
  let suma = 0;
  let multiplicador = 2;

  for (let i = rut.length - 1; i >= 0; i--) {
    suma += parseInt(rut[i]) * multiplicador;
    multiplicador = multiplicador < 7 ? multiplicador + 1 : 2;
  }

  const dvCalculado = 11 - (suma % 11);
  const dvReal = dvCalculado === 11 ? "0" : dvCalculado === 10 ? "K" : dvCalculado.toString();

  return dv.toUpperCase() === dvReal;
};

// Validar teléfono chileno
const validarTelefonoChileno = (telefono) => {
  const regexTelefono = /^9\d{8}$/; // Número debe comenzar con 9 y tener 9 dígitos
  return regexTelefono.test(telefono);
};

// Crear cliente
const createCliente = async (req, res) => {
  try {
    console.log("Datos recibidos en el backend:", req.body);

    const { nombre, apellido, email, telefono, contrasena, confirmarContrasena, rut, digitoVerificador } = req.body;

    if (!nombre || !apellido || !email || !telefono || !contrasena || !confirmarContrasena || !rut || !digitoVerificador) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }
    
    // Validar contraseñas
    if (contrasena !== confirmarContrasena) {
      return res.status(400).json({ error: "Las contraseñas no coinciden." });
    }

    // Validar RUT
    if (!validarRut(rut, digitoVerificador)) {
      return res.status(400).json({ error: "El RUT ingresado es inválido." });
    }

    const rutCompleto = `${rut}-${digitoVerificador}`;

    // Validar teléfono
    if (!validarTelefonoChileno(telefono)) {
      return res.status(400).json({ error: "El número de teléfono debe comenzar con 9 y tener 9 dígitos." });
    }

    const telefonoCompleto = `+56${telefono}`;

    // Verificar duplicados
    const [clienteExistente] = await pool.query(
      "SELECT * FROM usuarios_clientes WHERE email = ? OR rut = ? OR telefono = ?",
      [email, rutCompleto, telefonoCompleto]
    );

    if (clienteExistente.length > 0) {
      return res.status(400).json({ error: "El correo, RUT o teléfono ya están registrados." });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar cliente
    await pool.query(
      "INSERT INTO usuarios_clientes (nombre, apellido, email, telefono, contrasena, rut) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, apellido, email, telefonoCompleto, hashedPassword, rutCompleto]
    );

    res.status(201).json({ message: "Cliente creado exitosamente." });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ error: "Error al crear el cliente." });
  }
};



// Actualizar cliente
const updateCliente = async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, apellido, rut, email, telefono } = req.body;
  
      await pool.query(
        "UPDATE usuarios_clientes SET nombre = ?, apellido = ?, rut = ?, email = ?, telefono = ? WHERE id_cliente = ?",
        [nombre, apellido, rut, email, telefono, id]
      );
  
      res.status(200).json({ message: "Cliente actualizado exitosamente." });
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      res.status(500).json({ error: "Error al actualizar el cliente." });
    }
  };

// Eliminar cliente
const deleteCliente = async (req, res) => {
    try {
      const { id } = req.params;
  
      await pool.query("DELETE FROM usuarios_clientes WHERE id_cliente = ?", [id]);
  
      res.status(200).json({ message: "Cliente eliminado exitosamente." });
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      res.status(500).json({ error: "Error al eliminar el cliente." });
    }
  };

//------------------------------------------------CRUD BARBEROS -----------------------------------------------
// Obtener todos los barberos
const getAllBarberos = async (req, res) => {
    try {
      const [barberos] = await pool.query("SELECT * FROM barberos");
      res.status(200).json(barberos);
    } catch (error) {
      console.error("Error al obtener barberos:", error);
      res.status(500).json({ error: "Error al obtener los barberos." });
    }
  };

// Obtener barbero por ID
const getBarberoById = async (req, res) => {
    const { id } = req.params;
  
    try {
      const [barbero] = await pool.query("SELECT * FROM barberos WHERE id_barbero = ?", [id]);
  
      if (barbero.length === 0) {
        return res.status(404).json({ error: "Barbero no encontrado" });
      }
  
      res.status(200).json(barbero[0]);
    } catch (error) {
      console.error("Error al obtener barbero por ID:", error);
      res.status(500).json({ error: "Error al obtener barbero" });
    }
  };
// Crear un barbero
// Validar RUT// Validar RUT de barberos
const validarRutBarbero = (rut, dv) => {
  let suma = 0;
  let multiplicador = 2;

  for (let i = rut.length - 1; i >= 0; i--) {
    suma += parseInt(rut[i]) * multiplicador;
    multiplicador = multiplicador < 7 ? multiplicador + 1 : 2;
  }

  const dvCalculado = 11 - (suma % 11);
  const dvReal = dvCalculado === 11 ? "0" : dvCalculado === 10 ? "K" : dvCalculado.toString();

  return dv.toUpperCase() === dvReal;
};

// Validar teléfono chileno para barberos
const validarTelefonoBarbero = (telefono) => {
  const regexTelefono = /^9\d{8}$/; // Número debe comenzar con 9 y tener 9 dígitos
  return regexTelefono.test(telefono);
};

// Crear barbero
const createBarbero = async (req, res) => {
  try {
    console.log("Datos recibidos en el backend para crear barbero:", req.body);

    const {
      barberoNombre,
      barberoApellido,
      barberoEmail,
      barberoTelefono,
      barberoContrasena,
      barberoConfirmarContrasena,
      barberoRut,
      barberoDigitoVerificador,
      barberoEspecialidad,
    } = req.body;

    // Verificar campos obligatorios
    if (
      !barberoNombre ||
      !barberoApellido ||
      !barberoEmail ||
      !barberoTelefono ||
      !barberoContrasena ||
      !barberoConfirmarContrasena ||
      !barberoRut ||
      !barberoDigitoVerificador ||
      !barberoEspecialidad
    ) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Validar contraseñas
    if (barberoContrasena !== barberoConfirmarContrasena) {
      return res.status(400).json({ error: "Las contraseñas no coinciden." });
    }

    // Validar RUT
    if (!validarRutBarbero(barberoRut, barberoDigitoVerificador)) {
      return res.status(400).json({ error: "El RUT ingresado es inválido." });
    }

    const rutCompletoBarbero = `${barberoRut}-${barberoDigitoVerificador}`;

    // Validar teléfono
    if (!validarTelefonoBarbero(barberoTelefono)) {
      return res.status(400).json({
        error: "El número de teléfono debe comenzar con 9 y tener 9 dígitos.",
      });
    }

    const telefonoCompletoBarbero = `+56${barberoTelefono}`;

    // Verificar duplicados
    const [barberoExistente] = await pool.query(
      "SELECT * FROM barberos WHERE email = ? OR rut = ? OR telefono = ?",
      [barberoEmail, rutCompletoBarbero, telefonoCompletoBarbero]
    );

    if (barberoExistente.length > 0) {
      return res.status(400).json({
        error: "El correo, RUT o teléfono ya están registrados.",
      });
    }

    // Hashear contraseña
    const hashedPasswordBarbero = await bcrypt.hash(barberoContrasena, 10);

    // Insertar barbero
    await pool.query(
      "INSERT INTO barberos (nombre, apellido, email, telefono, especialidad, contrasena, rut) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        barberoNombre,
        barberoApellido,
        barberoEmail,
        telefonoCompletoBarbero,
        barberoEspecialidad,
        hashedPasswordBarbero,
        rutCompletoBarbero,
      ]
    );

    res.status(201).json({ message: "Barbero creado exitosamente." });
  } catch (error) {
    console.error("Error al crear barbero:", error);
    res.status(500).json({ error: "Error al crear el barbero." });
  }
};



// Modificar barbero
const updateBarbero = async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, apellido, rut, email, telefono, especialidad } = req.body;
  
      await pool.query(
        "UPDATE barberos SET nombre = ?, apellido = ?, rut = ?, email = ?, telefono = ?, especialidad = ? WHERE id_barbero = ?",
        [nombre, apellido, rut, email, telefono, especialidad, id]
      );
  
      res.status(200).json({ message: "Barbero actualizado exitosamente." });
    } catch (error) {
      console.error("Error al actualizar barbero:", error);
      res.status(500).json({ error: "Error al actualizar el barbero." });
    }
  };
  
// Eliminar barbero
const deleteBarbero = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM barberos WHERE id_barbero = ?", [id]);

    res.status(200).json({ message: "Barbero eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar barbero:", error);
    res.status(500).json({ error: "Error al eliminar el barbero." });
  }
};

//------------------------------------------------CRUD PRODUCTOS ----------------------------------------------------------------------------------------------
// Obtener todos los productos con su categoría
const getAllProductos = async (req, res) => {
    try {
      const [productos] = await pool.query(
        `SELECT p.*, c.descripcion AS categoria
         FROM productos p
         LEFT JOIN categoria_productos c ON p.id_categoria = c.id_categoria`
      );
      res.status(200).json(productos);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      res.status(500).json({ error: "Error al obtener los productos." });
    }
  };
  
// Obtener un producto por ID
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



  
  // Actualizar un producto
  const fs = require("fs");
  const path = require("path");
  
  // Actualizar un producto
  const updateProducto = async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, precio, stock, id_categoria, imagen_url } = req.body;
  
      // Validar que la categoría exista
      const [categoria] = await pool.query("SELECT * FROM categoria_productos WHERE id_categoria = ?", [id_categoria]);
      if (categoria.length === 0) {
        return res.status(400).json({ error: "La categoría proporcionada no existe." });
      }
  
      let nuevaImagenUrl = imagen_url;
  
      // Si se subió una nueva imagen
      if (req.file) {
        // Ruta donde se guardará la nueva imagen
        const nuevaRutaImagen = `img/productos/${req.file.filename}`;
  
        // Eliminar la imagen antigua si existe y no es la misma
        if (imagen_url && imagen_url !== nuevaRutaImagen) {
          const rutaAntigua = path.join(__dirname, "..", imagen_url);
          fs.unlink(rutaAntigua, (err) => {
            if (err) console.error("Error al eliminar la imagen antigua:", err);
          });
        }
  
        nuevaImagenUrl = nuevaRutaImagen;
      }
  
      // Actualizar el producto
      await pool.query(
        `UPDATE productos
          SET nombre = ?, descripcion = ?, precio = ?, stock = ?, id_categoria = ?, imagen_url = ?
          WHERE id_producto = ?`,
        [nombre, descripcion, precio, stock, id_categoria, nuevaImagenUrl, id]
      );
  
      res.status(200).json({ message: "Producto actualizado exitosamente." });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      res.status(500).json({ error: "Error al actualizar el producto." });
    }
  };


  // Eliminar un producto
  const deleteProducto = async (req, res) => {
    try {
      const { id } = req.params;
  
      await pool.query("DELETE FROM productos WHERE id_producto = ?", [id]);
  
      res.status(200).json({ message: "Producto eliminado exitosamente." });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      res.status(500).json({ error: "Error al eliminar el producto." });
    }
  };
  
  module.exports = {
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
    updateProducto,
    deleteProducto,
  };
  