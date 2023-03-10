package com.first.springboot.tutorial.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import com.first.springboot.tutorial.entity.Department;
import com.first.springboot.tutorial.repository.DepartmentRepository;

@SpringBootTest
class DepartmentServiceTest {

	@Autowired
	DepartmentService departmentService;

	@MockBean
	DepartmentRepository departmentRepository;

	@BeforeEach
	void setUp() throws Exception {
		Department department = Department.builder().departmentAddress("BLR").departmentCode("IT-1").departmentId(1L)
				.departmentName("IT").build();
		Mockito.when(departmentRepository.findByDepartmentNameIgnoreCase("IT")).thenReturn(department);
		

	}

//	@Test
//	void test() {
//		fail("Not yet implemented");
//	}
	@Test
	@DisplayName("get data based on name")
	public void whenDepartmentNameIsValidDepartmentIsFound() {
		String departmentName = "IT";
		Department departmentDB = departmentService.fetchDepartmentByName(departmentName);
		assertEquals(departmentName, departmentDB.getDepartmentName());

	}

}
