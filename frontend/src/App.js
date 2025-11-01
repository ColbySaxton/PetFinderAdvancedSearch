import { useState } from "react";

export default function App() {
  const [form, setForm] = useState({
    apiKey: "",
    apiSecret: "",
    type: "dog",
    age: "",
    gender: "",
    keywords: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch("http://localhost:4000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          keywords: form.keywords.split(",").map(k => k.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4">🐾 Petfinder Search</h1>

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input name="apiKey" placeholder="Petfinder API Key" onChange={handleChange} className="border p-2 w-full rounded" />
        <input name="apiSecret" placeholder="Petfinder API Secret" onChange={handleChange} className="border p-2 w-full rounded" />
        <select name="type" value={form.type} onChange={handleChange} className="border p-2 w-full rounded">
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="rabbit">Rabbit</option>
          <option value="bird">Bird</option>
        </select>
        <input name="age" placeholder="Age (baby, young, adult, senior)" onChange={handleChange} className="border p-2 w-full rounded" />
        <input name="gender" placeholder="Gender (male, female)" onChange={handleChange} className="border p-2 w-full rounded" />
        <input name="keywords" placeholder="Keywords (comma separated)" onChange={handleChange} className="border p-2 w-full rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {results.length > 0 && (
        <ul className="space-y-4">
          {results.map(animal => (
            <li key={animal.id} className="border rounded p-4 shadow-sm hover:shadow-md transition">
              <h2 className="text-xl font-semibold">{animal.name}</h2>
              <p className="text-gray-600">{animal.breeds?.primary} • {animal.age} • {animal.gender}</p>
              <p className="mt-2 text-sm text-gray-700">
                {animal.description ? animal.description.slice(0, 150) + "..." : "No description available"}
              </p>
              {animal.photos?.[0] && (
                <img src={animal.photos[0].medium} alt={animal.name} className="mt-3 rounded w-48" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
