"""
Test file for HavenWelfare new features:
1. Forgot Password flow - POST /api/auth/forgot-password
2. Audit Logs - GET /api/admin/audit-logs
3. Donation Receipt - GET /api/donations/{donation_id}/receipt
4. Track donation returns donation_id for receipt download
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://havenwelfare.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "brijesh.kr.dube@gmail.com"
ADMIN_PASSWORD = "Haven@9874"


class TestForgotPassword:
    """Test Forgot Password endpoint"""
    
    def test_forgot_password_with_valid_email(self):
        """Test forgot password with a valid email format"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": ADMIN_EMAIL}
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        # Should return success message even if email exists (security)
        assert "password reset link will be sent" in data["message"].lower() or "if email exists" in data["message"].lower()
    
    def test_forgot_password_with_nonexistent_email(self):
        """Test forgot password with non-existent email - should still return success (security)"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": "nonexistent@example.com"}
        )
        # Should return 200 even for non-existent emails (security best practice)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
    
    def test_forgot_password_with_invalid_email_format(self):
        """Test forgot password with invalid email format"""
        response = requests.post(
            f"{BASE_URL}/api/auth/forgot-password",
            json={"email": "invalid-email"}
        )
        # Should return 422 for validation error
        assert response.status_code == 422


class TestAuditLogs:
    """Test Audit Logs endpoint"""
    
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
    
    def test_get_audit_logs_authenticated(self, admin_token):
        """Test getting audit logs with admin authentication"""
        response = requests.get(
            f"{BASE_URL}/api/admin/audit-logs",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # If there are logs, verify structure
        if len(data) > 0:
            log = data[0]
            assert "id" in log
            assert "action" in log
            assert "created_at" in log
            # user_email and details may be optional
    
    def test_get_audit_logs_with_limit(self, admin_token):
        """Test getting audit logs with limit parameter"""
        response = requests.get(
            f"{BASE_URL}/api/admin/audit-logs",
            params={"limit": 10},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 10
    
    def test_get_audit_logs_unauthenticated(self):
        """Test getting audit logs without authentication - should fail"""
        response = requests.get(f"{BASE_URL}/api/admin/audit-logs")
        assert response.status_code in [401, 403]
    
    def test_get_audit_logs_non_admin(self):
        """Test getting audit logs with non-admin user - should fail"""
        # First register a patient
        test_email = f"test_patient_{uuid.uuid4().hex[:8]}@example.com"
        register_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": test_email,
                "name": "Test Patient",
                "password": "TestPass123!",
                "role": "patient"
            }
        )
        
        if register_response.status_code == 200:
            # Try to login (will fail if pending approval)
            login_response = requests.post(
                f"{BASE_URL}/api/auth/login",
                json={"email": test_email, "password": "TestPass123!"}
            )
            
            if login_response.status_code == 200:
                token = login_response.json().get("token")
                response = requests.get(
                    f"{BASE_URL}/api/admin/audit-logs",
                    headers={"Authorization": f"Bearer {token}"}
                )
                assert response.status_code == 403
            else:
                # Patient is pending approval, which is expected
                pytest.skip("Patient pending approval - cannot test non-admin access")


class TestDonationReceipt:
    """Test Donation Receipt endpoint"""
    
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
    
    @pytest.fixture
    def approved_donation_id(self, admin_token):
        """Get an approved donation ID for testing"""
        response = requests.get(
            f"{BASE_URL}/api/donations",
            params={"status": "approved"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        if response.status_code == 200:
            donations = response.json()
            if len(donations) > 0:
                return donations[0]["id"]
        return None
    
    def test_get_receipt_for_approved_donation(self, admin_token, approved_donation_id):
        """Test getting receipt for an approved donation"""
        if not approved_donation_id:
            pytest.skip("No approved donations available for testing")
        
        response = requests.get(
            f"{BASE_URL}/api/donations/{approved_donation_id}/receipt"
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify receipt structure
        assert "receipt_number" in data
        assert "donation_id" in data
        assert "transaction_id" in data
        assert "amount" in data
        assert "currency" in data
        assert data["currency"] == "USD"  # Verify USD currency
        assert "donor_name" in data
        assert "patient_name" in data
        assert "donation_date" in data
        assert "status" in data
        assert data["status"] == "Approved"
        assert "organization" in data
        assert data["organization"] == "HavenWelfare"
    
    def test_get_receipt_for_nonexistent_donation(self):
        """Test getting receipt for non-existent donation"""
        fake_id = str(uuid.uuid4())
        response = requests.get(f"{BASE_URL}/api/donations/{fake_id}/receipt")
        assert response.status_code == 404
    
    def test_get_receipt_for_non_approved_donation(self, admin_token):
        """Test getting receipt for non-approved donation - should fail"""
        # Get a non-approved donation
        response = requests.get(
            f"{BASE_URL}/api/donations",
            params={"status": "submitted"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        if response.status_code == 200:
            donations = response.json()
            if len(donations) > 0:
                donation_id = donations[0]["id"]
                receipt_response = requests.get(
                    f"{BASE_URL}/api/donations/{donation_id}/receipt"
                )
                assert receipt_response.status_code == 400
                assert "approved" in receipt_response.json().get("detail", "").lower()
            else:
                pytest.skip("No submitted donations available for testing")
        else:
            pytest.skip("Could not fetch donations")


class TestTrackDonation:
    """Test Track Donation endpoint returns donation_id"""
    
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
    
    @pytest.fixture
    def existing_donation(self, admin_token):
        """Get an existing donation for testing"""
        response = requests.get(
            f"{BASE_URL}/api/donations",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        if response.status_code == 200:
            donations = response.json()
            if len(donations) > 0:
                return donations[0]
        return None
    
    def test_track_donation_returns_donation_id(self, existing_donation):
        """Test that track donation returns donation_id for receipt download"""
        if not existing_donation:
            pytest.skip("No donations available for testing")
        
        transaction_id = existing_donation["transaction_id"]
        response = requests.get(f"{BASE_URL}/api/donations/track/{transaction_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify donation_id is returned
        assert "donation_id" in data
        assert data["donation_id"] == existing_donation["id"]
        assert "transaction_id" in data
        assert "amount" in data
        assert "status" in data
    
    def test_track_nonexistent_donation(self):
        """Test tracking non-existent donation"""
        fake_transaction_id = f"FAKE_{uuid.uuid4().hex[:8]}"
        response = requests.get(f"{BASE_URL}/api/donations/track/{fake_transaction_id}")
        assert response.status_code == 404


class TestResetPassword:
    """Test Reset Password endpoint"""
    
    def test_reset_password_with_invalid_token(self):
        """Test reset password with invalid token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/reset-password",
            json={"token": "invalid_token_12345", "new_password": "NewPassword123!"}
        )
        assert response.status_code == 400
        data = response.json()
        assert "invalid" in data.get("detail", "").lower() or "expired" in data.get("detail", "").lower()


class TestHealthAndBasicEndpoints:
    """Test basic endpoints are working"""
    
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
    
    def test_public_payment_info(self):
        """Test public payment info endpoint"""
        response = requests.get(f"{BASE_URL}/api/donations/payment-info")
        assert response.status_code == 200
    
    def test_public_patients_list(self):
        """Test public patients list endpoint"""
        response = requests.get(f"{BASE_URL}/api/donations/patients")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
