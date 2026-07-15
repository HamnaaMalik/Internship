#Section A:
#Conditional Statements (If-Elif-Else) Scenarios 
#Question 01: Smart Traffic Control System

light=input("Enter current light color(red/yellow/green):")
if light=="red":
    print("Stop your vehicle")
elif light=="yellow":
    print("slow down")
elif light=="green":
    print("Go")
else:
    print("Invalid input")
