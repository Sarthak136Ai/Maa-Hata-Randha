import http.server
import socketserver
import json
import os
import mimetypes
import time
from urllib.parse import urlparse

PORT = 5500
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data.json")

def get_initial_data():
    return {
        "users": [
            { "id": "U001", "name": "Restaurant Admin", "email": "admin@restaurant.com", "password": "admin123", "role": "admin" },
            { "id": "U002", "name": "Floor Host Staff", "email": "staff@restaurant.com", "password": "staff123", "role": "staff" },
            { "id": "U003", "name": "Valued Customer", "email": "customer@restaurant.com", "password": "customer123", "role": "customer" },
            { "id": "U004", "name": "Alice Chef", "email": "chef@restaurant.com", "password": "staff123", "role": "staff", "staffRole": "Chef" },
            { "id": "U005", "name": "Bob Waiter", "email": "waiter@restaurant.com", "password": "staff123", "role": "staff", "staffRole": "Waiter" }
        ],
        "tables": [
            { "id": "T1", "number": "T1", "capacity": 2, "section": "Window Area", "shape": "square", "status": "Available", "x": 100, "y": 100 },
            { "id": "T2", "number": "T2", "capacity": 2, "section": "Window Area", "shape": "round", "status": "Available", "x": 250, "y": 100 },
            { "id": "T3", "number": "T3", "capacity": 4, "section": "Main Dining Area", "shape": "square", "status": "Available", "x": 80, "y": 220 },
            { "id": "T4", "number": "T4", "capacity": 4, "section": "Main Dining Area", "shape": "square", "status": "Available", "x": 240, "y": 220 },
            { "id": "T5", "number": "T5", "capacity": 6, "section": "Main Dining Area", "shape": "rectangle", "status": "Available", "x": 400, "y": 220 },
            { "id": "T6", "number": "T6", "capacity": 8, "section": "Main Dining Area", "shape": "rectangle", "status": "Available", "x": 550, "y": 220 },
            { "id": "T7", "number": "T7", "capacity": 2, "section": "Outdoor Seating", "shape": "round", "status": "Available", "x": 100, "y": 380 },
            { "id": "T8", "number": "T8", "capacity": 4, "section": "Outdoor Seating", "shape": "square", "status": "Available", "x": 250, "y": 380 },
            { "id": "T9", "number": "T9", "capacity": 4, "section": "VIP Section", "shape": "square", "status": "Available", "x": 450, "y": 100 },
            { "id": "T10", "number": "T10", "capacity": 6, "section": "VIP Section", "shape": "rectangle", "status": "Available", "x": 600, "y": 100 }
        ],
        "menuItems": [
            { "id": "M001", "name": "Paneer Tikka", "category": "Starters", "description": "Cottage cheese cubes marinated in spiced hung curd, bell peppers, and roasted in clay tandoor.", "price": 240, "rating": 4.8, "isVeg": True, "image": "/images/dishes/M001.jpg", "available": True },
            { "id": "M002", "name": "Crispy Spring Rolls", "category": "Starters", "description": "Golden fried rolls stuffed with crunchy julienne vegetables and glass noodles, served with sweet chilli dip.", "price": 180, "rating": 4.5, "isVeg": True, "image": "/images/dishes/M002.jpg", "available": True },
            { "id": "M003", "name": "Hara Bhara Kebab", "category": "Starters", "description": "Pan-seared spinach, green peas, and potato patties scented with royal spices and roasted cashew nuts.", "price": 210, "rating": 4.6, "isVeg": True, "image": "/images/dishes/M003.jpg", "available": True },
            { "id": "M004", "name": "Crispy Chilli Corn", "category": "Starters", "description": "Sweet corn kernels tossed with crushed black pepper, spring onion, fresh chillies, and lemon zest.", "price": 190, "rating": 4.4, "isVeg": True, "image": "/images/dishes/M004.jpg", "available": True },
            { "id": "M005", "name": "Chicken Seekh Kebab", "category": "Starters", "description": "Minced chicken skewers blended with fresh herbs, ginger, and aromatic spices grilled over charcoal embers.", "price": 290, "rating": 4.7, "isVeg": False, "image": "/images/dishes/M005.jpg", "available": True },
            { "id": "M006", "name": "Chicken Malai Tikka", "category": "Starters", "description": "Tender chicken morsels marinated in rich cream, cashew paste, cardamom, and gentle cheese glaze.", "price": 320, "rating": 4.9, "isVeg": False, "image": "/images/dishes/M006.jpg", "available": True },
            { "id": "M007", "name": "Amritsari Fish Fry", "category": "Starters", "description": "Crispy carom-spiced batter fried river sole fish fillets served with mint chutney and onion rings.", "price": 360, "rating": 4.8, "isVeg": False, "image": "/images/dishes/M007.jpg", "available": True },
            { "id": "M008", "name": "Golden Fried Prawns", "category": "Starters", "description": "Butterflied tiger prawns coated in panko breadcrumbs and fried golden crisp with garlic tartar dip.", "price": 420, "rating": 4.9, "isVeg": False, "image": "/images/dishes/M008.jpg", "available": True },
            { "id": "M009", "name": "Paneer Butter Masala", "category": "Main Course", "description": "Fresh cottage cheese simmered in a velvet-smooth buttery tomato gravy enriched with fenugreek leaves.", "price": 320, "rating": 4.8, "isVeg": True, "image": "/images/dishes/M009.jpg", "available": True },
            { "id": "M010", "name": "Dal Makhani", "category": "Main Course", "description": "Black lentils and kidney beans slow-cooked overnight with churned butter and fresh cream on charcoal tandoor.", "price": 260, "rating": 4.9, "isVeg": True, "image": "/images/dishes/M010.jpg", "available": True },
            { "id": "M011", "name": "Kadai Paneer", "category": "Main Course", "description": "Cottage cheese and crisp bell peppers stir-fried in a spicy freshly pounded coriander and red chilli gravy.", "price": 310, "rating": 4.6, "isVeg": True, "image": "/images/dishes/M011.jpg", "available": True },
            { "id": "M012", "name": "Shahi Malai Kofta", "category": "Main Course", "description": "Melt-in-mouth cottage cheese and dry-fruit dumplings in a fragrant saffron cashew nut sauce.", "price": 340, "rating": 4.7, "isVeg": True, "image": "/images/dishes/M012.jpg", "available": True },
            { "id": "M013", "name": "Butter Chicken", "category": "Main Course", "description": "Tandoori grilled chicken chunks braised in a luxurious satin tomato, butter, honey, and cream sauce.", "price": 380, "rating": 4.9, "isVeg": False, "image": "/images/dishes/M013.jpg", "available": True },
            { "id": "M014", "name": "Chicken Tikka Masala", "category": "Main Course", "description": "Charcoal roasted chicken tikka cooked in an onion-tomato spicy masala with bell peppers.", "price": 370, "rating": 4.7, "isVeg": False, "image": "/images/dishes/M014.jpg", "available": True },
            { "id": "M015", "name": "Mutton Rogan Josh", "category": "Main Course", "description": "Tender Kashmiri lamb shanks slow-simmered in aromatic fennel, ginger, and ratanjot spiced red gravy.", "price": 450, "rating": 4.9, "isVeg": False, "image": "/images/dishes/M015.jpg", "available": True },
            { "id": "M016", "name": "Garlic Butter Naan Basket", "category": "Main Course", "description": "Freshly baked tandoori leavened flatbread brushed with garlic butter and fresh coriander (3 pieces).", "price": 120, "rating": 4.7, "isVeg": True, "image": "/images/dishes/M016.jpg", "available": True },
            { "id": "M017", "name": "Hyderabadi Chicken Dum Biryani", "category": "Biryani", "description": "Aromatic long-grain basmati rice layered with spiced marinated chicken and slow-steamed in a sealed clay pot.", "price": 360, "rating": 4.9, "isVeg": False, "image": "/images/dishes/M017.jpg", "available": True },
            { "id": "M018", "name": "Royal Mutton Dum Biryani", "category": "Biryani", "description": "Prime cuts of juicy mutton slow-cooked with saffron-infused basmati rice, fried onions, and kewra essence.", "price": 440, "rating": 4.9, "isVeg": False, "image": "/images/dishes/M018.jpg", "available": True },
            { "id": "M019", "name": "Veg Dum Biryani", "category": "Biryani", "description": "Garden vegetables, paneer cubes, and fragrant basmati rice layered with mint, saffron, and roasted nuts.", "price": 280, "rating": 4.5, "isVeg": True, "image": "/images/dishes/M019.jpg", "available": True },
            { "id": "M020", "name": "Margherita Pizza (10 inch)", "category": "Fast Foods", "description": "Hand-stretched artisan crust topped with Italian San Marzano tomato sauce, fresh basil, and mozzarella cheese.", "price": 310, "rating": 4.6, "isVeg": True, "image": "/images/dishes/M020.jpg", "available": True },
            { "id": "M021", "name": "Chicken Feast Supreme Pizza", "category": "Fast Foods", "description": "Loaded with BBQ grilled chicken, spicy peri peri chicken, red onions, jalapenos, and mozzarella.", "price": 410, "rating": 4.8, "isVeg": False, "image": "/images/dishes/M021.jpg", "available": True },
            { "id": "M022", "name": "Farmhouse Veggie Pizza", "category": "Fast Foods", "description": "Loaded with mushrooms, bell peppers, sweet corn, black olives, red paprika, and mozzarella cheese.", "price": 350, "rating": 4.5, "isVeg": True, "image": "/images/dishes/M022.jpg", "available": True },
            { "id": "M023", "name": "Classic Aloo Tikki Burger", "category": "Fast Foods", "description": "Crispy spiced herb potato patty, tomato slice, crunchy lettuce, and tangy mint mayo in toasted sesame bun.", "price": 150, "rating": 4.3, "isVeg": True, "image": "/images/dishes/M023.jpg", "available": True },
            { "id": "M024", "name": "Crispy Chicken Zinger Burger", "category": "Fast Foods", "description": "Super crunchy spiced fried chicken breast fillet, melted cheddar cheese slice, coleslaw, and sriracha aioli.", "price": 240, "rating": 4.8, "isVeg": False, "image": "/images/dishes/M024.jpg", "available": True },
            { "id": "M025", "name": "Cheesy Peri Peri French Fries", "category": "Fast Foods", "description": "Crispy golden potato fries tossed in fiery African peri peri seasoning and drizzled with warm cheese sauce.", "price": 160, "rating": 4.7, "isVeg": True, "image": "/images/dishes/M025.jpg", "available": True },
            { "id": "M026", "name": "Loaded Mexican Nachos", "category": "Fast Foods", "description": "Crispy corn tortilla chips baked with cheddar cheese, refried beans, pico de gallo salsa, and sour cream.", "price": 220, "rating": 4.6, "isVeg": True, "image": "/images/dishes/M026.jpg", "available": True },
            { "id": "M027", "name": "Paneer Tikka Kathi Roll", "category": "Fast Foods", "description": "Smoky tandoori paneer cubes, crunchy onions, and green mint chutney wrapped in a flaky paratha.", "price": 190, "rating": 4.6, "isVeg": True, "image": "/images/dishes/M027.jpg", "available": True },
            { "id": "M028", "name": "Chicken Shawarma Roll", "category": "Fast Foods", "description": "Shredded rotisserie spiced chicken, pickled cucumbers, garlic toum sauce, and fries rolled in warm pita.", "price": 220, "rating": 4.8, "isVeg": False, "image": "/images/dishes/M028.jpg", "available": True },
            { "id": "M029", "name": "Molten Chocolate Lava Cake", "category": "Desserts", "description": "Warm dark chocolate sponge cake with a rich oozing molten Belgian chocolate center, served fresh.", "price": 190, "rating": 4.9, "isVeg": True, "image": "/images/dishes/M029.jpg", "available": True },
            { "id": "M030", "name": "Gulab Jamun with Ice Cream", "category": "Desserts", "description": "Warm golden milk dumplings soaked in cardamom-saffron sugar syrup served with rich vanilla bean ice cream.", "price": 150, "rating": 4.8, "isVeg": True, "image": "/images/dishes/M030.jpg", "available": True },
            { "id": "M031", "name": "Royal Rasmalai (2 Pcs)", "category": "Desserts", "description": "Soft and spongy cottage cheese patties soaked in chilled, thick cardamom and pistachio-infused saffron milk.", "price": 170, "rating": 4.9, "isVeg": True, "image": "/images/dishes/M031.jpg", "available": True },
            { "id": "M032", "name": "Sizzling Brownie with Vanilla", "category": "Desserts", "description": "Warm walnut brownie served on a hot sizzling skillet topped with vanilla ice cream and hot fudge sauce.", "price": 220, "rating": 4.9, "isVeg": True, "image": "/images/dishes/M032.jpg", "available": True },
            { "id": "M033", "name": "Fresh Lime Soda (Sweet & Salt)", "category": "Beverages", "description": "Sparkling bubbly soda mixed with freshly squeezed lime juice, mint leaves, rock salt, and ice.", "price": 95, "rating": 4.4, "isVeg": True, "image": "/images/dishes/M033.jpg", "available": True },
            { "id": "M034", "name": "Iced Caramel Macchiato", "category": "Beverages", "description": "Freshly brewed espresso poured over chilled whole milk, vanilla syrup, and drizzled with caramel sauce.", "price": 170, "rating": 4.7, "isVeg": True, "image": "/images/dishes/M034.jpg", "available": True },
            { "id": "M035", "name": "Virgin Blue Lagoon Mocktail", "category": "Beverages", "description": "Refreshing blend of blue curacao syrup, crushed ice, sprite, fresh mint leaves, and lemon wedge.", "price": 160, "rating": 4.6, "isVeg": True, "image": "/images/dishes/M035.jpg", "available": True },
            { "id": "M036", "name": "Alphonso Mango Lassi", "category": "Beverages", "description": "Traditional thick and creamy yogurt smoothie churned with sweet Alphonso mango pulp and saffron.", "price": 140, "rating": 4.9, "isVeg": True, "image": "/images/dishes/M036.jpg", "available": True },
            { "id": "M037", "name": "Oreo Chocolate Crunch Milkshake", "category": "Beverages", "description": "Thick creamy shake blended with crunchy Oreo cookies, chocolate sauce, and topped with whipped cream.", "price": 180, "rating": 4.8, "isVeg": True, "image": "/images/dishes/M037.jpg", "available": True }
        ],
        "reservations": [
            {
                "reservationId": "RES9801",
                "customerId": "U003",
                "customerName": "Valued Customer",
                "date": time.strftime("%Y-%m-%d"),
                "timeSlot": "19:00-21:00",
                "guests": 4,
                "tableId": "T3",
                "status": "Confirmed"
            }
        ],
        "orders": [
            {
                "orderId": "ORD1001",
                "customerId": "U003",
                "customerName": "Valued Customer",
                "items": [
                    { "id": "M001", "name": "Paneer Tikka", "price": 240, "qty": 1 },
                    { "id": "M004", "name": "Butter Chicken", "price": 380, "qty": 1 },
                    { "id": "M007", "name": "Chicken Dum Biryani", "price": 350, "qty": 2 }
                ],
                "orderType": "Dine-in",
                "tableId": "T3",
                "subtotal": 1320,
                "tax": 66,
                "discount": 0,
                "total": 1386,
                "status": "Served",
                "createdAt": time.strftime("%Y-%m-%dT08:00:00.000Z")
            },
            {
                "orderId": "ORD1002",
                "customerId": "U003",
                "customerName": "Valued Customer",
                "items": [
                    { "id": "M010", "name": "Margherita Pizza", "price": 300, "qty": 2 },
                    { "id": "M017", "name": "Iced Caramel Macchiato", "price": 160, "qty": 2 }
                ],
                "orderType": "Takeaway",
                "tableId": "",
                "subtotal": 920,
                "tax": 46,
                "discount": 50,
                "total": 916,
                "status": "Preparing",
                "createdAt": time.strftime("%Y-%m-%dT09:15:00.000Z")
            }
        ],
        "serviceRequests": [
            {
                "requestId": "REQ7001",
                "tableId": "T3",
                "type": "Call Waiter",
                "status": "Pending",
                "createdAt": time.strftime("%Y-%m-%dT09:20:00.000Z")
            }
        ],
        "version": 1,
        "updatedAt": time.time()
    }

def read_db():
    if not os.path.exists(DATA_FILE):
        data = get_initial_data()
        write_db(data)
        return data
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        data = get_initial_data()
        write_db(data)
        return data

def write_db(data):
    data["updatedAt"] = time.time()
    data["version"] = data.get("version", 0) + 1
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

# File watcher for auto-reload on code change
WATCH_EXTENSIONS = ('.html', '.css', '.js', '.jsx', '.json')
EXCLUDE_DIRS = ('node_modules', '.git', '.agents', '.vscode', 'dist', '__pycache__')

def get_codebase_version():
    max_mtime = 0
    try:
        for root, dirs, files in os.walk(BASE_DIR):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                if file.endswith(WATCH_EXTENSIONS) and file != "data.json":
                    fp = os.path.join(root, file)
                    try:
                        mt = os.path.getmtime(fp)
                        if mt > max_mtime:
                            max_mtime = mt
                    except Exception:
                        pass
    except Exception:
        pass
    return int(max_mtime)

LIVE_RELOAD_SNIPPET = """
<!-- Auto Live-Reload on Code Change -->
<script id="__livereload_script__">
(function() {
    let lastVer = null;
    function checkCodeChange() {
        fetch('/api/code-version')
            .then(r => r.json())
            .then(d => {
                if (lastVer !== null && d.version > lastVer) {
                    console.log('🔄 Code change detected (' + d.version + '), auto-reloading page...');
                    window.location.reload();
                }
                lastVer = d.version;
            })
            .catch(() => {});
    }
    checkCodeChange();
    setInterval(checkCodeChange, 800);
})();
</script>
</body>
"""

class RestaurantHandler(http.server.SimpleHTTPRequestHandler):
    def address_string(self):
        # Avoid reverse DNS lookup delay on Windows
        return self.client_address[0]

    def end_headers(self):
        # Enable CORS and disable caching
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        
        # Endpoint to check codebase version for auto-reload
        if parsed.path == "/api/code-version":
            ver = get_codebase_version()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"version": ver}).encode("utf-8"))
            return

        if parsed.path == "/api/data":
            data = read_db()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return
        
        # Inject live-reload snippet into HTML pages
        clean_path = parsed.path.lstrip('/')
        if clean_path == "" or clean_path == "/":
            clean_path = "index.html"
        file_path = os.path.join(BASE_DIR, clean_path.replace('/', os.sep))
        
        if os.path.isfile(file_path) and file_path.endswith('.html'):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                if '</body>' in content:
                    content = content.replace('</body>', LIVE_RELOAD_SNIPPET)
                elif '</html>' in content:
                    content = content.replace('</html>', LIVE_RELOAD_SNIPPET + '</html>')
                else:
                    content += LIVE_RELOAD_SNIPPET
                
                content_bytes = content.encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(content_bytes)))
                self.end_headers()
                self.wfile.write(content_bytes)
                return
            except Exception:
                pass

        # Default file serving
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/data" or parsed.path == "/api/sync":
            content_len = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_len).decode("utf-8")
            try:
                payload = json.loads(body)
                current_db = read_db()
                
                # Check if updating a single key or multiple keys
                if "key" in payload and "value" in payload:
                    key = payload["key"]
                    current_db[key] = payload["value"]
                elif isinstance(payload, dict):
                    for k, v in payload.items():
                        if k in ["users", "tables", "menuItems", "reservations", "orders", "serviceRequests"]:
                            current_db[k] = v
                
                write_db(current_db)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "data": current_db}).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        if parsed.path == "/api/reset":
            data = get_initial_data()
            write_db(data)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "data": data}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

if __name__ == "__main__":
    os.chdir(BASE_DIR)
    # Ensure data.json exists
    read_db()
    with ThreadingHTTPServer(("", PORT), RestaurantHandler) as httpd:
        print(f"[*] Restaurant Management Server running at http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
