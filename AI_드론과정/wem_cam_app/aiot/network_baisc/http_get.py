import requests

# GET 요청
response = requests.get('http://example.com')

# 응답 내용 출력
print(response.text)