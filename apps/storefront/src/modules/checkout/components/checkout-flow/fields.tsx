"use client"

import { useId } from "react"

type FieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> & {
  name: string
  label: string
  half?: boolean
}

/** Floating-label input sized for touch (16px text prevents iOS zoom). */
export function Field({ label, half, className, id, ...props }: FieldProps) {
  const generated = useId()
  const inputId = id ?? generated
  return (
    <div className={`lux-field${half ? " lux-field-half" : ""}${className ? ` ${className}` : ""}`}>
      <input id={inputId} placeholder=" " {...props} />
      <label htmlFor={inputId}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
    </div>
  )
}

export function Notice({ children, tone = "error" }: { children: React.ReactNode; tone?: "error" | "info" }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className="lux-notice" data-tone={tone}>
      {children}
    </p>
  )
}
