/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Nav from "../components/Nav";
import Popup from "../components/Popup";
import { TbUpload } from "react-icons/tb";
import { GoDotFill } from "react-icons/go";
import { BsFillTrash3Fill } from "react-icons/bs";
import { BsFillCloudDownloadFill } from "react-icons/bs";
import Tooltip from "../components/Tooltip";
import DropCustom from "../components/DropCustom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import Registros from "../components/Registros";

const Layout = ({ module, registerID, datos }) => {
  const [pop, setPop] = useState(false);
  const [fields, setFields] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [isEditing, setIsEditing] = useState({});
  const [initialStates, setInitialStates] = useState({});
  const [pendingUploads, setPendingUploads] = useState({});
  const [originalRegistros, setOriginalRegistros] = useState([]);
  const {
    faltaCobrarCliente,
    totalMontoCobrado,
    faltaPaginaCliente,
    totalPaginasCobradas,
  } = useMemo(() => {
    const totalMontoCobrado = registros.reduce((acc, registro) => {
      if (registro.Estado === "Pago") {
        return acc + (parseFloat(registro.Monto) || 0);
      }
      return acc;
    }, 0);
    const faltaCobrarCliente = datos.Presupuesto - totalMontoCobrado;
    const montoPorPagina = datos.Presupuesto / datos.Numero_de_Paginas;
    const totalPaginasCobradas = totalMontoCobrado / montoPorPagina;
    const faltaPaginaCliente = datos.Numero_de_Paginas - totalPaginasCobradas;
    return {
      faltaCobrarCliente,
      totalMontoCobrado,
      faltaPaginaCliente,
      totalPaginasCobradas,
    };
  }, [registros, datos.Presupuesto, datos.Numero_de_Paginas]);

  const est = registros.map((r) => r.Estado);

  useEffect(() => {
    if (datos && datos.GestionCP) {
      setRegistros(datos.GestionCP);
      // Guardamos una copia profunda para comparar cambios posteriores
      setOriginalRegistros(JSON.parse(JSON.stringify(datos.GestionCP)));
      getFields();
      // Inicializar los estados originales
      const states = {};
      datos.GestionCP.forEach((registro) => {
        states[registro.id] = registro.Estado;
      });
      setInitialStates(states);
      // Limpiar el estado de edición al cargar nuevos datos
      setIsEditing({});
    }
  }, [datos]);

  const togglePopup = () => {
    setPop(!pop);
  };
  const showToast = (icon, title) => {
    Swal.fire({
      icon: icon,
      title: title,
      position: "top-end",
      toast: true,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };
  const handleLink = (url) => {
    window.open(url, "_blank");
  };
  const getFields = (entrity) => {
    return new Promise(function (resolve, reject) {
      window.ZOHO.CRM.META.getFields({ Entity: "Gestioncp" })
        .then(function (response) {
          console.log("llamada GetFields");
          setFields(response.fields);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  };
  const getFieldValues = (fields, apiName) => {
    const field = fields.find((item) => item.api_name === apiName);
    return field ? field.pick_list_values || [] : [];
  };
  const validateRegistros = () => {
    for (let i = 0; i < registros.length; i++) {
      const registro = registros[i];

      // Validación básica para campos siempre requeridos
      if (
        !registro.N_Pago ||
        registro.N_Pago === "-None-" ||
        !registro.Tipo ||
        registro.Tipo === "-None-" ||
        !registro.Estado ||
        registro.Estado === "-None-"
      ) {
        return {
          isValid: false,
          message: `El registro ${
            i + 1
          } tiene campos vacíos o con valor "-None-". Por favor, complete N° de pago, Tipo y Estado con valores válidos.`,
        };
      }

      // Validación específica para el campo Monto
      const requiereMonto =
        registro.Estado === "Pago" ||
        (registro.Estado === "Debe" && registro.Fecha_solicitud_pago);

      if (requiereMonto && (!registro.Monto || registro.Monto === "-None-")) {
        return {
          isValid: false,
          message: `El registro ${i + 1} requiere un monto válido porque ${
            registro.Estado === "Pago"
              ? "está marcado como Pagado"
              : "está marcado como Debe y tiene Fecha de solicitud de pago"
          }.`,
        };
      }
    }
    return { isValid: true };
  };
  const validateRegistrosBeforeSave = () => {
    const invalidRegistros = registros.filter((registro) => {
      const initialState = initialStates[registro.id];
      const currentState = registro.Estado;

      return (
        initialState !== "Pago" &&
        currentState === "Pago" &&
        (!registro.Comprobante ||
          registro.Comprobante.length === 0 ||
          !registro.Fecha_cobro)
      );
    });

    if (invalidRegistros.length > 0) {
      return {
        isValid: false,
        message: `Hay ${invalidRegistros.length} registro(s) que cambiaron a estado "Pagado" sin comprobante o fecha contable asignados. Por favor, complete estos campos antes de guardar.`,
      };
    }

    return { isValid: true };
  };
  const updateRegistros = async () => {
    try {
      const getConfig = {
        Entity: module,
        RecordID: registerID,
      };
      console.log("llamada GetRecord");
      const currentRecord = await window.ZOHO.CRM.API.getRecord(getConfig);
      if (currentRecord.data && currentRecord.data[0].GestionCP) {
        const newRegistros = currentRecord.data[0].GestionCP;
        const updatedRegistros = newRegistros.map((registro, index) => {
          if (pendingUploads[index]) {
            return {
              ...registro,
              Comprobante: [
                {
                  file_Name: pendingUploads[index].name,
                  isPending: true,
                },
              ],
            };
          }
          return registro;
        });
        setRegistros(updatedRegistros);
        // Actualizar también originalRegistros para reflejar el nuevo estado base
        setOriginalRegistros(JSON.parse(JSON.stringify(updatedRegistros)));
        // Limpiar el estado de edición ya que ahora tenemos nuevos registros base
        setIsEditing({});
      }
    } catch (error) {
      console.error("Error fetching updated records:", error);
    }
  };
  const uploadFile = async (file, index) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const blob = new Blob([event.target.result], { type: file.type });
        // Primero, obtener el ID del registro de GestionCP actual
        console.log(registros);
        console.log(index);

        const gestionCPId = registros[index].id;
        if (!gestionCPId) {
          reject(new Error("No se encontró el ID del registro de GestionCP"));
          return;
        }
        console.log(gestionCPId);

        // Usar el ID de GestionCP para el nombre del archivo
        const fileName = `${gestionCPId}|${file.name}`;

        const config = {
          Entity: module,
          RecordID: registerID,
          File: {
            Name: fileName,
            Content: blob,
          },
        };

        try {
          const response = await window.ZOHO.CRM.API.attachFile(config);
          console.log("llamada attach");
          if (response.data && response.data[0].status === "success") {
            resolve(response.data[0].details);
          } else {
            reject(new Error("Error al subir el archivo"));
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };
  const handleFileUpload = async (index) => {
    const { value: file } = await Swal.fire({
      title: "Selecciona un archivo",
      input: "file",
      inputAttributes: {
        accept: "image/*,application/pdf",
        "aria-label": "Sube tu comprobante",
      },
      showCancelButton: true,
      confirmButtonText: "Subir",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
      preConfirm: (file) => {
        if (!file) {
          Swal.showValidationMessage("Por favor selecciona un archivo");
        }
        // Verificar si el registro tiene ID
        if (!registros[index].id) {
          Swal.showValidationMessage(
            "Primero debe guardar el registro de GestionCP"
          );
          return false;
        }
        return file;
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (file) {
      // Actualizar pendingUploads con el nuevo archivo
      setPendingUploads((prev) => ({
        ...prev,
        [index]: file,
      }));

      // Actualizar UI para mostrar el archivo pendiente
      const updatedRegistros = [...registros];
      updatedRegistros[index] = {
        ...updatedRegistros[index],
        Comprobante: [
          {
            file_Name: file.name,
            isPending: true,
          },
        ],
      };
      setRegistros(updatedRegistros);

      Swal.fire(
        "Archivo seleccionado",
        "Se subirá cuando guardes los cambios",
        "success"
      );
    }
  };
  const hasUnsavedChanges = () => {
    return JSON.stringify(registros) !== JSON.stringify(originalRegistros);
  };
  const handleCancel = () => {
    if (hasUnsavedChanges()) {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Hay cambios no guardados. Si cancelas, se perderán estos cambios.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No, volver",
      }).then((result) => {
        if (result.isConfirmed) {
          window.ZOHO.CRM.UI.Popup.closeReload();
        }
      });
    } else {
      window.ZOHO.CRM.UI.Popup.closeReload();
    }
  };
  const handleSaveAndClose = async () => {
    const basicValidation = validateRegistros();
    if (!basicValidation.isValid) {
      showToast("error", basicValidation.message);
      return;
    }
    const saveValidation = validateRegistrosBeforeSave();
    if (!saveValidation.isValid) {
      Swal.fire({
        title: "Error",
        text: saveValidation.message,
        icon: "error",
        confirmButtonText: "Entendido",
      });
      return;
    }
    try {
      Swal.fire({
        title: "Guardando cambios",
        text: "Por favor espere...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Crear una copia profunda de los registros para las actualizaciones
      const updatedRegistros = JSON.parse(JSON.stringify(registros));

      // Subir todos los archivos pendientes
      for (const [index, file] of Object.entries(pendingUploads)) {
        try {
          const fileDetails = await uploadFile(file, index);
          updatedRegistros[index].Comprobante = [
            {
              file_Name: file.name,
              id: fileDetails.id,
            },
          ];
          updatedRegistros[index].URL_Comprobante = fileDetails.download_Url;
        } catch (error) {
          console.error(`Error uploading file for index ${index}:`, error);
          throw new Error(`Error al subir el archivo ${file.name}`);
        }
      }

      // Actualizar el registro con todos los cambios
      const updateConfig = {
        Entity: module,
        APIData: {
          id: registerID,
          GestionCP: updatedRegistros,
          Mover_archivo_workdrive: true,
        },
        Trigger: ["workflow"],
      };

      const response = await window.ZOHO.CRM.API.updateRecord(updateConfig);

      console.log("llamada Update");

      // Limpiar los archivos pendientes después de una actualización exitosa
      setPendingUploads({});
      setIsEditing({});
      window.ZOHO.CRM.UI.Popup.closeReload();
    } catch (error) {
      console.error("Error al guardar los cambios:", error);
      Swal.fire("Error", "Hubo un error al guardar los cambios.", "error");
    }
  };
  const handleDelete = async (index) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto una vez eliminado el registro.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Crear una copia del array actual de registros
          const updatedRegistros = [...registros];
          // Eliminar el registro en el índice especificado
          updatedRegistros.splice(index, 1);

          // Actualizar el estado local
          setRegistros(updatedRegistros);

          // Actualizar el registro en Zoho CRM
          const updateConfig = {
            Entity: module,
            APIData: {
              id: registerID,
              GestionCP: updatedRegistros,
            },
          };

          console.log(updateConfig);

          const response = await window.ZOHO.CRM.API.updateRecord(updateConfig);
          console.log("llamada update");

          // Mostrar una alerta de éxito después de la eliminación
          Swal.fire(
            "Eliminado!",
            "El registro ha sido eliminado con éxito.",
            "success"
          );
        } catch (error) {
          console.error("Error al eliminar el registro:", error);
          Swal.fire("Error", "Hubo un error al eliminar el registro.", "error");
        }
      }
    });
  };
  const handleFieldChange = (index, fieldName, value) => {
    const updatedRegistros = [...registros];
    const currentRegistro = updatedRegistros[index];

    // Encontrar el registro original correspondiente
    const originalRegistro = originalRegistros.find(
      (r) => r.id === currentRegistro.id
    );

    // Actualizar el valor
    currentRegistro[fieldName] = value;

    // Solo marcar como editado si:
    // 1. El registro existe en originalRegistros (no es nuevo)
    // 2. El valor actual es diferente al original
    if (
      originalRegistro &&
      JSON.stringify(originalRegistro) !== JSON.stringify(currentRegistro)
    ) {
      setIsEditing((prev) => ({ ...prev, [currentRegistro.id]: true }));
    } else if (
      originalRegistro &&
      JSON.stringify(originalRegistro) === JSON.stringify(currentRegistro)
    ) {
      // Si los valores vuelven a ser iguales al original, quitar la marca de editado
      setIsEditing((prev) => {
        const newState = { ...prev };
        delete newState[currentRegistro.id];
        return newState;
      });
    }

    setRegistros(updatedRegistros);

    // Mantener la lógica existente para el estado "Pago"
    if (
      fieldName === "Estado" &&
      value === "Pago" &&
      (!currentRegistro.Comprobante || currentRegistro.Comprobante.length === 0)
    ) {
      Swal.fire({
        title: "Atención",
        text: "Ha cambiado el estado a 'Pagado'. Por favor, asegúrese de cargar un comprobante antes de guardar.",
        icon: "warning",
        confirmButtonText: "Entendido",
      });
    }
  };
  const handelPop = () => {
    setPop(!pop);
  };
  const estado = getFieldValues(fields, "Estado");
  const tipo = getFieldValues(fields, "Tipo");

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setRegistros((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = [...items];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);

      return newItems;
    });
  };

  return (
    <>
      <div className="h-screen flex flex-col">
        <Nav
          datos={datos}
          handleSaveAndClose={handleSaveAndClose}
          handleCancel={handleCancel}
          handelPop={handelPop}
        />
        <div className="flex flex-1 h-[calc(100vh-60px)] bg-violet-100 ">
          <div className="w-[230px] bg-gray-2300 text-black p-2">
            <div className=" flex w-full font-bold mt-4  justify-between ">
              <p>Presupuesto</p>
              <p>{datos.Presupuesto}</p>
            </div>
            <div className=" flex w-full font-bold mt-4  justify-between ">
              <p>Moneda</p>
              <p>{datos.Moneda_cobro}</p>
            </div>
            <div className=" flex w-full font-bold mt-4  justify-between ">
              <p>N. de paginas</p>
              <p>{datos.Numero_de_Paginas}</p>
            </div>
            <div className=" flex w-full font-bold mt-4  justify-between ">
              <p>P. por pagina</p>
              <p>{datos.Precio_de_pagina}</p>
            </div>
            <div className="flex text-center items-center  w-full mt-4 justify-between ">
              <p
                className={`
                 "text-zinc-800"
                 text-[14px] font-extrabold `}
              >
                C. de paginas
              </p>
              <Tooltip
                pos={"-top-20 right-42"}
                title={datos && datos.Comentario_pagina}
              />
            </div>
            <div className="flex text-center items-center  w-full mt-4  justify-between ">
              <p
                className={`
                  "text-zinc-800"
                  text-[14px] font-extrabold `}
              >
                C. presupuesto
              </p>
              <Tooltip
                pos={"top-5 right-30"}
                title={datos && datos.Comentario_Presupuesto}
              />
            </div>
            <div className="w-full flex-col rounded-lg flex gap-2 justify-center items-center px-2 mt-16">
              <p className="font-semibold">Falta cobrar cliente</p>
              <div className="text-black flex w-full font-bold justify-center px-12 items-center bg-white rounded-lg h-10 text-sm">
                <p>{faltaCobrarCliente.toFixed(2)}</p>
              </div>
              <p className="font-semibold">Monto total cobrado</p>
              <div className="text-black flex w-full font-bold justify-center px-12 items-center bg-white rounded-lg h-10 text-sm">
                <p>{totalMontoCobrado.toFixed(2)}</p>
              </div>
              <p className="font-semibold">Falta paginas cliente</p>
              <div className="text-black flex w-full font-bold justify-center px-12 items-center bg-white rounded-lg h-10 text-sm">
                <p>{faltaPaginaCliente.toFixed(2)}</p>
              </div>
              <p className="font-semibold">Total paginas cobradas</p>
              <div className="text-black flex w-full font-bold justify-center px-12 items-center bg-white rounded-lg h-10 text-sm">
                <p>{totalPaginasCobradas.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-gray-100 relative p-2 overflow-auto">
            <div className="flex w-full justify-start flex-col ">
              <div className="cards w-full  flex justify-start flex-col  3xl:h-[85vh]  2xl:h-[85vh]  overflow-y-auto rounded-md">
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={registros}
                    strategy={verticalListSortingStrategy}
                  >
                    {registros.length > 0 &&
                      registros.map((registro, i) => (
                        <Registros
                          key={i}
                          registro={registro}
                          i={i}
                          handleFieldChange={handleFieldChange}
                          handleDelete={handleDelete}
                          handleFileUpload={handleFileUpload}
                          handleLink={handleLink}
                          tipo={tipo}
                          isEdited={isEditing[registro.id]}
                        />
                      ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>
        </div>
      </div>
      {pop ? (
        <Popup
          togglePopup={togglePopup}
          registerID={registerID}
          module={module}
          onSave={() => {
            updateRegistros();
            showToast("success", "Nuevo registro añadido con éxito");
          }}
          estado={estado}
          tipo={tipo}
        />
      ) : null}
    </>
  );
};

export default Layout;
