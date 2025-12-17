// File: src/main/java/com/quickserve/backend/service/ServiceService.java

package com.quickserve.backend.service;

import com.quickserve.backend.model.Service; // This is your model class
import com.quickserve.backend.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
// We DO NOT import org.springframework.stereotype.Service to avoid conflict

import java.util.List;
import java.util.Optional;

// --- THIS IS THE FIX ---
// We use the full path to the annotation to avoid a name conflict
@org.springframework.stereotype.Service
// --- END OF FIX ---
public class ServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    /**
     * Gets all services from the database.
     */
    public List<Service> getAllServices() {
        // 'Service' here refers to your model
        return serviceRepository.findAll();
    }

    /**
     * Creates a new service.
     */
    public Service createService(Service service) throws Exception {
        // Check if a service with this name already exists
        if (serviceRepository.findByName(service.getName()).isPresent()) {
            throw new Exception("A service with the name '" + service.getName() + "' already exists.");
        }
        return serviceRepository.save(service);
    }

    /**
     * Updates an existing service (e.g., to change the price).
     */
    public Service updateService(Long serviceId, Service serviceDetails) throws Exception {
        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new Exception("Service not found with ID: " + serviceId));

        // Check if the name is being changed to one that already exists
        Optional<Service> existingServiceWithName = serviceRepository.findByName(serviceDetails.getName());
        if (existingServiceWithName.isPresent() && !existingServiceWithName.get().getId().equals(serviceId)) {
            throw new Exception("A service with the name '" + serviceDetails.getName() + "' already exists.");
        }

        service.setName(serviceDetails.getName());
        service.setPrice(serviceDetails.getPrice());
        service.setDescription(serviceDetails.getDescription());

        return serviceRepository.save(service);
    }

    /**
     * Deletes a service.
     */
    public void deleteService(Long serviceId) throws Exception {
        if (!serviceRepository.existsById(serviceId)) {
            throw new Exception("Service not found with ID: ".concat(serviceId.toString()));
        }
        serviceRepository.deleteById(serviceId);
    }
}