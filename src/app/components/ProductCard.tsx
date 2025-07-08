import OfferDropdown from "./OfferDropdown";

export default function ProductCard({
  product,
  selectedPackage,
  onSelectPackage,
  onBuy,
  loadingInvoice,
  invoiceResult,
}: {
  product: any;
  selectedPackage: any | null;
  onSelectPackage: (pkg: any) => void;
  onBuy: () => void;
  loadingInvoice: boolean;
  invoiceResult: any;
}) {
  return (
    <div className="mt-4 w-full max-w-md">
      <div className="flex items-center gap-3 mb-2">
        <span className="font-bold text-lg">{product.name}</span>
      </div>
      <div className="mb-2 font-semibold text-[#FF9900]">Select an offer:</div>
      <OfferDropdown
        packages={product.packages}
        selectedPackage={selectedPackage}
        onSelect={onSelectPackage}
      />
      {selectedPackage && (
        <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded text-green-900">
          Selected offer: <b>{selectedPackage.value} €</b> – {(selectedPackage.price / 1e9).toFixed(8)} BTC
          <br />
          <span className="text-xs text-gray-600">Package ID: {selectedPackage.id}</span>
          <br />
          <button
            className="mt-3 px-4 py-2 rounded bg-[#FF9900] text-white font-bold hover:bg-[#e08700] transition"
            onClick={onBuy}
            disabled={loadingInvoice}
          >
            {loadingInvoice ? "Creating invoice..." : "Buy"}
          </button>
          {invoiceResult && (
            <div className="mt-3 text-sm bg-gray-100 rounded p-2">
              {invoiceResult.error && (
                <span className="text-red-600">{invoiceResult.error}</span>
              )}
              {invoiceResult.data && (
                <>
                  <div className="font-bold text-green-700">Invoice created!</div>
                  <div className="break-all">ID: {invoiceResult.data.id}</div>
                  <div>
                    Payment method: {invoiceResult.data.payment?.method}
                  </div>
                  <div>
                    Amount to pay ({invoiceResult.data.payment?.currency}):{" "}
                    <span className="font-mono text-xs">{invoiceResult.data.payment?.price}</span>
                  </div>
                  <div className="mt-2 italic text-sm text-gray-700">
                    (We consider the invoice paid for this demo. You will receive an email confirmation soon.)
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
