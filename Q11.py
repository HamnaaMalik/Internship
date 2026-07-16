#Firewall protection system ke paas block access sets hain: blocked_ips = {"192.168.1.1",
#"10.0.0.1"} . Agar aik IP ko safe declare kar diya jaye, to use set se .remove() kaise karenge?
#Code likh kar update check karein.
blocked_ips = {"192.168.1.1", "10.0.0.1"}
blocked_ips.remove("10.0.0.1")
print(blocked_ips)