import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const BITREFILL_API_KEY = process.env.BITREFILL_API_KEY!;
  const body = await req.json();

  // Requis par l’API Bitrefill :
  // - product_id
  // - value
  // - quantity
  // On force un paiement en bitcoin (modifie selon ce que tu veux)
  const payload = {
    products: [
      {
        product_id: body.product_id,
        value: body.value,
        quantity: body.quantity || 1
      }
    ],
    payment_method: "balance", 
    auto_pay: false,
  };

  const res = await fetch("https://api.bitrefill.com/v2/invoices", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${BITREFILL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
