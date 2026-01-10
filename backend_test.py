#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class HavenWelfareAPITester:
    def __init__(self, base_url="https://havenwelfare.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.doctor_token = None
        self.patient_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session = requests.Session()
        
        # Test data
        self.admin_credentials = {
            "email": "brijesh.kr.dube@gmail.com",
            "password": "Haven@9874"
        }
        
        self.test_doctor = {
            "email": f"test_doctor_{datetime.now().strftime('%H%M%S')}@test.com",
            "name": "Test Doctor",
            "password": "TestPass123!",
            "role": "doctor",
            "phone": "9876543210"
        }
        
        self.test_patient = {
            "email": f"test_patient_{datetime.now().strftime('%H%M%S')}@test.com",
            "name": "Test Patient",
            "password": "TestPass123!",
            "role": "patient",
            "phone": "9876543211"
        }

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({
                "name": name,
                "details": details,
                "response": response_data
            })
            print(f"   Details: {details}")
        
        if details:
            print(f"   {details}")

    def make_request(self, method: str, endpoint: str, data: Dict = None, 
                    token: str = None, files: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.api_url}/{endpoint.lstrip('/')}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        if files:
            headers.pop('Content-Type', None)  # Let requests set it for multipart
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url, headers=headers)
            elif method.upper() == 'POST':
                if files:
                    response = self.session.post(url, data=data, files=files, headers=headers)
                else:
                    response = self.session.post(url, json=data, headers=headers)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method.upper() == 'DELETE':
                response = self.session.delete(url, headers=headers)
            else:
                return False, {"error": "Unsupported method"}, 0
            
            try:
                response_data = response.json()
            except:
                response_data = {"text": response.text}
            
            return response.status_code < 400, response_data, response.status_code
            
        except Exception as e:
            return False, {"error": str(e)}, 0

    def test_admin_login(self):
        """Test admin login"""
        success, data, status = self.make_request(
            'POST', 'auth/login', self.admin_credentials
        )
        
        if success and 'token' in data:
            self.admin_token = data['token']
            user_data = data.get('user', {})
            if user_data.get('role') == 'admin':
                self.log_test("Admin Login", True, f"Admin user: {user_data.get('name')}")
                return True
            else:
                self.log_test("Admin Login", False, f"Expected admin role, got: {user_data.get('role')}")
        else:
            self.log_test("Admin Login", False, f"Status: {status}, Response: {data}")
        
        return False

    def test_user_registration(self):
        """Test user registration for doctor and patient"""
        # Test doctor registration
        success, data, status = self.make_request('POST', 'auth/register', self.test_doctor)
        
        if success and data.get('role') == 'doctor':
            self.log_test("Doctor Registration", True, f"Doctor registered: {data.get('name')}")
            doctor_registered = True
        else:
            self.log_test("Doctor Registration", False, f"Status: {status}, Response: {data}")
            doctor_registered = False
        
        # Test patient registration
        success, data, status = self.make_request('POST', 'auth/register', self.test_patient)
        
        if success and data.get('role') == 'patient':
            self.log_test("Patient Registration", True, f"Patient registered: {data.get('name')}")
            patient_registered = True
        else:
            self.log_test("Patient Registration", False, f"Status: {status}, Response: {data}")
            patient_registered = False
        
        return doctor_registered and patient_registered

    def test_admin_analytics(self):
        """Test admin analytics endpoint"""
        if not self.admin_token:
            self.log_test("Admin Analytics", False, "No admin token available")
            return False
        
        success, data, status = self.make_request('GET', 'admin/analytics', token=self.admin_token)
        
        if success:
            required_fields = ['total_users', 'total_doctors', 'total_patients', 'total_donations']
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                self.log_test("Admin Analytics", True, f"Analytics data retrieved successfully")
                return True
            else:
                self.log_test("Admin Analytics", False, f"Missing fields: {missing_fields}")
        else:
            self.log_test("Admin Analytics", False, f"Status: {status}, Response: {data}")
        
        return False

    def test_admin_users_management(self):
        """Test admin user management endpoints"""
        if not self.admin_token:
            self.log_test("Admin Users Management", False, "No admin token available")
            return False
        
        # Get all users
        success, data, status = self.make_request('GET', 'admin/users', token=self.admin_token)
        
        if success and isinstance(data, list):
            self.log_test("Get All Users", True, f"Retrieved {len(data)} users")
            users_retrieved = True
        else:
            self.log_test("Get All Users", False, f"Status: {status}, Response: {data}")
            users_retrieved = False
        
        return users_retrieved

    def test_rehab_centers(self):
        """Test rehab centers endpoints"""
        if not self.admin_token:
            self.log_test("Rehab Centers Test", False, "No admin token available")
            return False
        
        # Get rehab centers
        success, data, status = self.make_request('GET', 'rehab-centers', token=self.admin_token)
        
        if success:
            self.log_test("Get Rehab Centers", True, f"Retrieved {len(data) if isinstance(data, list) else 0} centers")
            
            # Test creating a rehab center
            test_center = {
                "name": "Test Rehab Center",
                "address": "123 Test Street",
                "city": "Test City",
                "state": "Test State",
                "pincode": "123456",
                "phone": "9876543210",
                "email": "test@rehab.com",
                "description": "Test rehabilitation center",
                "facilities": ["Counseling", "Medical Care"]
            }
            
            success, data, status = self.make_request('POST', 'rehab-centers', test_center, token=self.admin_token)
            
            if success and data.get('name') == test_center['name']:
                self.log_test("Create Rehab Center", True, f"Center created: {data.get('id')}")
                return True
            else:
                self.log_test("Create Rehab Center", False, f"Status: {status}, Response: {data}")
        else:
            self.log_test("Get Rehab Centers", False, f"Status: {status}, Response: {data}")
        
        return False

    def test_addiction_types(self):
        """Test addiction types endpoints"""
        if not self.admin_token:
            self.log_test("Addiction Types Test", False, "No admin token available")
            return False
        
        # Get addiction types
        success, data, status = self.make_request('GET', 'addiction-types')
        
        if success:
            self.log_test("Get Addiction Types", True, f"Retrieved {len(data) if isinstance(data, list) else 0} types")
            
            # Test creating an addiction type
            test_type = {
                "name": "Test Addiction",
                "description": "Test addiction type for testing",
                "severity_levels": ["Mild", "Moderate", "Severe"]
            }
            
            success, data, status = self.make_request('POST', 'addiction-types', test_type, token=self.admin_token)
            
            if success and data.get('name') == test_type['name']:
                self.log_test("Create Addiction Type", True, f"Type created: {data.get('id')}")
                return True
            else:
                self.log_test("Create Addiction Type", False, f"Status: {status}, Response: {data}")
        else:
            self.log_test("Get Addiction Types", False, f"Status: {status}, Response: {data}")
        
        return False

    def test_donations_endpoints(self):
        """Test donations related endpoints"""
        # Test public payment info (no auth required)
        success, data, status = self.make_request('GET', 'donations/payment-info')
        
        if success:
            self.log_test("Get Payment Info", True, "Payment info retrieved")
            payment_info_ok = True
        else:
            self.log_test("Get Payment Info", False, f"Status: {status}, Response: {data}")
            payment_info_ok = False
        
        # Test get donatable patients (no auth required)
        success, data, status = self.make_request('GET', 'donations/patients')
        
        if success:
            self.log_test("Get Donatable Patients", True, f"Retrieved {len(data) if isinstance(data, list) else 0} patients")
            patients_ok = True
        else:
            self.log_test("Get Donatable Patients", False, f"Status: {status}, Response: {data}")
            patients_ok = False
        
        # Test admin donations view
        if self.admin_token:
            success, data, status = self.make_request('GET', 'donations', token=self.admin_token)
            
            if success:
                self.log_test("Admin Get Donations", True, f"Retrieved {len(data) if isinstance(data, list) else 0} donations")
                admin_donations_ok = True
            else:
                self.log_test("Admin Get Donations", False, f"Status: {status}, Response: {data}")
                admin_donations_ok = False
        else:
            admin_donations_ok = False
        
        return payment_info_ok and patients_ok and admin_donations_ok

    def test_doctors_endpoints(self):
        """Test doctors related endpoints"""
        # Test get approved doctors (no auth required)
        success, data, status = self.make_request('GET', 'doctors')
        
        if success:
            self.log_test("Get Approved Doctors", True, f"Retrieved {len(data) if isinstance(data, list) else 0} doctors")
            return True
        else:
            self.log_test("Get Approved Doctors", False, f"Status: {status}, Response: {data}")
            return False

    def test_admin_settings(self):
        """Test admin settings endpoints"""
        if not self.admin_token:
            self.log_test("Admin Settings Test", False, "No admin token available")
            return False
        
        # Test payment settings
        success, data, status = self.make_request('GET', 'admin/payment-settings', token=self.admin_token)
        
        if success:
            self.log_test("Get Payment Settings", True, "Payment settings retrieved")
            payment_settings_ok = True
        else:
            self.log_test("Get Payment Settings", False, f"Status: {status}, Response: {data}")
            payment_settings_ok = False
        
        # Test SMTP settings
        success, data, status = self.make_request('GET', 'admin/smtp-settings', token=self.admin_token)
        
        if success:
            self.log_test("Get SMTP Settings", True, "SMTP settings retrieved")
            smtp_settings_ok = True
        else:
            self.log_test("Get SMTP Settings", False, f"Status: {status}, Response: {data}")
            smtp_settings_ok = False
        
        # Test audit logs
        success, data, status = self.make_request('GET', 'admin/audit-logs', token=self.admin_token)
        
        if success:
            self.log_test("Get Audit Logs", True, f"Retrieved {len(data) if isinstance(data, list) else 0} logs")
            audit_logs_ok = True
        else:
            self.log_test("Get Audit Logs", False, f"Status: {status}, Response: {data}")
            audit_logs_ok = False
        
        return payment_settings_ok and smtp_settings_ok and audit_logs_ok

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting HavenWelfare Backend API Tests")
        print("=" * 50)
        
        # Test admin login first (required for most tests)
        admin_login_success = self.test_admin_login()
        
        # Test user registration
        self.test_user_registration()
        
        # Test admin endpoints (require admin token)
        if admin_login_success:
            self.test_admin_analytics()
            self.test_admin_users_management()
            self.test_rehab_centers()
            self.test_addiction_types()
            self.test_admin_settings()
        
        # Test public endpoints
        self.test_donations_endpoints()
        self.test_doctors_endpoints()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests ({len(self.failed_tests)}):")
            for test in self.failed_tests:
                print(f"  - {test['name']}: {test['details']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"\n✨ Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = HavenWelfareAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except Exception as e:
        print(f"❌ Test runner failed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())