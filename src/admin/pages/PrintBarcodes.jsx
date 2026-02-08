import { useLocation } from "react-router-dom";
import BarcodeLabel from "../components/BarcodeLabel";

const PrintBarcodes = () => {
  const { state } = useLocation();
  const products = state?.products || [];

  if (!products.length) {
    return (
      <div className="p-6 text-center text-red-500">
        No products selected for barcode printing.
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4 print:hidden">
        <h1 className="text-xl font-bold">Barcode Labels</h1>
        <button
          onClick={() => window.print()}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Print
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 print:grid-cols-4">
        {products.map((product) => (
          <BarcodeLabel key={product._id} product={product} />
        ))}
      </div>

      <style>
        {`
          @media print {
            body {
              margin: 0;
            }
            .print\\:hidden {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PrintBarcodes;
