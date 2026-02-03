import requests

data = {'key1': 'value1', 'key2': 'value2'}
response = requests.post('http://example.com', data=data)

print('Status Code:', response.status_code)
print('Response Body:', response.text)