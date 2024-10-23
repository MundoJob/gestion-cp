import React, { useState } from "react";

const DropCustom = ({ options, value, onChange, className, dark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const handleToggleDropdown = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };
  const handleSelectOption = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className="relative cursor-pointer">
      <div
        className=" border-2 w-[8vw] h-9 text-center rounded-md sm:text-md shadow-md flex justify-center items-center relative"
        onClick={handleToggleDropdown}
      >
        {selectedOption ? (
          <div className="flex items-center justify-start ml-2  overflow-hidden  ">
            <div
              className="w-3 h-3 rounded-full  "
              style={{ backgroundColor: selectedOption.color }}
            ></div>
            <div className="ml-2">{selectedOption.label}</div>
          </div>
        ) : (
          "Seleccionar"
        )}
      </div>
      {isOpen && (
        <div
          className={`dropdown-content absolute top-10 left-[0] ${
            dark ? "bg-[#222631]" : "bg-white"
          } w-40 h-40 rounded-md border-[2px] z-10  `}
        >
          {options.map((option) => (
            <div
              key={option.color}
              className="h-6 mt-1 hover:bg-slate-200 flex items-center justify-center "
            >
              <div className="w-[20%] flex justify-center ">
                <div
                  className="w-3 h-3 rounded-full  "
                  style={{ backgroundColor: option.color }}
                ></div>
              </div>
              <div
                key={option.value}
                className="w-[80%] flex justify-start text-sm font-semibold"
                onClick={() => handleSelectOption(option)}
              >
                <p className="">{option.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropCustom;
