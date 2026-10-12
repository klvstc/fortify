import { GoogleGenAI, Type } from "@google/genai";
import { type JournalEntry, type MentorPersona, type ChatMessage, type Rank, type DailyMindset, type CheckInValidationResult, type EmergencyNudge, type EnhancedEmergencyNudge, type WeeklyReview, type DreamBuilderInputs, type JournalTemplate, type VulnerabilityShield, type GuidedMeditation, type OracleResponse } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Utility to safely parse JSON from Gemini response
const safelyParseJson = (text: string, fallback: any) => {
    try {
        let cleanText = text.trim();
        // Handle markdown code blocks
        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = cleanText.match(jsonRegex);
        if (match && match[1]) {
            cleanText = match[1];
        }
        return JSON.parse(cleanText);
    } catch (parseError) {
        return fallback;
    }
};

export const getDailyMindset = async (): Promise<DailyMindset> => {
    try {
        const prompt = "Generate a short motivational quote, a personal affirmation, and a very short (2-3 sentences) success story for someone quitting an addiction. Return it as JSON with keys: quote, affirmation, story.";
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { quote: { type: Type.STRING }, affirmation: { type: Type.STRING }, story: { type: Type.STRING } },
                    required: ["quote", "affirmation", "story"]
                }
            }
        });
        const fallback = { quote: "Strength is what we gain from the madness we survive.", affirmation: "I am in control.", story: "Keep going." };
        return safelyParseJson(response.text, fallback);
    } catch (error) {
        return {
            quote: "Your strength is greater than your struggle.",
            affirmation: "I am worthy of a peaceful and free life.",
            story: "Remember that cravings are temporary. Breathe through it, moment by moment. You've got this."
        };
    }
};

export const validateCheckIn = async (context: {
  journalEntries: JournalEntry[];
}): Promise<CheckInValidationResult> => {
    try {
        const recentJournalContent = context.journalEntries.slice(0, 3).map((e: any) => e.content).join('\n---\n');
        const prompt = `You are an AI integrity adjudicator. Your task is to determine if a user's journal entries suggest they have been dishonest about their progress in quitting an addiction. Analyze the following recent journal entries. If there are strong indicators of a relapse (e.g., mentions of giving in, feeling intense guilt after a specific event, resetting their count), classify the check-in as 'suspicious' and provide a gentle, non-accusatory reasoning. Otherwise, classify it as 'valid'. The reasoning should encourage honesty without being confrontational. Content: ${recentJournalContent}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { status: { type: Type.STRING }, reasoning: { type: Type.STRING } },
                    required: ['status']
                }
            }
        });
        const fallback = { status: 'valid', reasoning: '' };
        return safelyParseJson(response.text, fallback);
    } catch (error) {
        return { status: 'valid', reasoning: '' };
    }
};

export const getMentorResponse = async (
    persona: MentorPersona,
    history: ChatMessage[],
    message: string,
    context: { streakDays: number; journalSummary: string }
): Promise<string> => {
    try {
        const contextualMessage = `(Context: Streak ${context.streakDays} days. Journal: "${context.journalSummary || 'N/A'}")\n\nUser: ${message}`;
        const contents = [...history.map((h: any) => ({ role: h.role, parts: [{ text: h.content }] })), { role: 'user', parts: [{ text: contextualMessage }] }];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents.map(c => ({ role: c.role, parts: c.parts })),
            config: { systemInstruction: persona.systemInstruction },
        });
        return response.text;
    } catch (error) {
        return "I seem to be at a loss for words. My connection to the ether is weak. Please try again in a moment.";
    }
};

export const generateLegacySummary = async (context: {
  ranksAchieved: Rank[];
  journalSummary: string;
  badgesEarned: string[];
}): Promise<string> => {
  try {
    const prompt = `Create a heroic, epic summary of a user's journey of self-improvement. The user has achieved the following ranks: ${context.ranksAchieved.map(r => r.name).join(', ')}. They have earned these badges: ${context.badgesEarned.join(', ')}. Their recent journal entries have this theme: "${context.journalSummary}". Write a short, powerful narrative (3-4 paragraphs) about their transformation, referencing their trials (from journal themes) and triumphs (ranks and badges).`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Your journey has been monumental...";
  }
};

export const getEmergencyNudge = async (context: {
  streakDays: number;
  rank: string;
  mentor: MentorPersona;
}): Promise<EmergencyNudge> => {
    try {
        const prompt = `Generate a single, powerful "Pattern Interrupt" for someone about to relapse. Context: Streak of ${context.streakDays} days, Rank ${context.rank}. Mentor: ${context.mentor.name}. The response must be JSON with keys: "title" (short, punchy), "message" (1-2 sentences), "action" (a single, simple physical action).`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, message: { type: Type.STRING }, action: { type: Type.STRING } },
                    required: ['title', 'message', 'action']
                }
            }
        });
        const fallback = { title: "Pause.", message: "This moment does not define you. Your response does.", action: "Stand up and walk to a different room." };
        return safelyParseJson(response.text, fallback);
    } catch (error) {
        return {
            title: "Hold Fast.",
            message: "This is a test of your resolve...",
            action: "Splash cold water on your face."
        };
    }
};

export const getEnhancedEmergencyNudge = async (context: {
  journalEntries: JournalEntry[];
  visionNarrative: string | null;
  previousNudges: (EmergencyNudge | EnhancedEmergencyNudge)[];
  escalationLevel: number;
}): Promise<EnhancedEmergencyNudge> => {
    try {
        const journalSummary = context.journalEntries.slice(0, 5).map((e: any) => e.content).join('\n---\n');
        const prompt = `
You are an expert AI therapist specializing in crisis intervention for addiction recovery. A user is in a moment of extreme vulnerability and has escalated their request for help. This is escalation level ${context.escalationLevel} out of 10.
Their stated vision for their future self is: "${context.visionNarrative || 'To be strong and free.'}"
Their Recent Thoughts (Journal Summary): "${journalSummary || 'No recent journal entries.'}"
Previous Interventions Provided (in order): ${JSON.stringify(context.previousNudges, null, 2)}
Your Task: Generate a NEW, MORE DETAILED, and MORE PROFOUND intervention. Do NOT repeat advice. As the escalation level increases, your response should become more introspective and action-oriented.
Your response must be in JSON format with three keys: "personalizedMessage", "rescuePlan" (an array of 2-4 concrete, actionable steps), and "visionReminder".`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        personalizedMessage: { type: Type.STRING },
                        rescuePlan: { type: Type.ARRAY, items: { type: Type.STRING } },
                        visionReminder: { type: Type.STRING }
                    },
                    required: ['personalizedMessage', 'rescuePlan', 'visionReminder']
                }
            }
        });
        const fallback = { personalizedMessage: `This is a deep struggle, but you are deeper. (Level ${context.escalationLevel})`, rescuePlan: ["Take 5 slow, deep breaths."], visionReminder: "Remember the peace you are fighting for." };
        return safelyParseJson(response.text, fallback);
    } catch (error) {
        return {
            personalizedMessage: `This is a deep struggle, but you are deeper. Let's try something new (Level ${context.escalationLevel}).`,
            rescuePlan: ["Take 5 slow, deep breaths. Focus only on the air entering and leaving your lungs."],
            visionReminder: "Remember the feeling of peace you are striving for. It is real and it is waiting for you."
        };
    }
};

export const getWeeklyReview = async (journalEntries: JournalEntry[]): Promise<WeeklyReview> => {
    try {
        const prompt = `You are an AI coach specializing in Cognitive Behavioral Therapy (CBT). Analyze the past week of journal entries for a user on a self-improvement journey. Generate a weekly review based on CBT principles.
- **biggestWin**: Identify a moment where the user successfully broke a negative thought/behavior cycle or applied a healthy coping mechanism.
- **toughestChallenge**: Describe the most difficult situation and the automatic negative thoughts (ANTs) that likely accompanied it.
- **unseenPattern**: Identify a specific cognitive distortion (e.g., "all-or-nothing thinking," "catastrophizing," "personalization") that appears in their writing. Briefly and simply explain it.
- **nextWeekMission**: Propose a concrete, actionable CBT-based "behavioral experiment" for the user to try. It should help them challenge the identified pattern.
Entries: ${JSON.stringify(journalEntries)}. Return JSON with keys: biggestWin, toughestChallenge, unseenPattern, nextWeekMission.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { biggestWin: { type: Type.STRING }, toughestChallenge: { type: Type.STRING }, unseenPattern: { type: Type.STRING }, nextWeekMission: { type: Type.STRING } },
                    required: ['biggestWin', 'toughestChallenge', 'unseenPattern', 'nextWeekMission']
                }
            }
        });
        const fallback = { biggestWin: "Consistency", toughestChallenge: "Stress", unseenPattern: "N/A", nextWeekMission: "Focus on peace." };
        return safelyParseJson(response.text, fallback);
    } catch (error) {
        return {
            biggestWin: "Your consistency in journaling is a huge win.",
            toughestChallenge: "Moments of stress seem to be a recurring challenge.",
            unseenPattern: "Could not analyze patterns at this time.",
            nextWeekMission: "Focus on noticing small moments of peace."
        };
    }
};

export const generateVisionNarrative = async (inputs: DreamBuilderInputs): Promise<string> => {
    try {
        const prompt = `Based on these inputs, write a short, inspiring first-person narrative (2-3 sentences) of the user's ideal future self. Feeling on waking: "${inputs.feeling}". First action: "${inputs.morningAction}". Positive interaction: "${inputs.interaction}". Accomplishment: "${inputs.accomplishment}". Weave these into a cohesive story.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        return "I am a person of strength and integrity...";
    }
};

export const getJournalingTemplate = async (): Promise<JournalTemplate> => {
    try {
        const prompt = `Generate a new, insightful journaling template for someone on a self-improvement journey. Provide a creative title and a template with 3-4 bullet points or questions. Return JSON with keys: "title" and "template".`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, template: { type: Type.STRING } },
                    required: ['title', 'template']
                }
            }
        });
        const fallback = { title: "Evening Reflection", template: "# Evening Reflection\n\n* One thing I'm proud of today is...\n\n* One challenge I faced...\n\n* I can prepare for a better tomorrow by..." };
        return safelyParseJson(response.text, fallback);
    } catch (error) {
        return {
            title: "Evening Reflection",
            template: "# Evening Reflection\n\n* One thing I'm proud of today is...\n\n* One challenge I faced...\n\n* I can prepare for a better tomorrow by..."
        };
    }
};

export const getVulnerabilityShield = async (challenge: string): Promise<VulnerabilityShield> => {
    try {
        const prompt = `A user is facing a challenge: "${challenge}". Create a "Vulnerability Shield" plan for them. Provide an empowering mindset, an array of 2-3 proactive shieldActions to prepare, and a simple escapeRoute if they feel overwhelmed. Return JSON with keys: mindset, shieldActions, escapeRoute.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { mindset: { type: Type.STRING }, shieldActions: { type: Type.ARRAY, items: { type: Type.STRING } }, escapeRoute: { type: Type.STRING } },
                    required: ['mindset', 'shieldActions', 'escapeRoute']
                }
            }
        });
        const fallback = { mindset: "This is an opportunity to prove my strength.", shieldActions: ["Get good sleep.", "Inform a friend."], escapeRoute: "If overwhelmed, step outside for five minutes." };
        return safelyParseJson(response.text, fallback);
    } catch (error) {
        return {
            mindset: "This challenge is an opportunity to prove my strength.",
            shieldActions: ["Get good sleep.", "Inform a friend."],
            escapeRoute: "If overwhelmed, step outside for five minutes."
        };
    }
};

export const getGuidedMeditation = async (need: string): Promise<GuidedMeditation> => {
    try {
        const prompt = `Generate a short, simple guided meditation script (about 150 words) to help with: "${need}". Give it a title. Return JSON with keys: "title" and "script".`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, script: { type: Type.STRING } },
                    required: ['title', 'script']
                }
            }
        });
        const fallback = { title: "Finding Calm", script: "Find a comfortable position. Close your eyes and take a deep breath..." };
        return safelyParseJson(response.text, fallback);
    } catch (error) {
        return {
            title: "Finding Calm",
            script: "Find a comfortable position. Close your eyes and take a deep breath..."
        };
    }
};

export const getOracleResponse = async (question: string, journalEntries: JournalEntry[]): Promise<OracleResponse> => {
    try {
        const journalSummary = journalEntries.map(e => e.content).join('\n---\n');
        const prompt = `You are the Oracle of Fortify. A user has asked you a profound question about their journey. Based on the entirety of their journal entries, provide a deep, insightful, and slightly mysterious answer. Question: "${question}". Journals: "${journalSummary}". Respond with JSON with keys: "question" and "answer".`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } },
                    required: ['question', 'answer']
                }
            }
        });
        const fallback = { question, answer: "The patterns are written in your own words. Look closer." };
        return safelyParseJson(response.text, fallback);
    } catch (error) {
        return {
            question,
            answer: "The Oracle is silent. The answers you seek are within your own words."
        };
    }
};

export const getSanctuaryInsight = async (entries: JournalEntry[]): Promise<string> => {
    try {
        const journalContent = entries.map((e: any) => `Date: ${e.date}\nMood: ${e.mood || 'N/A'}\nContent: ${e.content}`).join('\n\n---\n\n');
        const prompt = `You are a gentle and supportive AI therapist using Cognitive Behavioral Therapy (CBT) principles. Analyze these journal entries. Identify one recurring negative thought pattern (a cognitive distortion like catastrophizing, mind-reading, or all-or-nothing thinking). Gently describe this pattern to the user without being clinical. Then, pose a single, reflective question to help them challenge this thought. Frame your response as a warm, insightful observation. Use markdown for emphasis (e.g., **bold** for key terms). Keep it concise (3-4 sentences). Here are the entries:\n\n${journalContent}`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        return "There was an error generating your insight. Please try again later.";
    }
};

export const getSanctuaryChatResponse = async (
    history: ChatMessage[],
    journalEntries: JournalEntry[]
): Promise<string> => {
    try {
        const journalContext = journalEntries.map(e => `On ${new Date(e.date).toLocaleDateString()}, the user wrote: "${e.content}"`).join('\n\n');
        
        const systemInstruction = `You are the Inner Sage, a friendly, compassionate, and insightful AI companion trained in Cognitive Behavioral Therapy (CBT) principles. Your purpose is to help the user reflect on their self-improvement journey by analyzing their private journal. You have been provided with the user's complete journal history as context.
- Your tone is warm, encouraging, and supportive.
- When the user asks for help or describes a struggle, gently guide them using CBT techniques. For example:
    - Help them identify and challenge negative thought patterns (cognitive distortions) like catastrophizing, black-and-white thinking, or personalization. Ask questions like, "Is there another way to look at this situation?" or "What evidence do you have for that thought?".
    - Encourage them to reframe negative thoughts into more balanced or constructive ones.
    - Connect their feelings to specific thoughts and events described in their journals.
    - Suggest simple, actionable behavioral experiments or coping strategies.
- While your primary source of insight is the user's journal, you can offer general, helpful CBT-based advice.
- Keep your answers concise, thoughtful, and act as a supportive guide.

Here is the user's journal history:
---
${journalContext}
---
`;

        const contents = history.map(h => ({ role: h.role, parts: [{ text: h.content }] }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: { systemInstruction },
        });
        return response.text;
    } catch (error) {
        return "My vision is clouded at this moment. The words on the pages of your past are blurry. Ask again when the path is clearer.";
    }
};

export const getSubscriptionPitch = async (context: {
    streakDays: number;
    journalSummary: string;
}): Promise<string> => {
    try {
        const prompt = `
        You are an empathetic life coach. A user is on a self-improvement journey to break an addiction. Their trial for a support app has ended, and they are seeing the paywall.
        Their current streak is ${context.streakDays} days.
        Their recent journal entries are about: "${context.journalSummary || 'their recent progress'}".

        Write a short (2-3 sentences), powerful, and personal emotional pitch encouraging them to subscribe. Use the user's context. The tone should be inspiring and gently contrast the cost of their old habit with the small investment in their recovery.
        
        Example for inspiration: "You have spent enough on your addiction habits, now it is time to spend a fraction of that and get you back on track."
        
        Do not return JSON, just the raw text of the pitch.
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        return "You have spent enough on your addiction habits, now it is time to spend a fraction of that and get you back on track.";
    }
};

export const verifyRatingScreenshot = async (base64Image: string, mimeType: string): Promise<{ isGenuine: boolean; isAppNameVisible: boolean; isFiveStars: boolean; reason: string }> => {
    try {
        const prompt = "You are an AI assistant tasked with verifying a screenshot for a 5-star rating on the Google Play Store for an app named 'Fortify'. Analyze the provided image and determine three things: 1. Is this a genuine screenshot of a Google Play Store rating page? 2. Is the app name 'Fortify' clearly visible? 3. Is a 5-star rating clearly selected or submitted? Your response must be in JSON format.";

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isGenuine: { type: Type.BOOLEAN, description: 'True if the image appears to be a real Play Store screenshot.' },
                        isAppNameVisible: { type: Type.BOOLEAN, description: "True if the app name 'Fortify' is clearly visible in the screenshot." },
                        isFiveStars: { type: Type.BOOLEAN, description: 'True if a 5-star rating is visibly selected.' },
                        reason: { type: Type.STRING, description: 'A brief explanation for your decision, especially if verification fails.' }
                    },
                    required: ['isGenuine', 'isAppNameVisible', 'isFiveStars', 'reason']
                }
            }
        });
        
        const fallback = { isGenuine: false, isAppNameVisible: false, isFiveStars: false, reason: 'AI analysis failed.' };
        return safelyParseJson(response.text, fallback);
    } catch (error) {
        return {
            isGenuine: false,
            isAppNameVisible: false,
            isFiveStars: false,
            reason: 'An error occurred during AI analysis. Please try again.'
        };
    }
};