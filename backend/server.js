import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let tokenCache = { token: null, expires: 0 };

async function getToken(apiKey, apiSecret) {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expires) return tokenCache.token;

  const res = await fetch("https://api.petfinder.com/v2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: apiKey,
      client_secret: apiSecret,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access token");

  tokenCache = { token: data.access_token, expires: now + data.expires_in * 1000 };
  return tokenCache.token;
}

app.post("/search", async (req, res) => {
  try {
    const { apiKey, apiSecret, type, age, gender, keywords } = req.body;
    const token = await getToken(apiKey, apiSecret);

    const url = new URL("https://api.petfinder.com/v2/animals");
    if (type) url.searchParams.append("type", type);
    if (age) url.searchParams.append("age", age);
    if (gender) url.searchParams.append("gender", gender);
    url.searchParams.append("limit", "50");

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!data.animals) return res.json([]);

    const lowerKeywords = (keywords || []).map(k => k.toLowerCase());
    const filtered = data.animals.filter(animal =>
      lowerKeywords.length === 0
        ? true
        : lowerKeywords.some(k => animal.description?.toLowerCase().includes(k))
    );

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => console.log("✅ Backend running on http://localhost:4000"));
