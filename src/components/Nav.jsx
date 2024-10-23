import React, { useState } from "react";
import { FaRegClock } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";

const Nav = ({
  datos,
  handleSaveAndClose,
  handleSaveAndProceed,
  handleCancel,
  handelPop,
}) => {
  return (
    <div className="w-screen h-[60px] bg-white flex justify-between items-center px-8">
      <div className="font-bold text-xl text-black">
        {datos ? datos.Name : null}
      </div>
      <div className=" h-[50px] flex gap-4  items-center justify-center ">
        <button
          className="flex items-center gap-2 w-28 h-8 border-2 text-xs py-1 px-2 rounded-md bg-[#f73463] border-none text-white font-semibold hover:bg-red-600 hover:text-white"
          onClick={handleCancel}
        >
          <IoCloseCircleOutline size={20} />
          Cancelar
        </button>
        <button
          className={`flex items-center gap-2 border-none h-8 border-2 text-xs py-1 px-2 rounded-md  bg-violet-500  text-white font-semibold hover:bg-violet-600 hover:text-white`}
          onClick={() => handleSaveAndClose()}
        >
          <FaRegClock size={14} />
          Guardar y cerrar
        </button>
        <div
          onClick={handelPop}
          className="w-[42px] h-[42px] rounded-full bg-violet-500 flex justify-center items-center text-white text-2xl  cursor-pointer shadow-xl"
        >
          +
        </div>
      </div>
    </div>
  );
};

export default Nav;
