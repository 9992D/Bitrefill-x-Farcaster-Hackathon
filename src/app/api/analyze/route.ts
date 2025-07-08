import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const serpApiKey = process.env.SERPAPI_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!serpApiKey || !cloudName || !uploadPreset) {
    return NextResponse.json({ error: "Missing env variables" }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  // 1. Upload to Cloudinary
  const arrayBuffer = await file.arrayBuffer();
  const cloudinaryData = new FormData();
  cloudinaryData.append("file", new Blob([arrayBuffer], { type: file.type || "image/png" }), "image.png");
  cloudinaryData.append("upload_preset", uploadPreset);

  const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: cloudinaryData,
  });

  if (!cloudRes.ok) {
    const errText = await cloudRes.text();
    return NextResponse.json({ error: "Cloudinary upload failed", details: errText }, { status: 500 });
  }

  const cloudJson = await cloudRes.json();
  const imageUrl = cloudJson.secure_url;
  if (!imageUrl) {
    return NextResponse.json({ error: "No image url from Cloudinary" }, { status: 500 });
  }

  // 2. SerpApi reverse image
  const serpParams = new URLSearchParams({
    engine: "google_reverse_image",
    image_url: imageUrl,
    api_key: serpApiKey,
    output: "json",
  });

  const serpRes = await fetch("https://serpapi.com/search?" + serpParams.toString(), {
    method: "GET",
    headers: { "Accept": "application/json" },
  });

  if (!serpRes.ok) {
    const errText = await serpRes.text();
    return NextResponse.json({ error: "SerpApi reverse image failed", details: errText }, { status: 500 });
  }

  const serpData = await serpRes.json();

  // 3. Trouve un best guess ou titre
  let bestGuess = serpData?.search_information?.best_guess || serpData?.image_results?.[0]?.title || "";
  if (!bestGuess) bestGuess = "Produit"; // fallback

  // 4. Recherche Google Shopping (SerpApi)
  const shoppingParams = new URLSearchParams({
    engine: "google_shopping",
    q: bestGuess,
    api_key: serpApiKey,
    gl: "us",         // adapte si tu veux pour une autre région
    hl: "en",
    output: "json",
  });
  const shoppingRes = await fetch("https://serpapi.com/search?" + shoppingParams.toString());
  const shoppingData = await shoppingRes.json();
  const annonces = shoppingData?.shopping_results ?? [];

  // 5. Renvoie tout ce qu'il faut au front
  return NextResponse.json({
    imageUrl,
    bestGuess,
    annonces,
  });
}
