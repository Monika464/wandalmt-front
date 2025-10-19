// import { useEffect, useState } from "react";

// const Purchase = () => {
//   const [status, setStatus] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const sessionId = params.get("session_id");

//     if (!sessionId) {
//       setError("Brak session_id w adresie URL");
//       return;
//     }

//     const checkPurchase = async () => {
//       try {
//         const res = await fetch(
//           `http://localhost:3000/api/purchase?session_id=${sessionId}`
//         );
//         if (!res.ok) throw new Error("Błąd podczas sprawdzania płatności");

//         const data = await res.json();
//         if (data.status === "complete") {
//           setStatus("✅ Płatność zakończona pomyślnie!");
//         } else {
//           setStatus("⚙️ Płatność w trakcie przetwarzania...");
//         }
//       } catch (err) {
//         console.error(err);
//         setError("Błąd podczas sprawdzania płatności.");
//       }
//     };

//     checkPurchase();
//   }, []);

//   if (error) return <h2 style={{ color: "red" }}>{error}</h2>;
//   if (!status) return <h2>Sprawdzanie statusu płatności...</h2>;
//   return <h2>{status}</h2>;
// };

// export default Purchase;
