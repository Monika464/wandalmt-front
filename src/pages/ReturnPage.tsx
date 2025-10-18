import React, { useEffect, useState } from "react";

const ReturnPage: React.FC = () => {
  const [message, setMessage] = useState<string>("Trwa sprawdzanie statusu...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (sessionId) {
      fetch(`http://localhost:3000/session-status?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => setMessage(data.message));
    }
  }, []);

  return <h2>{message}</h2>;
};

export default ReturnPage;
