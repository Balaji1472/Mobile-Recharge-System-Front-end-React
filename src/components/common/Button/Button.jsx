import "./Button.css";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
}) => {
  return (
    <button
      type={type}
      className={`btn btn--${variant}${fullWidth ? " btn--full" : ""}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? <span className="btn__spinner" /> : children}
    </button>
  );
};

export default Button;
