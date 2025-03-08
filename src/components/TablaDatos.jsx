import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";

const TablaDatos = () => {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState(""); // Estado para el texto de búsqueda
  const [modalVisible, setModalVisible] = useState(false); // Estado para controlar la visibilidad de la modal de eliminación
  const [modalEditarVisible, setModalEditarVisible] = useState(false); // Estado para controlar la visibilidad de la modal de edición
  const [productoAEliminar, setProductoAEliminar] = useState(null); // Estado para almacenar el ID del producto a eliminar
  const [productoAEditar, setProductoAEditar] = useState(null); // Estado para almacenar el producto a editar

  // Estados para los campos del formulario de edición
  const [nombreEditar, setNombreEditar] = useState("");
  const [precioVentaEditar, setPrecioVentaEditar] = useState("");
  const [tieneFechaVencimientoEditar, setTieneFechaVencimientoEditar] = useState(false);
  const [fechaVencimientoEditar, setFechaVencimientoEditar] = useState("");
  const [precioProveedorEditar, setPrecioProveedorEditar] = useState("");
  const [cantidadEditar, setCantidadEditar] = useState("");

  useEffect(() => {
    // Escuchar cambios en la colección "productos"
    const unsubscribe = onSnapshot(collection(db, "productos"), (querySnapshot) => {
      const datos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(datos); // Actualizar el estado con los nuevos datos
    });

    // Limpiar la suscripción al desmontar el componente
    return () => unsubscribe();
  }, []);

  // Función para formatear la fecha
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "-";
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString("es-ES");
    } catch (error) {
      return fechaString;
    }
  };

  // Función para formatear el precio en soles
  const formatearPrecioSoles = (precio) => {
    return precio ? `S/ ${Number(precio).toFixed(2)}` : "-";
  };

  // Calcular el total del inventario
  const totalInventario = productos.reduce((total, producto) => {
    const precio = producto.precio || 0;
    const cantidad = producto.cantidad || 0;
    return total + precio * cantidad;
  }, 0);

  // Función para eliminar un producto
  const eliminarProducto = async () => {
    if (!productoAEliminar) return;

    try {
      await deleteDoc(doc(db, "productos", productoAEliminar));
      setModalVisible(false); // Cerrar la modal después de eliminar
    } catch (error) {
      console.error("Error al eliminar el producto: ", error);
    }
  };

  // Función para abrir el modal de edición
  const abrirModalEditar = (producto) => {
    setProductoAEditar(producto);
    setNombreEditar(producto.nombre);
    setPrecioVentaEditar(producto.descripcion);
    setTieneFechaVencimientoEditar(producto.tiene_fecha_vencimiento);
    setFechaVencimientoEditar(producto.fecha_vencimiento || "");
    setPrecioProveedorEditar(producto.precio);
    setCantidadEditar(producto.cantidad);
    setModalEditarVisible(true);
  };

  // Función para guardar los cambios editados
  const guardarEdicion = async () => {
    if (!productoAEditar) return;

    try {
      await updateDoc(doc(db, "productos", productoAEditar.id), {
        nombre: nombreEditar,
        descripcion: precioVentaEditar,
        tiene_fecha_vencimiento: tieneFechaVencimientoEditar,
        fecha_vencimiento: tieneFechaVencimientoEditar ? fechaVencimientoEditar : null,
        precio: parseFloat(precioProveedorEditar),
        cantidad: parseInt(cantidadEditar),
      });
      setModalEditarVisible(false); // Cerrar la modal después de editar
    } catch (error) {
      console.error("Error al editar el producto: ", error);
    }
  };

  // Filtrar productos según la búsqueda
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="w-full px-4 sm:px-0">
      {/* Modal de confirmación para eliminar */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
            <h3 className="text-xl font-semibold text-gray-800">¿Estás seguro?</h3>
            <p className="text-sm text-gray-600 mt-2">
              Esta acción eliminará el producto permanentemente. ¿Deseas continuar?
            </p>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setModalVisible(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarProducto}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {modalEditarVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
            <h3 className="text-xl font-semibold text-gray-800">Editar Producto</h3>
            <form className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre:</label>
                <input
                  type="text"
                  value={nombreEditar}
                  onChange={(e) => setNombreEditar(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio de Venta:</label>
                <input
                  type="number"
                  step="0.01"
                  value={precioVentaEditar}
                  onChange={(e) => setPrecioVentaEditar(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio Proveedor:</label>
                <input
                  type="number"
                  step="0.01"
                  value={precioProveedorEditar}
                  onChange={(e) => setPrecioProveedorEditar(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cantidad:</label>
                <input
                  type="number"
                  value={cantidadEditar}
                  onChange={(e) => setCantidadEditar(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento:</label>
                <input
                  type="date"
                  value={fechaVencimientoEditar}
                  onChange={(e) => setFechaVencimientoEditar(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setModalEditarVisible(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={guardarEdicion}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card del Total del Inventario */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">Total del Inventario</h3>
        <p className="text-2xl font-bold text-blue-600 mt-2">
          {formatearPrecioSoles(totalInventario)}
        </p>
        <p className="text-sm text-gray-500 mt-1">Valor total en soles (PEN)</p>
      </div>

      {/* Título sección y buscador */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">Listado de Productos</h2>
        <p className="text-sm text-blue-100 mb-4">
          {productosFiltrados.length} productos encontrados
        </p>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-2 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Para pantallas medianas y grandes - Tabla tradicional */}
      <div className="hidden sm:block overflow-x-auto shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio de Venta
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Venc.
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Proveedor
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((producto) => {
                const totalProducto = (producto.precio || 0) * (producto.cantidad || 0);
                return (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {producto.nombre || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {formatearPrecioSoles(producto.descripcion)} {/* Precio de Venta */}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(producto.fecha_vencimiento)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatearPrecioSoles(producto.precio)} {/* Precio Proveedor */}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {producto.cantidad || "0"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-semibold">
                      {formatearPrecioSoles(totalProducto)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => abrirModalEditar(producto)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setProductoAEliminar(producto.id);
                          setModalVisible(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-3 text-sm text-center text-gray-500">
                  No hay productos que coincidan con la búsqueda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Para móviles - Vista de tarjetas */}
      <div className="sm:hidden">
        {productosFiltrados.length > 0 ? (
          <div className="space-y-4">
            {productosFiltrados.map((producto) => {
              const totalProducto = (producto.precio || 0) * (producto.cantidad || 0);
              return (
                <div key={producto.id} className="bg-white p-4 rounded-lg shadow mb-3 border border-gray-200">
                  <h3 className="font-bold text-lg text-gray-800">{producto.nombre || "-"}</h3>
                  
                  <div className="mt-2 text-sm">
                    <p className="text-gray-600 mb-1 line-clamp-2">
                      Precio de Venta: {formatearPrecioSoles(producto.descripcion)} {/* Precio de Venta */}
                    </p>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Fecha Venc.</p>
                      <p>{formatearFecha(producto.fecha_vencimiento)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Precio Proveedor</p>
                      <p className="font-semibold text-blue-600">{formatearPrecioSoles(producto.precio)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Cantidad</p>
                      <p>{producto.cantidad || "0"} unidades</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Total</p>
                      <p className="font-semibold text-green-600">{formatearPrecioSoles(totalProducto)}</p>
                    </div>
                  </div>

                  {/* Botones de acciones en la vista móvil */}
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => abrirModalEditar(producto)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setProductoAEliminar(producto.id);
                        setModalVisible(true);
                      }}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
            No hay productos que coincidan con la búsqueda
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 text-right rounded-b-lg text-xs text-gray-500 shadow-md">
        Última actualización: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default TablaDatos;