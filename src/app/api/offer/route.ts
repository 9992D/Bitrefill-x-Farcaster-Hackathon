import { NextResponse } from "next/server";

export async function POST() {
  const BITREFILL_API_KEY = process.env.BITREFILL_API_KEY!;
  const url = "https://api.bitrefill.com/v2/products/testcorp-syldavia";

  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${BITREFILL_API_KEY}`,
      "Content-Type": "application/json",
    }
  });
  const data = await res.json();
  return NextResponse.json({ status: res.status, products: data });
}
