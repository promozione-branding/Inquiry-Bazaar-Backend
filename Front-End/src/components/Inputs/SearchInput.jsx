import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Search } from "lucide-react";

export default function SearchableSelect({
  label,
  Icon = Search,
  options = [],
  value,
  onChange,
  name = "categoryId",
  placeholder,
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // filter only when typing
  const filteredOptions =
    debouncedQuery.trim() === ""
      ? []
      : options.filter((opt) =>
        opt.label.toLowerCase().includes(debouncedQuery.toLowerCase())
      );

  // outside click close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!wrapperRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (opt) => {
    onChange({ target: { name, value: opt.value } });
    setQuery(opt.label);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    onChange({ target: { name, value: "" } });
    setOpen(false);
  };

  // set initial value label
  useEffect(() => {
    const selected = options.find((o) => o.value === value);
    if (selected) setQuery(selected.label);
  }, [value, options]);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium mb-2">{label}</label>

      <div className="relative">
        {/* Icon */}
        <Icon size={18} className="absolute top-4 left-2 text-gray-600" />

        {/* Input */}
        <input
          type="text"
          className="w-full border border-gray-300 pl-8 shadow-sm rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-blue-500"
          placeholder={placeholder || label}
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);

            // open ONLY when typing
            if (val.trim() !== "") {
              setOpen(true);
            } else {
              setOpen(false);
            }
          }}
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, i) => (
              <div
                key={i}
                onClick={() => handleSelect(opt)}
                className="px-3 py-2 cursor-pointer border-t border-gray-200 hover:bg-gray-100"
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-400">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}