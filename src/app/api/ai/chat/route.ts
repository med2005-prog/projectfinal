import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history } = body;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: "GROQ_API_KEY is not defined in environment variables. Please restart your server." 
      }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    // 1. Context Retrieval with Timeout/Error handling
    let postsContext = "";
    try {
      await connectToDatabase();
      const searchTerms = message.split(' ').filter((w: string) => w.length > 2).join(' ');
      
      const contextPosts = await Post.find(
        searchTerms ? { $text: { $search: searchTerms }, status: "active" } : { status: "active" }
      )
      .populate("author", "name")
      .limit(5)
      .lean();

      if (contextPosts && contextPosts.length > 0) {
        postsContext = "Relevant posts from our database:\n" + contextPosts.map((p: any) => 
          `- [${p.type.toUpperCase()}] Title: ${p.title} | Location: ${p.city}, ${p.location} | Posted by: ${p.author?.name || "Anonymous"} | Post ID: ${p._id}`
        ).join('\n');
      }
    } catch (dbError) {
      console.warn("DB Context failed, continuing without it:", dbError);
      postsContext = "(Note: Live database search currently unavailable)";
    }

    // 2. Prepare Prompt
    const systemPrompt = `
      You are 'Hassan', the smart AI assistant for 'Fin Huwa' (The leading Lost & Found platform in Agadir, Morocco).
      Your goal is to help people find their lost items or report items they've found in Agadir and surrounding areas (Inzegane, Ait Melloul, Taghazout, etc.).

      MARKET KNOWLEDGE:
      - You know Agadir well (Souk El Had, Marina, Talborjt, Anza, Beach, etc.).
      - If someone mentions a location in Agadir, be specific about it.

      CRITICAL LANGUAGE RULES:
      1. If the user speaks in Darija (e.g., 'khouya lost my phone', 'fin n9der nl9a sswart'), you MUST respond in Darija using ARABIC SCRIPT.
      2. If the user uses Latin script for Darija (Franco-Arabic/Arabezi), still respond in Darija using ARABIC SCRIPT.
      3. If they speak English/French, respond in that language but keep a friendly Moroccan vibe.
      4. Your Darija should be natural (Souss/Agadir vibe), using words like 'khouya/khti', 'marhba', 'f l-blasa'.

      DATABASE CONTEXT:
      ${postsContext}
      
      BEHAVIOR:
      - If you find a match in the database, provide the Post ID and tell them to search for it.
      - If no match, encourage them to click 'Report Lost' (l-fo9 3la l-isr) or 'Report Found'.
      - Be concise. Don't write long paragraphs.
    `;

    // 3. Call Groq with a reliable model
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...(history || []).map((h: any) => ({
          role: h.role === "model" ? "assistant" : "user",
          content: h.text || h.parts?.[0]?.text || ""
        })),
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile", // Currently active and reliable model
      temperature: 0.6,
      max_tokens: 512,
    });

    const aiMessage = chatCompletion.choices[0]?.message?.content || "No response from AI.";

    return NextResponse.json({ success: true, message: aiMessage });

  } catch (error: any) {
    console.error("CRITICAL AI CHAT ERROR:", error);
    return NextResponse.json({ 
      success: false, 
      error: `AI Error: ${error.message || "Unknown error"}` 
    }, { status: 500 });
  }
}
