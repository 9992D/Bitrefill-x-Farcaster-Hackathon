"use client";
import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import ImageUploader from "./components/ImageUploader";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  function handleClear() {
    setSelectedFile(null);
    setIsProcessing(false);
  }

  function handleValidate() {
    if (!selectedFile) return;
    setIsProcessing(true);
    setTimeout(() => {
      alert("ChatGPT image analysis would start here!");
      setIsProcessing(false);
    }, 1500);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-3xl font-bold mb-4 text-[#FF9900] flex items-center gap-2">
        Visual Shopping Mini App
      </h1>
      <ImageUploader
        onImageSelected={setSelectedFile}
        onClear={handleClear}
        onValidate={handleValidate}
        selectedFile={selectedFile}
        isProcessing={isProcessing}
      />
    </main>
  );
}
