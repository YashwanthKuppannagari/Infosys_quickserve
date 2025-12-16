const WALLET_API_URL = 'http://localhost:8080';

window.currentUserWalletBalance = 0.0;

async function loadWalletBalance() {
    const userDataString = sessionStorage.getItem('loggedInUser');
    if (!userDataString) return;
    const user = JSON.parse(userDataString);

    try {
        const response = await fetch(`${WALLET_API_URL}/api/users/${user.id}/wallet?t=${Date.now()}`);
        if (response.ok) {
            const data = await response.json();
            
            let balance = 0;
            if (typeof data === 'object' && data.balance !== undefined) {
                balance = data.balance;
            } else if (typeof data === 'number') {
                balance = data;
            }
            
            window.currentUserWalletBalance = parseFloat(balance);

            const displays = document.querySelectorAll('.wallet-balance-display');
            displays.forEach(el => {
                el.textContent = `₹${window.currentUserWalletBalance.toFixed(2)}`;
                el.style.color = window.currentUserWalletBalance > 0 ? '#198754' : '#dc3545'; 
            });
        }
    } catch (error) {
        console.error("Error loading wallet:", error);
    }
}

async function handleWithdraw() {
    const userDataString = sessionStorage.getItem('loggedInUser');
    if (!userDataString) return;
    const user = JSON.parse(userDataString);

    const balance = window.currentUserWalletBalance;

    if (balance <= 0) {
        alert("No funds to withdraw.");
        return;
    }

    if (!confirm(`Withdraw ₹${balance.toFixed(2)} to your bank account?`)) {
        return;
    }

    try {
        const response = await fetch(`${WALLET_API_URL}/api/users/${user.id}/withdraw`, {
            method: 'POST'
        });

        if (response.ok) {
            const result = await response.json();
            const msg = result.message || "Withdrawal successful!";
            alert(msg);
            loadWalletBalance(); 
        } else {
            alert("Withdrawal failed.");
        }
    } catch (error) {
        alert("Error connecting to server.");
    }
}
document.addEventListener('DOMContentLoaded', loadWalletBalance);