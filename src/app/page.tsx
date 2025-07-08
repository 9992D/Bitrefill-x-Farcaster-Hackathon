"use client";
import { useEffect, useState, useCallback } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import Image from "next/image";
import ImageUploader from "./components/ImageUploader";
import BtcSpinner from "./components/BtcSpinner";
import BtcSuccess from "./components/BtcSuccess";
import BtcBackButton from "./components/BtcBackButton";
import ToastNotification from "./components/ToastNotification";
import ProductCard from "./components/ProductCard";

export default function Home() {
  const [step, setStep] = useState<"upload" | "processing" | "done">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);

  const [bitrefillProduct, setBitrefillProduct] = useState<any | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [errorProduct, setErrorProduct] = useState<string | null>(null);

  // Invoice feedback
  const [invoiceResult, setInvoiceResult] = useState<any | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Toast notification
  const [showPaidToast, setShowPaidToast] = useState(false);

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
      setResult({ imageUrl: "", bestGuess: "", annonces: [], error: "Network or server error" });
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
    setShowPaidToast(false);
    try {
      const res = await fetch("/api/offer", { method: "POST" });
      const data = await res.json();
      if (data?.products?.data) {
        setBitrefillProduct(data.products.data);
      } else {
        setErrorProduct("No product found or wrong format.");
      }
    } catch (e) {
      setErrorProduct("Network or authentication error!");
    } finally {
      setLoadingProduct(false);
    }
  }

  // Create invoice and simulate payment
  const handleBuy = useCallback(async () => {
    if (!bitrefillProduct || !selectedPackage) return;
    setLoadingInvoice(true);
    setInvoiceResult(null);
    setShowPaidToast(false);
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: bitrefillProduct.id,
          value: selectedPackage.value,
          quantity: 1
        })
      });
      const data = await res.json();
      setInvoiceResult(data);
      setTimeout(() => setShowPaidToast(true), 400);
    } catch (err) {
      setInvoiceResult({ error: "Invoice creation error!" });
    } finally {
      setLoadingInvoice(false);
    }
  }, [bitrefillProduct, selectedPackage]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white relative">
      <ToastNotification
        show={showPaidToast}
        invoiceId={invoiceResult?.data?.id}
        onClose={() => setShowPaidToast(false)}
      />

      {/* Bitrefill offers button */}
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
          <ProductCard
            product={bitrefillProduct}
            selectedPackage={selectedPackage}
            onSelectPackage={setSelectedPackage}
            onBuy={handleBuy}
            loadingInvoice={loadingInvoice}
            invoiceResult={invoiceResult}
          />
        )}
      </div>

      {/* The rest of your app */}
      {step !== "upload" && <BtcBackButton onClick={handleBack} />}

      <h1 className="text-3xl font-bold mb-4 text-[#FF9900] flex items-center gap-2">
        <span>
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill="#FF9900"/>
            <text x="10" y="25" fontSize="16" fontWeight="bold" fill="white">₿</text>
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
              alt="Uploaded image"
              width={300}
              height={300}
              className="max-w-xs rounded-lg shadow"
              unoptimized
            />
          )}
          {result?.bestGuess && (
            <div className="italic text-gray-700 text-center mb-4">Search: <b>{result.bestGuess}</b></div>
          )}
          {result?.error ? (
            <div className="text-red-600 font-semibold">{result.error}</div>
          ) : result?.annonces && result.annonces.length > 0 ? (
            <div className="w-full">
              <h2 className="text-lg font-semibold mb-2">Google Shopping results:</h2>
              <ul className="space-y-4">
                {result.annonces.map((item: any, idx: number) => (
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
            <div className="text-gray-700">No shopping results found.</div>
          )}
        </div>
      )}
    </main>
  );
}
