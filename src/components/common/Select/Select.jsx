import "./Select.css";

const Select = ({ id, label, value, onChange, options = [], required = false }) => {
  return (
    <div className="select-group">
      {label && (
        <label htmlFor={id} className="select-group__label">
          {label}
          {required && <span className="select-group__required"> *</span>}
        </label>
      )}
      <select
        id={id}
        className="select-group__field"
        value={value}
        onChange={onChange}
        required={required}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
