import { HttpTypes } from "@medusajs/types"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  const values = (option.values ?? []).map((v) => v.value)

  return (
    <fieldset className="flex flex-col gap-y-3">
      <legend className="mb-3 text-[11px] font-medium uppercase tracking-label text-lux-muted">
        {title}
        {current && <span className="ml-2 normal-case tracking-normal text-lux-ink">{current}</span>}
      </legend>
      <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
        {values.map((v) => (
          <button
            type="button"
            onClick={() => updateOption(option.id, v)}
            key={v}
            className="lux-pill"
            aria-pressed={v === current}
            disabled={disabled}
            data-testid="option-button"
          >
            {v}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export default OptionSelect
