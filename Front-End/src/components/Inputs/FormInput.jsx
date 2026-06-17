import { IdCard } from 'lucide-react';
import React from 'react'

export default function Input({ label, Icon = IdCard, ...props }) {
    return (
        <div>
            <label className="label">{label}</label>
            <div className="relative">
                <Icon size={18} className="icon" />
                <input className="input pl-8!" placeholder={label} {...props} />
            </div>
        </div>
    );
}
