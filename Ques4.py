#Question 04: ATM Cash Withdrawal Limit
balance=15000
amount=int(input("enter amount to withdraw:"))
if amount <= balance:
    balance = balance-amount
    print("updated balance:" , balance)
else:
    print("Insufficient Funds")
