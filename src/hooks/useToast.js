import { useDispatch } from 'react-redux';
import { showToast, clearToast } from '../features/toast/slice/toastSlice';

export function useToast() {
  const dispatch = useDispatch();

  const toast = (message, type = 'success', duration = 3000) => {
    // 1. Show the toast
    dispatch(showToast({ message, type }));

    // 2. Set a timer to hide it after 'duration'
    setTimeout(() => {
      dispatch(clearToast());
    }, duration);
  };

  return { toast };
}