#Question 04: Salary Record Eraser (Pop Method)
#HR Database mein privacy maintain rakhne ke liye aapko employee ki dictionary employee =
#{"name": "Sarah", "role": "Designer", "salary": 95000} se salary key-value pair ko
#permanent delete karna hai. .pop() method ka use karke isay remove karein aur updated dictionary print karein.
employee = {"name": "Sarah", "role": "Designer", "salary": 95000}
employee.pop("salary")
print(employee)
