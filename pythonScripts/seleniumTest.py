# import openpyxl module
import time

import openpyxl
import sys
import os
import subprocess

from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Edge()
driver.get("http://automationpractice.com/index.php")

# Declare the variables
global path
global wb_obj
global sheet_obj
global row
global column
global columnNumber
global fromRow
global toRow

# time.sleep(10)
wait = WebDriverWait(driver, 10)
# enter = input("Press Enter to Continue \n")
# print(enter)
# wait.until(EC.alert_is_present())
print("Waiting for element to be clickable")
wait.until(EC.visibility_of_element_located((By.ID, "index")))
obj = driver.find_element(By.ID, "contact-link")
obj.click()
print("Element clicked")
# alert = driver.switch_to.alert
# alert.send_keys("root" + Keys.TAB + "Bpc@12345")
# alert.accept()
