import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const generateCourseFromPrompt = async (prompt) => {
    const systemPrompt = `You are an expert AI educator. Generate a structured educational course based on the given prompt.
The output MUST be a valid JSON object following this EXACT structure:
{
  "Title": "Course Title",
  "Description": "Brief course description",
  "Modules": [
    {
      "Title": "Module 1 Title",
      "Explanation": "Detailed explanation of the module concept.",
      "KeyPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ]
}
Ensure there are exactly 5 to 8  large modules. Return ONLY this JSON without any markdown formatting or extra text.`;

    const response = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" }
    });

    const completionBody = response.choices[0]?.message?.content;
    try {
        const jsonResponse = JSON.parse(completionBody);
        return jsonResponse;
    } catch (err) {
        console.error("Failed to parse AI output:", err);
        throw new Error("Invalid AI generated content format");
    }
};

export const generateQuizFromCourse = async (courseTitle, trimmedContent) => {
    const systemPrompt = `You are a STRICT AI Quiz Generator.

SYSTEM GUARDRAIL:
- You must generate questions ONLY from the provided content.
- If you generate questions about "Photosynthesis", "Evaporation", or "General Biology" and it is NOT in the content, you have FAILED.
- Ground your questions in specific facts from the modules.

CRITICAL RULES:
1. Generate questions ONLY from the given course content.
2. DO NOT use any external or general knowledge.
3. Each question MUST include at least one keyword EXACTLY from the content.
4. If a question can be answered without the content, DO NOT include it.
5. If content is insufficient to generate 5 unique questions, return exactly: "INSUFFICIENT_DATA"

COURSE CONTENT:
${trimmedContent}

TASK:
Generate exactly 5 Multiple Choice Questions for the course: "${courseTitle}".

FORMAT (STRICT JSON ONLY):
[
  {
    "question": "must reference course content",
    "options": ["A", "B", "C", "D"],
    "answer": "correct option",
    "explanation": "must include content keyword from given context"
  }
]`;

    try {
        const response = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            max_tokens: 1000
        });

        const content = response.choices[0].message.content.trim();
        
        if (content.includes("INSUFFICIENT_DATA")) {
            return { error: "INSUFFICIENT_DATA" };
        }

        try {
            return JSON.parse(content);
        } catch (e) {
            console.error("Failed to parse AI quiz JSON:", e);
            // Fallback: try to find the array in the text
            const match = content.match(/\[[\s\S]*\]/);
            if (match) return JSON.parse(match[0]);
            throw e;
        }

    } catch (err) {
        console.error("Failed to parse AI output or reach API:", err);
        throw new Error("Invalid AI generated quiz format or timeout");
    }
};
