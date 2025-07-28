#!/usr/bin/env python3
"""
Backend API Testing Script for OCP Foundation
Tests all the core API endpoints including authentication, user management, and departments.
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL - using production backend service
BACKEND_URL = "https://wikiguides1-backend.emergentmind.com"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    def test_health_check(self):
        """Test GET /api/health endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_test("Health Check", True, "Health endpoint working correctly", data)
                    return True
                else:
                    self.log_test("Health Check", False, "Health endpoint returned unexpected data", data)
                    return False
            else:
                self.log_test("Health Check", False, f"Health endpoint returned status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Health endpoint failed with exception: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Test POST /api/auth/register endpoint"""
        try:
            user_data = {
                "email": "admin@test.com",
                "password": "admin123",
                "full_name": "Admin User",
                "role": "admin"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/register",
                json=user_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["id", "email", "full_name", "role", "is_active", "created_at"]
                
                if all(field in data for field in expected_fields):
                    if (data["email"] == user_data["email"] and 
                        data["full_name"] == user_data["full_name"] and
                        data["role"] == user_data["role"] and
                        data["is_active"] == True):
                        self.log_test("User Registration", True, "User registered successfully", data)
                        return True
                    else:
                        self.log_test("User Registration", False, "User data doesn't match expected values", data)
                        return False
                else:
                    self.log_test("User Registration", False, "Missing required fields in response", data)
                    return False
            else:
                self.log_test("User Registration", False, f"Registration failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("User Registration", False, f"Registration failed with exception: {str(e)}")
            return False
    
    def test_user_login(self):
        """Test POST /api/auth/login endpoint"""
        try:
            login_data = {
                "email": "admin@test.com",
                "password": "admin123"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["access_token", "token_type", "user"]
                
                if all(field in data for field in expected_fields):
                    if (data["token_type"] == "bearer" and 
                        data["access_token"] and
                        "user" in data and
                        data["user"]["email"] == login_data["email"]):
                        
                        # Store token for subsequent tests
                        self.auth_token = data["access_token"]
                        self.log_test("User Login", True, "User logged in successfully", 
                                    {"token_received": True, "user_email": data["user"]["email"]})
                        return True
                    else:
                        self.log_test("User Login", False, "Login response data is invalid", data)
                        return False
                else:
                    self.log_test("User Login", False, "Missing required fields in login response", data)
                    return False
            else:
                self.log_test("User Login", False, f"Login failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("User Login", False, f"Login failed with exception: {str(e)}")
            return False
    
    def test_get_current_user(self):
        """Test GET /api/auth/me endpoint"""
        if not self.auth_token:
            self.log_test("Get Current User", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/auth/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["id", "email", "full_name", "role", "is_active"]
                
                if all(field in data for field in expected_fields):
                    if (data["email"] == "admin@test.com" and 
                        data["role"] == "admin" and
                        data["is_active"] == True):
                        self.log_test("Get Current User", True, "Current user info retrieved successfully", data)
                        return True
                    else:
                        self.log_test("Get Current User", False, "Current user data is incorrect", data)
                        return False
                else:
                    self.log_test("Get Current User", False, "Missing required fields in user response", data)
                    return False
            else:
                self.log_test("Get Current User", False, f"Get current user failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Get Current User", False, f"Get current user failed with exception: {str(e)}")
            return False
    
    def test_create_department(self):
        """Test POST /api/departments endpoint"""
        if not self.auth_token:
            self.log_test("Create Department", False, "No auth token available")
            return False
            
        try:
            dept_data = {
                "name": "Engineering Department",
                "description": "Software engineering and development team"
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/departments",
                json=dept_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["id", "name", "description", "created_at"]
                
                if all(field in data for field in expected_fields):
                    if (data["name"] == dept_data["name"] and 
                        data["description"] == dept_data["description"]):
                        self.log_test("Create Department", True, "Department created successfully", data)
                        return True
                    else:
                        self.log_test("Create Department", False, "Department data doesn't match expected values", data)
                        return False
                else:
                    self.log_test("Create Department", False, "Missing required fields in department response", data)
                    return False
            else:
                self.log_test("Create Department", False, f"Create department failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Create Department", False, f"Create department failed with exception: {str(e)}")
            return False
    
    def test_get_departments(self):
        """Test GET /api/departments endpoint"""
        if not self.auth_token:
            self.log_test("Get Departments", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/departments", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check if the department we created exists
                        dept_found = any(dept.get("name") == "Engineering Department" for dept in data)
                        if dept_found:
                            self.log_test("Get Departments", True, f"Departments retrieved successfully ({len(data)} departments)", 
                                        {"department_count": len(data)})
                            return True
                        else:
                            self.log_test("Get Departments", False, "Created department not found in list", data)
                            return False
                    else:
                        self.log_test("Get Departments", True, "Departments retrieved successfully (empty list)", data)
                        return True
                else:
                    self.log_test("Get Departments", False, "Departments response is not a list", data)
                    return False
            else:
                self.log_test("Get Departments", False, f"Get departments failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Get Departments", False, f"Get departments failed with exception: {str(e)}")
            return False
    
    def test_mongodb_integration(self):
        """Test MongoDB integration by verifying data persistence"""
        try:
            # Test if we can login again (verifies user was stored in MongoDB)
            login_data = {
                "email": "admin@test.com",
                "password": "admin123"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                self.log_test("MongoDB Integration", True, "User data persisted correctly in MongoDB")
                return True
            else:
                self.log_test("MongoDB Integration", False, "User data not persisted in MongoDB")
                return False
                
        except Exception as e:
            self.log_test("MongoDB Integration", False, f"MongoDB integration test failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print(f"🚀 Starting Backend API Tests for {self.base_url}")
        print("=" * 60)
        
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Get Current User", self.test_get_current_user),
            ("Create Department", self.test_create_department),
            ("Get Departments", self.test_get_departments),
            ("MongoDB Integration", self.test_mongodb_integration)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test failed with unexpected error: {str(e)}")
        
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Backend API is working correctly.")
            return True
        else:
            print(f"⚠️  {total - passed} tests failed. Please check the issues above.")
            return False
    
    def print_summary(self):
        """Print detailed test summary"""
        print("\n📋 Detailed Test Summary:")
        print("-" * 40)
        
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}: {result['message']}")
        
        return self.test_results

def main():
    """Main function to run backend tests"""
    tester = BackendTester()
    
    try:
        success = tester.run_all_tests()
        tester.print_summary()
        
        # Exit with appropriate code
        sys.exit(0 if success else 1)
        
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error during testing: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()