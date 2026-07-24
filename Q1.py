#Question 01: E-Commerce Product Registry (Class & Object)
#Ek online store ke liye Product class banayein jismein name aur price ke default attributes hon. 
#Is class ke do objects (e.g., Laptop aur Smartphone) instantiate karein aur dono ki details print karein.

class Product:
    name="Unknown"
    price=0.0
    laptop=0.0
laptop=Product()
laptop.name="Laptop"
laptop.price=55000
smartphone= Product()
smartphone.name="Smartphone"
smartphone.price=25000
print(f"Product: {laptop.name}, Price: {laptop.price}")
print(f"Product: {smartphone.name}, Price: {smartphone.price}")
    