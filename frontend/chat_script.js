const CHAT_API_URL = 'http://localhost:8080';
let stompClient = null;
let currentBookingId = null;
let currentUserId = null;
let currentUserName = null;

function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    if (!chatWindow) return;
    
    if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
        chatWindow.style.display = 'block';
        scrollToBottom();
    } else {
        chatWindow.style.display = 'none';
    
    }
}

function openChatForBooking(bookingId, userId, userName) {
    currentBookingId = bookingId;
    currentUserId = userId;
    currentUserName = userName;
    
    const chatWindow = document.getElementById('chatWindow');
    const headerTitle = document.getElementById('chatHeaderTitle');
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const messagesDiv = document.getElementById('chatMessages');
    
    if(!chatWindow) {
        console.error("Chat window element not found");
        return;
    }
    
    chatWindow.style.display = 'block';
    if(headerTitle) headerTitle.textContent = `Chat - Booking #${bookingId}`;
    if(chatInput) {
        chatInput.disabled = false;
        chatInput.value = '';
        chatInput.focus();
    }
    if(chatSendBtn) chatSendBtn.disabled = false;
    
    if(messagesDiv) messagesDiv.innerHTML = '<div class="text-center text-muted small mt-5">Loading messages...</div>';

    if (stompClient !== null) {
        stompClient.disconnect();
    }

    loadChatHistory(bookingId);
    connectToWebSocket();
}

function connectToWebSocket() {
    const socket = new SockJS(CHAT_API_URL + '/ws'); 
    
    stompClient = Stomp.over(socket);
    stompClient.debug = null; 
    
    stompClient.connect({}, function (frame) {
        console.log('Connected to Chat Server: ' + frame);
        
        
        stompClient.subscribe('/topic/booking/' + currentBookingId, function (messageOutput) {
            console.log("Message Received"); 
            showMessage(JSON.parse(messageOutput.body));
        });
    }, function(error) {
        console.error('WebSocket connection error:', error);
        const msgsDiv = document.getElementById('chatMessages');
        if(msgsDiv) msgsDiv.innerHTML += '<div class="text-center text-danger small mt-2">Connection lost. Reconnecting...</div>';
    });
}

function disconnectChat() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    console.log("Disconnected");
    currentBookingId = null;
}

function sendChatMessage() {
    const messageInput = document.getElementById('chatInput');
    if(!messageInput) return;
    
    const content = messageInput.value.trim();
    
    if (content && stompClient && currentBookingId) {
        const chatMessage = {
            senderId: currentUserId,
            senderName: currentUserName,
            content: content,
            bookingId: currentBookingId
        };
        
        try {
            stompClient.send("/app/chat/" + currentBookingId + "/sendMessage", {}, JSON.stringify(chatMessage));
            messageInput.value = '';
        } catch (e) {
            console.error("Send failed:", e);
            alert("Failed to send message. Please try again.");
        }
    } else {
        console.warn("Cannot send: Client not connected or empty message.");
    }
}

function loadChatHistory(bookingId) {
    fetch(`${CHAT_API_URL}/api/chat/${bookingId}/history`)
        .then(response => response.json())
        .then(messages => {
            const chatMessagesDiv = document.getElementById('chatMessages');
            if(!chatMessagesDiv) return;
            
            chatMessagesDiv.innerHTML = ''; 
            if(messages.length === 0) {
                chatMessagesDiv.innerHTML = '<div class="text-center text-muted small mt-5">Start the conversation!</div>';
            } else {
                messages.forEach(msg => showMessage(msg));
            }
            scrollToBottom();
        })
        .catch(error => console.error('Error loading chat history:', error));
}

function showMessage(message) {
    const chatMessagesDiv = document.getElementById('chatMessages');
    if(!chatMessagesDiv) return;
    
    const loadingText = chatMessagesDiv.querySelector('.text-center');
    if (loadingText) loadingText.remove();
    
    const messageElement = document.createElement('div');
    const isCurrentUser = (message.senderId === currentUserId);
    
    messageElement.className = isCurrentUser ? 'd-flex justify-content-end mb-2' : 'd-flex justify-content-start mb-2';
    
    const bubbleColor = isCurrentUser ? 'bg-primary text-white' : 'bg-light text-dark border';
    const align = isCurrentUser ? 'text-end' : 'text-start';
    
    messageElement.innerHTML = `
        <div class="p-2 px-3 rounded-3 ${bubbleColor}" style="max-width: 75%; word-wrap: break-word; text-align: left;">
            <div style="font-size: 0.7rem; opacity: 0.8; margin-bottom: 2px; text-align: ${align};">${message.senderName}</div>
            <div>${message.content}</div>
        </div>
    `;
    
    chatMessagesDiv.appendChild(messageElement);
    scrollToBottom();
}

function scrollToBottom() {
    const chatMessagesDiv = document.getElementById('chatMessages');
    if(chatMessagesDiv) {
        setTimeout(() => {
            chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
        }, 50);
    }
}

const inputEl = document.getElementById('chatInput');
if(inputEl){
    inputEl.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendChatMessage();
    });
}