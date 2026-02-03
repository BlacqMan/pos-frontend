import { useState } from "react";

const AdminPasswordModal = ({ onConfirm, onCancel }) => {
  const [password, setPassword] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded w-80">
        <h3 className="font-bold mb-3">
          Confirm Admin Password
        </h3>

        <input
          type="password"
          className="w-full p-2 bg-gray-700 mb-3"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            className="flex-1 bg-red-600 p-2"
            onClick={() => onConfirm(password)}
          >
            Confirm
          </button>
          <button
            className="flex-1 bg-gray-600 p-2"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPasswordModal;
