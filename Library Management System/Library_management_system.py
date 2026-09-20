"""
Library Management System (CLI)
---------------------------------
A simple console-based Library Management System built in Python.

Features:
- Add Book
- Add Member
- Issue Book
- Return Book
- Search Book (by title/author)
- View All Books
- View All Members
- Delete Book
"""


import json
import os
from datetime import datetime

DATA_FILE = "library_data.json"


class Library:
    def __init__(self, data_file=DATA_FILE):
        self.data_file = data_file
        self.books = {}
        self.members = {}
        self.load_data()

    # ---------------- Data Persistence ----------------
    def load_data(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r") as f:
                    data = json.load(f)
                    self.books = data.get("books", {})
                    self.members = data.get("members", {})
            except (json.JSONDecodeError, IOError):
                self.books = {}
                self.members = {}
        else:
            self.books = {}
            self.members = {}

    def save_data(self):
        with open(self.data_file, "w") as f:
            json.dump({"books": self.books, "members": self.members}, f, indent=4)

    # ---------------- ID Generators ----------------
    def _next_id(self, collection, prefix_len=4):
        if not collection:
            return "1001"
        return str(max(int(k) for k in collection.keys()) + 1)

    # ---------------- Book Operations ----------------
    def add_book(self, title, author, copies):
        if copies <= 0:
            print("Number of copies must be positive.")
            return None
        book_id = self._next_id(self.books)
        self.books[book_id] = {
            "title": title,
            "author": author,
            "total_copies": copies,
            "available_copies": copies,
        }
        self.save_data()
        print(f"✅ Book added successfully! Book ID: {book_id}")
        return book_id

    def delete_book(self, book_id):
        book = self._get_book(book_id)
        if not book:
            return False
        if book["available_copies"] != book["total_copies"]:
            print("❌ Cannot delete: some copies of this book are currently issued.")
            return False
        confirm = input(f"Are you sure you want to delete '{book['title']}'? (y/n): ").strip().lower()
        if confirm == "y":
            del self.books[book_id]
            self.save_data()
            print("✅ Book deleted.")
            return True
        print("Cancelled.")
        return False

    def search_book(self, keyword):
        keyword = keyword.lower().strip()
        results = {
            bid: b for bid, b in self.books.items()
            if keyword in b["title"].lower() or keyword in b["author"].lower()
        }
        if not results:
            print("No matching books found.")
            return {}
        self._print_books(results)
        return results

    def view_all_books(self):
        if not self.books:
            print("No books in the library yet.")
            return
        self._print_books(self.books)

    def _print_books(self, books_dict):
        print("\n" + "-" * 75)
        print(f"{'ID':<8}{'Title':<25}{'Author':<20}{'Available/Total':>15}")
        print("-" * 75)
        for bid, b in books_dict.items():
            avail = f"{b['available_copies']}/{b['total_copies']}"
            print(f"{bid:<8}{b['title']:<25}{b['author']:<20}{avail:>15}")
        print("-" * 75)

    # ---------------- Member Operations ----------------
    def add_member(self, name, phone):
        member_id = self._next_id(self.members)
        self.members[member_id] = {
            "name": name,
            "phone": phone,
            "borrowed_books": [],
        }
        self.save_data()
        print(f"✅ Member added successfully! Member ID: {member_id}")
        return member_id

    def view_all_members(self):
        if not self.members:
            print("No members registered yet.")
            return
        print("\n" + "-" * 60)
        print(f"{'ID':<8}{'Name':<20}{'Phone':<15}{'Borrowed':>10}")
        print("-" * 60)
        for mid, m in self.members.items():
            print(f"{mid:<8}{m['name']:<20}{m['phone']:<15}{len(m['borrowed_books']):>10}")
        print("-" * 60)

    # ---------------- Issue / Return ----------------
    def issue_book(self, book_id, member_id):
        book = self._get_book(book_id)
        member = self._get_member(member_id)
        if not book or not member:
            return False
        if book["available_copies"] <= 0:
            print("❌ No available copies of this book right now.")
            return False
        if book_id in member["borrowed_books"]:
            print("❌ This member has already borrowed this book.")
            return False

        book["available_copies"] -= 1
        member["borrowed_books"].append(book_id)
        self.save_data()
        print(f"✅ '{book['title']}' issued to {member['name']} on {datetime.now().strftime('%Y-%m-%d')}.")
        return True

    def return_book(self, book_id, member_id):
        book = self._get_book(book_id)
        member = self._get_member(member_id)
        if not book or not member:
            return False
        if book_id not in member["borrowed_books"]:
            print("❌ This member did not borrow this book.")
            return False

        member["borrowed_books"].remove(book_id)
        book["available_copies"] += 1
        self.save_data()
        print(f"✅ '{book['title']}' returned by {member['name']}.")
        return True

    # ---------------- Helpers ----------------
    def _get_book(self, book_id):
        book = self.books.get(str(book_id))
        if not book:
            print(f"❌ Book ID {book_id} not found.")
        return book

    def _get_member(self, member_id):
        member = self.members.get(str(member_id))
        if not member:
            print(f"❌ Member ID {member_id} not found.")
        return member


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
    library = Library()

    menu = """
==========================================
      LIBRARY MANAGEMENT SYSTEM
==========================================
1. Add Book
2. Add Member
3. Issue Book
4. Return Book
5. Search Book
6. View All Books
7. View All Members
8. Delete Book
9. Exit
==========================================
"""

    while True:
        print(menu)
        choice = input("Enter your choice (1-9): ").strip()

        if choice == "1":
            title = get_nonempty("Enter book title: ")
            author = get_nonempty("Enter author name: ")
            copies = get_int("Enter number of copies: ")
            library.add_book(title, author, copies)

        elif choice == "2":
            name = get_nonempty("Enter member name: ")
            phone = get_nonempty("Enter member phone: ")
            library.add_member(name, phone)

        elif choice == "3":
            book_id = get_nonempty("Enter book ID: ")
            member_id = get_nonempty("Enter member ID: ")
            library.issue_book(book_id, member_id)

        elif choice == "4":
            book_id = get_nonempty("Enter book ID: ")
            member_id = get_nonempty("Enter member ID: ")
            library.return_book(book_id, member_id)

        elif choice == "5":
            keyword = get_nonempty("Enter title or author keyword: ")
            library.search_book(keyword)

        elif choice == "6":
            library.view_all_books()

        elif choice == "7":
            library.view_all_members()

        elif choice == "8":
            book_id = get_nonempty("Enter book ID: ")
            library.delete_book(book_id)

        elif choice == "9":
            print("Thank you for using the Library Management System. Goodbye!")
            break

        else:
            print("❌ Invalid choice. Please select a number between 1 and 9.")


if __name__ == "__main__":
    main()
