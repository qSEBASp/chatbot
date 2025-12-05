import express from 'express';
import bodyParser from 'body-parser';
import { HfInference } from '@huggingface/inference';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Hugging Face
if (!process.env.HUGGINGFACE_API_KEY) {
  console.error('ERROR: No se encontró HUGGINGFACE_API_KEY en las variables de entorno');
  process.exit(1);
}

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const MODEL = 'google/flan-t5-base';  // Modelo base de FLAN-T5

// Respuestas predefinidas para comandos rápidos
const quickResponses = {
  'hola': '¡Hola! Soy tu asistente con IA. ¿En qué puedo ayudarte hoy?',
  'ayuda': 'Puedes preguntarme cualquier cosa. Estoy aquí para ayudarte con información general.',
  'adiós': '¡Hasta luego! Fue un placer ayudarte.'
};

app.post('/chat', async (req, res) => {
  try {
    const userMessage = (req.body.message || '').trim();
    
    // Verificar si es un comando rápido
    const lowerMessage = userMessage.toLowerCase();
    if (quickResponses[lowerMessage]) {
      return res.json({ reply: quickResponses[lowerMessage] });
    }

    // Si no es un comando rápido, usar el modelo de IA
    console.log(`Enviando solicitud al modelo ${MODEL}...`);
    const response = await hf.textGeneration({
      model: MODEL,
      inputs: `Pregunta: ${userMessage} \nRespuesta:`,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        do_sample: true
      }
    }).catch(error => {
      console.error('Error en la llamada a la API:', error);
      throw new Error('No se pudo conectar con el servicio de IA. Por favor, verifica tu conexión y credenciales.');
    });

    if (!response || !response.generated_text) {
      throw new Error('La respuesta del modelo no es válida');
    }

    let reply = response.generated_text
      .replace(/<[^>]*>?/gm, '')
      .trim()
      .replace(/^[\s\n]+|[\s\n]+$/g, '');

    res.json({ reply });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud',
      details: error.message 
    });
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Chatbot con IA listo. Usa POST /chat para enviar mensajes.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Chatbot listo en http://localhost:${PORT}`);
  console.log('Usa el endpoint POST /chat para enviar mensajes');
});