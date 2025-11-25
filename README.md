Notes: Currently, LooBites is facing issues regarding displaying the meals from each cafeteria on our Vercel deployed domain due to anti-scraping protocols by the University of Waterloo. A fix will be found to this sooner or later, to finish the service. 

🍴 LooBites

LooBites is a platform for University of Waterloo students to check daily residence cafeteria meals, share reviews, and upload photos of their food. Our goal is to help students make better meal choices and build a community around campus dining.

🚀 MVP Features

Daily Menus

Scrape and display residence cafeteria meals for breakfast, lunch, and dinner.

Automatically refresh menus daily.

User Authentication

Sign up / log in with Google (via Supabase Auth).

Basic profile page accessible from the Navbar.

Reviews & Ratings

Students can leave reviews and rate meals (1–5 stars).

Reviews displayed alongside each food item.

Photo Uploads

Students can upload images of their meals.


Navigation

Navbar visible on all pages with links to:

Home (Daily Menus)

Residences (Dropdown for each cafeteria)

Reviews

Profile (top-right icon)

🛠️ Tech Stack

Frontend: React (UI, routing, pages)

Backend & Auth: Supabase (database + Gmail login)

Deployment: Vercel (production hosting)
