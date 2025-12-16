const API_BASE_URL = 'http://localhost:8080';
let isEmailVerified = false;

document.addEventListener('DOMContentLoaded', function() {

    loadServices();
    const submitButton = document.getElementById('submitRegistrationButton');
    const fullNameInput = document.getElementById('fullName');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const phoneInput = document.getElementById('phoneNumber');
    const emailInput = document.getElementById('email');
    const messageDisplay = document.getElementById('message');
    
    const providerFieldsDiv = document.getElementById('providerSpecificFields');
    const operatingLocationSelect = document.getElementById('operatingLocation');
    const ageInput = document.getElementById('age');
    const yearsOfExperienceInput = document.getElementById('yearsOfExperience');
    const highestQualificationInput = document.getElementById('highestQualification');
    const collegeNameInput = document.getElementById('collegeName');
    const percentageInput = document.getElementById('percentage');
    const providerAddressInput = document.getElementById('providerAddress');

    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');

    if (submitButton) submitButton.addEventListener('click', handleNewRegistration);
    if (sendOtpBtn) sendOtpBtn.addEventListener('click', handleSendOtp);
    if (verifyOtpBtn) verifyOtpBtn.addEventListener('click', handleVerifyOtp);
    
    toggleProviderFields(); 

    async function handleSendOtp() {
        const email = emailInput.value.trim();
        
        if (!email || !email.includes('@')) {
            alert("Please enter a valid email address.");
            return;
        }
        
        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = "Sending...";
        messageDisplay.textContent = "";

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            });
            
            const text = await response.text();
            if (response.ok) {
                document.getElementById('otpSection').style.display = 'block';
                messageDisplay.textContent = "OTP sent to your email.";
                messageDisplay.className = "text-center mt-3 text-success";
                sendOtpBtn.textContent = "Resend OTP";
            } else {
                messageDisplay.textContent = text; 
                messageDisplay.className = "text-center mt-3 text-danger";
                sendOtpBtn.textContent = "Verify Email";
            }
        } catch (error) {
            alert("Error connecting to server.");
        } finally {
            sendOtpBtn.disabled = false;
        }
    }

    async function handleVerifyOtp() {
        const email = emailInput.value.trim();
        const otp = document.getElementById('otpInput').value.trim();
        const otpMsg = document.getElementById('otpMessage');

        if (otp.length !== 4) {
            otpMsg.textContent = "Please enter the 4-digit code.";
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, otp: otp })
            });

            if (response.ok) {
                otpMsg.textContent = "Verified!";
                otpMsg.className = "text-success";
                isEmailVerified = true;
                
                
                submitButton.disabled = false;
                submitButton.classList.remove('btn-secondary');
                submitBtn = submitButton.classList.add('btn-success');
                
                
                emailInput.disabled = true;
                sendOtpBtn.style.display = 'none';
                document.getElementById('otpSection').style.display = 'none';
                
            } else {
                otpMsg.textContent = "Incorrect OTP";
                otpMsg.className = "text-danger";
            }
        } catch (error) {
            console.error(error);
        }
    }


    async function handleNewRegistration(event) {
        event.preventDefault(); 

        if (!isEmailVerified) {
            alert("Please verify your email first.");
            return;
        }

        const fullName = fullNameInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const role = roleSelect.value;
        const phoneNumber = phoneInput.value.trim();
        const email = emailInput.value.trim();

        messageDisplay.textContent = ""; 

        if (!fullName || !username || !password || !phoneNumber) {
            messageDisplay.textContent = "Error: Please fill out all required fields.";
            messageDisplay.className = "text-center mt-3 text-danger";
            return;
        }

        const registrationData = {
            fullName: fullName, username: username, password: password, role: role,
            phoneNumber: phoneNumber, email: email, servicesProvided: null, 
            operatingLocation: null, age: null, yearsOfExperience: null,
            highestQualification: null, collegeName: null, percentage: null,
            providerAddress: null
        };

        if (role === 'Provider') {
            const operatingLocation = operatingLocationSelect.value;
            const serviceCheckboxes = document.querySelectorAll('#serviceCheckboxes input[name="service"]');
            const selectedServices = Array.from(serviceCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);
                
            const age = ageInput.value ? parseInt(ageInput.value) : null;
            const yearsOfExperience = yearsOfExperienceInput.value ? parseInt(yearsOfExperienceInput.value) : null;
            const highestQualification = highestQualificationInput.value.trim();
            const collegeName = collegeNameInput.value.trim();
            const percentage = percentageInput.value ? parseFloat(percentageInput.value) : null;
            const providerAddress = providerAddressInput.value.trim();
            
            if (selectedServices.length === 0 || !operatingLocation) {
                 messageDisplay.textContent = "Error: As a Provider, please select at least one service and an operating location.";
                 messageDisplay.className = "text-center mt-3 text-danger";
                 return; 
            }
            
            registrationData.servicesProvided = selectedServices.join(',');
            registrationData.operatingLocation = operatingLocation;
            registrationData.age = age;
            registrationData.yearsOfExperience = yearsOfExperience;
            registrationData.highestQualification = highestQualification;
            registrationData.collegeName = collegeName;
            registrationData.percentage = percentage;
            registrationData.providerAddress = providerAddress;
        }

        messageDisplay.textContent = "Submitting registration...";
        messageDisplay.className = "text-center mt-3 text-primary";

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData) 
            });

            if (response.ok) { 
                if (role === 'Provider') {
                    messageDisplay.textContent = "Registration submitted! Please wait for admin approval.";
                } else {
                    messageDisplay.textContent = "Registration successful! Redirecting to login...";
                }
                messageDisplay.className = "text-center mt-3 text-success";
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000); 
            } else {
                const errorText = await response.text();
                messageDisplay.textContent = errorText || "Registration failed.";
                messageDisplay.className = "text-center mt-3 text-danger";
            }

        } catch (error) {
            messageDisplay.textContent = "Error: Could not connect to server.";
            messageDisplay.className = "text-center mt-3 text-danger";
        }
    } 

    function toggleProviderFields() {
        const selectedRole = roleSelect.value; 
        if (selectedRole === 'Provider') {
            providerFieldsDiv.style.display = 'block'; 
        } else {
            providerFieldsDiv.style.display = 'none'; 
        }
    }
}); 

function toggleProviderFields() {
    const roleSelect = document.getElementById('role');
    const providerFieldsDiv = document.getElementById('providerSpecificFields');
    
    if (roleSelect && providerFieldsDiv) { 
         const selectedRole = roleSelect.value; 
        if (selectedRole === 'Provider') {
            providerFieldsDiv.style.display = 'block'; 
        } else {
            providerFieldsDiv.style.display = 'none'; 
        
            const serviceCheckboxes = document.querySelectorAll('#serviceCheckboxes input[name="service"]');
            serviceCheckboxes.forEach(checkbox => checkbox.checked = false);
            document.getElementById('operatingLocation').value = '';
            document.getElementById('age').value = '';
            document.getElementById('yearsOfExperience').value = '';
            document.getElementById('highestQualification').value = '';
            document.getElementById('collegeName').value = '';
            document.getElementById('percentage').value = '';
            document.getElementById('providerAddress').value = '';
        }
    }
}

async function loadServices() {
    const checkboxContainer = document.getElementById('serviceCheckboxes');
    const loadingMsg = document.getElementById('serviceLoadingMsg');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/services`);
        if (!response.ok) throw new Error("Could not fetch services.");
        
        const services = await response.json();
        
        if (services.length > 0) {
            loadingMsg.style.display = 'none';
            checkboxContainer.innerHTML = ''; 
            
            services.forEach(service => {
                const div = document.createElement('div');
                div.className = 'form-check';
                
                const checkbox = document.createElement('input');
                checkbox.className = 'form-check-input';
                checkbox.type = 'checkbox';
                checkbox.name = 'service';
                checkbox.value = service.name;
                checkbox.id = `service-${service.name.replace(/\s+/g, '-')}`;
                
                const label = document.createElement('label');
                label.className = 'form-check-label';
                label.htmlFor = checkbox.id;
                label.textContent = ` ${service.name} (₹${service.price.toFixed(2)})`;
                
                div.appendChild(checkbox);
                div.appendChild(label);
                checkboxContainer.appendChild(div);
            });
        } else {
            loadingMsg.textContent = 'No services available.';
        }
    } catch (error) {
        loadingMsg.textContent = 'Error loading services.';
        loadingMsg.style.color = 'red';
    }
}