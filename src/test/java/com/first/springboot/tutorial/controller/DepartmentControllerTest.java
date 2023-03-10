package com.first.springboot.tutorial.controller;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockRequestDispatcher;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import com.first.springboot.tutorial.entity.Department;
import com.first.springboot.tutorial.service.DepartmentService;

@WebMvcTest(DepartmentController.class)
class DepartmentControllerTest {
	
	@Autowired
	private MockMvc mockMvc;
	
	@MockBean
	private DepartmentService departmentService;
	
	private Department department;

	@BeforeEach
	void setUp() throws Exception {
		Department department = Department.builder().departmentAddress("BLR").departmentCode("IT-1").departmentName("IT").departmentId(1L).build();
		
	}

	@Test
	void saveDepartment() throws Exception {
		
		Department departmentInput = Department.builder().departmentAddress("BLR").departmentCode("IT-1").departmentName("IT").build();
		Mockito.when(departmentService.saveDepartment(departmentInput)).thenReturn(department);

		mockMvc.perform(MockMvcRequestBuilders.post("/departments").contentType(MediaType.APPLICATION_JSON).content("{\r\n"
				+ "     \"departmentName\": \"IT\",\r\n"
				+ "    \"departmentAddress\": \"BLR\",\r\n"
				+ "    \"departmentCode\": \"IT-1\"\r\n"
				+ "}")).andExpect(MockMvcResultMatchers.status().isOk());
	}

}
