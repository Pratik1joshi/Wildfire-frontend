import { NextResponse } from "next/server";
import Papa from "papaparse";
import fs from "fs";
import path from "path";
import NodeCache from "node-cache"; // You'll need to install this: npm install node-cache

// Create a cache with 1 day TTL
const firmsCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

export const dynamic = 'force-dynamic'; 

// Implement a custom fetch with longer timeout
const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Path for local cache files
const cacheDir = path.join(process.cwd(), 'cache');
// Create cache directory if it doesn't exist
try {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
} catch (error) {
  console.error("Error creating cache directory:", error);
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { date } = resolvedParams;
    
    // Get search params
    const { searchParams } = new URL(request.url);
    const requestedSource = searchParams.get("source") || "NASA_FIRMS"; // Default to NASA_FIRMS

    if (!date) {
      return NextResponse.json(
        { error: "Missing date parameter" },
        { status: 400 }
      );
    }

    // Check if we have cached data for this date and source
    const cacheKey = `firms-${date}-${requestedSource}`;
    const cachedData = firmsCache.get(cacheKey);
    
    if (cachedData) {
      console.log(`Using cached data for ${date} from ${requestedSource}`);
      return NextResponse.json(cachedData);
    }

    // Check if we have a local file cache
    const cacheFilePath = path.join(cacheDir, `${cacheKey}.json`);
    try {
      if (fs.existsSync(cacheFilePath)) {
        const fileData = fs.readFileSync(cacheFilePath, 'utf8');
        const parsedFileData = JSON.parse(fileData);
        // Store in memory cache as well
        firmsCache.set(cacheKey, parsedFileData);
        console.log(`Using file cached data for ${date} from ${requestedSource}`);
        return NextResponse.json(parsedFileData);
      }
    } catch (err) {
      console.error("Error reading cache file:", err);
    }

    const mapKey = process.env.FIRMS_MAP_KEY;
    if (!mapKey) {
      throw new Error("FIRMS_MAP_KEY is not set in environment variables");
    }

    const source = "MODIS_NRT";
    const countryCode = "NPL";
    const selectedDate = new Date(date);
    const yesterday = new Date(selectedDate);
    yesterday.setDate(selectedDate.getDate() - 1);

    // Format dates for API
    const fromDate = yesterday.toISOString().split("T")[0];
    const toDate = date;

    const apiUrl = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${mapKey}/${source}/${countryCode}/2/${fromDate}`;

    console.log(`Fetching FIRMS data from ${apiUrl} (timeout: 30s)`);
    
    try {
      // Use our custom fetch with longer timeout
      const response = await fetchWithTimeout(apiUrl, {}, 30000);
      
      if (!response.ok) {
        throw new Error(`NASA FIRMS API request failed: ${response.statusText}`);
      }

      const csvText = await response.text();
      const parsedData = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      }).data;

      // Transform data to match expected format
      const transformedData = parsedData.map(item => ({
        ...item,
        date: item.acq_date || date,
        latitude: item.latitude,
        longitude: item.longitude,
        source: "NASA_FIRMS"
      }));

      // Cache the data
      firmsCache.set(cacheKey, transformedData);
      
      // Save to file cache
      try {
        fs.writeFileSync(cacheFilePath, JSON.stringify(transformedData));
      } catch (err) {
        console.error("Error writing to cache file:", err);
      }

      console.log(`Successfully fetched ${transformedData.length} FIRMS records`);
      return NextResponse.json(transformedData);
    } catch (fetchError) {
      console.error("Error fetching from NASA FIRMS API:", fetchError);
      
      // Return empty data with a more graceful error
      const fallbackData = [];
      
      // Try to use previously cached data if it exists (even if expired)
      const oldCachedData = firmsCache.get(cacheKey, true); // force get even if expired
      
      if (oldCachedData) {
        console.log("Using expired cached data as fallback");
        return NextResponse.json(oldCachedData);
      }
      
      return NextResponse.json(fallbackData);
    }
  } catch (error) {
    console.error("Error in FIRMS API route:", error);
    // Return an empty array instead of an error to avoid breaking the UI
    return NextResponse.json([]);
  }
}