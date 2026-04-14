import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { clearToast } from "../features/toast/toastSlice";

const ToastListener = () => {
  const dispatch = useDispatch();
  const { show, message, type } = useSelector((state) => state.toast);

  useEffect(() => {
    if (show && message) {
      toast[type]?.(message) ?? toast(message);
      dispatch(clearToast());
    }
  }, [show, message, type, dispatch]);

  return null;
};

export default ToastListener;
