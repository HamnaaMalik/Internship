#Question 05: E-Commerce Discount Voucher

cart_value=float(input("enter total cart value:"))
if cart_value > 5000:
    discount=cart_value*0.10
    discounted_total=cart_value - discount
    print("Discounted Total:" , discounted_total)
else:
    print("no discount aplicable")
