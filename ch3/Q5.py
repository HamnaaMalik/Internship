#Server configuration dictionary config = {"host": "localhost", "port": 8080} mein se
#port number search karna hai. .get() method ka istemal karke port check karein aur agar koi aisi key
#search ki jaye jo dictionary mein na ho (jaise "username"), to crash hone ke bajaye safety response check karein
config = {"host": "localhost", "port": 8080}
print(config.get("port"))
print(config.get("username"))
print(config.get("username", "N/A"))
