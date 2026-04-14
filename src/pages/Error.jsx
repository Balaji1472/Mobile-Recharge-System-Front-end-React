import { useNavigate } from "react-router-dom";
import { Button } from "../components/common";
import "./Error.css";

const Error = () => {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-page__content">
        <h1 className="error-page__code">404</h1>
        <h2 className="error-page__title">Page Not Found</h2>
        <p className="error-page__message">
          The resource you are looking for is not available.
        </p>
        <div className="error-page__actions">
          <Button onClick={() => navigate("/")}>Go Home</Button>
          <Button variant="outline" onClick={() => navigate("/login")}>
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error;
