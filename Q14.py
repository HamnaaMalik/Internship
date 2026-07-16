#Do marketing campaigns se generate hone wali unique leads ko merge karna hai: leads_a =
#{"ali@mail.com", "sara@mail.com"} aur leads_b = {"zain@mail.com",
#"sara@mail.com"} . Set union operation perform karein taake dono data lists combine ho sakein aur
#duplicate "sara@mail.com" clean-up ho jaye.

leads_a = {"ali@mail.com", "sara@mail.com"}
leads_b = {"zain@mail.com", "sara@mail.com"}
merged = leads_a | leads_b
print(merged)