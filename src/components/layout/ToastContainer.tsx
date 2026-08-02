'use client';
import { Bounce, ToastContainer as RootToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const ToastContainer = () => (
  <RootToastContainer
    autoClose={5000}
    className='toast-container'
    closeOnClick
    draggable
    hideProgressBar={false}
    newestOnTop={false}
    pauseOnFocusLoss
    pauseOnHover
    position='bottom-center'
    rtl={false}
    theme='light'
    transition={Bounce}
  />
);
