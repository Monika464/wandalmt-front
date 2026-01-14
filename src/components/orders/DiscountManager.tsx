// components/admin/SimpleDiscountManager.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";

interface Discount {
  _id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed" | "product";
  value: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
}

const SimpleDiscountManager: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: 10,
    minPurchaseAmount: 0,
    maxDiscountAmount: 0,
    maxUses: 0,
    isActive: true,
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: "",
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      // Tymczasowo - zrób prostą stronę z komunikatami
      console.log("Fetch discounts feature coming soon...");
      setDiscounts([]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Feature coming soon. For now, create coupons directly in database.");
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Ładowanie...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kupony rabatowe</h1>
        <p className="text-gray-600 mt-2">
          Ta funkcja jest w trakcie rozwoju. Na razie możesz tworzyć kupony
          bezpośrednio w bazie danych.
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h2 className="font-bold text-yellow-800">Jak dodać kupon:</h2>
        <ol className="list-decimal pl-5 mt-2 text-yellow-700">
          <li>Otwórz MongoDB Compass</li>
          <li>Przejdź do kolekcji "discounts"</li>
          <li>Kliknij "Add Data" → "Insert Document"</li>
          <li>Wklej przykładowy kupon:</li>
        </ol>
        <pre className="bg-gray-800 text-white p-3 rounded mt-2 text-sm overflow-x-auto">
          {`{
  "name": "10% zniżki",
  "code": "WELCOME10",
  "type": "percentage",
  "value": 10,
  "minPurchaseAmount": 0,
  "maxDiscountAmount": 50,
  "maxUses": 100,
  "usedCount": 0,
  "isActive": true,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validUntil": "2025-12-31T23:59:59.999Z"
}`}
        </pre>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-800">Testowe kupony:</h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between p-3 bg-white rounded border">
            <div>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                WELCOME10
              </span>
              <span className="ml-3">10% zniżki na całe zamówienie</span>
            </div>
            <span className="text-green-600 font-bold">-10%</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded border">
            <div>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                SAVE20
              </span>
              <span className="ml-3">
                20 PLN zniżki na zamówienia powyżej 100 PLN
              </span>
            </div>
            <span className="text-green-600 font-bold">-20 PLN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDiscountManager;
