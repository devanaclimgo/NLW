import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '../env.ts'

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY)

// Prefer fast, low-latency model for chat/QA
const GENERATION_MODEL = 'gemini-2.5-flash'
const EMBEDDING_MODEL = 'text-embedding-004'

export async function transcribeAudio(audioAsBase64: string, mimeType: string) {
  const model = genAI.getGenerativeModel({ model: GENERATION_MODEL })

  const response = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'Transcreva o áudio para português do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada e divida o texto em parágrafos quando for apropriado.',
          },
          {
            inlineData: {
              mimeType,
              data: audioAsBase64,
            },
          },
        ],
      },
    ],
  })

  const text = response.response.text()

  if (!text) {
    throw new Error('Não foi possível converter o áudio')
  }

  return text
}

export async function generateEmbeddings(text: string) {
  const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL })
  const result = await embeddingModel.embedContent({
    content: { role: 'user', parts: [{ text }] },
  })

  const values = result.embedding?.values

  if (!values || values.length === 0) {
    throw new Error('Não foi possível gerar os embeddings.')
  }

  return values
}

export async function generateAnswer(
  question: string,
  transcriptions: string[],
) {
  const context = transcriptions.join('\n\n')

  const prompt = `
    Com base no texto fornecido abaixo como contexto, responda a pergunta de forma clara e precisa em português do Brasil.
  
    CONTEXTO:
    ${context}

    PERGUNTA:
    ${question}

    INSTRUÇÕES:
    - Use apenas informações contidas no contexto enviado;
    - Se a resposta não for encontrada no contexto, apenas responda que não possui informações suficientes para responder;
    - Seja objetivo;
    - Mantenha um tom educativo e profissional;
    - Cite trechos relevantes do contexto se apropriado;
    - Se for citar o contexto, utilize o temo "conteúdo da aula";
  `.trim()

  const model = genAI.getGenerativeModel({ model: GENERATION_MODEL })
  const response = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  })

  const text = response.response.text()

  if (!text) {
    throw new Error('Falha ao gerar resposta pelo Gemini')
  }

  return text
}
