from PIL import Image
import collections

def analyze_image(path):
    img = Image.open(path)
    img = img.convert("RGBA")
    pixels = img.getdata()
    counter = collections.Counter(pixels)
    print(f"Analysis for {path}:")
    print(f"Top 10 most common colors: {counter.most_common(10)}")
    
    # Check corners
    width, height = img.size
    corners = [
        img.getpixel((0,0)),
        img.getpixel((width-1, 0)),
        img.getpixel((0, height-1)),
        img.getpixel((width-1, height-1))
    ]
    print(f"Corner pixels: {corners}")

analyze_image("miniprogram/images/tabbar/home.png")
