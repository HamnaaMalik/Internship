diameter = input("Enter pizza diameter (in inches): ")   # input hamesha STRING return karta hai
diameter = float(diameter)   # typecasting - string ko decimal number mein convert kiya

radius = diameter / 2
area = 3.14 * (radius ** 2)   # ** ka matlab "power" (square) hota hai

print(f"Pizza Area: {area} square inches")