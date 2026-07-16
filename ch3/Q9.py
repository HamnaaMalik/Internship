#Aapke analytics server par dynamic IPs se requests aayi hain: traffic = ["IP-1", "IP-2",
#"IP-1", "IP-3", "IP-2"] . Is list ko set mein convert karein taake duplicate IPs khud-b-khud
#delete ho jayein aur unique IPs print ho sakein.

traffic = ["IP-1", "IP-2", "IP-1", "IP-3", "IP-2"]
unique_traffic = set(traffic)
print(unique_traffic)
