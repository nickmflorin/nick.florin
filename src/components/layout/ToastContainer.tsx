"use client";
import { ToastContainer as RootToastContainer, Bounce } from "react-toastify";
/* Note: We should move towards the minified version if/when we decide to do more of the toast
   styling ourselves.
   import "react-toastify/dist/ReactToastify.minimal.css"; */
import "react-toastify/dist/ReactToastify.css";

export const ToastContainer = () => (
  <RootToastContainer
    className="toast-container"
    position="bottom-center"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    transition={Bounce}
  />
);

export default ToastContainer;
