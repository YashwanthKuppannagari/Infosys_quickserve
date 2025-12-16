const API_BASE_URL = 'http://localhost:8080';
let servicePriceMap = new Map();
let reviewModal; 
let map;
let marker;
let selectedLat = null;
let selectedLng = null;
let loggedInUser = null; 

function switchView(sectionId, linkElement) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active-section'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active-section');
    const links = document.querySelectorAll('.list-group-item-action');
    links.forEach(link => link.classList.remove('active'));
    if (linkElement) linkElement.classList.add('active');
    if (sectionId === 'homeSection' && map) setTimeout(() => { map.invalidateSize(); }, 200);
}

document.addEventListener('DOMContentLoaded', function() {
    const modalEl = document.getElementById('reviewModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
        reviewModal = new bootstrap.Modal(modalEl);
    }
    
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.getElementById('sidebar-wrapper').classList.toggle('toggled');
        });
    }
    
    const userDataString = sessionStorage.getItem('loggedInUser');
    if (userDataString) {
        try {
            loggedInUser = JSON.parse(userDataString); 
            if (loggedInUser) {
                const welcomeMsg = document.getElementById('welcomeMessage');
                if(welcomeMsg) welcomeMsg.textContent = `Welcome, ${loggedInUser.fullName}!`;
                document.getElementById('sidebarUserRole').textContent = `Customer #${loggedInUser.id}`;
                document.getElementById('sidebarUserName').textContent = loggedInUser.fullName;
                document.getElementById('profileNameDisplay').textContent = loggedInUser.fullName;
                document.getElementById('profileUsernameDisplay').textContent = '@' + loggedInUser.username;
                document.getElementById('profileEmailDisplay').textContent = loggedInUser.email || 'No email provided';
            }
        } catch (e) { console.error("Error parsing user data:", e); }
    }
    
    loadProfileData();
    loadServices();
    initMap();
    checkSearchCriteria();
    
    initUserViewMoreButtons();
    
    const searchButton = document.getElementById('searchProvidersButton');
    if (searchButton) searchButton.addEventListener('click', handleProviderSearch); 
    
    if (loggedInUser && loggedInUser.id) {
        loadMyBookings(loggedInUser.id);
    } else {
        ['noPendingMsg', 'noActiveMsg', 'noCompletedMsg', 'noDeclinedMsg'].forEach(id => {
            document.getElementById(id)?.style.setProperty('display', 'block');
        });
    }
    
    const fileInput = document.getElementById('profileImageInput');
    if(fileInput) {
        fileInput.addEventListener('change', async function() {
            const file = this.files[0];
            if (!file || !loggedInUser) return;
            const formData = new FormData();
            formData.append('file', file);
            try {
                const response = await fetch(`${API_BASE_URL}/api/users/${loggedInUser.id}/image`, {
                    method: 'POST', body: formData 
                });
                if (response.ok) {
                    alert("Profile picture updated!");
                    loadProfileData(); 
                } else { alert("Failed to upload image."); }
            } catch (error) { console.error(error); alert("Error uploading image."); }
        });
    }
    
}); 

function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof L === 'undefined') return;
    const defaultLat = 17.3850; 
    const defaultLng = 78.4867; 
    map = L.map('map').setView([defaultLat, defaultLng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    marker = L.marker([defaultLat, defaultLng], {draggable: true}).addTo(map);
    marker.on('dragend', function(event) {
        const position = marker.getLatLng();
        selectedLat = position.lat;
        selectedLng = position.lng;
    });
    map.on('click', function(e) {
        marker.setLatLng(e.latlng);
        selectedLat = e.latlng.lat;
        selectedLng = e.latlng.lng;
    });
}

function loadProfileData() {
    if (loggedInUser) {
        document.getElementById('profileFullName').value = loggedInUser.fullName || '';
        document.getElementById('profilePhone').value = loggedInUser.phoneNumber || '';
        document.getElementById('profileEmail').value = loggedInUser.email || '';
        const imgEl = document.getElementById('profileImageDisplay');
        const iconEl = document.getElementById('profileIconFallback');
        if(imgEl && iconEl) {
            imgEl.src = `${API_BASE_URL}/api/users/${loggedInUser.id}/image?t=${new Date().getTime()}`;
            imgEl.onload = function() { imgEl.style.display = 'inline-block'; iconEl.style.display = 'none'; };
            imgEl.onerror = function() { imgEl.style.display = 'none'; iconEl.style.display = 'inline-flex'; };
        }
    }
}
function toggleEditProfile() {
    document.getElementById('profileFullName').disabled = false;
    document.getElementById('profilePhone').disabled = false;
    document.getElementById('profileEmail').disabled = false;
    document.getElementById('profileActionBtns').style.display = 'block';
    document.getElementById('editProfileBtn').style.display = 'none';
    document.getElementById('profileImageLabel').style.display = 'inline-block';
}
function cancelEditProfile() {
    loadProfileData();
    document.getElementById('profileFullName').disabled = true;
    document.getElementById('profilePhone').disabled = true;
    document.getElementById('profileEmail').disabled = true;
    document.getElementById('profileActionBtns').style.display = 'none';
    document.getElementById('editProfileBtn').style.display = 'block';
    document.getElementById('profileImageLabel').style.display = 'none';
}
async function saveProfile() {
    if (!loggedInUser) return;
    const updatedData = {
        fullName: document.getElementById('profileFullName').value,
        phoneNumber: document.getElementById('profilePhone').value,
        email: document.getElementById('profileEmail').value
    };
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${loggedInUser.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData)
        });
        if (response.ok) {
            const newUser = await response.json();
            const mergedUser = { ...loggedInUser, ...newUser };
            sessionStorage.setItem('loggedInUser', JSON.stringify(mergedUser));
            loggedInUser = mergedUser;
            alert("Profile updated successfully!");
            cancelEditProfile(); 
            document.getElementById('welcomeMessage').textContent = `Welcome, ${mergedUser.fullName}!`;
            document.getElementById('sidebarUserName').textContent = mergedUser.fullName;
            document.getElementById('profileNameDisplay').textContent = mergedUser.fullName;
        } else { alert("Failed to update profile."); }
    } catch (error) { alert("Could not connect to server."); }
}
function updateProfileStats(bookings) {
    const total = bookings.length;
    const active = bookings.filter(b => b.bookingStatus.toLowerCase() === 'active' || b.bookingStatus.toLowerCase() === 'confirmed').length;
    const completed = bookings.filter(b => b.bookingStatus.toLowerCase() === 'completed').length;
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statCompleted').textContent = completed;
}

async function loadServices() {
    const serviceSelect = document.getElementById('serviceSelect');
    if (!serviceSelect) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/services`);
        if (!response.ok) throw new Error("Could not fetch services.");
        const services = await response.json();
        if (services.length > 0) {
            serviceSelect.innerHTML = '<option value="">-- Select Service --</option>';
            services.forEach(service => {
                servicePriceMap.set(service.name, service.price); 
                const option = document.createElement('option');
                option.value = service.name;
                option.textContent = service.name; 
                serviceSelect.appendChild(option);
            });
        }
    } catch (error) { serviceSelect.innerHTML = '<option value="">Error loading services</option>'; }
}

function checkSearchCriteria() {
    const serviceSelect = document.getElementById('serviceSelect');
    const locationSelect = document.getElementById('locationSelect');
    const dateTimeContainer = document.getElementById('dateTimeContainer');
    const addressContainer = document.getElementById('addressContainer');
    const priceDisplay = document.getElementById('servicePriceDisplay'); 
    if (serviceSelect && locationSelect && dateTimeContainer && addressContainer && priceDisplay) {
        const service = serviceSelect.value;
        if (service) {
            const price = servicePriceMap.get(service);
            priceDisplay.textContent = price ? `Price: ₹${price.toFixed(2)}` : '';
        } else { priceDisplay.textContent = ''; }
        if (service !== "" && locationSelect.value !== "") {
            addressContainer.style.display = 'block';
            dateTimeContainer.style.display = 'block';
            if (map) setTimeout(() => { map.invalidateSize(); }, 200);
        } else {
            addressContainer.style.display = 'none';
            dateTimeContainer.style.display = 'none';
        }
    }
}

async function handleProviderSearch(event) {
    event.preventDefault(); 
    const serviceSelect = document.getElementById('serviceSelect');
    const locationSelect = document.getElementById('locationSelect');
    const serviceDateInput = document.getElementById('serviceDate');
    const serviceTimeInput = document.getElementById('serviceTime');
    const searchResultsDiv = document.getElementById('searchResults');
    const searchMessage = document.getElementById('searchMessage');
    const providerList = document.getElementById('providerList');
    const service = serviceSelect.value;
    const location = locationSelect.value;
    const date = serviceDateInput.value;
    const time = serviceTimeInput.value;
    
    if (!service || !location || !date || !time) {
        searchMessage.textContent = "Error: Please select all fields.";
        searchMessage.className = "text-danger";
        searchResultsDiv.style.display = 'block'; 
        return; 
    }
    searchMessage.textContent = `Searching...`;
    searchMessage.className = "text-primary";
    searchResultsDiv.style.display = 'block'; 
    providerList.innerHTML = '';
    
    try {
        const queryParams = new URLSearchParams({ service: service, location: location, date: date, time: time });
        const response = await fetch(`${API_BASE_URL}/api/providers/search?${queryParams}`);
        if (response.ok) {
            const providers = await response.json(); 
            displayProviders(providers, providerList, searchMessage);
        } else {
            const errorText = await response.text();
            searchMessage.textContent = `Error: ${errorText}`;
            searchMessage.className = "text-danger";
        }
    } catch (error) {
        searchMessage.textContent = "Error: Could not connect to server.";
        searchMessage.className = "text-danger";
    }
} 

function displayProviders(providers, providerList, searchMessage) {
    providerList.innerHTML = ''; 
    if (!providers || providers.length === 0) {
        searchMessage.textContent = "No providers found.";
        searchMessage.className = "text-warning";
        return;
    }
    searchMessage.textContent = `Found ${providers.length} provider(s):`;
    searchMessage.className = "text-success";
    providers.forEach(provider => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
            <span>${provider.fullName} <br><small class="text-muted">Services: ${provider.servicesProvided}</small></span>
            <button onclick="handleBookNow(${provider.id})" class="btn btn-success">Book Now</button>
        `;
        providerList.appendChild(listItem);
    });
}

async function handleBookNow(providerId) {
    if (!loggedInUser) { alert("Error: Not logged in."); return; }
    const serviceName = document.getElementById('serviceSelect').value;
    const serviceLocation = document.getElementById('locationSelect').value;
    const bookingDate = document.getElementById('serviceDate').value;
    const bookingTime = document.getElementById('serviceTime').value;
    const customerAddress = document.getElementById('customerAddress').value.trim();
    const bookingPrice = servicePriceMap.get(serviceName);

    if (!customerAddress || !bookingPrice) { alert("Please fill details."); return; }

    let paymentMethod = "ONLINE";
    let onlineAmount = bookingPrice;
    let walletAmount = 0.0;
    const walletBalance = parseFloat(window.currentUserWalletBalance || 0);

    if (walletBalance > 0) {
        if (walletBalance >= bookingPrice) {
            if (confirm(`Pay full amount (₹${bookingPrice.toFixed(2)}) using Wallet? (Balance: ₹${walletBalance.toFixed(2)})`)) {
                paymentMethod = "WALLET";
                onlineAmount = 0;
                walletAmount = bookingPrice;
            }
        } else {
            const remaining = bookingPrice - walletBalance;
            if (confirm(`Use wallet balance (₹${walletBalance.toFixed(2)})? Pay remaining ₹${remaining.toFixed(2)} online.`)) {
                paymentMethod = "SPLIT";
                onlineAmount = remaining;
                walletAmount = walletBalance;
            }
        }
    }

    if (paymentMethod === "WALLET") {
        saveBooking(providerId, loggedInUser, serviceName, serviceLocation, bookingDate, bookingTime, customerAddress, bookingPrice, "WALLET-TXN-" + Date.now(), "WALLET", walletAmount);
    } else {
        startRazorpayFlow(providerId, loggedInUser, serviceName, serviceLocation, bookingDate, bookingTime, customerAddress, bookingPrice, onlineAmount, walletAmount, paymentMethod);
    }
}

async function startRazorpayFlow(providerId, user, sName, sLoc, date, time, addr, totalPrice, onlineAmount, walletUsed, method) {
    try {
        const orderResponse = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: onlineAmount }) 
        });
        if (!orderResponse.ok) { alert("Payment init failed"); return; }
        const orderId = await orderResponse.text();
        const options = {
            "key": "rzp_test_RjdFtngjruBIMO", 
            "amount": onlineAmount * 100, "currency": "INR", "name": "QuickServe", "description": `Booking for ${sName}`, "order_id": orderId, 
            "handler": function (response) {
                saveBooking(providerId, user, sName, sLoc, date, time, addr, totalPrice, response.razorpay_payment_id, method, walletUsed);
            },
            "prefill": { "name": user.fullName, "email": user.email, "contact": user.phoneNumber }, "theme": { "color": "#007bb6" }
        };
        new Razorpay(options).open();
    } catch (e) { alert("Payment Error"); }
}

async function saveBooking(providerId, user, sName, sLoc, date, time, addr, price, payId, method, walletUsed) {
    const req = {
        customerId: user.id, providerId: providerId, serviceName: sName, serviceLocation: sLoc,
        bookingDate: date, bookingTime: time, customerAddress: addr, bookingPrice: price,
        paymentId: payId, latitude: selectedLat, longitude: selectedLng,
        paymentMethod: method, walletAmountUsed: walletUsed || 0.0
    };
    try {
        const res = await fetch(`${API_BASE_URL}/api/bookings`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req)
        });
        if (res.ok) {
            const booking = await res.json();
            alert(`Booking Confirmed! Paid via ${method}.`);
            addBookingToDOM(booking, true); 
            if (typeof loadWalletBalance === 'function') loadWalletBalance();
            checkAndRefreshViewMore();
        } else { alert(`Failed: ${await res.text()}`); }
    } catch (e) { alert("Error saving booking."); }
}

async function loadMyBookings(customerId) {
    ['pendingBookingsList', 'activeBookingsList', 'completedBookingsList', 'declinedBookingsList'].forEach(id => {
        const list = document.getElementById(id);
        if(list) { list.innerHTML = ''; list.classList.remove('expanded'); }
    });
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/customer/${customerId}`);
        if (!response.ok) throw new Error(`Server error`);
        const bookings = await response.json(); 
        
        if (bookings.length > 0) {
            bookings.sort((a, b) => b.id - a.id);
            
            bookings.forEach(booking => { 
                addBookingToDOM(booking, false);
            });
            updateProfileStats(bookings); 
        }
        
        checkAndRefreshViewMore();

    } catch (error) { console.error("Error loading my bookings:", error); }
}

function addBookingToDOM(booking, prepend = false) {
    let targetListId, noMsgId;
    const status = booking.bookingStatus ? booking.bookingStatus.toLowerCase() : '';

    if (status === 'pending') { targetListId = 'pendingBookingsList'; noMsgId = 'noPendingMsg'; }
    else if (status === 'active' || status === 'confirmed') { targetListId = 'activeBookingsList'; noMsgId = 'noActiveMsg'; }
    else if (status === 'completed') { targetListId = 'completedBookingsList'; noMsgId = 'noCompletedMsg'; }
    else if (status === 'declined' || status === 'cancelled') { targetListId = 'declinedBookingsList'; noMsgId = 'noDeclinedMsg'; }
    else return;
    const noMsg = document.getElementById(noMsgId);
    if (noMsg) noMsg.style.display = 'none';
    
    const list = document.getElementById(targetListId);
    if (!list) return; 
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item'; 
    const price = booking.bookingPrice ? booking.bookingPrice.toFixed(2) : '0.00';
    
    let htmlContent = `
        <div class="d-flex justify-content-between">
            <strong>${booking.serviceName} <span class="text-muted">#${booking.id}</span></strong>
            <span class="badge bg-light text-dark">₹${price}</span>
        </div>
        <div class="small text-muted mt-2">
            <strong>Provider Name:</strong> ${booking.providerName} <br>
            <strong>Date:</strong> ${booking.bookingDate} at ${booking.bookingTime}
        </div>
    `;
    
    if (status === 'pending') htmlContent += `<div class="mt-2 text-end"><button onclick="handleCancel(${booking.id})" class="btn btn-outline-danger btn-sm">Cancel Request</button></div>`;
    else if (status === 'active') htmlContent += `<div class="mt-2 pt-2 border-top"><strong class="text-success">Contact: ${booking.providerPhoneNumber}</strong><br><strong class="text-primary">OTP: ${booking.otp}</strong><div class="mt-2"><button onclick="openChatForBooking(${booking.id}, ${loggedInUser.id}, '${loggedInUser.fullName}')" class="btn btn-primary btn-sm w-100"><i class="fa-solid fa-comments"></i> Chat</button></div></div>`;
    else if (status === 'completed') htmlContent += `<div class="mt-2 text-end"><button onclick="openReviewModal(${booking.id})" class="btn btn-outline-primary btn-sm">Rate</button></div>`;
    else if (status === 'declined') htmlContent += `<div class="mt-1 text-danger small fw-bold"><i class="fa-solid fa-circle-xmark"></i> Declined</div>`;
    else if (status === 'cancelled') htmlContent += `<div class="mt-1 text-secondary small fw-bold"><i class="fa-solid fa-ban"></i> Cancelled</div>`;
    
    listItem.innerHTML = htmlContent;

    if (prepend) {
        list.prepend(listItem);
    } else {
        list.appendChild(listItem);
    }
    
    const items = list.querySelectorAll('li');
    if (items.length > 5) {
        
        if (!list.classList.contains('expanded')) {
            items.forEach((item, index) => {
                item.style.display = index < 5 ? 'block' : 'none';
            });
        }
    }
}

async function handleCancel(bookingId) {
    if (!confirm("Cancel booking?")) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/cancel`, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
        if (response.ok) {
            alert("Booking cancelled.");
            loadMyBookings(loggedInUser.id);
            if (typeof loadWalletBalance === 'function') loadWalletBalance(); 
        } else { alert(`Failed: ${await response.text()}`); }
    } catch (error) { alert("Connection error."); }
}
function initUserViewMoreButtons() {
    const categories = ['Pending', 'Active', 'Completed', 'Declined'];
    categories.forEach(cat => {
        const btn = document.getElementById(`viewMore${cat}`);
        const list = document.getElementById(`${cat.toLowerCase()}BookingsList`);
        
        if (btn && list) {
            btn.addEventListener('click', () => {
                list.classList.add('expanded');
                const items = list.querySelectorAll('li');
                items.forEach(item => item.style.display = 'block');
                
                btn.style.display = 'none';
            });
        }
    });
}

function checkAndRefreshViewMore() {
    const categories = ['Pending', 'Active', 'Completed', 'Declined'];
    categories.forEach(cat => {
        const list = document.getElementById(`${cat.toLowerCase()}BookingsList`);
        const btn = document.getElementById(`viewMore${cat}`);
        
        if (list && btn) {
            const items = list.querySelectorAll('li');
            if (items.length > 5) {
                
                if (!list.classList.contains('expanded')) {
                    btn.style.display = 'block';
                    
                    items.forEach((item, index) => {
                        item.style.display = index < 5 ? 'block' : 'none';
                    });
                } else {
                    btn.style.display = 'none';
                }
            } else {
                btn.style.display = 'none';
            }
        }
    });
}

function openReviewModal(bookingId) {
    if (reviewModal) {
        document.getElementById('reviewBookingId').value = bookingId;
        document.getElementById('reviewComment').value = '';
        document.getElementById('reviewRating').value = '5';
        reviewModal.show();
    }
}

async function submitReview() {
    const bookingId = document.getElementById('reviewBookingId').value;
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value.trim();
    if (!comment) { alert("Please enter a comment."); return; }
    const reviewData = { rating: parseInt(rating), comment: comment };
    try {
        const response = await fetch(`${API_BASE_URL}/api/reviews/${bookingId}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reviewData)
        });
        if (response.ok) {
            alert("Review submitted successfully!");
            if (reviewModal) reviewModal.hide();
        } else { alert(`Error: ${await response.text()}`); }
    } catch (error) { alert("Could not connect to server."); }
}
(function applyDateRestrictions() {
    const dateInput = document.getElementById('serviceDate');
    const timeInput = document.getElementById('serviceTime');

    if (!dateInput || !timeInput) {
        console.error("Date/Time inputs not found! Check HTML IDs.");
        return;
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); 
    const day = String(now.getDate()).padStart(2, '0');
    

    const todayStr = `${year}-${month}-${day}`;


    dateInput.setAttribute('min', todayStr);
    
    function updateTimeLimits() {
        const selectedDate = dateInput.value;
        if (selectedDate === todayStr) {
            const currentNow = new Date();
            const hours = String(currentNow.getHours()).padStart(2, '0');
            const minutes = String(currentNow.getMinutes()).padStart(2, '0');
            timeInput.min = `${hours}:${minutes}`;
        } else {
        
            timeInput.min = '00:00';
        }
    }

    dateInput.addEventListener('change', updateTimeLimits);
    dateInput.addEventListener('click', updateTimeLimits);
    
    updateTimeLimits();
    
    console.log("Date restrictions applied. Min Date:", todayStr);
})();