"""
Car Rental System (CLI)
-------------------------
A simple console-based Car Rental System built in Python.

Features:
- View All Cars
- Rent a Car
- Return a Car
- Search for a Car
- View Rental Records
- Data is saved to a JSON file so it persists between runs.
"""

import json
import os
import re
from datetime import datetime

DATA_FILE = "car_rental_data.json"
RATE_PER_DAY = 5000  # default rental rate per day (PKR), used if a car has no custom rate


class CarRental:
    def __init__(self, data_file=DATA_FILE):
        self.data_file = data_file
        self.cars = {}
        self.rentals = []
        self.load_data()
        if not self.cars:
            self._seed_cars()

    # ---------------- Data Persistence ----------------
    def load_data(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r") as f:
                    data = json.load(f)
                    self.cars = data.get("cars", {})
                    self.rentals = data.get("rentals", [])
            except (json.JSONDecodeError, IOError):
                self.cars = {}
                self.rentals = []
        else:
            self.cars = {}
            self.rentals = []

    def save_data(self):
        with open(self.data_file, "w") as f:
            json.dump({"cars": self.cars, "rentals": self.rentals}, f, indent=4)

    def _seed_cars(self):
        # Adds a few sample cars on first run so the system isn't empty.
        sample_cars = [
            ("Toyota Corolla", 6000),
            ("Honda Civic", 7000),
            ("Suzuki Alto", 4000),
            ("Toyota Fortuner", 12000),
        ]
        for i, (model, rate) in enumerate(sample_cars, start=1):
            car_id = str(1000 + i)
            self.cars[car_id] = {
                "model": model,
                "rate_per_day": rate,
                "available": True,
            }
        self.save_data()

    # ---------------- Car Operations ----------------
    def view_all_cars(self):
        if not self.cars:
            print("No cars available in the system.")
            return
        print("\n" + "-" * 60)
        print(f"{'ID':<8}{'Model':<22}{'Rate/Day':<12}{'Status':>15}")
        print("-" * 60)
        for car_id, car in self.cars.items():
            status = "Available" if car["available"] else "Rented"
            print(f"{car_id:<8}{car['model']:<22}{car['rate_per_day']:<12}{status:>15}")
        print("-" * 60)

    def search_car(self, keyword):
        keyword = keyword.lower().strip()
        results = {cid: c for cid, c in self.cars.items() if keyword in c["model"].lower()}
        if not results:
            print("No matching cars found.")
            return {}
        print("\n" + "-" * 60)
        print(f"{'ID':<8}{'Model':<22}{'Rate/Day':<12}{'Status':>15}")
        print("-" * 60)
        for car_id, car in results.items():
            status = "Available" if car["available"] else "Rented"
            print(f"{car_id:<8}{car['model']:<22}{car['rate_per_day']:<12}{status:>15}")
        print("-" * 60)
        return results

    # ---------------- Rent / Return ----------------
    def rent_car(self, car_id, customer_name, phone, days):
        car = self._get_car(car_id)
        if not car:
            return False
        if not car["available"]:
            print("❌ This car is currently not available.")
            return False
        if not self._is_valid_phone(phone):
            print("❌ Invalid phone number. Use digits only, 10-13 characters (e.g. 03001234567).")
            return False
        if days <= 0:
            print("❌ Number of rental days must be positive.")
            return False

        total_cost = round(days * car["rate_per_day"], 2)
        car["available"] = False

        record = {
            "car_id": car_id,
            "model": car["model"],
            "customer_name": customer_name,
            "phone": phone,
            "days": days,
            "rate_per_day": car["rate_per_day"],
            "total_cost": total_cost,
            "rented_on": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "returned": False,
        }
        self.rentals.append(record)
        self.save_data()

        print(f"\n✅ Car rented successfully!")
        print(f"   Model: {car['model']}")
        print(f"   Days: {days}")
        print(f"   Total Cost: {total_cost:.2f}")
        return True

    def return_car(self, car_id):
        car = self._get_car(car_id)
        if not car:
            return False
        if car["available"]:
            print("❌ This car is not currently rented.")
            return False

        # Find the latest open rental record for this car.
        for record in reversed(self.rentals):
            if record["car_id"] == car_id and not record["returned"]:
                record["returned"] = True
                record["returned_on"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                break

        car["available"] = True
        self.save_data()
        print(f"✅ '{car['model']}' has been returned. It's now available for rent.")
        return True

    def view_rental_records(self):
        if not self.rentals:
            print("No rental records yet.")
            return
        print("\n" + "-" * 95)
        print(f"{'Model':<18}{'Customer':<18}{'Phone':<14}{'Days':<6}{'Total':<10}{'Status':>12}")
        print("-" * 95)
        for r in self.rentals:
            status = "Returned" if r["returned"] else "Active"
            print(f"{r['model']:<18}{r['customer_name']:<18}{r['phone']:<14}{r['days']:<6}{r['total_cost']:<10.2f}{status:>12}")
        print("-" * 95)

    # ---------------- Helpers ----------------
    def _get_car(self, car_id):
        car = self.cars.get(str(car_id))
        if not car:
            print(f"❌ Car ID {car_id} not found.")
        return car

    @staticmethod
    def _is_valid_phone(phone):
        return bool(re.fullmatch(r"\d{10,13}", phone))


# ---------------- Input Helpers ----------------
def get_int(prompt):
    while True:
        try:
            return int(input(prompt))
        except ValueError:
            print("Please enter a valid whole number.")


def get_nonempty(prompt):
    while True:
        value = input(prompt).strip()
        if value:
            return value
        print("This field cannot be empty.")


# ---------------- Main Menu ----------------
def main():
    rental = CarRental()

    menu = """
==========================================
         CAR RENTAL SYSTEM
==========================================
1. View All Cars
2. Rent a Car
3. Return a Car
4. Search for a Car
5. View Rental Records
6. Exit
==========================================
"""

    while True:
        print(menu)
        choice = input("Enter your choice (1-6): ").strip()

        if choice == "1":
            rental.view_all_cars()

        elif choice == "2":
            car_id = get_nonempty("Enter car ID: ")
            name = get_nonempty("Enter customer name: ")
            phone = get_nonempty("Enter phone number (digits only): ")
            days = get_int("Enter number of rental days: ")
            rental.rent_car(car_id, name, phone, days)

        elif choice == "3":
            car_id = get_nonempty("Enter car ID: ")
            rental.return_car(car_id)

        elif choice == "4":
            keyword = get_nonempty("Enter car model keyword: ")
            rental.search_car(keyword)

        elif choice == "5":
            rental.view_rental_records()

        elif choice == "6":
            print("Thank you for using the Car Rental System. Goodbye!")
            break

        else:
            print("❌ Invalid choice. Please select a number between 1 and 6.")


if __name__ == "__main__":
    main()
