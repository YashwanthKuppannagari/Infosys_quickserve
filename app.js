const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', function() {

    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton'); 
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const messageDisplay = document.getElementById('message'); 

    
    if (loginButton) {
        loginButton.addEventListener('click', handleLogin);
    }
    if (registerButton) {
        registerButton.addEventListener('click', function() {
            
            window.location.href = 'register.html';
        });
    }

    async function handleLogin(event) {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const role = roleSelect.value;

        messageDisplay.textContent = ""; 

        if (username === "" || password === "") {
            messageDisplay.textContent = "Error: Please enter both username and password.";
            messageDisplay.style.color = "red";
            return;
        }

        
        const loginData = {
            username: username,
            password: password,
            role: role
        };

        messageDisplay.textContent = "Attempting login...";
        messageDisplay.style.color = "blue";

        try {
            
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            
            if (response.ok) { 
                const userData = await response.json();

            
                
                sessionStorage.setItem('loggedInUser', JSON.stringify(userData));
            

                messageDisplay.textContent = `Login successful! Redirecting to ${role} dashboard...`;
                messageDisplay.style.color = "green";

                
                setTimeout(() => {
                    
                    
                    window.location.href = role.toLowerCase() + '_dashboard.html';
                }, 1000); 

            } else { 
                
                const errorText = await response.text();
                
                messageDisplay.textContent = errorText || "Login failed. Please check credentials or register first.";
                messageDisplay.style.color = "red";
            }

        } catch (error) { 
            console.error('Network or server connection error during login:', error);
            messageDisplay.textContent = "Error: Could not connect to the Java server. Is the backend running?";
            messageDisplay.style.color = "red";
        }
    }

});