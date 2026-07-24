#Question 03:
#Smart Home Light (Methods) SIMPLE SIMPLE Ek SmartBulb class banayein jismein ek attribute state = "OFF" ho.
#Isme ek method turn_on() banayein jo state ko "ON" kar de
class SmartBulb:
    state = "OFF"

    def turn_on(self):
        self.state = "ON"
        print(f"Bulb state is now: {self.state}")

bulb = SmartBulb()
print(f"Initial state: {bulb.state}")
bulb.turn_on()
