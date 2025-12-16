const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', function() {

    const loginButton = document.getElementById('adminLoginButton');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const messageDisplay = document.getElementById('message');

    if (loginButton) {
        loginButton.addEventListener('click', handleAdminLogin);
    }

    async function handleAdminLogin(event) {
        event.preventDefault(); 

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const role = "admin"; // Hard-code the role as "admin"

        messageDisplay.textContent = ""; 

        if (username === "" || password === "") {
            messageDisplay.textContent = "Error: Please enter both username and password.";
            messageDisplay.style.color = "red";
            return;
        }

        const loginData = {
            username: username,
            password: password,
            role: role // This will always be "admin"
        };

        messageDisplay.textContent = "Attempting login...";
        messageDisplay.style.color = "blue";

        try {
            // We use the same backend login endpoint as before
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            if (response.ok) { 
                const userData = await response.json(); 
                
                // Save admin data to session storage
                sessionStorage.setItem('loggedInUser', JSON.stringify(userData));

                messageDisplay.textContent = "Login successful! Redirecting to admin dashboard...";
                messageDisplay.style.color = "green";

                setTimeout(() => {
                    // Always redirect to the admin dashboard
                    window.location.href = 'admin_dashboard.html';
                }, 1000); 

            } else { 
                const errorText = await response.text();
                messageDisplay.textContent = errorText || "Login failed. Invalid credentials.";
                messageDisplay.style.color = "red";
            }

        } catch (error) { 
            console.error('Network or server connection error during admin login:', error);
            messageDisplay.textContent = "Error: Could not connect to the Java server. Is the backend running?";
            messageDisplay.style.color = "red";
        }
    }
});