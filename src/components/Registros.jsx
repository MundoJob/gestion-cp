import React from "react";
import { BsFillCloudDownloadFill, BsFillTrash3Fill } from "react-icons/bs";
import { TbGripVertical, TbUpload } from "react-icons/tb";
import DropCustom from "./DropCustom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Registros = ({
  registro,
  handleFieldChange,
  handleDelete,
  handleFileUpload,
  handleLink,
  tipo,
  i,
  isEdited,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: registro.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className={`w-full ${isDragging ? "opacity-50" : ""}`}>
      <div
        className={`2xl:w-[99%] flex  mr-[10px] mb-[10px]   rounded-[8px] bg-white shadow-xl
          ${isEdited ? "border-2 border-red-500" : "border border-gray-200"}`}
        ref={setNodeRef}
        style={style}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-100 rounded-lg mr-2"
        >
          <TbGripVertical className="text-gray-500 text-xl" />
        </div>
        <div className="w-[100%] h-full flex  flex-col relative px-4 py-2">
          <div className="absolute top-0 right-0">
            <button
              onClick={() => handleDelete(i)}
              className="btn-raro w-18 text-xs h-6 mb-4   px-2  border-none rounded-tr-[9px] rounded-bl-[15px]  bg-red-500 text-white  hover:text-white font-semibold "
            >
              <BsFillTrash3Fill />
            </button>
          </div>
          <div className="flex justify-between flex-wrap  ">
            <div className=" flex flex-col h-20 ">
              <label
                htmlFor="N_Pago"
                className="block text-sm font-medium mr-4 mb-2  "
              >
                Nº de pago
              </label>
              <input
                type="text"
                id="N_Pago"
                name="N_Pago"
                value={registro.N_Pago || ""}
                onChange={(e) => handleFieldChange(i, "N_Pago", e.target.value)}
                className="block border-2 w-[8vw] h-9 text-center rounded-md sm:text-md shadow-md"
              />
            </div>
            <div className="  flex flex-col h-20  ">
              <label
                htmlFor="Tipo"
                className="block text-sm font-medium mr-4 mb-2  "
              >
                Tipo
              </label>
              <select
                type="text"
                id="Tipo"
                name="Tipo"
                value={registro.Tipo || ""}
                onChange={(e) => handleFieldChange(i, "Tipo", e.target.value)}
                className="block border-2 w-8] h-9 text-center rounded-md sm:text-md shadow-md"
              >
                {tipo
                  .filter((e) => e.display_value !== "-None-")
                  .map((e) => (
                    <option key={e.id} value={e.display_value}>
                      {e.display_value}
                    </option>
                  ))}
              </select>
            </div>
            <div className=" flex flex-col h-20  ">
              <label
                htmlFor="Monto"
                className="block text-sm font-medium mr-4 mb-2  "
              >
                Monto
              </label>
              <input
                type="text"
                id="Monto"
                name="Monto"
                value={registro.Monto || ""}
                onChange={(e) => handleFieldChange(i, "Monto", e.target.value)}
                className="block border-2 w-8] h-9 text-center rounded-md sm:text-md shadow-md"
              />
            </div>
            <div className="  flex flex-col h-20  ">
              <label
                htmlFor="Monto_Secundario"
                className="block text-sm font-medium mr-4 mb-2  "
              >
                Monto secundario
              </label>
              <input
                type="text"
                id="Monto_Secundario"
                name="Monto_Secundario"
                value={registro.Monto_Secundario || ""}
                onChange={(e) =>
                  handleFieldChange(i, "Monto_Secundario", e.target.value)
                }
                className="block border-2 w-8] h-9 text-center rounded-md sm:text-md shadow-md"
              />
            </div>
            <div className="  flex flex-col h-20  ">
              <label
                htmlFor="Fecha_solicitud_pago"
                className="block text-sm font-medium mr-4 mb-2  "
              >
                F. solicitud de pago
              </label>
              <input
                type="date"
                id="Fecha_solicitud_pago"
                name="Fecha_solicitud_pago"
                value={registro.Fecha_solicitud_pago || ""}
                onChange={(e) =>
                  handleFieldChange(i, "Fecha_solicitud_pago", e.target.value)
                }
                className="block border-2 w-8] h-9 text-center rounded-md sm:text-md shadow-md"
              />
            </div>
            <div className="  flex flex-col h-20  ">
              <label
                htmlFor="Estado"
                className="block text-sm font-medium mr-4 mb-2  "
              >
                Estado
              </label>
              <DropCustom
                options={[
                  {
                    value: "Debe",
                    label: "Debe",
                    color: "#eb4d4d",
                  },
                  {
                    value: "Pago",
                    label: "Pago",
                    color: "#67c480",
                  },
                  {
                    value: "PARALIZADO",
                    label: "PARALIZADO",
                    color: "#f5c72f",
                  },
                  {
                    value: "Caido",
                    label: "Caido",
                    color: "#666666",
                  },
                ]}
                value={registro.Estado || ""}
                onChange={(value) => handleFieldChange(i, "Estado", value)}
                className="block border-2 w-[125px]  text-center  border-none p-1 rounded-md shadow-sm bg-[#f0f0f8] dark:bg-[#222631] text-white text-[14px] focus:ring-indigo-500 focus:border-indigo-500"
              />
              {/* <select
          type="text"
          id="Estado"
          name="Estado"
          value={registro.Estado || ""}
          onChange={(e) =>
            handleFieldChange(i, "Estado", e.target.value)
          }
          className="block border-2 w-8] h-9 text-center rounded-md sm:text-md shadow-md"
        >
          {estado.map((e) => (
            <option key={e.id} value={e.display_value}>
              <span className="px-2  w-full">
                <p class="circle-filled text-green-600">
                  ●
                </p>
              </span>
              {e.display_value}
            </option>
          ))}
        </select> */}
            </div>
            <div className="  flex flex-col h-20  ">
              <label
                htmlFor="Fecha_entrega"
                className="block text-sm font-medium mr-4 mb-2  "
              >
                F. entrega
              </label>
              <input
                type="date"
                id="Fecha_entrega"
                name="Fecha_entrega"
                value={registro.Fecha_entrega || ""}
                onChange={(e) =>
                  handleFieldChange(i, "Fecha_entrega", e.target.value)
                }
                className="block border-2 w-8] h-9 text-center rounded-md sm:text-md shadow-md"
              />
            </div>
            <div className=" flex flex-col h-20  ">
              <label
                htmlFor="Fecha_cobro"
                className="block text-sm font-medium mr-4 mb-2  "
              >
                F. contable
              </label>
              <input
                type="date"
                id="Fecha_cobro"
                name="Fecha_cobro"
                value={registro.Fecha_cobro || ""}
                onChange={(e) =>
                  handleFieldChange(i, "Fecha_cobro", e.target.value)
                }
                className="block border-2 w-8] h-9 text-center rounded-md sm:text-md shadow-md"
              />
            </div>
            <div className=" w-[50%] mt-2   flex flex-col ">
              <label
                htmlFor="Comentario_gestor"
                className="block text-sm font-medium mr-4   "
              >
                Comentario gestor
              </label>
              <input
                type="text"
                id="Comentario_Gestor"
                name="Comentario_Gestor"
                value={registro.Comentario_Gestor || ""}
                onChange={(e) =>
                  handleFieldChange(i, "Comentario_Gestor", e.target.value)
                }
                className="block border-2 w-[100%] h-9 text-start px-4 rounded-md shadow-md sm:text-md"
              />
            </div>
            <div className=" w-[40%] mt-4  flex flex-1  items-center justify-center  ">
              <label
                htmlFor="Comprobante"
                className="block text-sm font-medium mr-4 mb-2 "
              >
                Comprobante
              </label>
              <div className="flex">
                {registro.URL_Comprobante && registro.Comprobante !== "" ? (
                  <div
                    onClick={() => handleLink(registro.URL_Comprobante)}
                    className=" bg-blue-400  flex justify-center text-sm items-center ml-4 rounded-md p-1 px-2 cursor-pointer"
                  >
                    <BsFillCloudDownloadFill color="white" className="mr-2" />
                    <p className="text-white">Ver archivo</p>
                  </div>
                ) : null}

                <div
                  onClick={() => handleFileUpload(i)}
                  className="bg-violet-500 flex justify-center text-sm items-center ml-4 rounded-md py-1 px-2 cursor-pointer  relative"
                >
                  <TbUpload color="white" className="mr-2" />
                  <p className="text-white flex flex-col">
                    {registro.Comprobante && registro.Comprobante[0]?.isPending
                      ? "Subiendo..."
                      : "Subir"}
                  </p>
                  {registro.Comprobante &&
                    registro.Comprobante[0]?.isPending && (
                      <span className="text-xs font-semibold absolute bottom-2 left-28  text-black ml-4 mt-1 truncate max-w-[200px]">
                        {registro.Comprobante[0].file_Name}
                      </span>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registros;
