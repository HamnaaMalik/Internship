#Question 05: Cloud Server Configuration (Class vs Instance Attributes) SIMPLE Aik Server class banayein jahan class level par provider_name = "AWS" ho aur instance level par server ki ip_address ho. 
# Explain karein ke humne provider name ko class level par kyun rakha

class Vehicle:
    def run_diagnostic(self):
        print("System check complete: 0 errors found.")

car = Vehicle()
car.run_diagnostic()