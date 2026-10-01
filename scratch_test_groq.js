const apiKey = "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";

async function main() {
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  const data = await res.json();
  const models = data.data.map(m => m.id);
  console.log("AVAILABLE_MODELS:", JSON.stringify(models, null, 2));
}

main().catch(console.error);
