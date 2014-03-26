"""
TODO: use django-facebook's open_facebook api instead

pythonfacebook/facebook-sdk is not stable/production-ready, I want to use django-facebook but is py2.7 only
django-facebook will separate out its open_facebook (graph-api), once separated I will make it py3, in meanwhile
I am hacking pythonfacebook/facebook-sdk

"""
import facebook

FacebookGraphAPI = facebook.GraphAPI

def make_retriable_request():
    _request = FacebookGraphAPI.request

    def retriable_request(self, *args, **kwargs):
        retries = 3
        e = None
        while retries:
            try:
                return _request(self, *args, **kwargs)
            except facebook.GraphAPIError as ex:
                e = ex
                retries -= 1
        raise facebook.GraphAPIError(e)
    return retriable_request
FacebookGraphAPI.request = make_retriable_request()


class FacebookTestUsers(FacebookGraphAPI):

    def create_test_user(self, app_id, app_access_token, **kwargs):
        """Creates test user for the app."""
        args = {'access_token': app_access_token, 'method': 'post'}
        args.update(kwargs)
        return self.request(app_id + "/accounts/test-users", args=args)

    def get_test_users(self, app_id, app_access_token, **kwargs):
        """Access all test users created for the app."""
        args = {'access_token': app_access_token}
        args.update(kwargs)
        return self.request(app_id + "/accounts/test-users", args=args)

    def edit_test_user(self, user_id, app_access_token, **kwargs):
        """Changed given test user's name or password.

        Returns True if succeed.
        """
        args = {'access_token': app_access_token, 'method': 'post'}
        args.update(kwargs)
        return self.request(user_id, args=args)

    def delete_test_user(self, user_id, access_token):
        """Deletes given test user.

        access_token = either app_access_token from get_app_access_token
                       or access_token of the test user.

        Returns True if succeed.
        """
        args = {'access_token': access_token, 'method': 'delete'}
        return self.request(user_id, args=args)

