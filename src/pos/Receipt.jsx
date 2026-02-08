const Receipt = ({ data, onClose }) => {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 print:bg-white">
      <div className="bg-white text-black p-6 w-80 rounded shadow-lg print:w-full">
        <h2 className="text-center font-bold text-lg mb-2">MY SHOP NAME</h2>
        <p className="text-center text-sm mb-4">{data.date}</p>

        <p className="mb-2"><strong>Cashier:</strong> {data.cashier}</p>

        <hr className="my-2" />

        {data.items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm">
            <span>{item.name} × {item.quantity}</span>
            <span>₵ {item.price * item.quantity}</span>
          </div>
        ))}

        <hr className="my-2" />

        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>₵ {data.total}</span>
        </div>

        <div className="flex justify-between text-sm mt-2">
          <span>Paid</span>
          <span>₵ {data.amountPaid}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Change</span>
          <span>₵ {data.change}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Method</span>
          <span>{data.method}</span>
        </div>

        <div className="flex gap-2 mt-4 print:hidden">
          <button onClick={handlePrint} className="flex-1 bg-green-600 text-white p-2 rounded">
            Print
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-600 text-white p-2 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
