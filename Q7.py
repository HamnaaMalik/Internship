#Question 07: Database Connection Setup (Tuple Usage) SIMPLE Ek DatabaseConfig class banayein jismein host aur port ko aik tuple attribute credentials = ("localhost", 3306)
#  mein store kiya jaye taake credentials immutable rahin.
class DatabaseConfig:
    def __init__(self):
        self.credentials = ("localhost", 3306)

db = DatabaseConfig()
print(f"Host: {db.credentials[0]}, Port: {db.credentials[1]}")