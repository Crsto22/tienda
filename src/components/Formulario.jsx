import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const Formulario = () => {
  const [nombre, setNombre] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [tieneFechaVencimiento, setTieneFechaVencimiento] = useState(false);
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [precioProveedor, setPrecioProveedor] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // Calcular el precio total
  const precioTotal = (parseFloat(precioProveedor) || 0) * (parseInt(cantidad) || 0);

  const guardarDatos = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMensaje({ texto: "", tipo: "" });

    try {
      await addDoc(collection(db, "productos"), {
        nombre: nombre,
        descripcion: precioVenta, // Aquí se guarda el precio de venta como "descripcion"
        tiene_fecha_vencimiento: tieneFechaVencimiento,
        fecha_vencimiento: tieneFechaVencimiento ? fechaVencimiento : null,
        precio: parseFloat(precioProveedor), // Aquí se guarda el precio proveedor como "precio"
        cantidad: parseInt(cantidad),
      });
      // Limpiar el formulario
      setNombre("");
      setPrecioVenta("");
      setTieneFechaVencimiento(false);
      setFechaVencimiento("");
      setPrecioProveedor("");
      setCantidad("");
      // Mostrar mensaje de éxito
      setMensaje({ texto: "Producto guardado exitosamente", tipo: "exito" });
    } catch (error) {
      console.error("Error al guardar los datos: ", error);
      setMensaje({ texto: "Error al guardar el producto", tipo: "error" });
    } finally {
      setIsLoading(false);
      // El mensaje desaparecerá después de 3 segundos
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
    }
  };

  return (
    <div className="w-full px-4 sm:px-0 sm:max-w-md mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
        Registro de Producto
      </h2>

      {mensaje.texto && (
        <div 
          className={`mb-4 p-3 rounded-md text-sm ${
            mensaje.tipo === "exito" 
              ? "bg-green-100 text-green-700 border border-green-200" 
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={guardarDatos} className="space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <label className="block text-sm font-medium text-gray-700">Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            placeholder="Ingrese nombre del producto"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <label className="block text-sm font-medium text-gray-700">Precio de Venta:</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">S/</span>
            <input
              type="number"
              step="0.01"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
              required
              placeholder="0.00"
              className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Toggle para fecha de vencimiento */}
        <div className="flex items-center">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={tieneFechaVencimiento}
              onChange={() => setTieneFechaVencimiento(!tieneFechaVencimiento)}
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">Tiene fecha de vencimiento</span>
          </label>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Fecha de vencimiento (condicional) */}
          {tieneFechaVencimiento && (
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento:</label>
              <input
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                required={tieneFechaVencimiento}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}
          
          <div className="space-y-1 sm:space-y-2">
            <label className="block text-sm font-medium text-gray-700">Cantidad:</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <label className="block text-sm font-medium text-gray-700">Precio Proveedor:</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">S/</span>
            <input
              type="number"
              step="0.01"
              value={precioProveedor}
              onChange={(e) => setPrecioProveedor(e.target.value)}
              required
              placeholder="0.00"
              className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Campo de Precio Total */}
        <div className="space-y-1 sm:space-y-2">
          <label className="block text-sm font-medium text-gray-700">Precio Total:</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">S/</span>
            <input
              type="text"
              value={precioTotal.toFixed(2)}
              readOnly
              className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className={`w-full py-3 px-4 text-white font-medium rounded-md shadow-sm transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isLoading 
              ? "bg-blue-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "Guardando..." : "Guardar Producto"}
        </button>
      </form>
    </div>
  );
};

export default Formulario;