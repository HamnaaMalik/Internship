#Question 15: Total Languages Counter (Set Length) 
#User portal par checked languages ki list di gayi hai: languages = ["Python", "Java",
#"Python", "C++", "Java"] . Is list ko set mein transform karein aur len() function ka use karte
#hue check karein ke customer ko kitni unique languages aati hain
languages = ["Python", "Java", "Python", "C++", "Java"]
unique_languages = set(languages)
print(len(unique_languages))
