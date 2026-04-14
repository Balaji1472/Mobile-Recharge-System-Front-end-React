import "./Spinner.css";

const Spinner = ({ size = "md", fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="spinner-overlay">
        <span className={`spinner spinner--${size}`} />
      </div>
    );
  }
  return <span className={`spinner spinner--${size}`} />;
};

export default Spinner;
