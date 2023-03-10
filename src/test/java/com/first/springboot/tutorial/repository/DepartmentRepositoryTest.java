package com.first.springboot.tutorial.repository;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.first.springboot.tutorial.entity.Department;

@DataJpaTest
class DepartmentRepositoryTest {

	@Autowired
	private DepartmentRepository departmentRepository;

	@Autowired
	private TestEntityManager testEntityManager;

	@BeforeEach
	void setUp(){
		Department department = Department.builder().departmentAddress("BLR123").departmentCode("IT-123")
				.departmentName("IT123").build();
		testEntityManager.persist(department);

	}

	@Test
	public void whenFindByIdThenReturnDepartment() {

		Department department = departmentRepository.findById(1L).get();
		assertEquals(department.getDepartmentName(),"IT123");
	}

}
