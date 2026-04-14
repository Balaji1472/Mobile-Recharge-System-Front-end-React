import "./Input.css";

const Input = ({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
}) => {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className="input-group__label">
          {label}
          {required && <span className="input-group__required"> *</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`input-group__field${error ? " input-group__field--error" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      {error && <span className="input-group__error">{error}</span>}
    </div>
  );
};

export default Input;
