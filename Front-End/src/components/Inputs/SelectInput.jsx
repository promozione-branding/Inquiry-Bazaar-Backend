import { IdCard } from "lucide-react";
import React from "react";

export default function SelectInput({ label, Icon = IdCard, options = [], ...props }) {
    return (
        <div>
            <label className="label">{label}</label>
            <div className="relative">
                <Icon size={18} className="icon" />
                <select className="input pl-8! p-2.5!" {...props}>
                    <option value="">Select {label}</option>
                    {options.map((opt, i) => (
                        <option key={i} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}