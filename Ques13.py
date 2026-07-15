#Question 13: Immutable Connection Settings
#SECTION c:
server_config = ("192.168.1.1", 8080)

print("Original Config:", server_config)
server_config[1] = 9090   
 #-------------------------


#server_config = ("192.168.1.1", 8080)   

#server_config = list(server_config)     
#server_config[1] = 9090                 
#server_config = tuple(server_config)    

#print("Updated Config:", server_config)