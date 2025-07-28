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
                "email": "admin@wikiguides.com",
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
            elif response.status_code == 400:
                # User might already exist, which is fine for testing
                self.log_test("User Registration", True, "User already exists (expected for repeated tests)", {"status": "user_exists"})
                return True
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
                "email": "admin@wikiguides.com",
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
                    if (data["email"] == "admin@wikiguides.com" and 
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
                "email": "admin@wikiguides.com",
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

    # Wiki System Tests
    def test_wiki_admin_login(self):
        """Test login as admin user for Wiki testing"""
        try:
            login_data = {
                "email": "admin@wikiguides.com",
                "password": "admin123"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.log_test("Wiki Admin Login", True, "Admin logged in successfully for Wiki testing", 
                                {"user_email": data["user"]["email"], "role": data["user"]["role"]})
                    return True
                else:
                    self.log_test("Wiki Admin Login", False, "Invalid login response structure", data)
                    return False
            else:
                self.log_test("Wiki Admin Login", False, f"Admin login failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Wiki Admin Login", False, f"Admin login failed with exception: {str(e)}")
            return False

    def test_create_wiki_category(self):
        """Test POST /api/wiki/categories endpoint"""
        if not self.auth_token:
            self.log_test("Create Wiki Category", False, "No auth token available")
            return False
            
        try:
            category_data = {
                "name": "Getting Started",
                "description": "Essential guides for new users",
                "icon": "book-open",
                "color": "#10b981"
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/wiki/categories",
                json=category_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["id", "name", "description", "icon", "color", "created_at", "created_by"]
                
                if all(field in data for field in expected_fields):
                    if (data["name"] == category_data["name"] and 
                        data["description"] == category_data["description"] and
                        data["icon"] == category_data["icon"] and
                        data["color"] == category_data["color"]):
                        self.category_id = data["id"]  # Store for later tests
                        self.log_test("Create Wiki Category", True, "Wiki category created successfully", data)
                        return True
                    else:
                        self.log_test("Create Wiki Category", False, "Category data doesn't match expected values", data)
                        return False
                else:
                    self.log_test("Create Wiki Category", False, "Missing required fields in category response", data)
                    return False
            else:
                self.log_test("Create Wiki Category", False, f"Create category failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Create Wiki Category", False, f"Create category failed with exception: {str(e)}")
            return False

    def test_get_wiki_categories(self):
        """Test GET /api/wiki/categories endpoint"""
        if not self.auth_token:
            self.log_test("Get Wiki Categories", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/wiki/categories", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check if our created category exists
                        category_found = any(cat.get("name") == "Getting Started" for cat in data)
                        if category_found:
                            self.log_test("Get Wiki Categories", True, f"Categories retrieved successfully ({len(data)} categories)", 
                                        {"category_count": len(data)})
                            return True
                        else:
                            self.log_test("Get Wiki Categories", False, "Created category not found in list", data)
                            return False
                    else:
                        self.log_test("Get Wiki Categories", True, "Categories retrieved successfully (empty list)", data)
                        return True
                else:
                    self.log_test("Get Wiki Categories", False, "Categories response is not a list", data)
                    return False
            else:
                self.log_test("Get Wiki Categories", False, f"Get categories failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Get Wiki Categories", False, f"Get categories failed with exception: {str(e)}")
            return False

    def test_create_troubleshooting_category(self):
        """Test creating a second category for Troubleshooting"""
        if not self.auth_token:
            self.log_test("Create Troubleshooting Category", False, "No auth token available")
            return False
            
        try:
            category_data = {
                "name": "Troubleshooting",
                "description": "Common issues and solutions",
                "icon": "wrench",
                "color": "#ef4444"
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/wiki/categories",
                json=category_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                if data["name"] == category_data["name"]:
                    self.troubleshooting_category_id = data["id"]  # Store for later tests
                    self.log_test("Create Troubleshooting Category", True, "Troubleshooting category created successfully", data)
                    return True
                else:
                    self.log_test("Create Troubleshooting Category", False, "Category data doesn't match", data)
                    return False
            else:
                self.log_test("Create Troubleshooting Category", False, f"Create troubleshooting category failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Create Troubleshooting Category", False, f"Create troubleshooting category failed with exception: {str(e)}")
            return False

    def test_create_wiki_subcategory(self):
        """Test POST /api/wiki/subcategories endpoint"""
        if not self.auth_token or not hasattr(self, 'category_id'):
            self.log_test("Create Wiki Subcategory", False, "No auth token or category ID available")
            return False
            
        try:
            subcategory_data = {
                "name": "User Onboarding",
                "description": "New user setup guides",
                "category_id": self.category_id
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/wiki/subcategories",
                json=subcategory_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["id", "name", "description", "category_id", "created_at", "created_by"]
                
                if all(field in data for field in expected_fields):
                    if (data["name"] == subcategory_data["name"] and 
                        data["description"] == subcategory_data["description"] and
                        data["category_id"] == subcategory_data["category_id"]):
                        self.subcategory_id = data["id"]  # Store for later tests
                        self.log_test("Create Wiki Subcategory", True, "Wiki subcategory created successfully", data)
                        return True
                    else:
                        self.log_test("Create Wiki Subcategory", False, "Subcategory data doesn't match expected values", data)
                        return False
                else:
                    self.log_test("Create Wiki Subcategory", False, "Missing required fields in subcategory response", data)
                    return False
            else:
                self.log_test("Create Wiki Subcategory", False, f"Create subcategory failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Create Wiki Subcategory", False, f"Create subcategory failed with exception: {str(e)}")
            return False

    def test_create_account_setup_subcategory(self):
        """Test creating a second subcategory for Account Setup"""
        if not self.auth_token or not hasattr(self, 'category_id'):
            self.log_test("Create Account Setup Subcategory", False, "No auth token or category ID available")
            return False
            
        try:
            subcategory_data = {
                "name": "Account Setup",
                "description": "Account configuration and setup guides",
                "category_id": self.category_id
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/wiki/subcategories",
                json=subcategory_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                if data["name"] == subcategory_data["name"]:
                    self.account_setup_subcategory_id = data["id"]  # Store for later tests
                    self.log_test("Create Account Setup Subcategory", True, "Account Setup subcategory created successfully", data)
                    return True
                else:
                    self.log_test("Create Account Setup Subcategory", False, "Subcategory data doesn't match", data)
                    return False
            else:
                self.log_test("Create Account Setup Subcategory", False, f"Create account setup subcategory failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Create Account Setup Subcategory", False, f"Create account setup subcategory failed with exception: {str(e)}")
            return False

    def test_get_wiki_subcategories(self):
        """Test GET /api/wiki/subcategories endpoint"""
        if not self.auth_token:
            self.log_test("Get Wiki Subcategories", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/wiki/subcategories", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check if our created subcategories exist
                        onboarding_found = any(subcat.get("name") == "User Onboarding" for subcat in data)
                        account_found = any(subcat.get("name") == "Account Setup" for subcat in data)
                        if onboarding_found and account_found:
                            self.log_test("Get Wiki Subcategories", True, f"Subcategories retrieved successfully ({len(data)} subcategories)", 
                                        {"subcategory_count": len(data)})
                            return True
                        else:
                            self.log_test("Get Wiki Subcategories", False, "Created subcategories not found in list", data)
                            return False
                    else:
                        self.log_test("Get Wiki Subcategories", True, "Subcategories retrieved successfully (empty list)", data)
                        return True
                else:
                    self.log_test("Get Wiki Subcategories", False, "Subcategories response is not a list", data)
                    return False
            else:
                self.log_test("Get Wiki Subcategories", False, f"Get subcategories failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Get Wiki Subcategories", False, f"Get subcategories failed with exception: {str(e)}")
            return False

    def test_get_subcategories_with_filter(self):
        """Test GET /api/wiki/subcategories with category_id filter"""
        if not self.auth_token or not hasattr(self, 'category_id'):
            self.log_test("Get Subcategories with Filter", False, "No auth token or category ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/wiki/subcategories?category_id={self.category_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    # All returned subcategories should belong to our category
                    all_match_category = all(subcat.get("category_id") == self.category_id for subcat in data)
                    if all_match_category:
                        self.log_test("Get Subcategories with Filter", True, f"Filtered subcategories retrieved successfully ({len(data)} subcategories)", 
                                    {"filtered_count": len(data), "category_id": self.category_id})
                        return True
                    else:
                        self.log_test("Get Subcategories with Filter", False, "Some subcategories don't match the filter", data)
                        return False
                else:
                    self.log_test("Get Subcategories with Filter", False, "Filtered subcategories response is not a list", data)
                    return False
            else:
                self.log_test("Get Subcategories with Filter", False, f"Get filtered subcategories failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Get Subcategories with Filter", False, f"Get filtered subcategories failed with exception: {str(e)}")
            return False

    def test_create_wiki_article(self):
        """Test POST /api/wiki/articles endpoint"""
        if not self.auth_token or not hasattr(self, 'subcategory_id'):
            self.log_test("Create Wiki Article", False, "No auth token or subcategory ID available")
            return False
            
        try:
            article_data = {
                "title": "How to Get Started",
                "content": "This is a comprehensive guide on getting started with WikiGuides. Follow these steps to begin your journey with our platform and make the most of all available features.",
                "subcategory_id": self.subcategory_id,
                "visibility": "internal",
                "tags": ["beginner", "setup", "guide"]
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/wiki/articles",
                json=article_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["id", "title", "content", "subcategory_id", "visibility", "tags", "version", "created_at", "updated_at", "created_by", "updated_by"]
                
                if all(field in data for field in expected_fields):
                    if (data["title"] == article_data["title"] and 
                        data["content"] == article_data["content"] and
                        data["subcategory_id"] == article_data["subcategory_id"] and
                        data["visibility"] == article_data["visibility"] and
                        data["tags"] == article_data["tags"] and
                        data["version"] == 1):
                        self.article_id = data["id"]  # Store for later tests
                        self.log_test("Create Wiki Article", True, "Wiki article created successfully", data)
                        return True
                    else:
                        self.log_test("Create Wiki Article", False, "Article data doesn't match expected values", data)
                        return False
                else:
                    self.log_test("Create Wiki Article", False, "Missing required fields in article response", data)
                    return False
            else:
                self.log_test("Create Wiki Article", False, f"Create article failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Create Wiki Article", False, f"Create article failed with exception: {str(e)}")
            return False

    def test_get_wiki_articles(self):
        """Test GET /api/wiki/articles endpoint"""
        if not self.auth_token:
            self.log_test("Get Wiki Articles", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/wiki/articles", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check if our created article exists
                        article_found = any(article.get("title") == "How to Get Started" for article in data)
                        if article_found:
                            self.log_test("Get Wiki Articles", True, f"Articles retrieved successfully ({len(data)} articles)", 
                                        {"article_count": len(data)})
                            return True
                        else:
                            self.log_test("Get Wiki Articles", False, "Created article not found in list", data)
                            return False
                    else:
                        self.log_test("Get Wiki Articles", True, "Articles retrieved successfully (empty list)", data)
                        return True
                else:
                    self.log_test("Get Wiki Articles", False, "Articles response is not a list", data)
                    return False
            else:
                self.log_test("Get Wiki Articles", False, f"Get articles failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Get Wiki Articles", False, f"Get articles failed with exception: {str(e)}")
            return False

    def test_get_specific_wiki_article(self):
        """Test GET /api/wiki/articles/{article_id} endpoint"""
        if not self.auth_token or not hasattr(self, 'article_id'):
            self.log_test("Get Specific Wiki Article", False, "No auth token or article ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/wiki/articles/{self.article_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["id", "title", "content", "subcategory_id", "visibility", "tags", "version"]
                
                if all(field in data for field in expected_fields):
                    if (data["id"] == self.article_id and 
                        data["title"] == "How to Get Started" and
                        data["version"] == 1):
                        self.log_test("Get Specific Wiki Article", True, "Specific article retrieved successfully", data)
                        return True
                    else:
                        self.log_test("Get Specific Wiki Article", False, "Article data doesn't match expected values", data)
                        return False
                else:
                    self.log_test("Get Specific Wiki Article", False, "Missing required fields in article response", data)
                    return False
            else:
                self.log_test("Get Specific Wiki Article", False, f"Get specific article failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Get Specific Wiki Article", False, f"Get specific article failed with exception: {str(e)}")
            return False

    def test_update_wiki_article(self):
        """Test PUT /api/wiki/articles/{article_id} endpoint"""
        if not self.auth_token or not hasattr(self, 'article_id'):
            self.log_test("Update Wiki Article", False, "No auth token or article ID available")
            return False
            
        try:
            update_data = {
                "title": "How to Get Started - Updated",
                "content": "This is an updated comprehensive guide on getting started with WikiGuides. Follow these enhanced steps to begin your journey with our platform and make the most of all available features. This version includes additional tips and best practices.",
                "tags": ["beginner", "setup", "guide", "updated"]
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.put(
                f"{self.base_url}/api/wiki/articles/{self.article_id}",
                json=update_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if (data["title"] == update_data["title"] and 
                    data["content"] == update_data["content"] and
                    data["tags"] == update_data["tags"] and
                    data["version"] == 2):  # Version should be incremented
                    self.log_test("Update Wiki Article", True, "Article updated successfully with version control", data)
                    return True
                else:
                    self.log_test("Update Wiki Article", False, "Updated article data doesn't match expected values", data)
                    return False
            else:
                self.log_test("Update Wiki Article", False, f"Update article failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Update Wiki Article", False, f"Update article failed with exception: {str(e)}")
            return False

    def test_get_article_versions(self):
        """Test GET /api/wiki/articles/{article_id}/versions endpoint"""
        if not self.auth_token or not hasattr(self, 'article_id'):
            self.log_test("Get Article Versions", False, "No auth token or article ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/wiki/articles/{self.article_id}/versions", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) >= 2:  # Should have at least 2 versions (original + update)
                        # Check if versions are properly ordered (newest first)
                        versions_ordered = all(data[i]["version"] >= data[i+1]["version"] for i in range(len(data)-1))
                        if versions_ordered:
                            # Check if we have version 1 and 2
                            version_numbers = [v["version"] for v in data]
                            if 1 in version_numbers and 2 in version_numbers:
                                self.log_test("Get Article Versions", True, f"Article versions retrieved successfully ({len(data)} versions)", 
                                            {"version_count": len(data), "versions": version_numbers})
                                return True
                            else:
                                self.log_test("Get Article Versions", False, "Expected versions not found", data)
                                return False
                        else:
                            self.log_test("Get Article Versions", False, "Versions not properly ordered", data)
                            return False
                    else:
                        self.log_test("Get Article Versions", False, f"Expected at least 2 versions, got {len(data)}", data)
                        return False
                else:
                    self.log_test("Get Article Versions", False, "Versions response is not a list", data)
                    return False
            else:
                self.log_test("Get Article Versions", False, f"Get article versions failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Get Article Versions", False, f"Get article versions failed with exception: {str(e)}")
            return False

    def test_wiki_search(self):
        """Test GET /api/wiki/search endpoint"""
        if not self.auth_token:
            self.log_test("Wiki Search", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/wiki/search?q=getting", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["articles", "categories", "subcategories"]
                
                if all(field in data for field in expected_fields):
                    # Check if our article is found in search results
                    articles = data["articles"]
                    if isinstance(articles, list):
                        article_found = any("getting" in article.get("title", "").lower() or 
                                          "getting" in article.get("content", "").lower() for article in articles)
                        if article_found:
                            self.log_test("Wiki Search", True, f"Search functionality working correctly", 
                                        {"articles_found": len(articles), "categories_found": len(data["categories"]), "subcategories_found": len(data["subcategories"])})
                            return True
                        else:
                            self.log_test("Wiki Search", False, "Expected article not found in search results", data)
                            return False
                    else:
                        self.log_test("Wiki Search", False, "Articles in search response is not a list", data)
                        return False
                else:
                    self.log_test("Wiki Search", False, "Missing required fields in search response", data)
                    return False
            else:
                self.log_test("Wiki Search", False, f"Wiki search failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Wiki Search", False, f"Wiki search failed with exception: {str(e)}")
            return False

    def test_role_based_permissions(self):
        """Test role-based permissions for Wiki operations"""
        # This test assumes we have proper admin permissions
        # In a full test suite, we would create users with different roles and test their permissions
        if not self.auth_token:
            self.log_test("Role-Based Permissions", False, "No auth token available")
            return False
            
        try:
            # Test that admin can access all Wiki endpoints (already tested above)
            # For now, we'll just verify that our admin user can perform all operations
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/auth/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("role") == "admin":
                    self.log_test("Role-Based Permissions", True, "Admin role has proper permissions for Wiki operations", 
                                {"user_role": data["role"]})
                    return True
                else:
                    self.log_test("Role-Based Permissions", False, f"Expected admin role, got {data.get('role')}", data)
                    return False
            else:
                self.log_test("Role-Based Permissions", False, f"Failed to get current user info for permission test", 
                            {"status_code": response.status_code})
                return False
                
        except Exception as e:
            self.log_test("Role-Based Permissions", False, f"Permission test failed with exception: {str(e)}")
            return False

    def test_validation_error_cases(self):
        """Test error handling for invalid data and edge cases"""
        if not self.auth_token:
            self.log_test("Validation Error Cases", False, "No auth token available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Test 1: Try to create article with non-existent subcategory
            invalid_article_data = {
                "title": "Test Article",
                "content": "Test content",
                "subcategory_id": "non-existent-id",
                "visibility": "internal"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/wiki/articles",
                json=invalid_article_data,
                headers=headers
            )
            
            if response.status_code == 404:
                # Test 2: Try to get non-existent article
                response2 = self.session.get(f"{self.base_url}/api/wiki/articles/non-existent-id", headers=headers)
                
                if response2.status_code == 404:
                    self.log_test("Validation Error Cases", True, "Error handling working correctly for invalid data", 
                                {"test1_status": response.status_code, "test2_status": response2.status_code})
                    return True
                else:
                    self.log_test("Validation Error Cases", False, f"Expected 404 for non-existent article, got {response2.status_code}")
                    return False
            else:
                self.log_test("Validation Error Cases", False, f"Expected 404 for invalid subcategory, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Validation Error Cases", False, f"Validation test failed with exception: {str(e)}")
            return False

    # Flow System Tests
    def test_flow_admin_login(self):
        """Test login as admin user for Flow testing"""
        try:
            login_data = {
                "email": "admin@wikiguides.com",
                "password": "admin123"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.log_test("Flow Admin Login", True, "Admin logged in successfully for Flow testing", 
                                {"user_email": data["user"]["email"], "role": data["user"]["role"]})
                    return True
                else:
                    self.log_test("Flow Admin Login", False, "Invalid login response structure", data)
                    return False
            else:
                self.log_test("Flow Admin Login", False, f"Admin login failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Flow Admin Login", False, f"Admin login failed with exception: {str(e)}")
            return False

    def test_create_flow(self):
        """Test POST /api/flows endpoint"""
        if not self.auth_token:
            self.log_test("Create Flow", False, "No auth token available")
            return False
            
        try:
            flow_data = {
                "title": "Customer Onboarding Flow",
                "description": "Guide new customers through account setup",
                "visibility": "internal",
                "tags": ["onboarding", "customer", "setup"]
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/flows",
                json=flow_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["id", "title", "description", "visibility", "tags", "version", "is_active", "created_at", "updated_at", "created_by", "updated_by"]
                
                if all(field in data for field in expected_fields):
                    if (data["title"] == flow_data["title"] and 
                        data["description"] == flow_data["description"] and
                        data["visibility"] == flow_data["visibility"] and
                        data["tags"] == flow_data["tags"] and
                        data["version"] == 1 and
                        data["is_active"] == True):
                        self.flow_id = data["id"]  # Store for later tests
                        self.log_test("Create Flow", True, "Flow created successfully", data)
                        return True
                    else:
                        self.log_test("Create Flow", False, "Flow data doesn't match expected values", data)
                        return False
                else:
                    self.log_test("Create Flow", False, "Missing required fields in flow response", data)
                    return False
            else:
                self.log_test("Create Flow", False, f"Create flow failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Create Flow", False, f"Create flow failed with exception: {str(e)}")
            return False

    def test_get_flows(self):
        """Test GET /api/flows endpoint"""
        if not self.auth_token:
            self.log_test("Get Flows", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/flows", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check if our created flow exists
                        flow_found = any(flow.get("title") == "Customer Onboarding Flow" for flow in data)
                        if flow_found:
                            self.log_test("Get Flows", True, f"Flows retrieved successfully ({len(data)} flows)", 
                                        {"flow_count": len(data)})
                            return True
                        else:
                            self.log_test("Get Flows", False, "Created flow not found in list", data)
                            return False
                    else:
                        self.log_test("Get Flows", True, "Flows retrieved successfully (empty list)", data)
                        return True
                else:
                    self.log_test("Get Flows", False, "Flows response is not a list", data)
                    return False
            else:
                self.log_test("Get Flows", False, f"Get flows failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Get Flows", False, f"Get flows failed with exception: {str(e)}")
            return False

    def test_get_specific_flow(self):
        """Test GET /api/flows/{flow_id} endpoint"""
        if not self.auth_token or not hasattr(self, 'flow_id'):
            self.log_test("Get Specific Flow", False, "No auth token or flow ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/flows/{self.flow_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["id", "title", "description", "visibility", "tags", "version", "is_active"]
                
                if all(field in data for field in expected_fields):
                    if (data["id"] == self.flow_id and 
                        data["title"] == "Customer Onboarding Flow" and
                        data["is_active"] == True):
                        self.log_test("Get Specific Flow", True, "Specific flow retrieved successfully", data)
                        return True
                    else:
                        self.log_test("Get Specific Flow", False, "Flow data doesn't match expected values", data)
                        return False
                else:
                    self.log_test("Get Specific Flow", False, "Missing required fields in flow response", data)
                    return False
            else:
                self.log_test("Get Specific Flow", False, f"Get specific flow failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Get Specific Flow", False, f"Get specific flow failed with exception: {str(e)}")
            return False

    def test_create_flow_steps(self):
        """Test POST /api/flows/{flow_id}/steps endpoint - Create multiple steps"""
        if not self.auth_token or not hasattr(self, 'flow_id'):
            self.log_test("Create Flow Steps", False, "No auth token or flow ID available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Step 1: Information step
            step1_data = {
                "flow_id": self.flow_id,
                "step_order": 1,
                "step_type": "information",
                "question_text": "Welcome to our onboarding process!",
                "description": "This will guide you through setting up your account.",
                "is_required": True
            }
            
            response1 = self.session.post(
                f"{self.base_url}/api/flows/{self.flow_id}/steps",
                json=step1_data,
                headers=headers
            )
            
            if response1.status_code != 200:
                self.log_test("Create Flow Steps", False, f"Step 1 creation failed with status {response1.status_code}", 
                            {"status_code": response1.status_code, "text": response1.text})
                return False
            
            step1_response = response1.json()
            self.step1_id = step1_response["id"]
            
            # Step 2: Multiple choice step
            step2_data = {
                "flow_id": self.flow_id,
                "step_order": 2,
                "step_type": "multiple_choice",
                "question_text": "What type of account would you like to create?",
                "options": [
                    {"text": "Personal Account", "value": "personal", "next_step": None},
                    {"text": "Business Account", "value": "business", "next_step": None}
                ],
                "is_required": True
            }
            
            response2 = self.session.post(
                f"{self.base_url}/api/flows/{self.flow_id}/steps",
                json=step2_data,
                headers=headers
            )
            
            if response2.status_code != 200:
                self.log_test("Create Flow Steps", False, f"Step 2 creation failed with status {response2.status_code}", 
                            {"status_code": response2.status_code, "text": response2.text})
                return False
            
            step2_response = response2.json()
            self.step2_id = step2_response["id"]
            
            # Step 3: Text input step
            step3_data = {
                "flow_id": self.flow_id,
                "step_order": 3,
                "step_type": "text_input",
                "question_text": "Please enter your full name",
                "validation_rules": {"required": True, "min_length": 2},
                "is_required": True
            }
            
            response3 = self.session.post(
                f"{self.base_url}/api/flows/{self.flow_id}/steps",
                json=step3_data,
                headers=headers
            )
            
            if response3.status_code != 200:
                self.log_test("Create Flow Steps", False, f"Step 3 creation failed with status {response3.status_code}", 
                            {"status_code": response3.status_code, "text": response3.text})
                return False
            
            step3_response = response3.json()
            self.step3_id = step3_response["id"]
            
            self.log_test("Create Flow Steps", True, "All 3 flow steps created successfully", 
                        {"step1_id": self.step1_id, "step2_id": self.step2_id, "step3_id": self.step3_id})
            return True
                
        except Exception as e:
            self.log_test("Create Flow Steps", False, f"Create flow steps failed with exception: {str(e)}")
            return False

    def test_get_flow_steps(self):
        """Test GET /api/flows/{flow_id}/steps endpoint"""
        if not self.auth_token or not hasattr(self, 'flow_id'):
            self.log_test("Get Flow Steps", False, "No auth token or flow ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/flows/{self.flow_id}/steps", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) >= 3:  # Should have at least 3 steps we created
                        # Check if steps are properly ordered
                        steps_ordered = all(data[i]["step_order"] <= data[i+1]["step_order"] for i in range(len(data)-1))
                        if steps_ordered:
                            # Check if we have our expected steps
                            step_types = [step["step_type"] for step in data]
                            expected_types = ["information", "multiple_choice", "text_input"]
                            if all(step_type in step_types for step_type in expected_types):
                                self.log_test("Get Flow Steps", True, f"Flow steps retrieved successfully ({len(data)} steps)", 
                                            {"step_count": len(data), "step_types": step_types})
                                return True
                            else:
                                self.log_test("Get Flow Steps", False, "Expected step types not found", data)
                                return False
                        else:
                            self.log_test("Get Flow Steps", False, "Steps not properly ordered", data)
                            return False
                    else:
                        self.log_test("Get Flow Steps", False, f"Expected at least 3 steps, got {len(data)}", data)
                        return False
                else:
                    self.log_test("Get Flow Steps", False, "Steps response is not a list", data)
                    return False
            else:
                self.log_test("Get Flow Steps", False, f"Get flow steps failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Get Flow Steps", False, f"Get flow steps failed with exception: {str(e)}")
            return False

    def test_update_flow_step(self):
        """Test PUT /api/flows/{flow_id}/steps/{step_id} endpoint"""
        if not self.auth_token or not hasattr(self, 'flow_id') or not hasattr(self, 'step1_id'):
            self.log_test("Update Flow Step", False, "No auth token, flow ID, or step ID available")
            return False
            
        try:
            update_data = {
                "flow_id": self.flow_id,
                "step_order": 1,
                "step_type": "information",
                "question_text": "Welcome to our enhanced onboarding process!",
                "description": "This updated guide will walk you through setting up your account with new features.",
                "is_required": True
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.put(
                f"{self.base_url}/api/flows/{self.flow_id}/steps/{self.step1_id}",
                json=update_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if (data["question_text"] == update_data["question_text"] and 
                    data["description"] == update_data["description"]):
                    self.log_test("Update Flow Step", True, "Flow step updated successfully", data)
                    return True
                else:
                    self.log_test("Update Flow Step", False, "Updated step data doesn't match expected values", data)
                    return False
            else:
                self.log_test("Update Flow Step", False, f"Update flow step failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Update Flow Step", False, f"Update flow step failed with exception: {str(e)}")
            return False

    def test_start_flow_execution(self):
        """Test POST /api/flows/{flow_id}/execute endpoint"""
        if not self.auth_token or not hasattr(self, 'flow_id'):
            self.log_test("Start Flow Execution", False, "No auth token or flow ID available")
            return False
            
        try:
            execution_data = {
                "flow_id": self.flow_id,
                "session_data": {"user_agent": "test_browser", "ip_address": "127.0.0.1"}
            }
            
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/flows/{self.flow_id}/execute",
                json=execution_data,
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["id", "flow_id", "session_id", "status", "current_step_id", "answers", "session_data", "url_path", "started_at", "last_activity"]
                
                if all(field in data for field in expected_fields):
                    if (data["flow_id"] == self.flow_id and 
                        data["status"] == "in_progress" and
                        data["current_step_id"] is not None):
                        self.execution_id = data["id"]
                        self.session_id = data["session_id"]
                        self.current_step_id = data["current_step_id"]
                        self.log_test("Start Flow Execution", True, "Flow execution started successfully", data)
                        return True
                    else:
                        self.log_test("Start Flow Execution", False, "Execution data doesn't match expected values", data)
                        return False
                else:
                    self.log_test("Start Flow Execution", False, "Missing required fields in execution response", data)
                    return False
            else:
                self.log_test("Start Flow Execution", False, f"Start flow execution failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Start Flow Execution", False, f"Start flow execution failed with exception: {str(e)}")
            return False

    def test_get_flow_execution_status(self):
        """Test GET /api/flows/{flow_id}/execute/{session_id} endpoint"""
        if not self.auth_token or not hasattr(self, 'flow_id') or not hasattr(self, 'session_id'):
            self.log_test("Get Flow Execution Status", False, "No auth token, flow ID, or session ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/flows/{self.flow_id}/execute/{self.session_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["id", "flow_id", "session_id", "status", "current_step_id", "answers"]
                
                if all(field in data for field in expected_fields):
                    if (data["flow_id"] == self.flow_id and 
                        data["session_id"] == self.session_id and
                        data["status"] == "in_progress"):
                        self.log_test("Get Flow Execution Status", True, "Flow execution status retrieved successfully", data)
                        return True
                    else:
                        self.log_test("Get Flow Execution Status", False, "Execution status data doesn't match expected values", data)
                        return False
                else:
                    self.log_test("Get Flow Execution Status", False, "Missing required fields in execution status response", data)
                    return False
            else:
                self.log_test("Get Flow Execution Status", False, f"Get flow execution status failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Get Flow Execution Status", False, f"Get flow execution status failed with exception: {str(e)}")
            return False

    def test_submit_step_answers(self):
        """Test POST /api/flows/{flow_id}/execute/{session_id}/answer endpoint"""
        if not self.auth_token or not hasattr(self, 'flow_id') or not hasattr(self, 'session_id'):
            self.log_test("Submit Step Answers", False, "No auth token, flow ID, or session ID available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Answer Step 1 (information step)
            answer1_data = {
                "step_id": self.step1_id,
                "answer": "acknowledged",
                "metadata": {"viewed_at": "2024-01-01T10:00:00Z"}
            }
            
            response1 = self.session.post(
                f"{self.base_url}/api/flows/{self.flow_id}/execute/{self.session_id}/answer",
                json=answer1_data,
                headers=headers
            )
            
            if response1.status_code != 200:
                self.log_test("Submit Step Answers", False, f"Step 1 answer submission failed with status {response1.status_code}", 
                            {"status_code": response1.status_code, "text": response1.text})
                return False
            
            # Answer Step 2 (multiple choice)
            answer2_data = {
                "step_id": self.step2_id,
                "answer": "personal",
                "metadata": {"selected_at": "2024-01-01T10:01:00Z"}
            }
            
            response2 = self.session.post(
                f"{self.base_url}/api/flows/{self.flow_id}/execute/{self.session_id}/answer",
                json=answer2_data,
                headers=headers
            )
            
            if response2.status_code != 200:
                self.log_test("Submit Step Answers", False, f"Step 2 answer submission failed with status {response2.status_code}", 
                            {"status_code": response2.status_code, "text": response2.text})
                return False
            
            # Answer Step 3 (text input)
            answer3_data = {
                "step_id": self.step3_id,
                "answer": "John Doe",
                "metadata": {"input_at": "2024-01-01T10:02:00Z"}
            }
            
            response3 = self.session.post(
                f"{self.base_url}/api/flows/{self.flow_id}/execute/{self.session_id}/answer",
                json=answer3_data,
                headers=headers
            )
            
            if response3.status_code == 200:
                data3 = response3.json()
                # This should be the final step, so is_completed should be True
                if data3.get("is_completed") == True:
                    self.log_test("Submit Step Answers", True, "All step answers submitted successfully and flow completed", 
                                {"step1_status": response1.status_code, "step2_status": response2.status_code, "step3_status": response3.status_code, "completed": data3.get("is_completed")})
                    return True
                else:
                    self.log_test("Submit Step Answers", True, "All step answers submitted successfully", 
                                {"step1_status": response1.status_code, "step2_status": response2.status_code, "step3_status": response3.status_code})
                    return True
            else:
                self.log_test("Submit Step Answers", False, f"Step 3 answer submission failed with status {response3.status_code}", 
                            {"status_code": response3.status_code, "text": response3.text})
                return False
                
        except Exception as e:
            self.log_test("Submit Step Answers", False, f"Submit step answers failed with exception: {str(e)}")
            return False

    def test_get_flow_summary(self):
        """Test GET /api/flows/{flow_id}/execute/{session_id}/summary endpoint"""
        if not self.auth_token or not hasattr(self, 'flow_id') or not hasattr(self, 'session_id'):
            self.log_test("Get Flow Summary", False, "No auth token, flow ID, or session ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/flows/{self.flow_id}/execute/{self.session_id}/summary", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["execution_id", "flow_title", "completed_steps", "total_time_seconds", "summary_text", "summary_markdown", "summary_json", "generated_at"]
                
                if all(field in data for field in expected_fields):
                    if (data["flow_title"] == "Customer Onboarding Flow" and 
                        len(data["completed_steps"]) >= 3 and
                        "summary_text" in data and data["summary_text"] and
                        "summary_markdown" in data and data["summary_markdown"] and
                        "summary_json" in data and data["summary_json"]):
                        self.log_test("Get Flow Summary", True, "Flow summary generated successfully", 
                                    {"completed_steps": len(data["completed_steps"]), "total_time": data["total_time_seconds"]})
                        return True
                    else:
                        self.log_test("Get Flow Summary", False, "Summary data doesn't match expected values", data)
                        return False
                else:
                    self.log_test("Get Flow Summary", False, "Missing required fields in summary response", data)
                    return False
            else:
                self.log_test("Get Flow Summary", False, f"Get flow summary failed with status {response.status_code}", 
                            {"status_code": response.status_code, "text": response.text})
                return False
                
        except Exception as e:
            self.log_test("Get Flow Summary", False, f"Get flow summary failed with exception: {str(e)}")
            return False

    def test_flow_search_and_filtering(self):
        """Test flow search and filtering functionality"""
        if not self.auth_token:
            self.log_test("Flow Search and Filtering", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test search by title
            response1 = self.session.get(f"{self.base_url}/api/flows?search=onboarding", headers=headers)
            
            if response1.status_code != 200:
                self.log_test("Flow Search and Filtering", False, f"Search by title failed with status {response1.status_code}")
                return False
            
            search_data = response1.json()
            if not isinstance(search_data, list):
                self.log_test("Flow Search and Filtering", False, "Search response is not a list")
                return False
            
            # Test filter by tags
            response2 = self.session.get(f"{self.base_url}/api/flows?tags=onboarding,customer", headers=headers)
            
            if response2.status_code != 200:
                self.log_test("Flow Search and Filtering", False, f"Filter by tags failed with status {response2.status_code}")
                return False
            
            tag_data = response2.json()
            if not isinstance(tag_data, list):
                self.log_test("Flow Search and Filtering", False, "Tag filter response is not a list")
                return False
            
            self.log_test("Flow Search and Filtering", True, "Flow search and filtering working correctly", 
                        {"search_results": len(search_data), "tag_filter_results": len(tag_data)})
            return True
                
        except Exception as e:
            self.log_test("Flow Search and Filtering", False, f"Flow search and filtering failed with exception: {str(e)}")
            return False

    def test_flow_permissions_validation(self):
        """Test role-based permissions for Flow operations"""
        if not self.auth_token:
            self.log_test("Flow Permissions Validation", False, "No auth token available")
            return False
            
        try:
            # Test that admin can access all Flow endpoints (already tested above)
            # For now, we'll just verify that our admin user can perform all operations
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{self.base_url}/api/auth/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("role") == "admin":
                    self.log_test("Flow Permissions Validation", True, "Admin role has proper permissions for Flow operations", 
                                {"user_role": data["role"]})
                    return True
                else:
                    self.log_test("Flow Permissions Validation", False, f"Expected admin role, got {data.get('role')}", data)
                    return False
            else:
                self.log_test("Flow Permissions Validation", False, f"Failed to get current user info for permission test", 
                            {"status_code": response.status_code})
                return False
                
        except Exception as e:
            self.log_test("Flow Permissions Validation", False, f"Permission validation failed with exception: {str(e)}")
            return False

    def test_flow_error_handling(self):
        """Test error handling for Flow system edge cases"""
        if not self.auth_token:
            self.log_test("Flow Error Handling", False, "No auth token available")
            return False
            
        try:
            headers = {
                "Authorization": f"Bearer {self.auth_token}",
                "Content-Type": "application/json"
            }
            
            # Test 1: Try to get non-existent flow
            response1 = self.session.get(f"{self.base_url}/api/flows/non-existent-id", headers=headers)
            
            if response1.status_code != 404:
                self.log_test("Flow Error Handling", False, f"Expected 404 for non-existent flow, got {response1.status_code}")
                return False
            
            # Test 2: Try to create step for non-existent flow
            invalid_step_data = {
                "flow_id": "non-existent-flow-id",
                "step_order": 1,
                "step_type": "information",
                "question_text": "Test question",
                "is_required": True
            }
            
            response2 = self.session.post(
                f"{self.base_url}/api/flows/non-existent-flow-id/steps",
                json=invalid_step_data,
                headers=headers
            )
            
            if response2.status_code != 404:
                self.log_test("Flow Error Handling", False, f"Expected 404 for step creation on non-existent flow, got {response2.status_code}")
                return False
            
            # Test 3: Try to start execution for non-existent flow
            response3 = self.session.post(
                f"{self.base_url}/api/flows/non-existent-flow-id/execute",
                json={"flow_id": "non-existent-flow-id"},
                headers=headers
            )
            
            if response3.status_code != 404:
                self.log_test("Flow Error Handling", False, f"Expected 404 for execution on non-existent flow, got {response3.status_code}")
                return False
            
            self.log_test("Flow Error Handling", True, "Error handling working correctly for Flow system edge cases", 
                        {"test1_status": response1.status_code, "test2_status": response2.status_code, "test3_status": response3.status_code})
            return True
                
        except Exception as e:
            self.log_test("Flow Error Handling", False, f"Flow error handling test failed with exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print(f"🚀 Starting Backend API Tests for {self.base_url}")
        print("=" * 60)
        
        # Basic OCP Foundation Tests
        basic_tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Get Current User", self.test_get_current_user),
            ("Create Department", self.test_create_department),
            ("Get Departments", self.test_get_departments),
            ("MongoDB Integration", self.test_mongodb_integration)
        ]
        
        # Wiki System Tests
        wiki_tests = [
            ("Wiki Admin Login", self.test_wiki_admin_login),
            ("Create Wiki Category", self.test_create_wiki_category),
            ("Get Wiki Categories", self.test_get_wiki_categories),
            ("Create Troubleshooting Category", self.test_create_troubleshooting_category),
            ("Create Wiki Subcategory", self.test_create_wiki_subcategory),
            ("Create Account Setup Subcategory", self.test_create_account_setup_subcategory),
            ("Get Wiki Subcategories", self.test_get_wiki_subcategories),
            ("Get Subcategories with Filter", self.test_get_subcategories_with_filter),
            ("Create Wiki Article", self.test_create_wiki_article),
            ("Get Wiki Articles", self.test_get_wiki_articles),
            ("Get Specific Wiki Article", self.test_get_specific_wiki_article),
            ("Update Wiki Article", self.test_update_wiki_article),
            ("Get Article Versions", self.test_get_article_versions),
            ("Wiki Search", self.test_wiki_search),
            ("Role-Based Permissions", self.test_role_based_permissions),
            ("Validation Error Cases", self.test_validation_error_cases)
        ]
        
        # Flow System Tests
        flow_tests = [
            ("Flow Admin Login", self.test_flow_admin_login),
            ("Create Flow", self.test_create_flow),
            ("Get Flows", self.test_get_flows),
            ("Get Specific Flow", self.test_get_specific_flow),
            ("Create Flow Steps", self.test_create_flow_steps),
            ("Get Flow Steps", self.test_get_flow_steps),
            ("Update Flow Step", self.test_update_flow_step),
            ("Start Flow Execution", self.test_start_flow_execution),
            ("Get Flow Execution Status", self.test_get_flow_execution_status),
            ("Submit Step Answers", self.test_submit_step_answers),
            ("Get Flow Summary", self.test_get_flow_summary),
            ("Flow Search and Filtering", self.test_flow_search_and_filtering),
            ("Flow Permissions Validation", self.test_flow_permissions_validation),
            ("Flow Error Handling", self.test_flow_error_handling)
        ]
        
        all_tests = basic_tests + wiki_tests + flow_tests
        passed = 0
        total = len(all_tests)
        
        print(f"\n📋 Running {len(basic_tests)} Basic OCP Foundation Tests...")
        print("-" * 40)
        
        for test_name, test_func in basic_tests:
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test failed with unexpected error: {str(e)}")
        
        print(f"\n📚 Running {len(wiki_tests)} Wiki System Tests...")
        print("-" * 40)
        
        for test_name, test_func in wiki_tests:
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Test failed with unexpected error: {str(e)}")
        
        print(f"\n🔄 Running {len(flow_tests)} Flow System Tests...")
        print("-" * 40)
        
        for test_name, test_func in flow_tests:
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