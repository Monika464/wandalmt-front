// components/orders/RefundButton.tsx

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { refundOrder } from "../../store/slices/orderSlice";
import type { AppDispatch } from "../../store";
import { useTranslation } from "react-i18next";

interface RefundButtonProps {
  orderId: string;
  disabled?: boolean;
  variant?: "normal" | "discount";
  orderStatus?: string;
  hasPartialRefunds?: boolean;
  allProductsRefunded?: boolean;
}

const RefundButton: React.FC<RefundButtonProps> = ({
  orderId,
  disabled = false,
  variant = "normal",
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { t } = useTranslation();

  const dispatch = useDispatch<AppDispatch>();

  const handleFullRefund = async () => {
    // User confirmation
    if (!window.confirm(t("orders.confirmFullRefund"))) {
      return; // User cancelled
    }

    setLoading(true);
    setError(null);

    try {
      // Call Redux action
      const resultAction = await dispatch(refundOrder(orderId));

      // Check if the action succeeded
      if (refundOrder.fulfilled.match(resultAction)) {
        setSuccess(true);

        // Optionally: refresh the page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (refundOrder.rejected.match(resultAction)) {
        // Handle error from Redux action
        const errorMessage =
          resultAction.payload?.message ||
          resultAction.error?.message ||
          t("orders.refundError");

        setError(errorMessage);
        alert(errorMessage);
      }
    } catch (err: any) {
      console.error("Refund error:", err);

      const errorMessage = err.message || t("orders.refundError");
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return t("orders.processing");
    if (success) return t("orders.refunded");
    if (variant === "discount") return t("orders.refundFullOrderAfterDiscount");
    return t("orders.refundFullOrder");
  };

  return (
    <div>
      <button
        onClick={handleFullRefund}
        disabled={disabled || loading || success}
        className={`w-full px-4 py-2 rounded font-medium ${
          variant === "discount"
            ? "bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300"
            : "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
        }`}
        title={disabled ? t("orders.refundUnavailable") : ""}
      >
        {getButtonText()}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {success && (
        <p className="mt-2 text-sm text-green-600">
          ✓ {t("orders.refundSuccessMessage")}
        </p>
      )}
    </div>
  );
};

export default RefundButton;

// // components/orders/RefundButton.tsx

// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import { refundOrder } from "../../store/slices/orderSlice";
// import type { AppDispatch } from "../../store";
// import { useTranslation } from "react-i18next";

// interface RefundButtonProps {
//   orderId: string;
//   disabled?: boolean;
//   variant?: "normal" | "discount";
//   orderStatus?: string;
//   hasPartialRefunds?: boolean;
//   allProductsRefunded?: boolean;
// }

// const RefundButton: React.FC<RefundButtonProps> = ({
//   orderId,
//   disabled = false,
//   variant = "normal",
// }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   const { t } = useTranslation();

//   const dispatch = useDispatch<AppDispatch>();

//   const handleFullRefund = async () => {
//     // Potwierdzenie od użytkownika
//     if (
//       !window.confirm(
//         "Czy na pewno chcesz zwrócić całe zamówienie? Dostęp do produktów zostanie zablokowany.",
//       )
//     ) {
//       return; // Użytkownik anulował
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       // Wywołaj akcję Redux
//       const resultAction = await dispatch(refundOrder(orderId));

//       // Sprawdź czy akcja zakończyła się sukcesem
//       if (refundOrder.fulfilled.match(resultAction)) {
//         setSuccess(true);

//         // Opcjonalnie: odśwież stronę po 2 sekundach
//         setTimeout(() => {
//           window.location.reload();
//         }, 2000);
//       } else if (refundOrder.rejected.match(resultAction)) {
//         // Obsłuż błąd z akcji Redux
//         const errorMessage =
//           resultAction.payload?.message ||
//           resultAction.error?.message ||
//           "Błąd podczas zwrotu";

//         setError(errorMessage);
//         alert(errorMessage);
//       }
//     } catch (err: any) {
//       console.error("Refund error:", err);

//       const errorMessage = err.message || "Błąd podczas zwrotu";
//       setError(errorMessage);
//       alert(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getButtonText = () => {
//     if (loading) return "Przetwarzanie...";
//     if (success) return "Zwrócono!";
//     if (variant === "discount") return "Zwróć całe zamówienie (po zniżce)";
//     return "Zwróć całe zamówienie";
//   };

//   return (
//     <div>
//       <button
//         onClick={handleFullRefund}
//         disabled={disabled || loading || success}
//         className={`w-full px-4 py-2 rounded font-medium ${
//           variant === "discount"
//             ? "bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300"
//             : "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
//         }`}
//         title={disabled ? "Zwrot niedostępny" : ""}
//       >
//         {getButtonText()}
//       </button>

//       {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

//       {success && (
//         <p className="mt-2 text-sm text-green-600">
//           ✓ Zwrot został zlecony. Środki wrócą na kartę w ciągu 5-10 dni.
//         </p>
//       )}
//     </div>
//   );
// };

// export default RefundButton;
