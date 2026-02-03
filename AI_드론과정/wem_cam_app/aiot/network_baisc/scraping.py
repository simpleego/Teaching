from bs4 import BeautifulSoup
import requests

# 웹페이지 불러오기
response = requests.get('https://www.example.com')
html = response.text

# BeautifulSoup 객체 생성
soup = BeautifulSoup(html, 'html.parser')

# 태그를 이용한 데이터 추출
h1_tag = soup.find('h1')
print(h1_tag.text)