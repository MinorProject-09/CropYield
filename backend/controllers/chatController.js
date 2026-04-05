const { GoogleGenerativeAI } = require("@google/generative-ai");
const officeParser = require("officeparser");

const SYSTEM_INSTRUCTION = `You are CropYield's farming advisor for Indian farmers.

Focus on:
- Suggesting suitable crops from inputs like region, N/P/K values, soil pH, rainfall, humidity, temperature, month/duration, water availability, farm size, budget, and goals.
- Rough production/yield expectations only as general ranges (never guarantee outcomes).
- Profit or income ideas only as rough, educational pointers (mention market risk and local variation).
- Mention practical input factors used in this project domain: N, P, K, pH, weather trends, and location-based conditions.
- Encourage soil testing, local extension services, and verified seed sources.

Farmer-friendly style rules:
- Language is controlled by the "APP LANGUAGE" block in each request (the user's UI language). Follow that block exactly. Do not choose the reply language from the user's message unless the APP LANGUAGE block says otherwise.
- Use very simple words. Avoid technical jargon unless you explain it in 1 short line.
- Keep answers short and practical: "What to do now", "Why", "Expected result/risk".
- Prefer Indian context: acre/hectare, mandi rates, monsoon timing, local irrigation reality, seed/fertilizer availability.
- If user gives incomplete data, ask only 1-3 most important follow-up questions.
- Never shame the user; be respectful and supportive.

Output format:
1) "Recommended crop(s)"
2) "Why this suits your farm"
3) "Simple next steps (3-5 points)"
4) "Estimated yield/profit range (rough, not guaranteed)"

If the user attached images or documents, use them to understand soil reports, crop photos, or notes — describe what you see briefly, then give advice.

Never give medical or legal advice.`;

const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-pro",
].filter(Boolean);

const API_VERSIONS = ["v1", "v1beta"];

function fallbackReply(message) {
  const text = (message || "").toLowerCase();
  if (text.includes("rice") || text.includes("wheat") || text.includes("crop")) {
    return "Share your region/state, soil type, water source (rain-fed / canal / bore), farm size, and budget. I will suggest suitable crops and what to watch for on yield and market risk.";
  }
  if (text.includes("profit") || text.includes("income") || text.includes("money")) {
    return "Profit depends on local mandi rates, input costs, and weather. Tell me your crop, area (acres/ha), and rough cost per acre so I can outline a simple expectation range and risks—not a guarantee.";
  }
  return "I could not reach the AI service right now. Describe your location, soil, water, farm size, and what you want to grow (or your profit goal), and try again—or check that GEMINI_API_KEY is set and billing is enabled for Google AI.";
}

async function fileToParts(file) {
  const buffer = file.buffer;
  const mimetype = file.mimetype || "";
  const originalname = file.originalname || "file";

  if (/^image\//i.test(mimetype)) {
    return [
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: mimetype,
        },
      },
    ];
  }

  if (mimetype === "application/pdf" || /\.pdf$/i.test(originalname)) {
    return [
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: "application/pdf",
        },
      },
    ];
  }

  try {
    const text = await officeParser.parseOfficeAsync(buffer);
    if (text && String(text).trim()) {
      const excerpt = String(text).trim().slice(0, 12000);
      return [
        {
          text: `\n--- Text from ${originalname} ---\n${excerpt}\n`,
        },
      ];
    }
  } catch (_) {
    /* fall through */
  }

  if (
    /presentation|powerpoint|pptx|ppt|msword|wordprocessing|spreadsheet|excel/i.test(mimetype) ||
    /\.(pptx|ppt|docx|doc|xlsx|xls)$/i.test(originalname)
  ) {
    const mime =
      mimetype ||
      (originalname.toLowerCase().endsWith(".pptx")
        ? "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        : "application/octet-stream");
    return [
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: mime,
        },
      },
    ];
  }

  return [
    {
      text: `\n[Attached: ${originalname} — could not read automatically. Please paste the important lines as text.]\n`,
    },
  ];
}

function appLanguageBlock(lang, langLabel) {
  const code = String(lang || "en").toLowerCase().trim();
  const label =
    langLabel ||
    (code === "en" ? "English" : code);

  if (code === "en") {
    return [
      "=== APP LANGUAGE (MANDATORY) ===",
      "The farmer selected English in the app language menu.",
      "Write your ENTIRE reply in English only (Latin script).",
      "Do not use Hindi, Devanagari, Urdu script, or any other script for explanations.",
      "If the user's message is in another language, still answer in English unless they explicitly ask for another language.",
    ].join("\n");
  }

  return [
    "=== APP LANGUAGE (MANDATORY) ===",
    `The farmer selected "${label}" (code: ${code}) in the app language menu.`,
    `Write your ENTIRE reply ONLY in ${label}, using the correct native script for that language.`,
    "Do not default to Hindi or English unless the user explicitly asks for it in their message.",
  ].join("\n");
}

async function buildUserParts(message, lang, langLabel, files) {
  const langBlock = appLanguageBlock(lang, langLabel);

  let promptWithInstruction = `${SYSTEM_INSTRUCTION}\n\n${langBlock}\n\nUser request:\n${message}`;

  if (files && files.length) {
    promptWithInstruction += `\n\n(The user attached ${files.length} file(s). Use them if helpful.)`;
  }

  const parts = [{ text: promptWithInstruction }];

  if (files && files.length) {
    for (const f of files) {
      const extra = await fileToParts(f);
      parts.push(...extra);
    }
  }

  return parts;
}

async function generateWithGemini(apiKey, userParts) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let reply = "";
  let lastErr = null;
  const errors = [];

  for (const modelName of MODEL_CANDIDATES) {
    for (const apiVersion of API_VERSIONS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion });
        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: userParts,
            },
          ],
        });
        const response = result.response;
        reply =
          typeof response.text === "function" ? await response.text() : "";
        if (reply && reply.trim()) break;
      } catch (err) {
        lastErr = err;
        errors.push({
          model: modelName,
          apiVersion,
          message: err?.message || String(err),
        });
      }
    }
    if (reply && reply.trim()) break;
  }

  return { reply, lastErr, errors };
}

exports.chat = async (req, res) => {
  try {
    const { message: rawMessage, lang: rawLang, langLabel: rawLangLabel } = req.body || {};
    const files = req.files || [];

    const lang = String(rawLang || "en").toLowerCase().trim() || "en";
    const langLabel =
      String(rawLangLabel || "").trim() ||
      (lang === "en" ? "English" : lang);

    let message = String(rawMessage || "").trim();
    if (!message && files.length) {
      message = "Please help me using the attached file(s).";
    }

    if (!message) {
      return res.status(400).json({ error: "Message or file required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        reply: fallbackReply(message),
        limited: true,
        debug: "Missing GEMINI_API_KEY",
      });
    }

    const userParts = await buildUserParts(message, lang, langLabel, files);
    const { reply, lastErr, errors } = await generateWithGemini(apiKey, userParts);

    if (!reply || !reply.trim()) {
      if (lastErr) {
        console.error("❌ Gemini error:", lastErr?.message || lastErr);
      }
      return res.json({
        reply: fallbackReply(message),
        limited: true,
        debug:
          errors.length > 0
            ? errors.map((e) => `${e.apiVersion}:${e.model} -> ${e.message}`).join(" | ")
            : lastErr?.message || String(lastErr || "Unknown Gemini error"),
        triedModels: MODEL_CANDIDATES,
        triedApiVersions: API_VERSIONS,
        errors,
      });
    }

    return res.json({ reply: reply.trim() });
  } catch (err) {
    console.error("❌ Gemini error:", err?.message || err);

    const msg = String(err?.message || "");
    if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
      return res.json({
        reply: fallbackReply(req.body?.message),
        limited: true,
      });
    }

    return res.json({
      reply: fallbackReply(req.body?.message),
      limited: true,
      debug: err?.message || "Unknown error",
    });
  }
};
