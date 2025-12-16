const API_BASE_URL = 'http://localhost:8080';
let isSubmitting = false;
let allBookingsData = []; // Store bookings locally for search

// --- Sidebar Switcher ---
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
    // Mobile Toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.getElementById('sidebar-wrapper').classList.toggle('toggled');
        });
    }

    // Load Data
    loadDashboardStats();
    loadPendingProviders();
    loadExistingServices();
    loadAllUsers(); 
    loadAllBookings(); // NEW
    
    const newServiceForm = document.getElementById('newServiceForm');
    if (newServiceForm) {
        newServiceForm.addEventListener('submit', handleCreateService);
    }
    
    // NEW: Search Button Listener
    const searchBtn = document.getElementById('bookingSearchBtn');
    const searchInput = document.getElementById('bookingSearchInput');
    if(searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => filterBookings(searchInput.value));
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') filterBookings(searchInput.value);
            if (searchInput.value === '') filterBookings(''); // Reset on empty
        });
    }
}); 

// --- 1. STATISTICS ---
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/stats`);
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('totalUsersCount').textContent = stats.totalUsers;
            document.getElementById('activeProvidersCount').textContent = stats.activeProviders;
            document.getElementById('recentBookingsCount').textContent = stats.recentBookings;
        }
    } catch (error) { console.error("Error loading stats:", error); }
}

// --- 2. USER DIRECTORY ---
async function loadAllUsers() {
    const tableBody = document.getElementById('allUsersTableBody');
    if(!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading users...</td></tr>';
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`);
        if (!response.ok) throw new Error("Failed");
        const users = await response.json();
        tableBody.innerHTML = ''; 
        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No users found.</td></tr>';
            return;
        }
        users.forEach(user => {
            const row = document.createElement('tr');
            let roleBadge = user.role === 'Admin' ? '<span class="badge bg-danger">Admin</span>' :
                            user.role === 'Provider' ? '<span class="badge bg-info text-dark">Provider</span>' :
                            '<span class="badge bg-secondary">User</span>';
            let status = user.accountStatus || 'N/A';
            let statusBadge = status === 'APPROVED' ? '<span class="badge bg-success">Active</span>' :
                              status === 'PENDING' ? '<span class="badge bg-warning text-dark">Pending</span>' :
                              `<span class="badge bg-secondary">${status}</span>`;
            row.innerHTML = `<td>${user.id}</td><td>${user.fullName}</td><td>@${user.username}</td><td>${roleBadge}</td><td>${statusBadge}</td>`;
            tableBody.appendChild(row);
        });
    } catch (error) { tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error.</td></tr>'; }
}

// --- NEW: BOOKINGS DIRECTORY ---
async function loadAllBookings() {
    const tableBody = document.getElementById('allBookingsTableBody');
    if(!tableBody) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/bookings`);
        if (!response.ok) throw new Error("Failed");
        allBookingsData = await response.json(); // Store globally
        renderBookingsTable(allBookingsData);
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading bookings.</td></tr>';
    }
}

function renderBookingsTable(bookings) {
    const tableBody = document.getElementById('allBookingsTableBody');
    tableBody.innerHTML = '';
    
    if (bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No bookings found.</td></tr>';
        return;
    }
    
    bookings.forEach(booking => {
        const row = document.createElement('tr');
        
        // Status styling
        let statusBadge;
        const s = booking.bookingStatus.toUpperCase();
        if(s === 'PENDING') statusBadge = '<span class="badge bg-warning text-dark">Pending</span>';
        else if(s === 'ACTIVE') statusBadge = '<span class="badge bg-success">Active</span>';
        else if(s === 'COMPLETED') statusBadge = '<span class="badge bg-secondary">Completed</span>';
        else if(s === 'DECLINED') statusBadge = '<span class="badge bg-danger">Declined</span>';
        else statusBadge = `<span class="badge bg-light text-dark">${s}</span>`;
        
        const price = booking.bookingPrice ? booking.bookingPrice.toFixed(2) : '0.00';
        
        row.innerHTML = `
            <td>#${booking.id}</td>
            <td>${booking.serviceName}</td>
            <td>${booking.customerName} <small class="text-muted">(#${booking.customerId})</small></td>
            <td>${booking.providerName} <small class="text-muted">(#${booking.providerId})</small></td>
            <td><small>${booking.bookingDate}<br>${booking.bookingTime}</small></td>
            <td>${statusBadge}</td>
            <td>₹${price}</td>
        `;
        tableBody.appendChild(row);
    });
}

function filterBookings(query) {
    if(!query) {
        renderBookingsTable(allBookingsData);
        return;
    }
    // Filter by ID (exact match or contains)
    const filtered = allBookingsData.filter(b => b.id.toString().includes(query));
    renderBookingsTable(filtered);
}


// --- 3. PROVIDER MANAGEMENT (Unchanged) ---
async function loadPendingProviders() {
    const list = document.getElementById('pendingProviderList');
    const noMsg = document.getElementById('noPendingRequestsMsg');
    list.innerHTML = ''; 
    if (noMsg) noMsg.style.display = 'block'; 
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/providers/pending`);
        if (!response.ok) throw new Error(`Server error`);
        const providers = await response.json();
        if (providers.length > 0) {
            if (noMsg) noMsg.style.display = 'none'; 
            providers.forEach(provider => list.appendChild(createProviderListItem(provider)));
        }
    } catch (error) { list.innerHTML = `<p class="text-danger">Error loading requests.</p>`; }
}

function createProviderListItem(provider) {
    const listItem = document.createElement('li');
    listItem.id = `provider-request-${provider.id}`;
    listItem.className = 'list-group-item'; 
    let detailsHtml = `
        <div class="d-flex w-100 justify-content-between"><h5 class="mb-1">${provider.fullName}</h5><small class="text-muted">@${provider.username}</small></div>
        <p class="mb-1"><strong>Email:</strong> ${provider.email} | <strong>Phone:</strong> ${provider.phoneNumber}</p>
        <div class="accordion" id="accordion-${provider.id}">
            <div class="accordion-item border-0" style="background-color: transparent;">
                <h2 class="accordion-header" id="heading-${provider.id}">
                    <button class="accordion-button collapsed p-0" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${provider.id}">View Full Details</button>
                </h2>
                <div id="collapse-${provider.id}" class="accordion-collapse collapse" data-bs-parent="#accordion-${provider.id}">
                    <div class="accordion-body ps-0">
                        <p class="mb-1"><strong>Services:</strong> ${provider.servicesProvided}</p>
                        <p class="mb-1"><strong>Location:</strong> ${provider.operatingLocation}</p>
                        <p class="mb-1"><strong>Address:</strong> ${provider.providerAddress}</p>
                        <p class="mb-1"><strong>Age:</strong> ${provider.age || 'N/A'} | <strong>Experience:</strong> ${provider.yearsOfExperience || 'N/A'} yrs</p>
                        <p class="mb-1"><strong>Qualification:</strong> ${provider.highestQualification || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'mt-3';
    const approveButton = document.createElement('button');
    approveButton.textContent = 'Approve';
    approveButton.className = 'btn btn-success btn-sm me-2';
    approveButton.onclick = () => handleApprove(provider.id);
    const rejectButton = document.createElement('button');
    rejectButton.textContent = 'Reject';
    rejectButton.className = 'btn btn-danger btn-sm'; 
    rejectButton.onclick = () => handleReject(provider.id);
    buttonContainer.appendChild(approveButton);
    buttonContainer.appendChild(rejectButton);
    listItem.innerHTML = detailsHtml;
    listItem.appendChild(buttonContainer);
    return listItem;
}

async function handleApprove(providerId) {
    if (isSubmitting) return; 
    isSubmitting = true; 
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/providers/${providerId}/approve`, { method: 'PUT' });
        if (response.ok) {
            alert("Provider has been approved!"); 
            try {
                document.getElementById(`provider-request-${providerId}`)?.remove();
                const list = document.getElementById('pendingProviderList');
                if (list && list.children.length === 0) document.getElementById('noPendingRequestsMsg').style.display = 'block';
                loadAllUsers(); loadDashboardStats();
            } catch (e) {}
        } else { alert(`Error: ${await response.text()}`); }
    } catch (error) { alert("Connection error."); } 
    finally { isSubmitting = false; }
}

async function handleReject(providerId) {
    if (isSubmitting) return;
    if (!confirm("Reject this provider?")) return; 
    isSubmitting = true; 
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/providers/${providerId}/reject`, { method: 'PUT' });
        if (response.ok) {
            alert("Provider has been rejected."); 
            try {
                document.getElementById(`provider-request-${providerId}`)?.remove();
                const list = document.getElementById('pendingProviderList');
                if (list && list.children.length === 0) document.getElementById('noPendingRequestsMsg').style.display = 'block';
                loadAllUsers(); loadDashboardStats();
            } catch (e) {}
        } else { alert(`Error: ${await response.text()}`); }
    } catch (error) { alert("Connection error."); } 
    finally { isSubmitting = false; }
}

// --- 4. SERVICE MANAGEMENT (Unchanged) ---
async function loadExistingServices() {
    const list = document.getElementById('existingServicesList');
    const noMsg = document.getElementById('noServicesMsg');
    list.innerHTML = '';
    if(noMsg) noMsg.style.display = 'block';
    try {
        const response = await fetch(`${API_BASE_URL}/api/services`);
        if (!response.ok) throw new Error("Could not fetch services.");
        const services = await response.json();
        if (services.length > 0) {
            if(noMsg) noMsg.style.display = 'none';
            services.forEach(service => list.appendChild(createServiceListItem(service)));
        }
    } catch (error) { console.error(error); }
}

function createServiceListItem(service) {
    const listItem = document.createElement('li');
    listItem.id = `service-item-${service.id}`;
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    listItem.innerHTML = `
        <div><strong class="h6">${service.name}</strong> - <span class="text-success h5">₹${service.price.toFixed(2)}</span><br><small class="text-muted">${service.description || ''}</small></div>
        <div>
            <button class="btn btn-warning btn-sm me-2" onclick="handleUpdateService(${service.id}, '${service.name}', ${service.price}, '${service.description || ''}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="handleDeleteService(${service.id}, '${service.name}')">Delete</button>
        </div>
    `;
    return listItem;
}

async function handleCreateService(event) {
    event.preventDefault(); 
    if (isSubmitting) return;
    const name = document.getElementById('serviceName').value.trim();
    const price = document.getElementById('servicePrice').value;
    const description = document.getElementById('serviceDescription').value.trim();
    const messageEl = document.getElementById('serviceFormMessage');
    if (!name || !price) { messageEl.textContent = 'Name and Price required.'; messageEl.style.color = 'red'; return; }
    isSubmitting = true;
    try {
        const response = await fetch(`${API_BASE_URL}/api/services`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price: parseFloat(price), description })
        });
        if (response.ok) {
            messageEl.textContent = 'Success!'; messageEl.style.color = 'green';
            document.getElementById('newServiceForm').reset();
            loadExistingServices();
        } else { messageEl.textContent = `Error: ${await response.text()}`; messageEl.style.color = 'red'; }
    } catch (error) { messageEl.textContent = 'Connection error.'; messageEl.style.color = 'red'; } 
    finally { isSubmitting = false; }
}

async function handleDeleteService(serviceId, serviceName) {
    if (isSubmitting) return;
    if (!confirm(`Delete service "${serviceName}"?`)) return;
    isSubmitting = true;
    try {
        const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}`, { method: 'DELETE' });
        if (response.ok) { alert("Deleted."); loadExistingServices(); } 
        else { alert(`Error: ${await response.text()}`); }
    } catch (error) { alert("Connection error."); } 
    finally { isSubmitting = false; }
}

async function handleUpdateService(serviceId, serviceName, currentPrice, currentDescription) {
    if (isSubmitting) return;
    const newPriceString = prompt(`New price for "${serviceName}":`, currentPrice);
    if (!newPriceString) return;
    const newPrice = parseFloat(newPriceString);
    if (isNaN(newPrice) || newPrice <= 0) { alert("Invalid price."); return; }
    isSubmitting = true;
    try {
        const response = await fetch(`${API_BASE_URL}/api/services/${serviceId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: serviceId, name: serviceName, price: newPrice, description: currentDescription })
        });
        if (response.ok) { alert("Updated!"); loadExistingServices(); } 
        else { alert(`Error: ${await response.text()}`); }
    } catch (error) { alert("Connection error."); } 
    finally { isSubmitting = false; }
}