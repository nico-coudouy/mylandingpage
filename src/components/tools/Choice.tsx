/** Group of mutually exclusive options drawn as chips. */
export default function Choice<T extends string>({ legend, value, onChange, options, hint }: {
  legend: string;
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
  hint?: string;
}) {
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      <div className="chips">
        {options.map(([v, label]) => (
          <button key={v} type="button" className="chip" aria-pressed={value === v} onClick={() => onChange(v)}>{label}</button>
        ))}
      </div>
      {hint && <small>{hint}</small>}
    </fieldset>
  );
}
