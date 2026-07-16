#Aap ke paas do alag systems ka customer data hai: basic_info = {"name": "Hamza"} aur
#professional_info = {"role": "AI Specialist"} . .update() method ka use karte hue
#professional info ko basic info ki dictionary mein merge karein aur check karein.
basic_info = {"name": "Hamza"}
professional_info = {"role": "AI Specialist"}
basic_info.update(professional_info)
print(basic_info)