package com.first.springboot.tutorial.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.first.springboot.tutorial.entity.Department;
import com.first.springboot.tutorial.error.DepartmentNotFoundException;
import com.first.springboot.tutorial.repository.DepartmentRepository;

@Service
public class DepartmentServiceImpl implements DepartmentService{
	
	@Autowired
	private DepartmentRepository departmentRepository;

	@Override
	public Department saveDepartment(Department department) {
		// TODO Auto-generated method stub
		
		return departmentRepository.save(department);
		 
	}

	@Override
	public List<Department> fetchDepartmentList() {
		// TODO Auto-generated method stub
		return departmentRepository.findAll() ;
	}

	@Override
	public Department fetchDepartmentById(Long departmentId) throws DepartmentNotFoundException {
		// TODO Auto-generated method stub
		Optional<Department> department= departmentRepository.findById(departmentId);
		if(department.isEmpty()||!department.isPresent()) {
			throw new DepartmentNotFoundException("dpet is not available bro");
		}
		return department.get();
	}

	@Override
	public void deleteDepartmentById(Long departmentId) {
		// TODO Auto-generated method stub
		departmentRepository.deleteById(departmentId);
		
	}

	@Override
	public Department updateDepartment(Long departmentId, Department department) {
		// TODO Auto-generated method stub
		Department departmentDB =  departmentRepository.findById(departmentId).get();
		if(!departmentDB.getDepartmentName().isEmpty() && departmentDB.getDepartmentName() !=null) {
			departmentDB.setDepartmentName(department.getDepartmentName());		
		}
		
		if(!departmentDB.getDepartmentAddress().isEmpty() && departmentDB.getDepartmentAddress() !=null) {
			departmentDB.setDepartmentAddress(department.getDepartmentAddress());		
		}
		
		if(!departmentDB.getDepartmentCode().isEmpty() && departmentDB.getDepartmentCode() !=null) {
			departmentDB.setDepartmentCode(department.getDepartmentCode());		
		}
		
		return departmentRepository.save(departmentDB);
	}

	@Override
	public Department fetchDepartmentByName(String departmentName) {
		// TODO Auto-generated method stub
		return departmentRepository.findByDepartmentNameIgnoreCase(departmentName);
	}

	
}
