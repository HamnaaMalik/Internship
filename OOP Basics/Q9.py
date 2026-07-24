#Question 09: Hotel Booking System (State Mutation) SIMPLE Ek HotelRoom class banayein jismein is_occupied = True ho.
# Ek method checkout() banayein jo is value ko update karke False kar de
class HotelRoom:
    def __init__(self):
        self.is_occupied = True

    def checkout(self):
        self.is_occupied = False
        print("Checkout complete. Room is now available.")

room101 = HotelRoom()
print("Occupied?", room101.is_occupied)
room101.checkout()
print("Occupied?", room101.is_occupied)
