from bs4 import BeautifulSoup
import requests

response = requests.get('https://real-website.com')
html = response.text

soup = BeautifulSoup(html, 'html.parser')

items = soup.find_all(class_='item-class-name')
for item in items:
    print(item.text)