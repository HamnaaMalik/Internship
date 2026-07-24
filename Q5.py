#Question 05: Cloud Server Configuration (Class vs Instance Attributes) SIMPLE Aik Server class banayein
#  jahan class level par provider_name = "AWS" ho aur instance level par server ki ip_address ho. 
# Explain karein ke humne provider name ko class level par kyun rakha.
class Server:
    provider_name = "AWS"   # class attribute

    def __init__(self, ip_address):
        self.ip_address = ip_address   # instance attribute

server1 = Server("192.168.1.10")
server2 = Server("192.168.1.20")

print(f"{server1.provider_name} - {server1.ip_address}")
print(f"{server2.provider_name} - {server2.ip_address}")