import urllib.request
import json

KEY = "7c507d344a2d45348b2560eaa8cb6a3c"
HOST = "kcdigital.pro"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"

urls = [
    f"https://{HOST}/",
    f"https://{HOST}/portfolio.html",
    f"https://{HOST}/projects.html",
    f"https://{HOST}/contact.html",
    f"https://{HOST}/resume.html",
]

payload = json.dumps({
    "host": HOST,
    "key": KEY,
    "keyLocation": KEY_LOCATION,
    "urlList": urls,
}).encode()

req = urllib.request.Request(
    "https://api.indexnow.org/indexnow",
    data=payload,
    headers={"Content-Type": "application/json; charset=utf-8"},
    method="POST",
)

with urllib.request.urlopen(req) as res:
    print(f"Status: {res.status}")
    print(res.read().decode())
