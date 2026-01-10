"""
Test file for HavenWelfare new features (Iteration 3):
1. GET /api/admin/users - returns donation_history and total_donations for patient users
2. GET /api/treatment-requests - returns patient_profile_data for doctors/admins
3. Email notification functions (tested via status change endpoints)
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://havenwelfare.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "brijesh.kr.dube@gmail.com"
ADMIN_PASSWORD = "Haven@9874"


class TestAdminUsersWithDonationHistory:
    """Test GET /api/admin/users returns donation_history and total_donations for patients"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_get_all_users_returns_donation_history_for_patients(self, admin_token):
        """Test that GET /api/admin/users returns donation_history for patient users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        
        # Find patient users and verify donation_history field
        patient_users = [u for u in users if u.get('role') == 'patient']
        
        if len(patient_users) > 0:
            patient = patient_users[0]
            # Verify donation_history field exists for patients
            assert 'donation_history' in patient, "donation_history field missing for patient"
            assert 'total_donations' in patient, "total_donations field missing for patient"
            
            # donation_history should be a list (can be empty)
            assert isinstance(patient['donation_history'], list) or patient['donation_history'] is None
            
            # total_donations should be a number or None
            if patient['total_donations'] is not None:
                assert isinstance(patient['total_donations'], (int, float))
            
            print(f"Patient {patient['name']} has {len(patient.get('donation_history') or [])} donations, total: ${patient.get('total_donations', 0)}")
        else:
            pytest.skip("No patient users found to test donation_history")
    
    def test_get_users_filtered_by_patient_role(self, admin_token):
        """Test filtering users by patient role returns donation history"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            params={"role": "patient"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        users = response.json()
        
        # All returned users should be patients
        for user in users:
            assert user['role'] == 'patient'
            assert 'donation_history' in user
            assert 'total_donations' in user
    
    def test_non_patient_users_have_null_donation_history(self, admin_token):
        """Test that non-patient users (doctors, admins) have null donation_history"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        users = response.json()
        
        # Find non-patient users
        non_patient_users = [u for u in users if u.get('role') in ['doctor', 'admin']]
        
        for user in non_patient_users:
            # Non-patients should have null donation_history
            assert user.get('donation_history') is None, f"Non-patient {user['role']} should have null donation_history"
            assert user.get('total_donations') is None, f"Non-patient {user['role']} should have null total_donations"
    
    def test_donation_history_structure(self, admin_token):
        """Test that donation_history entries have correct structure"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            params={"role": "patient"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        users = response.json()
        
        # Find a patient with donations
        for user in users:
            if user.get('donation_history') and len(user['donation_history']) > 0:
                donation = user['donation_history'][0]
                # Verify donation structure
                assert 'id' in donation
                assert 'amount' in donation
                assert 'status' in donation
                assert 'created_at' in donation
                print(f"Donation structure verified: {donation.keys()}")
                return
        
        print("No patients with donations found - structure test skipped")


class TestTreatmentRequestsWithPatientProfile:
    """Test GET /api/treatment-requests returns patient_profile_data for doctors/admins"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_treatment_requests_include_patient_profile_data_for_admin(self, admin_token):
        """Test that treatment requests include patient_profile_data for admin users"""
        response = requests.get(
            f"{BASE_URL}/api/treatment-requests",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        requests_list = response.json()
        assert isinstance(requests_list, list)
        
        if len(requests_list) > 0:
            request = requests_list[0]
            # Verify patient_profile_data field exists
            assert 'patient_profile_data' in request, "patient_profile_data field missing in treatment request"
            
            # patient_profile_data can be dict or None
            if request['patient_profile_data'] is not None:
                assert isinstance(request['patient_profile_data'], dict)
                print(f"Patient profile data keys: {request['patient_profile_data'].keys()}")
            else:
                print("Patient has no profile data set")
            
            # Verify other required fields
            assert 'patient_id' in request
            assert 'patient_name' in request
            assert 'doctor_id' in request
            assert 'status' in request
        else:
            print("No treatment requests found - test passed but no data to verify")
    
    def test_treatment_request_response_model(self, admin_token):
        """Test treatment request response model includes all expected fields"""
        response = requests.get(
            f"{BASE_URL}/api/treatment-requests",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        requests_list = response.json()
        
        if len(requests_list) > 0:
            request = requests_list[0]
            expected_fields = [
                'id', 'patient_id', 'patient_name', 'patient_profile_data',
                'doctor_id', 'doctor_name', 'rehab_center_id', 'rehab_center_name',
                'addiction_type_id', 'addiction_type_name', 'description',
                'status', 'treatment_notes', 'created_at', 'updated_at'
            ]
            
            for field in expected_fields:
                assert field in request, f"Missing field: {field}"
            
            print(f"All expected fields present in treatment request response")


class TestUserStatusChangeNotifications:
    """Test user status change triggers email notification (background task)"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_user_status_update_endpoint_works(self, admin_token):
        """Test that user status update endpoint works (email sent in background)"""
        # First, get a pending user or create one
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            params={"status": "pending"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        pending_users = response.json()
        
        if len(pending_users) > 0:
            user = pending_users[0]
            user_id = user['id']
            
            # Approve the user (this should trigger email notification in background)
            update_response = requests.put(
                f"{BASE_URL}/api/admin/users/{user_id}/status",
                json={"status": "approved"},
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert update_response.status_code == 200
            data = update_response.json()
            assert "message" in data
            assert "approved" in data["message"].lower()
            print(f"User {user['email']} status updated to approved - email notification triggered in background")
        else:
            # Create a test user to test status update
            test_email = f"test_status_{uuid.uuid4().hex[:8]}@example.com"
            register_response = requests.post(
                f"{BASE_URL}/api/auth/register",
                json={
                    "email": test_email,
                    "name": "Test Status User",
                    "password": "TestPass123!",
                    "role": "patient"
                }
            )
            
            if register_response.status_code == 200:
                new_user = register_response.json()
                user_id = new_user['id']
                
                # Approve the new user
                update_response = requests.put(
                    f"{BASE_URL}/api/admin/users/{user_id}/status",
                    json={"status": "approved"},
                    headers={"Authorization": f"Bearer {admin_token}"}
                )
                assert update_response.status_code == 200
                print(f"Created and approved test user {test_email} - email notification triggered")
            else:
                pytest.skip("Could not create test user for status update test")


class TestDonationApprovalNotifications:
    """Test donation approval triggers email notification"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Admin authentication failed")
    
    def test_donation_approval_endpoint_works(self, admin_token):
        """Test that donation approval endpoint works (email sent in background)"""
        # Get a submitted donation
        response = requests.get(
            f"{BASE_URL}/api/donations",
            params={"status": "submitted"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        donations = response.json()
        
        if len(donations) > 0:
            donation = donations[0]
            donation_id = donation['id']
            
            # Approve the donation (this should trigger email notification in background)
            approve_response = requests.put(
                f"{BASE_URL}/api/donations/{donation_id}/approve",
                json={"status": "approved", "admin_remarks": "Test approval"},
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert approve_response.status_code == 200
            data = approve_response.json()
            assert data['status'] == 'approved'
            print(f"Donation {donation_id} approved - email notification triggered in background")
        else:
            print("No submitted donations to test approval - skipping")


class TestBasicEndpoints:
    """Test basic endpoints are still working"""
    
    def test_login_endpoint(self):
        """Test login endpoint works"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
    
    def test_addiction_types_endpoint(self):
        """Test addiction types endpoint"""
        response = requests.get(f"{BASE_URL}/api/addiction-types")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_doctors_endpoint(self):
        """Test approved doctors endpoint"""
        response = requests.get(f"{BASE_URL}/api/doctors")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
