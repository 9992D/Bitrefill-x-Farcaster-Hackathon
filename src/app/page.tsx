"use client";
import { useEffect, useState } from "react";
import ImageUploader from "./components/ImageUploader"; // ou adapte le chemin
import BtcSpinner from "./components/BtcSpinner";
import BtcSuccess from "./components/BtcSuccess";
import BtcBackButton from "./components/BtcBackButton";

type ShoppingAnnonce = {
  product_id?: string;
  title?: string;
  link?: string;
  source?: string;
  price?: string;
  thumbnail?: string;
};

type Result = {
  imageUrl: string;
  bestGuess: string;
  annonces: ShoppingAnnonce[];
  error?: string;
} | null;

export default function Home() {
  const [step, setStep] = useState<"upload" | "processing" | "done">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result>(null);

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
      setResult({ imageUrl: "", bestGuess: "", annonces: [], error: "Erreur réseau ou serveur" });
    } finally {
      setStep("done");
    }
  }

  function handleBack() {
    setSelectedFile(null);
    setResult(null);
    setStep("upload");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white relative">
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
            <img src={result.imageUrl} alt="Image uploadée" className="max-w-xs rounded-lg shadow" />
          )}
          {result?.bestGuess && (
            <div className="italic text-gray-700 text-center mb-4">Recherche : <b>{result.bestGuess}</b></div>
          )}
          {result?.error ? (
            <div className="text-red-600 font-semibold">{result.error}</div>
          ) : result?.annonces && result.annonces.length > 0 ? (
            <div className="w-full">
              <h2 className="text-lg font-semibold mb-2">Annonces Google Shopping :</h2>
              <ul className="space-y-4">
                {result.annonces.map((item, idx) => (
                  <li key={item.product_id || item.link || idx} className="border rounded-xl p-3 shadow flex gap-4 items-center">
                    {item.thumbnail && (
                      <img src={item.thumbnail} alt={item.title || ""} className="w-16 h-16 object-cover rounded-lg" />
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
            <div className="text-gray-700">Aucune annonce trouvée.</div>
          )}
        </div>
      )}
    </main>
  );
}
