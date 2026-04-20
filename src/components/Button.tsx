import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'tertiary';
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
    const baseStyles = "rounded-full transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] font-medium whitespace-nowrap";

    const variants = {
        primary: "bg-[#051A24] text-white px-7 py-3 shadow-[0_1px_2px_0_rgba(5,26,36,0.1),0_4px_4px_0_rgba(5,26,36,0.09),0_9px_6px_0_rgba(5,26,36,0.05),0_17px_7px_0_rgba(5,26,36,0.01),0_26px_7px_0_rgba(5,26,36,0),inset_0_2px_8px_0_rgba(255,255,255,0.5)]",
        secondary: "bg-white text-[#051A24] px-7 py-3 shadow-[0_0_0_0.5px_rgba(0,0,0,0.05),0_4px_30px_rgba(0,0,0,0.08)]",
        tertiary: "bg-white text-[#051A24] px-7 py-3 shadow-[0_1px_2px_0_rgba(5,26,36,0.1),inset_0_2px_8px_0_rgba(0,0,0,0.05)] border border-[#0D212C]/10"
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};
