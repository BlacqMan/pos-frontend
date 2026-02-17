import { useState } from "react";

const PaymentModel = ({ total, onConfirm, onCancel }) => {
  const [method, setMethod] = useState("cash");
  const [received, setReceived] = useState("");

  const change =
    method === "cash" && received
      ? Number(received) - total
      : 0;

  const confirm = () => {
    if (method === "cash" && Number(received) < total) {
      alert("Amount received is less than total");
      return;
    }

    onConfirm({
      paymentMethod: method,
      amountReceived: method === "cash" ? Number(received) : total,
      change: method === "cash" ? change : 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="text-lg font-bold mb-4">Complete Payment</h2>

        <p className="mb-3 font-semibold">Total: ₵ {total}</p>

        <select
          className="w-full border p-2 rounded mb-3"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="cash">Cash</option>
          <option value="momo">Mobile Money</option>
          <option value="card">Card</option>
        </select>

        {method === "cash" && (
          <>
            <input
              type="number"
              placeholder="Amount received"
              className="w-full border p-2 rounded mb-2"
              value={received}
              onChange={(e) => setReceived(e.target.value)}
            />

            <p className="text-sm mb-3">
              Change: ₵ {change >= 0 ? change : 0}
            </p>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={confirm}
            className="flex-1 bg-green-600 text-white p-2 rounded"
          >
            Confirm Payment
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white p-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModel;
