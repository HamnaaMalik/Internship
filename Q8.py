
#Question 08: Streaming Service Track (Parameterized Constructor) SIMPLE Ek Song class banayein jahan __init__ constructor ke zariye user naye song ka title
#  aur artist object banate waqt hi pass kar sake.
class Song:
    def __init__(self, title, artist):
        self.title = title
        self.artist = artist

song1 = Song("Blinding Lights", "The Weeknd")
print(f"Now Playing: {song1.title} by {song1.artist}")