from selenium import webdriver

# WebDriver 객체 생성
driver = webdriver.Firefox()

# 웹사이트 접속
driver.get('https://www.example.com')

# 웹사이트 제목 출력
print(driver.title)

driver.quit()