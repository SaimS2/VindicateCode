

import { GoogleGenAI, Type } from "@google/genai";
import { MCQ, ChatMessage, PresentationFilters, Differential, VindicateCategory, Difficulty, Source, Demographic } from '../types';
import { MCC_OBJECTIVES_DATA } from "../constants";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const differentialSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: 'The name of the diagnosis.' },
        category: { type: Type.STRING, enum: Object.values(VindicateCategory), description: 'The VINDICATE category.' },
        pathophysiology: { type: Type.STRING, description: 'A concise explanation of the pathophysiology.' },
        signsAndSymptoms: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of strings, where each string is a key sign or symptom.' },
        patientHistory: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of strings, where each string is a relevant patient history finding (e.g., risk factor).' },
        physicalExamSigns: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of strings, where each string is a key physical examination finding.' },
        labs: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of strings, where each string is an initial laboratory test to consider.' },
        imaging: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of strings, where each string is a relevant imaging study.' },
        treatmentOptions: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of strings, where each string is a primary treatment option.' },
        validation: { type: Type.STRING, enum: ['Medical Student', 'Resident', 'Physician'], description: 'Assumed validation level.' },
        isCritical: { type: Type.BOOLEAN, description: 'Indicates if this is a "can\'t-miss" diagnosis requiring immediate attention.' }
    },
    required: ['name', 'category', 'pathophysiology', 'signsAndSymptoms', 'patientHistory', 'physicalExamSigns', 'labs', 'imaging', 'treatmentOptions']
};

const mcqSchema = {
    type: Type.OBJECT,
    properties: {
        scenario: { type: Type.STRING, description: 'A detailed clinical scenario.' },
        question: { type: Type.STRING, description: 'The question based on the scenario.' },
        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of 5 distinct answer options.', minItems: 5, maxItems: 5 },
        correctAnswer: { type: Type.STRING, description: 'The correct option text.' },
        rationale: { type: Type.STRING, description: 'Explanation for why the answer is correct.' },
    },
    required: ['scenario', 'question', 'options', 'correctAnswer', 'rationale'],
};


export const generateDifferentials = async (presentationName: string, filters: PresentationFilters, demographic: Demographic): Promise<Differential[]> => {
    try {
        const cleanedPresentationName = presentationName.split('(')[0].trim();
        const contextText = MCC_OBJECTIVES_DATA[presentationName] || MCC_OBJECTIVES_DATA[cleanedPresentationName] || '';
        
        const contextInstruction = contextText 
            ? `Use the following information from the Medical Council of Canada's learning objectives as a primary source to guide your response:\n\n---\n${contextText}\n---\n` 
            : '';
        
        const ageText = demographic === 'Neonate' ? `${filters.age} days old` : `${filters.age} years old`;

        const prompt = `${contextInstruction}For a patient presenting with '${presentationName}', who is a 'biological ${filters.sex.toLowerCase()}', age '${ageText}', with a symptom chronicity of '${filters.chronicity}', generate a list of differential diagnoses within the VINDICATE framework. Return this as a JSON array of objects. For fields like signs/symptoms, labs, imaging, etc., provide an array of strings. Also, identify any critical, "can't-miss" diagnoses that require immediate intervention by setting an "isCritical" flag to true. Base your answer primarily on the provided learning objectives if they are available.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: differentialSchema
                },
            },
        });
        
        const jsonText = response.text.trim();
        const differentials = JSON.parse(jsonText) as Differential[];
        // Add a default validation level if missing
        return differentials.map(d => ({ ...d, validation: d.validation || 'Physician' }));

    } catch (error) {
        console.error("Error generating differentials:", error);
        throw new Error("Failed to generate differentials from AI.");
    }
};

export const generateMCQScenario = async (presentation: string, filters: PresentationFilters, difficulty: Difficulty, demographic: Demographic): Promise<MCQ | null> => {
  try {
    const cleanedPresentationName = presentation.split('(')[0].trim();
    const contextText = MCC_OBJECTIVES_DATA[presentation] || MCC_OBJECTIVES_DATA[cleanedPresentationName] || '';
        
    const contextInstruction = contextText 
        ? `Base the scenario on the following learning objectives from the Medical Council of Canada:\n\n---\n${contextText}\n---\n` 
        : '';
    
    const ageText = demographic === 'Neonate' ? `${filters.age} days` : `${filters.age} years`;

    const prompt = `${contextInstruction}Generate a ${difficulty}-level clinical case scenario for a ${ageText} old biological ${filters.sex.toLowerCase()} patient presenting with ${presentation} for a duration of ${filters.chronicity}. The scenario should be a multiple-choice question (MCQ) with 5 options. Provide a detailed scenario, a clear question, five distinct options, identify the correct answer, and give a concise rationale.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: mcqSchema,
      },
    });

    const jsonText = response.text.trim();
    const mcqData = JSON.parse(jsonText) as MCQ;
    
    if(mcqData.options && mcqData.options.length === 5 && mcqData.correctAnswer) {
        return mcqData;
    }
    return null;

  } catch (error) {
    console.error("Error generating MCQ scenario:", error);
    return null;
  }
};

export const generatePracticeTest = async (numberOfQuestions: number): Promise<MCQ[]> => {
    try {
        const prompt = `Generate a full-length practice test section for the MCCQE Part I medical licensing exam. It should consist of ${numberOfQuestions} unique multiple-choice questions (MCQs) covering a diverse range of medical topics appropriate for a graduating medical student in Canada. The topics should span major disciplines like Internal Medicine, Surgery, Pediatrics, Obstetrics & Gynecology, Psychiatry, and Public Health. Include some pre-test/pilot items as is typical. For each question, provide a detailed clinical scenario, a clear question, five distinct options, identify the correct answer, and give a concise rationale.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using a more powerful model for a complex task
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: mcqSchema
                },
            },
        });

        const jsonText = response.text.trim();
        const mcqs = JSON.parse(jsonText) as MCQ[];
        
        if (mcqs && mcqs.length > 0) {
            return mcqs;
        }
        throw new Error("Generated data is not a valid MCQ array.");

    } catch (error) {
        console.error("Error generating practice test:", error);
        throw new Error("Failed to generate practice test from AI.");
    }
};


export const askAIAssistant = async (history: ChatMessage[], newMessage: string): Promise<{ text: string; sources: Source[] }> => {
  try {
    const contents = [
        ...history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: newMessage }] }
    ];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: `You are a helpful medical education assistant for a tool called VINDICATE. Your goal is to guide students and clinicians through diagnostic reasoning in a conversational, step-by-step manner.

When a user provides an initial clinical scenario, follow this process:
1.  Start by asking **one or two** important, high-yield clarifying questions. For example, if they describe pain, you might first ask about its location and quality.
2.  **Wait for the user's answer** before asking more questions.
3.  Based on their response, ask another focused follow-up question. Continue this process, guiding them through a logical history-taking sequence (e.g., history of presenting illness, associated symptoms, past medical history, etc.).
4.  Keep your questions concise and focused on a single topic at a time. Avoid listing many questions at once.
5.  Use bold text for emphasis on medical terms (e.g., **Myocardial Infarction**).
6.  If the user asks a question that may require up-to-date information, use the search tool to find relevant information and provide source links.
7.  Do not provide medical advice for real patients. This is a simulation for educational purposes.`,
            tools: [{googleSearch: {}}]
        },
    });

    const sources: Source[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map(chunk => chunk.web)
        .filter((web): web is { uri: string; title: string } => !!web && !!web.uri && !!web.title)
        .map(web => ({ uri: web.uri, title: web.title })) ?? [];

    return {
        text: response.text,
        sources: sources,
    };

  } catch (error) {
    console.error("Error with AI Assistant:", error);
    return { text: "Sorry, I encountered an error. Please try again.", sources: [] };
  }
};