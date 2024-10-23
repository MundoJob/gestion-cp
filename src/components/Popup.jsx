import React, { useState } from "react";
import Swal from "sweetalert2";
import DropCustom from "./DropCustom";
import DropCustom2 from "./DropCustom2";

const Popup = ({ togglePopup, registerID, module, onSave, estado, tipo }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    N_Pago: "",
    Tipo: "",
    Comentario_Gestor: "",
    Monto: "",
    Monto_Secundario: "",
    Fecha_solicitud_pago: "",
    Estado: "",
    Fecha_entrega: "",
    Fecha_cobro: "",
    URL_Comprobante: "",
    Administracion: "",
  });

  const validateForm = () => {
    const errors = [];

    if (!formData.N_Pago) {
      errors.push("El Nº de pago es obligatorio");
    }
    if (!formData.Tipo || formData.Tipo === "none") {
      errors.push("El Tipo es obligatorio");
    }
    if (!formData.Estado || formData.Estado === "-None-") {
      errors.push("El Estado es obligatorio");
    }

    // Nueva lógica de validación para el Monto
    if (formData.Estado === "Pago") {
      if (!formData.Monto) {
        errors.push("El Monto es obligatorio cuando el Estado es Pago");
      }
      if (formData.Monto && isNaN(formData.Monto)) {
        errors.push("El Monto debe ser un número");
      }
      if (!formData.Fecha_cobro) {
        errors.push(
          "La Fecha contable es obligatoria cuando el Estado es Pago"
        );
      }
    } else if (formData.Estado === "Debe" && formData.Fecha_solicitud_pago) {
      if (!formData.Monto) {
        errors.push(
          "El Monto es obligatorio cuando el Estado es Debe y hay Fecha de solicitud de pago"
        );
      }
      if (formData.Monto && isNaN(formData.Monto)) {
        errors.push("El Monto debe ser un número");
      }
    }

    if (errors.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Errores de validación",
        html: errors.map((error) => `- ${error}`).join("<br>"),
        position: "top-end",
        toast: true,
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }

    return errors.length === 0;
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleRecord = async (formData) => {
    const getConfig = {
      Entity: module,
      RecordID: registerID,
    };
    try {
      const currentRecord = await window.ZOHO.CRM.API.getRecord(getConfig);
      console.log("llamada GetRecord");

      const currentGestionCP = Array.isArray(currentRecord.data[0].GestionCP)
        ? currentRecord.data[0].GestionCP
        : [];
      const updatedGestionCP = [...currentGestionCP, formData];
      const updateConfig = {
        Entity: module,
        APIData: {
          id: registerID,
          GestionCP: updatedGestionCP,
          Mover_archivo_workdrive: true,
        },
        Trigger: ["workflow"],
      };

      const updateResponse = await window.ZOHO.CRM.API.updateRecord(
        updateConfig
      );
      console.log("llamada UpdateRecord");

      const gestionCPArray = updateResponse.data[0].details.GestionCP;
      const lastGestionCP = gestionCPArray[gestionCPArray.length - 1]; // Obtiene el último elemento
      const lastGestionCPId = lastGestionCP.id; // Accede al id del último registro
      console.log(lastGestionCPId);

      return lastGestionCPId;
    } catch (error) {
      console.error("Error updating record:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const recordId = await handleRecord(formData);

      setFormData({
        N_Pago: "",
        Tipo: "",
        Comentario_Gestor: "",
        Monto: "",
        Monto_Secundario: "",
        Fecha_solicitud_pago: "",
        Estado: "",
        Fecha_entrega: "",
        Fecha_cobro: "",
        URL_Comprobante: "",
        Administracion: "",
      });
      setIsSubmitting(false);
      onSave();

      Swal.fire({
        icon: "success",
        title: "Guardado con éxito",
        position: "top-end",
        toast: true,
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error:", error);
      setIsSubmitting(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al guardar el registro",
        position: "top-end",
        toast: true,
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
    togglePopup();
  };

  return (
    <div className="w-screen h-screen absolute top-0 bg-[#000000b6] flex justify-center items-start z-20">
      <div
        className={`bg-[#f0f1f1] p-6 rounded-lg w-[95%] shadow-[0px_0px_30px_rgba(234,234,234,0.5)] mt-24`}
      >
        <div className={`text-xl flex justify-between font-semibold mb-4`}>
          <h2>Nueva Entrada</h2>
          <div>
            <div className="flex justify-end gap-4 text-sm">
              <div
                onClick={!isSubmitting ? handleSubmit : null} // Solo permite clic si no se está enviando
                className={`cursor-pointer inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-md 4xl:text-lg font-medium rounded-md text-white ${
                  isSubmitting
                    ? "bg-gray-400"
                    : "bg-[#43d1a7] hover:bg-[#37c298]"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </div>
              <button
                onClick={() => togglePopup()}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-md 4xl:text-lg font-medium rounded-md text-white bg-[#f74363] hover:bg-[#db3a58] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="  ">
          <div className="flex w-[100%] h-full  ">
            <div className="w-[100%]   ">
              <div className="flex justify-between flex-wrap ">
                <div className="mb-4  flex flex-col h-20  ">
                  <label
                    htmlFor="N_Pago"
                    className="block text-md font-medium mr-4 mb-2"
                  >
                    Nº de pago
                  </label>
                  <input
                    type="text"
                    id="N_Pago"
                    name="N_Pago"
                    value={formData.N_Pago}
                    onChange={handleChange}
                    className="block border-2 flex-1  text-center rounded-md sm:text-md shadow-md"
                  />
                </div>
                <div className="mb-4  flex flex-col h-20  ">
                  <label
                    htmlFor="Tipo"
                    className="block text-md font-medium mr-4 mb-2"
                  >
                    Tipo
                  </label>
                  <select
                    id="Tipo"
                    name="Tipo"
                    value={formData.Tipo || ""}
                    onChange={handleChange}
                    className="block border-2 3xl:flex-1 3xl:w-40 2xl:w-32 h-16 text-center rounded-md sm:text-md shadow-md"
                  >
                    <option value="none">Seleccione</option>
                    {tipo
                      .filter((e) => e.display_value !== "-None-")
                      .map((e) => (
                        <option key={e.id} value={e.display_value}>
                          {e.display_value}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="mb-4  flex flex-col h-20  ">
                  <label
                    htmlFor="Monto"
                    className="block text-md font-medium mr-4 mb-2"
                  >
                    Monto
                  </label>
                  <input
                    type="text"
                    id="Monto"
                    name="Monto"
                    value={formData.Monto}
                    onChange={handleChange}
                    className="block border-2 flex-1  text-center rounded-md sm:text-md shadow-md"
                  />
                </div>
                <div className="mb-4  flex flex-col h-20  ">
                  <label
                    htmlFor="Monto_Secundario"
                    className="block text-md font-medium mr-4 mb-2"
                  >
                    Monto secundario
                  </label>
                  <input
                    type="text"
                    id="Monto_Secundario"
                    name="Monto_Secundario"
                    value={formData.Monto_Secundario}
                    onChange={handleChange}
                    className="block border-2 flex-1  text-center rounded-md sm:text-md shadow-md"
                  />
                </div>
                <div className="mb-4  flex flex-col h-20  ">
                  <label
                    htmlFor="Fecha_solicitud_pago"
                    className="block text-md font-medium mr-4 mb-2"
                  >
                    Fecha solicitud de pago
                  </label>
                  <input
                    type="date"
                    id="Fecha_solicitud_pago"
                    name="Fecha_solicitud_pago"
                    value={formData.Fecha_solicitud_pago}
                    onChange={handleChange}
                    className="block border-2 flex-1  text-center rounded-md sm:text-md shadow-md"
                  />
                </div>
                <div className="mb-4  flex flex-col h-20  ">
                  <label
                    htmlFor="Estado"
                    className="block text-md font-medium mr-4 mb-2"
                  >
                    Estado
                  </label>

                  <DropCustom2
                    options={estado
                      .filter((e) => e.display_value !== "-None-")
                      .map((e) => ({
                        value: e.display_value,
                        label: e.display_value,
                        color:
                          e.display_value === "Debe"
                            ? "#eb4d4d"
                            : e.display_value === "Pago"
                            ? "#67c480"
                            : e.display_value === "PARALIZADO"
                            ? "#f5c72f"
                            : e.display_value === "Caido"
                            ? "#666666"
                            : null,
                      }))}
                    value={formData.Estado || ""}
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "Estado",
                          value: e,
                          type: "select",
                        },
                      })
                    }
                  />
                </div>
                <div className="mb-4  flex flex-col h-20  ">
                  <label
                    htmlFor="Fecha_entrega"
                    className="block text-md font-medium mr-4 mb-2"
                  >
                    Fecha entrega
                  </label>
                  <input
                    type="date"
                    id="Fecha_entrega"
                    name="Fecha_entrega"
                    value={formData.Fecha_entrega}
                    onChange={handleChange}
                    className="block border-2 flex-1  text-center rounded-md sm:text-md shadow-md"
                  />
                </div>
                <div className="mb-4  flex flex-col h-20  ">
                  <label
                    htmlFor="Fecha_cobro"
                    className="block text-md font-medium mr-4 mb-2"
                  >
                    Fecha contable
                  </label>
                  <input
                    type="date"
                    id="Fecha_cobro"
                    name="Fecha_cobro"
                    value={formData.Fecha_cobro}
                    onChange={handleChange}
                    className="block border-2 flex-1  text-center rounded-md sm:text-md shadow-md"
                  />
                </div>
                <div className="mb-4 w-[70%]  h-20  flex flex-col ">
                  <label
                    htmlFor="Comentario_Gestor"
                    className="block text-md font-medium mr-4 mb-2"
                  >
                    Comentario gestor
                  </label>
                  <textarea
                    id="Comentario_Gestor"
                    name="Comentario_Gestor"
                    value={formData.Comentario_Gestor}
                    onChange={handleChange}
                    className="block border-2 w-full h-24 text-center rounded-md shadow-md sm:text-md pt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Popup;
