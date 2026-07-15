import { GoogleGenAI, Type } from '@google/genai';

// Lazy initialized Gemini client
let _aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!_aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      throw new Error('GEMINI_API_KEY is missing. Please configure it in your Secrets.');
    }
    _aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return _aiClient;
}

export interface ProcessedChunk {
  id: string;
  index: number;
  content: string;
  tokenCountEstimate: number;
}

export interface ProcessedDocument {
  title: string;
  authors: string;
  journal: string;
  year: number;
  rawContent: string;
  cleanedContent: string;
  chunks: ProcessedChunk[];
  summary?: string;
  detailedSummary?: any; // Structured multi-dimensional summary
}

/**
 * Service responsible for document ingestion, text cleaning, chunking, and metadata extraction
 */
export class DocumentProcessor {
  /**
   * Cleans raw text content (normalizes line endings, collapses whitespace)
   */
  static cleanText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Splits a cleaned document into overlapping semantic/textual chunks
   */
  static chunkDocument(text: string, chunkSize = 2000, overlap = 400): ProcessedChunk[] {
    const cleaned = this.cleanText(text);
    const chunks: ProcessedChunk[] = [];
    if (!cleaned) return chunks;

    let startIndex = 0;
    let idx = 0;

    while (startIndex < cleaned.length) {
      let endIndex = startIndex + chunkSize;
      if (endIndex >= cleaned.length) {
        endIndex = cleaned.length;
      } else {
        // Try to break at a paragraph boundary or space
        const lastParagraph = cleaned.substring(startIndex, endIndex).lastIndexOf('\n\n');
        if (lastParagraph > chunkSize * 0.5) {
          endIndex = startIndex + lastParagraph;
        } else {
          const lastSpace = cleaned.substring(startIndex, endIndex).lastIndexOf(' ');
          if (lastSpace > chunkSize * 0.7) {
            endIndex = startIndex + lastSpace;
          }
        }
      }

      const chunkContent = cleaned.substring(startIndex, endIndex).trim();
      if (chunkContent) {
        chunks.push({
          id: `chunk-${Date.now()}-${idx}`,
          index: idx,
          content: chunkContent,
          tokenCountEstimate: Math.ceil(chunkContent.length / 4)
        });
      }

      idx++;
      if (endIndex === cleaned.length) {
        break;
      }
      startIndex = endIndex - overlap;
      if (startIndex < 0) startIndex = 0;
      // Prevent infinite loop if we are not advancing
      if (startIndex >= endIndex) {
        startIndex = endIndex;
      }
    }

    return chunks;
  }

  /**
   * Complete ingest pipeline: cleans, chunks, validates, and prepares structured document
   */
  static process(
    title: string,
    authors: string,
    journal: string,
    year: number,
    rawContent: string
  ): ProcessedDocument {
    const cleanedContent = this.cleanText(rawContent);
    const chunks = this.chunkDocument(cleanedContent);

    return {
      title: title || 'Untitled Research',
      authors: authors || 'Anonymous Researcher',
      journal: journal || 'Academic Proceedings',
      year: year || new Date().getFullYear(),
      rawContent,
      cleanedContent,
      chunks
    };
  }
}

/**
 * Reusable AI Service that manages structured prompting, grounding, and interaction with Gemini 3.5 Flash
 */
export class AIService {
  /**
   * RAG helper to find most relevant chunks for a user query based on keyword density/simple lexical TF-IDF proxy
   */
  static retrieveRelevantChunks(chunks: ProcessedChunk[], query: string, topK = 3): ProcessedChunk[] {
    if (!chunks || chunks.length === 0) return [];
    if (!query) return chunks.slice(0, topK);

    const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    if (queryWords.length === 0) return chunks.slice(0, topK);

    const scored = chunks.map(chunk => {
      const contentLower = chunk.content.toLowerCase();
      let score = 0;
      queryWords.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'g');
        const count = (contentLower.match(regex) || []).length;
        score += count * 5; // Direct match
        if (contentLower.includes(word)) {
          score += 1; // Substring match
        }
      });
      return { chunk, score };
    });

    // Sort by score desc, fallback to sequence index for structural coherence
    scored.sort((a, b) => b.score - a.score || a.chunk.index - b.chunk.index);
    return scored.slice(0, topK).map(s => s.chunk);
  }

  /**
   * Generates structured output using a single centralized model call pattern
   */
  static async execute(
    doc: ProcessedDocument,
    featureType: 'summarize' | 'chat' | 'flashcards' | 'quiz' | 'mindmap' | 'insight',
    userPrompt = ''
  ): Promise<any> {
    const ai = getGeminiClient();

    switch (featureType) {
      case 'summarize': {
        const prompt = `You are a high-fidelity academic analyzer. Synthesize a comprehensive multi-dimensional summary of this research paper based on the text contents.
        You must return a JSON object with the following fields:
        {
          "executiveSummary": "A concise executive highlight/summary of the paper (100-150 words).",
          "detailedSummary": "A deep academic dive summarizing key concepts (200-300 words).",
          "simpleSummary": "An plain English/ELI5 version explaining it to high-school students (100 words).",
          "bulletSummary": ["Bullet point 1", "Bullet point 2", "Bullet point 3", "Bullet point 4", "Bullet point 5"],
          "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
          "methodology": "The scholarly methodology, algorithms, datasets, architecture, or design (100-150 words).",
          "results": "Quantitative or qualitative evaluation results and details (100-150 words).",
          "limitations": ["Limitation 1", "Limitation 2"],
          "futureWork": ["Future path 1", "Future path 2"]
        }

        Paper details:
        Title: ${doc.title}
        Authors: ${doc.authors}
        Journal: ${doc.journal} (${doc.year})

        Document Content:
        ${doc.cleanedContent.substring(0, 20000)}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                executiveSummary: { type: Type.STRING },
                detailedSummary: { type: Type.STRING },
                simpleSummary: { type: Type.STRING },
                bulletSummary: { type: Type.ARRAY, items: { type: Type.STRING } },
                keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
                methodology: { type: Type.STRING },
                results: { type: Type.STRING },
                limitations: { type: Type.ARRAY, items: { type: Type.STRING } },
                futureWork: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: [
                'executiveSummary', 'detailedSummary', 'simpleSummary', 'bulletSummary',
                'keyFindings', 'methodology', 'results', 'limitations', 'futureWork'
              ]
            }
          }
        });

        return JSON.parse(response.text || '{}');
      }

      case 'chat': {
        // Grounded chat answering using only relevant chunks
        const relevantChunks = this.retrieveRelevantChunks(doc.chunks, userPrompt, 4);
        const groundingContext = relevantChunks.map(c => `[Chunk #${c.index + 1}]\n${c.content}`).join('\n\n');

        const systemPrompt = `You are ResearchMind AI, a scholarly assistant. You answer questions strictly grounded in the provided research paper content.
        You MUST cite specific page numbers or chunk indications in your answer using bracket indicators like [Page X] or [Chunk Y].
        If the answer cannot be found in the provided paper, state: "I've checked the paper content, but this specific detail is not mentioned." Do not hallucinate or make up facts.`;

        const promptContext = `
        [DOCUMENTS AND GROUNDING CONTEXT]
        ${groundingContext}

        User's Question: ${userPrompt}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: promptContext,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.1
          }
        });

        // Map retrieved chunks as sources
        const sources = relevantChunks.map(c => ({
          title: `${doc.title} - Chunk #${c.index + 1}`,
          snippet: c.content.substring(0, 150) + '...',
          page: c.index + 1
        }));

        return {
          text: response.text || "I was unable to formulate a grounded response.",
          sources
        };
      }

      case 'flashcards': {
        const prompt = `Analyze this research paper content and generate 5 highly informative study flashcards.
        Each flashcard must contain a question (front) and an educational, concise answer (back) strictly grounded in the paper details.
        Return ONLY a JSON array matching this structure:
        [
          {
            "question": "Question text here?",
            "answer": "Clear precise answer text based strictly on the paper details."
          }
        ]

        Paper Content:
        ${doc.cleanedContent.substring(0, 15000)}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                },
                required: ['question', 'answer']
              }
            }
          }
        });

        return JSON.parse(response.text || '[]');
      }

      case 'quiz': {
        const prompt = `Analyze this research paper and generate an interactive quiz with exactly 4 technical questions.
        Provide questions spanning Multiple Choice (MCQ), True/False, and Short Answer.
        For each question, provide 4 options (leave empty or omit for Short Answer), the correct answerIndex (or correct text for Short Answer), and a clear educational explanation of why it is correct.
        Return ONLY a JSON object matching this schema:
        {
          "title": "${doc.title.replace(/"/g, '\\"')} Study Assessment",
          "questions": [
            {
              "question": "The question text?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "answerIndex": 2,
              "explanation": "Clear explanation of the correct choice."
            }
          ]
        }

        Paper Content:
        ${doc.cleanedContent.substring(0, 15000)}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } },
                      answerIndex: { type: Type.INTEGER },
                      explanation: { type: Type.STRING }
                    },
                    required: ['question', 'options', 'answerIndex', 'explanation']
                  }
                }
              },
              required: ['title', 'questions']
            }
          }
        });

        return JSON.parse(response.text || '{}');
      }

      case 'mindmap': {
        const prompt = `Analyze this academic paper text and generate a structured conceptual mind map representing key ideas, methods, techniques, results, and limitations.
        Format the response as a JSON object containing nodes and link edges.
        Return ONLY a JSON object matching this structure:
        {
          "nodes": [
            {"id": "node-1", "label": "Label of Node", "group": "title", "description": "Short explanation of node"},
            {"id": "node-2", "label": "Another node", "group": "concept", "description": "Short explanation"},
            {"id": "node-3", "label": "Method name", "group": "method", "description": "Short explanation"},
            {"id": "node-4", "label": "Result name", "group": "finding", "description": "Short explanation"}
          ],
          "links": [
            {"source": "node-1", "target": "node-2"},
            {"source": "node-1", "target": "node-3"},
            {"source": "node-3", "target": "node-4"}
          ]
        }
        Groups allowed: "title", "concept", "method", "finding".
        Keep nodes counts between 6 and 10 for clean visualization.

        Paper Content:
        ${doc.cleanedContent.substring(0, 12000)}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      group: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ['id', 'label', 'group', 'description']
                  }
                },
                links: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      source: { type: Type.STRING },
                      target: { type: Type.STRING }
                    },
                    required: ['source', 'target']
                  }
                }
              },
              required: ['nodes', 'links']
            }
          }
        });

        return JSON.parse(response.text || '{}');
      }

      case 'insight': {
        const prompt = `Generate highly professional research insights, critical evaluations, and advanced study critiques for this document.
        Return a structured JSON object with the following:
        {
          "critiques": ["Critique 1", "Critique 2", "Critique 3"],
          "methodologyVal": "Expert analysis of methodology feasibility and rigor (100 words).",
          "extensionPaths": ["Extension idea 1", "Extension idea 2"],
          "realWorldImpact": "Practical industrial or real-world application cases (100 words)."
        }

        Paper Content:
        ${doc.cleanedContent.substring(0, 15000)}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                critiques: { type: Type.ARRAY, items: { type: Type.STRING } },
                methodologyVal: { type: Type.STRING },
                extensionPaths: { type: Type.ARRAY, items: { type: Type.STRING } },
                realWorldImpact: { type: Type.STRING }
              },
              required: ['critiques', 'methodologyVal', 'extensionPaths', 'realWorldImpact']
            }
          }
        });

        return JSON.parse(response.text || '{}');
      }

      default:
        throw new Error(`Unsupported feature type: ${featureType}`);
    }
  }
}
