const Receipt = ({ data, onClose }) => {
  const handlePrint = () => {
    window.print();   // triggers receipt printer (opens cash drawer if configured)
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 print:bg-white">
      <div className="bg-white text-black p-6 w-80 rounded shadow-lg print:w-full print:shadow-none">

        <h2 className="text-center font-bold text-lg mb-1">MY SHOP NAME</h2>
        <p className="text-center text-xs text-gray-500 mb-4">{data.date}</p>

        <p className="mb-2 text-sm">
          <strong>Cashier:</strong> {data.cashier}
        </p>

        <hr className="my-2" />

        {data.items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm">
            <span>{item.name} × {item.quantity}</span>
            <span>₵ {(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}

        <hr className="my-2" />

        <div className="flex justify-between font-bold text-base">
          <span>Total</span>
          <span>₵ {Number(data.total).toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm mt-2">
          <span>Paid</span>
          <span>₵ {Number(data.amountPaid).toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Change</span>
          <span>₵ {Number(data.change).toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Method</span>
          <span className="capitalize">{data.method}</span>
        </div>

        <div className="flex gap-2 mt-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-green-600 text-white p-2 rounded"
          >
            Print
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 text-white p-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
