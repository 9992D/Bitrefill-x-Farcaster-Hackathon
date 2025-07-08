"use client";
import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import Image from "next/image";
import ImageUploader from "./components/ImageUploader";
import BtcSpinner from "./components/BtcSpinner";
import BtcSuccess from "./components/BtcSuccess";
import BtcBackButton from "./components/BtcBackButton";
import OfferDropdown from "./components/OfferDropdown";
import { BitrefillProduct, BitrefillPackage } from "./types";

type ShoppingAnnonce = {
  product_id?: string;
  title?: string;
  link?: string;
  source?: string;
  price?: string;
  thumbnail?: string;
};

type AnalyzeResult = {
  imageUrl: string;
  bestGuess: string;
  annonces: ShoppingAnnonce[];
  error?: string;
} | null;

type InvoiceResult = {
  data?: {
    id: string;
    payment?: {
      method?: string;
      currency?: string;
      price?: number;
    };
  };
  error?: string;
} | null;

export default function Home() {
  const [step, setStep] = useState<"upload" | "processing" | "done">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalyzeResult>(null);

  const [bitrefillProduct, setBitrefillProduct] = useState<BitrefillProduct | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<BitrefillPackage | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [errorProduct, setErrorProduct] = useState<string | null>(null);

  const [invoiceResult, setInvoiceResult] = useState<InvoiceResult>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Notification
  const [showNotif, setShowNotif] = useState(false);
  const [notifId, setNotifId] = useState<string | null>(null);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  function handleClear() {
    setSelectedFile(null);
    setStep("upload");
    setResult(null);
  }

  async function handleValidate() {
    if (!selectedFile) return;
    setStep("processing");

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        imageUrl: "",
        bestGuess: "",
        annonces: [],
        error: "Network or server error",
      });
    } finally {
      setStep("done");
    }
  }

  function handleBack() {
    setSelectedFile(null);
    setResult(null);
    setStep("upload");
  }

  async function handleFetchBitrefillProduct() {
    setLoadingProduct(true);
    setBitrefillProduct(null);
    setErrorProduct(null);
    setSelectedPackage(null);
    setInvoiceResult(null);
    setShowNotif(false);
    setNotifId(null);
    try {
      const res = await fetch("/api/offer", { method: "POST" });
      const data = await res.json();
      if (data?.products?.data) {
        setBitrefillProduct(data.products.data);
      } else {
        setErrorProduct("No product found or bad format.");
      }
    } catch (e) {
      setErrorProduct("Network or authentication error!");
    } finally {
      setLoadingProduct(false);
    }
  }

  // Simulate invoice creation & payment (for hackathon demo)
  async function handleBuy() {
    if (!bitrefillProduct || !selectedPackage) return;
    setLoadingInvoice(true);
    setInvoiceResult(null);
    setShowNotif(false);
    setNotifId(null);

    // simulate API call
    setTimeout(() => {
      const invoiceId = crypto.randomUUID();
      setInvoiceResult({
        data: {
          id: invoiceId,
          payment: {
            method: "balance",
            currency: "BTC",
            price: selectedPackage.price,
          },
        },
      });
      setLoadingInvoice(false);

      // Show notification for 10s
      setShowNotif(true);
      setNotifId(invoiceId);
      setTimeout(() => {
        setShowNotif(false);
        setNotifId(null);
      }, 10000);
    }, 1200);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white relative">
      {/* Notification (appears on invoice) */}
      {showNotif && invoiceResult?.data?.id && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-4 rounded-xl shadow-xl z-50 animate-slide-down">
          Invoice <span className="font-mono">{invoiceResult.data.id}</span> was paid!<br />
          You'll receive a confirmation email soon.
        </div>
      )}

      {/* Button to fetch Bitrefill product */}
      <div className="mb-6 w-full flex flex-col items-center">
        <button
          className="px-4 py-2 bg-[#FF9900] text-white rounded font-bold hover:bg-[#e08700] transition"
          onClick={handleFetchBitrefillProduct}
          disabled={loadingProduct}
        >
          {loadingProduct ? "Loading..." : "Show Amazon.fr Bitrefill offers"}
        </button>
        {errorProduct && (
          <div className="mt-2 text-sm text-red-600 text-center max-w-xl break-all">
            {errorProduct}
          </div>
        )}
        {bitrefillProduct && (
          <div className="mt-4 w-full max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <Image
                src={`https://cdn.bitrefill.com/images/products/amazon_fr.png`}
                width={48}
                height={48}
                alt={bitrefillProduct.name}
                className="rounded-lg"
                unoptimized
              />
              <span className="font-bold text-lg">{bitrefillProduct.name}</span>
            </div>
            <div className="mb-2 font-semibold text-[#FF9900]">Select an offer:</div>
            <OfferDropdown
              packages={bitrefillProduct.packages}
              selectedPackage={selectedPackage}
              onSelect={setSelectedPackage}
            />
            {selectedPackage && (
              <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded text-green-900">
                Selected offer: <b>{selectedPackage.value} €</b> – {(selectedPackage.price / 1e8).toFixed(8)} BTC
                <br />
                <span className="text-xs text-gray-600">Package ID: {selectedPackage.id}</span>
                <br />
                <button
                  className="mt-3 px-4 py-2 rounded bg-[#FF9900] text-white font-bold hover:bg-[#e08700] transition"
                  onClick={handleBuy}
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
                        <div className="font-bold text-green-700">Invoice created and paid!</div>
                        <div className="break-all">ID: {invoiceResult.data.id}</div>
                        <div>
                          Payment method: {invoiceResult.data.payment?.method}
                        </div>
                        <div>
                          Amount paid:{" "}
                          <span className="font-mono text-xs">
                            {(invoiceResult.data.payment?.price || 0 / 1e8).toFixed(8)} BTC
                          </span>
                        </div>
                        <div className="mt-2 italic text-sm text-gray-700">
                          (You will receive an email confirmation soon.)
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rest of your app (image upload/analyze) */}
      {step !== "upload" && <BtcBackButton onClick={handleBack} />}
      <h1 className="text-3xl font-bold mb-4 text-[#FF9900] flex items-center gap-2">
        <span>
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill="#FF9900" />
            <text x="10" y="25" fontSize="16" fontWeight="bold" fill="white">
              ₿
            </text>
          </svg>
        </span>
        Visual Shopping Mini App
      </h1>
      {step === "upload" && (
        <ImageUploader
          onImageSelected={setSelectedFile}
          onClear={handleClear}
          onValidate={handleValidate}
          selectedFile={selectedFile}
          isProcessing={false}
        />
      )}
      {step === "processing" && <BtcSpinner />}
      {step === "done" && (
        <div className="w-full max-w-md flex flex-col items-center gap-4">
          <BtcSuccess />
          {result?.imageUrl && (
            <Image
              src={result.imageUrl}
              alt="Uploaded"
              width={300}
              height={300}
              className="max-w-xs rounded-lg shadow"
              unoptimized
            />
          )}
          {result?.bestGuess && (
            <div className="italic text-gray-700 text-center mb-4">
              Search: <b>{result.bestGuess}</b>
            </div>
          )}
          {result?.error ? (
            <div className="text-red-600 font-semibold">{result.error}</div>
          ) : result?.annonces && result.annonces.length > 0 ? (
            <div className="w-full">
              <h2 className="text-lg font-semibold mb-2">Google Shopping Ads:</h2>
              <ul className="space-y-4">
                {result.annonces.map((item: ShoppingAnnonce, idx: number) => (
                  <li key={item.product_id || item.link || idx} className="border rounded-xl p-3 shadow flex gap-4 items-center">
                    {item.thumbnail && (
                      <Image
                        src={item.thumbnail}
                        alt={item.title || ""}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg"
                        unoptimized
                      />
                    )}
                    <div>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 hover:underline">
                        {item.title}
                      </a>
                      <div className="text-sm text-gray-600">
                        {item.price} – {item.source}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-gray-700">No ads found.</div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-down {
          0% {
            opacity: 0;
            transform: translate(-50%, -24px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </main>
  );
}
