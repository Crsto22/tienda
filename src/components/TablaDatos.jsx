import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";

const TablaDatos = () => {
  const [productos, setProductos] = useState([]);

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
  const eliminarProducto = async (id) => {
    try {
      await deleteDoc(doc(db, "productos", id));

    } catch (error) {
      console.error("Error al eliminar el producto: ", error);
    }
  };

  return (
    <div className="w-full px-4 sm:px-0">
      {/* Card del Total del Inventario */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">Total del Inventario</h3>
        <p className="text-2xl font-bold text-blue-600 mt-2">
          {formatearPrecioSoles(totalInventario)}
        </p>
        <p className="text-sm text-gray-500 mt-1">Valor total en soles (PEN)</p>
      </div>

      {/* Título sección */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-semibold">Listado de Productos</h2>
        <p className="text-sm text-blue-100">
          {productos.length} productos registrados
        </p>
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
                Descripción
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Venc.
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
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
            {productos.length > 0 ? (
              productos.map((producto) => {
                const totalProducto = (producto.precio || 0) * (producto.cantidad || 0);
                return (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {producto.nombre || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {producto.descripcion || "-"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(producto.fecha_vencimiento)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatearPrecioSoles(producto.precio)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {producto.cantidad || "0"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-semibold">
                      {formatearPrecioSoles(totalProducto)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => eliminarProducto(producto.id)}
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
                  No hay productos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Para móviles - Vista de tarjetas */}
      <div className="sm:hidden">
        {productos.length > 0 ? (
          <div className="space-y-4">
            {productos.map((producto) => {
              const totalProducto = (producto.precio || 0) * (producto.cantidad || 0);
              return (
                <div key={producto.id} className="bg-white p-4 rounded-lg shadow mb-3 border border-gray-200">
                  <h3 className="font-bold text-lg text-gray-800">{producto.nombre || "-"}</h3>
                  
                  <div className="mt-2 text-sm">
                    <p className="text-gray-600 mb-1 line-clamp-2">{producto.descripcion || "-"}</p>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Fecha Venc.</p>
                      <p>{formatearFecha(producto.fecha_vencimiento)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Precio</p>
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

                  {/* Botón de eliminar en la vista móvil */}
                  <div className="mt-4">
                    <button
                      onClick={() => eliminarProducto(producto.id)}
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
            No hay productos registrados
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