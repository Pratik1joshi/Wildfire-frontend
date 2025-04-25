import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying BIPAD request:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from BIPAD" },
      { status: 500 }
    );
  }
}

