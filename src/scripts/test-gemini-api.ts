import 'dotenv/config';

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in environment variables.");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  console.log(`🔍 Querying Gemini API: ${url.replace(apiKey, 'HIDDEN_KEY')}`);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error("❌ API Error:", JSON.stringify(data, null, 2));
      return;
    }

    console.log("✅ Available Models:");
    if (data.models) {
        data.models.forEach((model: any) => {
            console.log(`   - ${model.name} (${model.version}) [${model.supportedGenerationMethods.join(', ')}]`);
        });
    } else {
        console.log("   No models found in response:", data);
    }

  } catch (error) {
    console.error("❌ Network Error:", error);
  }
}

listModels();
