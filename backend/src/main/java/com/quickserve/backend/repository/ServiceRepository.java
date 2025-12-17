package com.quickserve.backend.repository;

import com.quickserve.backend.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;


public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    
    Optional<Service> findByName(String name);
}