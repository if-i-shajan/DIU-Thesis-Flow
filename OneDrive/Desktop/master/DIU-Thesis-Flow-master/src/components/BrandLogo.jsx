import React from 'react'

export const BrandLogo = ({ showSubtitle = true, className = '' }) => {
    return (
        <div className={`inline-flex items-center gap-[14px] ${className}`.trim()}>
            <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#2A4DD0]">
                <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5"
                        stroke="#FFFFFF"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            <div className="mx-[4px] h-9 w-px bg-[#E0E7FF]" aria-hidden="true" />

            <div className="flex flex-col">
                <div className="text-[18px] font-bold leading-none tracking-[-0.4px]">
                    <span className="text-[#1A1F36]">Thesis</span>
                    <span className="text-[#2A4DD0]">Flow</span>
                </div>
                {showSubtitle && (
                    <p className="mt-1 text-[12px] font-normal text-[#8892B0] [letter-spacing:0.1px]">
                        Thesis Management System
                    </p>
                )}
            </div>
        </div>
    )
}