import React, { useState } from "react";

const FloatingInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  icon,
}) => {
  const [focused, setFocused] = useState(false);

  const isActive =
    focused ||
    (type === "boolean"
      ? value === true || value === false
      : value && value.length > 0);

  return (
    <div className="relative w-full">
      <label
        className={`
          absolute left-0 transition-all duration-300 font-semibold
          ${
            isActive
              ? "-top-2 text-[#ffc586] text-sm"
              : "top-1 text-[#d6d6d6] text-lg"
          }
        `}
      >
        {label}
      </label>

      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={4}
          className="
            w-full bg-transparent text-[#d6d6d6] text-base
            border-b-2 border-[#d6d6d6] pb-2 pt-5 outline-none
            transition-all duration-300 focus:border-[#ffc586] pr-10
            resize-none
          "
        />
      ) : type === "boolean" ? (
        <input
          type="checkbox"
          name={name}
          checked={value}
          onChange={(e) =>
            onChange({ target: { name, value: e.target.checked } })
          }
          className="
            mt-6 w-5 h-5 cursor-pointer accent-[#ffc586]
          "
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="
            w-full bg-transparent text-[#d6d6d6] text-base
            border-b-2 border-[#d6d6d6] pb-2 pt-5 outline-none
            transition-all duration-300 focus:border-[#ffc586] pr-10
          "
        />
      )}

      {icon && type !== "boolean" && (
        <img
          src={icon}
          alt="icon"
          className={`absolute right-1 bottom-3 w-5 ${
            isActive ? "icon-active-yellow" : ""
          }`}
        />
      )}
    </div>
  );
};

export default FloatingInput;
