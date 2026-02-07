import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

const BarcodeLabel = ({ product }) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (!product?.barcode) return;

    JsBarcode(barcodeRef.current, product.barcode, {
      format: "CODE128",
      width: 2,
      height: 60,
      displayValue: true,
      fontSize: 12,
      margin: 0,
    });
  }, [product]);

  return (
    <div className="w-[180px] h-[120px] border border-gray-300 flex flex-col items-center justify-center p-1 text-center">
      <div className="text-xs font-semibold truncate w-full">
        {product.name}
      </div>

      <svg ref={barcodeRef} />

      {product.price && (
        <div className="text-xs font-bold mt-1">
          ₵{product.price.toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default BarcodeLabel;
