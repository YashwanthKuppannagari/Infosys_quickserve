const API_BASE_URL = 'http://localhost:8080';
let loggedInProvider = null; 
let providerMap;
let providerMarker;
let mapModal;


function switchView(sectionId, linkElement) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active-section'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active-section');
    const links = document.querySelectorAll('.list-group-item-action');
    links.forEach(link => link.classList.remove('active'));
    if (linkElement) linkElement.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {

    const modalEl = document.getElementById('mapModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
         mapModal = new bootstrap.Modal(modalEl);
         modalEl.addEventListener('shown.bs.modal', function () {
             if (providerMap) providerMap.invalidateSize();
         });
    }

    const welcomeMessageElement = document.getElementById('welcomeMessage');
    const locationSelect = document.getElementById('providerLocationSelect'); 
    const menuToggle = document.getElementById('menu-toggle');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar-wrapper');
            if(sidebar) sidebar.classList.toggle('toggled');
        });
    }


    const userDataString = sessionStorage.getItem('loggedInUser');
    if (userDataString) {
        try {
            loggedInProvider = JSON.parse(userDataString); 
            if (loggedInProvider) {
                if (welcomeMessageElement) welcomeMessageElement.textContent = `Welcome, ${loggedInProvider.fullName}!`;
                
                const sidebarUserName = document.getElementById('sidebarUserName');
                if (sidebarUserName) sidebarUserName.textContent = loggedInProvider.fullName;
                
                const sidebarUserRole = document.getElementById('sidebarUserRole');
                if (sidebarUserRole) sidebarUserRole.textContent = `Provider #${loggedInProvider.id}`;
                
                
                const pName = document.getElementById('profileNameDisplay'); if(pName) pName.textContent = loggedInProvider.fullName;
                const pServices = document.getElementById('profileServicesDisplay'); if(pServices) pServices.textContent = loggedInProvider.servicesProvided || 'N/A';
                const pEmail = document.getElementById('profileEmailDisplay'); if(pEmail) pEmail.value = loggedInProvider.email || '';
                const pPhone = document.getElementById('profilePhoneDisplay'); if(pPhone) pPhone.value = loggedInProvider.phoneNumber || '';
                const pStart = document.getElementById('profileStartTime'); if(pStart) pStart.value = loggedInProvider.startTime || '';
                const pEnd = document.getElementById('profileEndTime'); if(pEnd) pEnd.value = loggedInProvider.endTime || '';

                if (loggedInProvider.operatingLocation && locationSelect) {
                    const cleanLoc = loggedInProvider.operatingLocation.trim().toLowerCase();
                    const opt = Array.from(locationSelect.options).find(o => o.value.trim().toLowerCase() === cleanLoc);
                    if (opt) locationSelect.value = opt.value; 
                }
            }
        } catch (e) { console.error(e); }
    }
    
    if (loggedInProvider && loggedInProvider.id) {
        loadProviderBookings(loggedInProvider.id);
        loadRatingStats(loggedInProvider.id);
    
    } else {
        const loadingMsg = document.getElementById('loadingMessage');
        if (loadingMsg) loadingMsg.textContent = 'Could not find provider ID. Please log in again.';
    }
    
    initViewMoreButtons();
}); 
function openMapModal(lat, lng) {
    if (!lat || !lng) {
        alert("No location coordinates provided for this booking.");
        return;
    }
    if (!providerMap) {
        if (typeof L === 'undefined') {
            alert("Map library not loaded.");
            return;
        }
        providerMap = L.map('providerMap').setView([lat, lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(providerMap);
        providerMarker = L.marker([lat, lng]).addTo(providerMap);
    } else {
        providerMap.setView([lat, lng], 15);
        providerMarker.setLatLng([lat, lng]);
    }
    
    const googleLink = document.getElementById('googleMapsLink');
    if (googleLink) {
        googleLink.href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    
    if (mapModal) mapModal.show();
}
async function loadRatingStats(providerId) {
    const statsElement = document.getElementById('ratingStats');
    if (!statsElement) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/reviews/provider/${providerId}/summary`);
        if (response.ok) {
            const stats = await response.json();
            const average = stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"; 
            statsElement.innerHTML = `<span class="text-warning fw-bold" style="font-size: 3rem;">${average}</span><span class="text-muted">/5.0</span><br><small class="text-muted">Based on ${stats.totalReviews || 0} review(s)</small>`;
        } else { statsElement.textContent = "Could not load ratings."; }
    } catch (error) { statsElement.textContent = "Error loading ratings."; }
}

async function loadProviderBookings(providerId) {
    const loadingMsg = document.getElementById('loadingMessage');
    const pendingList = document.getElementById('pendingBookingsList');
    const activeList = document.getElementById('activeBookingsList');
    const completedList = document.getElementById('completedBookingsList');
    const noPendingMsg = document.getElementById('noPendingMsg');
    const noActiveMsg = document.getElementById('noActiveMsg');
    const noCompletedMsg = document.getElementById('noCompletedMsg');

    if(pendingList) { pendingList.innerHTML = ''; pendingList.classList.remove('expanded'); }
    if(activeList) { activeList.innerHTML = ''; activeList.classList.remove('expanded'); }
    if(completedList) { completedList.innerHTML = ''; completedList.classList.remove('expanded'); }
    
    if (noPendingMsg) noPendingMsg.style.display = 'block';
    if (noActiveMsg) noActiveMsg.style.display = 'block';
    if (noCompletedMsg) noCompletedMsg.style.display = 'block';
    
    document.getElementById('viewMorePending')?.style.setProperty('display', 'none');
    document.getElementById('viewMoreActive')?.style.setProperty('display', 'none');
    document.getElementById('viewMoreCompleted')?.style.setProperty('display', 'none');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/provider/${providerId}`);
        if (!response.ok) throw new Error(`Server error`);
        
        const allBookings = await response.json(); 
        if (loadingMsg) loadingMsg.style.display = 'none'; 
        
        if (allBookings.length === 0) return;

        allBookings.forEach(booking => {
            const listItem = createBookingListItem(booking);
            if (!listItem) return; 
            
            const status = booking.bookingStatus ? booking.bookingStatus.toLowerCase() : '';
            
            if (status === 'pending' && pendingList) {
                pendingList.appendChild(listItem);
                if (noPendingMsg) noPendingMsg.style.display = 'none';
            } else if (status === 'active' && activeList) {
                activeList.appendChild(listItem);
                if (noActiveMsg) noActiveMsg.style.display = 'none';
            } else if (status === 'completed' && completedList) {
                completedList.appendChild(listItem);
                if (noCompletedMsg) noCompletedMsg.style.display = 'none';
            }
        });
        
        if(pendingList) updateViewMoreButton(pendingList, document.getElementById('viewMorePending'));
        if(activeList) updateViewMoreButton(activeList, document.getElementById('viewMoreActive'));
        if(completedList) updateViewMoreButton(completedList, document.getElementById('viewMoreCompleted'));
        
    } catch (error) {
        if (loadingMsg) { loadingMsg.textContent = 'Error loading bookings.'; loadingMsg.style.color = 'red'; }
    }
}

function createBookingListItem(booking) {
    const listItem = document.createElement('li');
    listItem.id = `booking-item-${booking.id}`; 
    listItem.className = 'list-group-item'; 
    
    const price = booking.bookingPrice ? booking.bookingPrice.toFixed(2) : '0.00';
    const customerName = booking.customerName || 'Unknown Customer';
    const customerId = booking.customerId || 'N/A';
    
    let locationBtn = '';
    if (booking.latitude && booking.longitude) {
        locationBtn = `<button onclick="openMapModal(${booking.latitude}, ${booking.longitude})" class="btn btn-outline-info btn-sm mt-1" style="width:100%"><i class="fa-solid fa-map-location-dot"></i> View Location</button>`;
    }
    
    listItem.innerHTML = `
        <div class="d-flex justify-content-between">
            <strong>${booking.serviceName} Request</strong>
            <span class="badge bg-secondary">₹${price}</span>
        </div>
        <div class="small text-muted mt-2">
            <strong>ID:</strong> #${booking.id}<br>
            <strong>Cust:</strong> ${customerName} (#${customerId})<br>
            <strong>Date:</strong> ${booking.bookingDate} ${booking.bookingTime}<br>
            <strong>Addr:</strong> ${booking.customerAddress || 'N/A'}
            ${locationBtn}
        </div>
    `;

    const status = booking.bookingStatus ? booking.bookingStatus.toLowerCase() : '';
    
    if (status === 'pending') {
        const d = document.createElement('div'); d.className = 'mt-2 d-flex gap-2';
        const b1 = document.createElement('button'); 
        b1.textContent='Accept'; b1.className='btn btn-success btn-sm flex-grow-1'; 
        b1.onclick=(e)=>handleAccept(booking.id,e);
        
        const b2 = document.createElement('button'); 
        b2.textContent='Decline'; b2.className='btn btn-danger btn-sm flex-grow-1'; 
        b2.onclick=(e)=>handleDecline(booking.id,e);
        
        d.appendChild(b1); d.appendChild(b2); listItem.appendChild(d);
    } 
    else if (status === 'active') {
        const chatBtn = document.createElement('button');
        chatBtn.className = 'btn btn-info btn-sm mt-2 w-100 text-white';
        chatBtn.innerHTML = '<i class="fa-solid fa-comments"></i> Chat with Customer';
        
        if (typeof openChatForBooking === 'function' && loggedInProvider) {
             chatBtn.onclick = function() { 
                openChatForBooking(booking.id, loggedInProvider.id, loggedInProvider.fullName); 
            };
        } else {
             chatBtn.disabled = true;
             chatBtn.title = "Chat unavailable";
        }
        listItem.appendChild(chatBtn);

        const completeButton = document.createElement('button');
        completeButton.textContent = 'Mark as Completed';
        completeButton.className = 'btn btn-primary btn-sm mt-2 w-100';
        completeButton.onclick = function(event) { handleComplete(booking.id, event); };
        listItem.appendChild(completeButton);
    }
    
    return listItem;
}
async function handleAccept(bookingId, event) {
    const button = event.target; button.disabled = true; button.textContent = 'Accepting...';
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/accept`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            if (loggedInProvider) loadProviderBookings(loggedInProvider.id);
        } else {
            alert(`Failed: ${await response.text()}`); button.disabled = false; button.textContent = 'Accept';
        }
    } catch (error) { alert("Connection error."); button.disabled = false; button.textContent = 'Accept'; }
}

async function handleDecline(bookingId, event) {
    if (!confirm("Decline this request?")) return;
    const button = event.target; button.disabled = true; button.textContent = 'Declining...';
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/decline`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            if (loggedInProvider) loadProviderBookings(loggedInProvider.id);
        } else {
            alert(`Failed: ${await response.text()}`); button.disabled = false; button.textContent = 'Decline';
        }
    } catch (error) { alert("Connection error."); button.disabled = false; button.textContent = 'Decline'; }
}

async function handleComplete(bookingId, event) {
    const otp = prompt("Job Completed! Please enter the customer's 4-digit OTP to verify");
    if (!otp) return;
    
    const button = event.target; button.disabled = true; button.textContent = 'Completing...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/complete`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ otp: otp.trim() }) 
        });
        
        if (response.ok) {
            if (loggedInProvider) {
                loadProviderBookings(loggedInProvider.id);
                loadRatingStats(loggedInProvider.id);
                
                if (typeof loadWalletBalance === 'function') {
                    loadWalletBalance();
                }
            
            }
        } else {
            alert(await response.text()); button.disabled = false; button.textContent = 'Mark as Completed'; 
        }
    } catch (error) { alert("Connection error."); button.disabled = false; button.textContent = 'Mark as Completed'; }
}
async function saveProfile() {
    if (!loggedInProvider) return;
    
    const updatedData = {
        email: document.getElementById('profileEmailDisplay').value,
        phoneNumber: document.getElementById('profilePhoneDisplay').value,
        startTime: document.getElementById('profileStartTime').value,
        endTime: document.getElementById('profileEndTime').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/${loggedInProvider.id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData)
        });
        
        if (response.ok) {
            const newUser = await response.json();
            const merged = { ...loggedInProvider, ...newUser };
            sessionStorage.setItem('loggedInUser', JSON.stringify(merged));
            loggedInProvider = merged; 
            alert("Updated!");
            cancelEditProfile();
        } else {
            alert("Failed to update profile.");
        }
    } catch (error) { alert("Error."); }
}

function toggleEditProfile() { 
    document.getElementById('profileEmailDisplay').disabled=false; 
    document.getElementById('profilePhoneDisplay').disabled=false; 
    document.getElementById('profileStartTime').disabled=false; 
    document.getElementById('profileEndTime').disabled=false; 
    document.getElementById('profileActionBtns').style.display='block'; 
    document.getElementById('editProfileBtn').style.display='none'; 
}

function cancelEditProfile() { 
    loadProviderData(); 
    document.getElementById('profileEmailDisplay').disabled=true; 
    document.getElementById('profilePhoneDisplay').disabled=true; 
    document.getElementById('profileStartTime').disabled=true; 
    document.getElementById('profileEndTime').disabled=true; 
    document.getElementById('profileActionBtns').style.display='none'; 
    document.getElementById('editProfileBtn').style.display='block'; 
}

function initViewMoreButtons() {
    document.getElementById('viewMorePending')?.addEventListener('click', () => {
        document.getElementById('pendingBookingsList')?.classList.add('expanded');
        document.getElementById('viewMorePending').style.display = 'none';
    });
    document.getElementById('viewMoreActive')?.addEventListener('click', () => {
        document.getElementById('activeBookingsList')?.classList.add('expanded');
        document.getElementById('viewMoreActive').style.display = 'none';
    });
    document.getElementById('viewMoreCompleted')?.addEventListener('click', () => {
        document.getElementById('completedBookingsList')?.classList.add('expanded');
        document.getElementById('viewMoreCompleted').style.display = 'none';
    });
}

function updateViewMoreButton(listElement, buttonElement) {
    if (!listElement || !buttonElement) return;
    if (listElement.querySelectorAll('li').length > 3) {
        buttonElement.style.display = 'block';
    } else {
        buttonElement.style.display = 'none';
    }
}