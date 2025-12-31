from PIL import Image
import os

target_dir = "miniprogram/images/tabbar/"

def remove_background(path):
    print(f"Processing {path}...")
    img = Image.open(path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # Check if the pixel is light (background)
        # Threshold: if all channels are > 190
        if item[0] > 190 and item[1] > 190 and item[2] > 190:
            new_data.append((255, 255, 255, 0)) # Transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(path, "PNG")

for filename in os.listdir(target_dir):
    if filename.endswith(".png") and not filename.startswith("._"):
        remove_background(os.path.join(target_dir, filename))

print("Background removal complete.")
