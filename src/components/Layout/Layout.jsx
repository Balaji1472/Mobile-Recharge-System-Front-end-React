import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import ToastListener from "../ToastListener";
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout__main">{children}</main>
      <Footer />
      <ToastListener />
    </div>
  );
};

export default Layout;
