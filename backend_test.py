import requests
import sys
import json
from datetime import datetime
import uuid

class BlogAPITester:
    def __init__(self, base_url="https://express-thoughts.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session = requests.Session()
        self.admin_token = None
        self.admin_user = None
        self.test_post_id = None
        self.test_comment_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_user_registration(self):
        """Test user registration - first user becomes admin"""
        test_email = f"admin_{uuid.uuid4().hex[:8]}@test.com"
        test_name = f"Admin User {datetime.now().strftime('%H%M%S')}"
        test_password = "TestPass123!"

        success, response = self.run_test(
            "User Registration (First User - Admin)",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": test_password,
                "name": test_name
            }
        )

        if success and 'user' in response:
            self.admin_user = response['user']
            self.admin_token = response.get('token')
            print(f"   Admin user created: {self.admin_user['email']}")
            print(f"   Is admin: {self.admin_user.get('is_admin', False)}")
            return True
        return False

    def test_user_login(self):
        """Test user login"""
        if not self.admin_user:
            print("❌ Cannot test login - no admin user created")
            return False

        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": self.admin_user['email'],
                "password": "TestPass123!"
            }
        )

        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Login successful, token received")
            return True
        return False

    def test_get_current_user(self):
        """Test get current user endpoint"""
        if not self.admin_token:
            print("❌ Cannot test /auth/me - no token available")
            return False

        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200,
            headers=headers
        )

        if success:
            print(f"   User: {response.get('name')} ({response.get('email')})")
            print(f"   Is admin: {response.get('is_admin', False)}")
            return True
        return False

    def test_create_post(self):
        """Test creating a blog post"""
        if not self.admin_token:
            print("❌ Cannot test post creation - no admin token")
            return False

        headers = {'Authorization': f'Bearer {self.admin_token}'}
        post_data = {
            "title": f"Test Post {datetime.now().strftime('%H%M%S')}",
            "content": "# Test Post\n\nThis is a **test post** created by the API tester.\n\n- Item 1\n- Item 2\n- Item 3",
            "preview": "This is a test post for API testing",
            "tags": ["test", "api", "automation"],
            "published": True
        }

        success, response = self.run_test(
            "Create Blog Post",
            "POST",
            "posts",
            200,
            data=post_data,
            headers=headers
        )

        if success and 'post_id' in response:
            self.test_post_id = response['post_id']
            print(f"   Post created with ID: {self.test_post_id}")
            return True
        return False

    def test_get_posts(self):
        """Test getting posts list"""
        success, response = self.run_test(
            "Get Posts List",
            "GET",
            "posts?page=1&limit=10",
            200
        )

        if success and isinstance(response, list):
            print(f"   Retrieved {len(response)} posts")
            return True
        return False

    def test_get_single_post(self):
        """Test getting a single post"""
        if not self.test_post_id:
            print("❌ Cannot test single post - no test post created")
            return False

        success, response = self.run_test(
            "Get Single Post",
            "GET",
            f"posts/{self.test_post_id}",
            200
        )

        if success and 'post_id' in response:
            print(f"   Post title: {response.get('title')}")
            print(f"   Author: {response.get('author_name')}")
            print(f"   Tags: {response.get('tags', [])}")
            return True
        return False

    def test_search_posts(self):
        """Test post search functionality"""
        success, response = self.run_test(
            "Search Posts",
            "GET",
            "posts?search=test",
            200
        )

        if success and isinstance(response, list):
            print(f"   Search returned {len(response)} posts")
            return True
        return False

    def test_create_comment(self):
        """Test creating a comment"""
        if not self.test_post_id:
            print("❌ Cannot test comment creation - no test post")
            return False

        comment_data = {
            "content": "This is a test comment created by the API tester.",
            "author_name": "Test Commenter",
            "author_email": "commenter@test.com"
        }

        success, response = self.run_test(
            "Create Comment",
            "POST",
            f"posts/{self.test_post_id}/comments",
            200,
            data=comment_data
        )

        if success and 'comment_id' in response:
            self.test_comment_id = response['comment_id']
            print(f"   Comment created with ID: {self.test_comment_id}")
            return True
        return False

    def test_get_comments(self):
        """Test getting comments for a post"""
        if not self.test_post_id:
            print("❌ Cannot test get comments - no test post")
            return False

        success, response = self.run_test(
            "Get Post Comments",
            "GET",
            f"posts/{self.test_post_id}/comments",
            200
        )

        if success and isinstance(response, list):
            print(f"   Retrieved {len(response)} comments")
            return True
        return False

    def test_get_tags(self):
        """Test getting tags"""
        success, response = self.run_test(
            "Get Tags",
            "GET",
            "tags",
            200
        )

        if success and isinstance(response, list):
            print(f"   Retrieved {len(response)} tags")
            if response:
                print(f"   Sample tags: {[tag.get('name') for tag in response[:3]]}")
            return True
        return False

    def test_update_post(self):
        """Test updating a post"""
        if not self.test_post_id or not self.admin_token:
            print("❌ Cannot test post update - missing post ID or admin token")
            return False

        headers = {'Authorization': f'Bearer {self.admin_token}'}
        update_data = {
            "title": f"Updated Test Post {datetime.now().strftime('%H%M%S')}",
            "content": "# Updated Test Post\n\nThis post has been **updated** via API.",
            "tags": ["test", "api", "updated"]
        }

        success, response = self.run_test(
            "Update Post",
            "PUT",
            f"posts/{self.test_post_id}",
            200,
            data=update_data,
            headers=headers
        )

        if success and 'post_id' in response:
            print(f"   Post updated successfully")
            return True
        return False

    def test_delete_comment(self):
        """Test deleting a comment (admin only)"""
        if not self.test_post_id or not self.test_comment_id or not self.admin_token:
            print("❌ Cannot test comment deletion - missing required data")
            return False

        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.run_test(
            "Delete Comment",
            "DELETE",
            f"posts/{self.test_post_id}/comments/{self.test_comment_id}",
            200,
            headers=headers
        )

        if success:
            print(f"   Comment deleted successfully")
            return True
        return False

    def test_delete_post(self):
        """Test deleting a post (admin only)"""
        if not self.test_post_id or not self.admin_token:
            print("❌ Cannot test post deletion - missing post ID or admin token")
            return False

        headers = {'Authorization': f'Bearer {self.admin_token}'}
        success, response = self.run_test(
            "Delete Post",
            "DELETE",
            f"posts/{self.test_post_id}",
            200,
            headers=headers
        )

        if success:
            print(f"   Post deleted successfully")
            return True
        return False

    def test_logout(self):
        """Test user logout"""
        if not self.admin_token:
            print("❌ Cannot test logout - no token available")
            return False

        success, response = self.run_test(
            "User Logout",
            "POST",
            "auth/logout",
            200
        )

        if success:
            print(f"   Logout successful")
            return True
        return False

def main():
    print("🚀 Starting Blog API Tests")
    print("=" * 50)
    
    tester = BlogAPITester()
    
    # Test sequence
    tests = [
        tester.test_root_endpoint,
        tester.test_user_registration,
        tester.test_user_login,
        tester.test_get_current_user,
        tester.test_create_post,
        tester.test_get_posts,
        tester.test_get_single_post,
        tester.test_search_posts,
        tester.test_create_comment,
        tester.test_get_comments,
        tester.test_get_tags,
        tester.test_update_post,
        tester.test_delete_comment,
        tester.test_delete_post,
        tester.test_logout
    ]
    
    # Run all tests
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())