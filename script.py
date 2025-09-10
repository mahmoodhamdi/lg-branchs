import requests
import json

# افتح JSON اللي فيه الفروع
with open("lg_branches.json", "r", encoding="utf-8") as f:
    branches = json.load(f)

def get_lat_lng(url):
    try:
        # نتابع التحويل (short link → full link)
        r = requests.get(url, allow_redirects=True)
        full_url = r.url
        if "/@" in full_url:
            # صيغة Google Maps URL: .../@30.12345,31.12345,...
            coords = full_url.split("/@")[1].split(",")[:2]
            return float(coords[0]), float(coords[1])
    except Exception as e:
        print("Error:", e)
    return None, None

# أضف lat/lng لكل فرع
for branch in branches:
    lat, lng = get_lat_lng(branch["maps_url"])
    branch["lat"] = lat
    branch["lng"] = lng

# خزّن الناتج في ملف جديد
with open("lg_branches_with_coords.json", "w", encoding="utf-8") as f:
    json.dump(branches, f, ensure_ascii=False, indent=2)

print("تم استخراج lat/lng وحفظها في lg_branches_with_coords.json")