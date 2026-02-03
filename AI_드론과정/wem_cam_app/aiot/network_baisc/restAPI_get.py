import requests

# RESTful API GET 요청
response = requests.get('https://api.github.com')

# 응답 출력
print(response.json())