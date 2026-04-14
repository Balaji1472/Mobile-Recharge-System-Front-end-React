import { useDispatch } from 'react-redux';
import { showToast, clearToast } from '../features/toast/toastSlice'; 

export function useToast() {
  const dispatch = useDispatch();

  const toast = (message, type = 'success', duration = 3000) => {
    dispatch(showToast({ message, type }));
    setTimeout(() => dispatch(clearToast()), duration);   
  };

  return { showToast: toast };
}