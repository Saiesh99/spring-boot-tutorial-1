package com.first.springboot.tutorial.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.first.springboot.tutorial.entity.Department;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long>{
  
	public Department findByDepartmentNameIgnoreCase(String departmentName);
}
