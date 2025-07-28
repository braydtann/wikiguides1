#!/usr/bin/env python3
"""
Additional Backend API Security Testing
Tests role-based access control and permissions.
"""

import requests
import json

BACKEND_URL = "http://localhost:8001"

def test_role_based_permissions():
    """Test that role-based permissions are working correctly"""
    session = requests.Session()
    
    print("🔒 Testing Role-Based Access Control")
    print("=" * 50)
    
    # 1. Register a viewer user (non-admin)
    viewer_data = {
        "email": "viewer@test.com",
        "password": "viewer123",
        "full_name": "Viewer User",
        "role": "viewer"
    }
    
    response = session.post(
        f"{BACKEND_URL}/api/auth/register",
        json=viewer_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        print("✅ Viewer user registered successfully")
    else:
        print(f"❌ Failed to register viewer user: {response.status_code}")
        return False
    
    # 2. Login as viewer
    login_data = {
        "email": "viewer@test.com",
        "password": "viewer123"
    }
    
    response = session.post(
        f"{BACKEND_URL}/api/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        viewer_token = response.json()["access_token"]
        print("✅ Viewer user logged in successfully")
    else:
        print(f"❌ Failed to login viewer user: {response.status_code}")
        return False
    
    # 3. Try to create department as viewer (should fail)
    dept_data = {
        "name": "Unauthorized Department",
        "description": "This should not be created"
    }
    
    headers = {
        "Authorization": f"Bearer {viewer_token}",
        "Content-Type": "application/json"
    }
    
    response = session.post(
        f"{BACKEND_URL}/api/departments",
        json=dept_data,
        headers=headers
    )
    
    if response.status_code == 403:
        print("✅ Role-based access control working: Viewer cannot create departments")
        return True
    else:
        print(f"❌ Security issue: Viewer was able to create department (status: {response.status_code})")
        print(f"Response: {response.text}")
        return False

def test_invalid_credentials():
    """Test authentication with invalid credentials"""
    session = requests.Session()
    
    print("\n🔐 Testing Invalid Credentials")
    print("=" * 40)
    
    # Test with wrong password
    login_data = {
        "email": "admin@test.com",
        "password": "wrongpassword"
    }
    
    response = session.post(
        f"{BACKEND_URL}/api/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 401:
        print("✅ Invalid credentials properly rejected")
        return True
    else:
        print(f"❌ Security issue: Invalid credentials accepted (status: {response.status_code})")
        return False

def test_unauthorized_access():
    """Test accessing protected endpoints without token"""
    session = requests.Session()
    
    print("\n🚫 Testing Unauthorized Access")
    print("=" * 35)
    
    # Try to access /api/auth/me without token
    response = session.get(f"{BACKEND_URL}/api/auth/me")
    
    if response.status_code == 403:
        print("✅ Protected endpoint properly secured")
        return True
    else:
        print(f"❌ Security issue: Protected endpoint accessible without auth (status: {response.status_code})")
        return False

def main():
    """Run all security tests"""
    print("🛡️  Starting Backend Security Tests")
    print("=" * 60)
    
    tests = [
        ("Role-Based Permissions", test_role_based_permissions),
        ("Invalid Credentials", test_invalid_credentials),
        ("Unauthorized Access", test_unauthorized_access)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    print("\n" + "=" * 60)
    print(f"🔒 Security Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All security tests passed! Backend security is working correctly.")
        return True
    else:
        print(f"⚠️  {total - passed} security tests failed. Please review security implementation.")
        return False

if __name__ == "__main__":
    main()