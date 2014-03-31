from django_webtest import WebTest
from django.core.urlresolvers import reverse


class TestCsrfLogin(WebTest):

    def test_301_if_not_https(self):
        url = reverse('api.csrf_cookie')
        res = self.app.get(url, extra_environ={'wsgi.url_scheme': 'http'})
        self.assertEqual(res.status_code, 301)

    def test_get_csrf_cookie(self):
        url = reverse('api.csrf_cookie')
        res = self.app.get(url, extra_environ={'wsgi.url_scheme': 'https'})
        self.assertIn('csrftoken', dict(res.headers)['Set-Cookie'])
