#!/usr/bin/env python3
"""
Comprehensive Backend API Validation Test
Final validation of all endpoints with edge cases and data validation.
"""

import requests
import json

BACKEND_URL = "http://localhost:8001"

def test_comprehensive_api_validation():
    """Comprehensive test of all API endpoints with validation"""
    session = requests.Session()
    
    print("🔍 Comprehensive API Validation Test")
    print("=" * 50)
    
    # Test 1: Health endpoint
    response = session.get(f"{BACKEND_URL}/api/health")
    assert response.status_code == 200
    health_data = response.json()
    assert "status" in health_data and health_data["status"] == "healthy"
    assert "timestamp" in health_data
    print("✅ Health endpoint: All validations passed")
    
    # Test 2: User registration with validation
    user_data = {
        "email": "manager@test.com",
        "password": "manager123",
        "full_name": "Manager User",
        "role": "manager"
    }
    
    response = session.post(
        f"{BACKEND_URL}/api/auth/register",
        json=user_data,
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 200
    user_response = response.json()
    
    # Validate user response structure
    required_fields = ["id", "email", "full_name", "role", "is_active", "created_at"]
    for field in required_fields:
        assert field in user_response, f"Missing field: {field}"
    
    assert user_response["email"] == user_data["email"]
    assert user_response["role"] == user_data["role"]
    assert user_response["is_active"] == True
    assert "password" not in user_response  # Password should not be returned
    print("✅ User registration: All validations passed")
    
    # Test 3: User login with token validation
    login_data = {
        "email": "manager@test.com",
        "password": "manager123"
    }
    
    response = session.post(
        f"{BACKEND_URL}/api/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 200
    login_response = response.json()
    
    # Validate login response structure
    assert "access_token" in login_response
    assert "token_type" in login_response
    assert "user" in login_response
    assert login_response["token_type"] == "bearer"
    assert len(login_response["access_token"]) > 50  # JWT tokens are long
    
    manager_token = login_response["access_token"]
    print("✅ User login: All validations passed")
    
    # Test 4: Get current user with token validation
    headers = {"Authorization": f"Bearer {manager_token}"}
    response = session.get(f"{BACKEND_URL}/api/auth/me", headers=headers)
    assert response.status_code == 200
    current_user = response.json()
    
    assert current_user["email"] == "manager@test.com"
    assert current_user["role"] == "manager"
    assert "password" not in current_user
    print("✅ Get current user: All validations passed")
    
    # Test 5: Department creation with manager permissions
    dept_data = {
        "name": "Marketing Department",
        "description": "Marketing and communications team",
        "parent_department_id": None
    }
    
    response = session.post(
        f"{BACKEND_URL}/api/departments",
        json=dept_data,
        headers={**headers, "Content-Type": "application/json"}
    )
    
    # Manager should NOT be able to create departments (only admin can)
    assert response.status_code == 403
    print("✅ Department creation permissions: Manager correctly denied access")
    
    # Test 6: Login as admin and create department
    admin_login = {
        "email": "admin@test.com",
        "password": "admin123"
    }
    
    response = session.post(
        f"{BACKEND_URL}/api/auth/login",
        json=admin_login,
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 200
    admin_token = response.json()["access_token"]
    
    admin_headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    response = session.post(
        f"{BACKEND_URL}/api/departments",
        json=dept_data,
        headers=admin_headers
    )
    assert response.status_code == 200
    dept_response = response.json()
    
    # Validate department response
    assert "id" in dept_response
    assert dept_response["name"] == dept_data["name"]
    assert dept_response["description"] == dept_data["description"]
    assert "created_at" in dept_response
    print("✅ Department creation: Admin successfully created department")
    
    # Test 7: Get departments list
    response = session.get(f"{BACKEND_URL}/api/departments", headers=admin_headers)
    assert response.status_code == 200
    departments = response.json()
    
    assert isinstance(departments, list)
    assert len(departments) >= 2  # Should have at least 2 departments now
    
    # Find our created departments
    eng_dept = next((d for d in departments if d["name"] == "Engineering Department"), None)
    marketing_dept = next((d for d in departments if d["name"] == "Marketing Department"), None)
    
    assert eng_dept is not None, "Engineering Department not found"
    assert marketing_dept is not None, "Marketing Department not found"
    print("✅ Get departments: All departments retrieved correctly")
    
    # Test 8: Test invalid email format
    invalid_user = {
        "email": "invalid-email",
        "password": "test123",
        "full_name": "Invalid User",
        "role": "viewer"
    }
    
    response = session.post(
        f"{BACKEND_URL}/api/auth/register",
        json=invalid_user,
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 422  # Validation error
    print("✅ Email validation: Invalid email format correctly rejected")
    
    # Test 9: Test duplicate user registration
    response = session.post(
        f"{BACKEND_URL}/api/auth/register",
        json=user_data,  # Same user data as before
        headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 400  # User already exists
    print("✅ Duplicate user validation: Duplicate registration correctly rejected")
    
    print("\n🎉 All comprehensive validations passed!")
    return True

def main():
    """Run comprehensive validation tests"""
    try:
        test_comprehensive_api_validation()
        print("\n✅ COMPREHENSIVE TEST RESULT: ALL BACKEND APIs ARE WORKING CORRECTLY")
        print("✅ Authentication, authorization, data validation, and MongoDB integration all verified")
        return True
    except AssertionError as e:
        print(f"\n❌ COMPREHENSIVE TEST FAILED: {str(e)}")
        return False
    except Exception as e:
        print(f"\n💥 UNEXPECTED ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    main()