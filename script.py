import requests
import json
import re
from urllib.parse import unquote

def get_lat_lng(url):
    try:
        # فك أي short link (goo.gl / maps.app.goo.gl ...)
        r = requests.get(url, allow_redirects=True, timeout=10)
        full_url = unquote(r.url)  # نحول %2C → ,

        # 1. صيغة /@LAT,LNG
        if "/@" in full_url:
            coords = full_url.split("/@")[1].split(",")[:2]
            return float(coords[0]), float(coords[1])

        # 2. صيغة !3dLAT!4dLNG
        match = re.search(r"!3d([-0-9.]+)!4d([-0-9.]+)", full_url)
        if match:
            return float(match.group(1)), float(match.group(2))

        # 3. صيغة !8m2!3dLAT!4dLNG
        match2 = re.search(r"!8m2!3d([-0-9.]+)!4d([-0-9.]+)", full_url)
        if match2:
            return float(match2.group(1)), float(match2.group(2))

    except Exception as e:
        print("Error parsing", url, ":", e)

    return None, None


if __name__ == "__main__":
    # افتح JSON اللي فيه الفروع
    with open("lg_branches.json", "r", encoding="utf-8") as f:
        branches = json.load(f)

    # أضف lat/lng لكل فرع
    for branch in branches:
        lat, lng = get_lat_lng(branch["maps_url"])
        branch["lat"] = lat
        branch["lng"] = lng

    # خزّن الناتج في ملف جديد
    with open("lg_branches_with_coords.json", "w", encoding="utf-8") as f:
        json.dump(branches, f, ensure_ascii=False, indent=2)

    print("✅ تم استخراج lat/lng وحفظها في lg_branches_with_coords.json")
