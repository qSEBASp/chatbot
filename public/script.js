const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');

// Enviar mensaje al presionar Enter o hacer clic en el botón
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && userInput.value.trim()) {
        sendMessage();
    }
});

sendBtn.addEventListener('click', () => {
    if (userInput.value.trim()) {
        sendMessage();
    }
});

async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Mostrar mensaje del usuario
    addMessage(message, 'user');
    userInput.value = '';
    sendBtn.disabled = true;
    
    // Mostrar indicador de carga
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.innerHTML = '<div class="loading"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(loadingDiv);
    scrollToBottom();
    
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        // Remover indicador de carga
        loadingDiv.remove();
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            addMessage(`Error: ${data.details || data.error}`, 'bot');
        } else {
            addMessage(data.reply, 'bot');
        }
    } catch (error) {
        loadingDiv.remove();
        addMessage(`Error de conexión: ${error.message}`, 'bot');
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const p = document.createElement('p');
    p.textContent = text;
    
    messageDiv.appendChild(p);
    messagesContainer.appendChild(messageDiv);
    
    scrollToBottom();
}

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
