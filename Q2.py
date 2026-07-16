#Question 02: Contact Book Phone Update (Mutability) DICTIONARIES
#Ek student contact portal par student ka mobile number change karna hai. 
# student_contact ={"Ali": "0300-1234567"} dictionary mein Ali ka contact number update karke "0300-9999999"
#karein aur check karein ke kya value change ho gayi hai.

student_contact = {"Ali": "0300-1234567"}
student_contact["Ali"] = "0300-9999999"
print(student_contact)
