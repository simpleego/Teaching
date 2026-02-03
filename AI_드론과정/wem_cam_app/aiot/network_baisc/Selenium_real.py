from selenium import webdriver

driver = webdriver.Firefox()

driver.get('https://real-website.com')

element = driver.find_element_by_css_selector('div.some-class')

print(element.text)

driver.quit()