# -*- coding: utf-8 -*-
"""
emails_data.py — In-world November 5, 2009 Gmail mailbox content for Brian Miller (bmiller79@gmail.com),
a 30-year-old Sacramento State (CSUS) geography grad student / part-time GIS tech living in Sacramento, CA
(provisional federal capital of the U.S. Government).

Date anchor: Thursday, November 5, 2009, ~4:30 PM PST (day after the Nov 4 Millington, TN nuclear blast).
All people/accounts are fictional; places, 2009 services, and timeline events match docs/MARKETS_2009.md,
docs/FACTIONS.md, site/wiki/usg_en.html, site/sites/flickr/fl_content.py, and site/sites/live/news.py.
"""

USER_EMAIL = "bmiller79@gmail.com"
USER_NAME = "Brian Miller"

# Custom labels with authentic 2009 Gmail label palette (bg, fg)
LABELS = [
    {"id": "Family",       "name": "Family",       "bg": "#285bac", "fg": "#ffffff"},
    {"id": "CSUS",         "name": "CSUS",         "bg": "#8e63ce", "fg": "#ffffff"},
    {"id": "Gov & Alerts", "name": "Gov & Alerts", "bg": "#cc3a21", "fg": "#ffffff"},
    {"id": "Receipts",     "name": "Receipts",     "bg": "#16a765", "fg": "#ffffff"},
    {"id": "Promo",        "name": "Promo",        "bg": "#cf8933", "fg": "#ffffff"},
]

# Rotating 2009 Web Clips (shown in the top #6694e3 bar above the toolbar, authentic to 2009 Gmail!)
WEB_CLIPS = [
    {"title": "Pacific Exchange halts trading 1 hr after 10% drop", "source": "finance.yahoo.com", "body": "Wilshire 5000 falls 9.87% in first session since Millington blast"},
    {"title": "FCC Emergency Directive 09-4A: Public Notice", "source": "www.fcc.gov", "body": "Temporary search indexing restrictions under Domestic Security Act"},
    {"title": "Wells Fargo caps Arizona ATM withdrawals at $300", "source": "reuters.com", "body": "California daily cash limit set at $500 until further notice"},
    {"title": "Costco limits rice, fuel purchases at California stores", "source": "sacbee.com", "body": "Sacramento and Fresno warehouses post per-member limits"},
    {"title": "Safely Browse the Web - Tips for spotting phishing emails", "source": "www.google.com/help", "body": "Never enter your banking PIN from an email link"},
]

# Embedded 2009 Google Talk (Chat) sidebar contacts
CHAT_CONTACTS = [
    {"name": "Dave Kowalski",    "status": "green",  "msg": "at work til 5"},
    {"name": "Kyle Ramirez",     "status": "green",  "msg": "L4D2 demo is sick"},
    {"name": "Mom",              "status": "green",  "msg": ""},
    {"name": "Rachel Morales",   "status": "orange", "msg": "Idle"},
    {"name": "Jen Miller",       "status": "orange", "msg": "Portland rain again"},
    {"name": "Mark Henderson",   "status": "green",  "msg": "Tichondrius - Horde"},
    {"name": "Uncle Ray",        "status": "gray",   "msg": "Offline"},
]

# Contextual 2009 Google AdWords ("Sponsored Links") shown in the right column of Conversation View
AD_SETS = {
    "emergency": [
        ("Honda EU2000i Generators", "Quiet inverter power in stock. Ships from Sacramento & Reno.", "www.WesternPowerEquip.com"),
        ("Emergency Water Barrels", "55-Gal FDA food-grade drums & siphon pumps. CA pickup.", "www.SierraPrepSupply.com"),
        ("NOAA Crank Weather Radios", "Eton & Grundig solar/hand-crank AM/FM/SW radios.", "www.Universal-Radio.com"),
    ],
    "wellness": [
        ("Himalayan Salt Lamps $19", "Hand-carved Pakistani rock salt lamps. Calms & purifies air.", "www.SaltGlowDirect.com"),
        ("Pure Essential Oils 40% Off", "Organic Lavender, Eucalyptus & Frankincense. Ships from CA.", "www.AromaCraftBotanicals.com"),
        ("Natural Stress Relief Tea", "Chamomile, Valerian & Lemon Balm organic loose leaf.", "www.PacificHerbals.com"),
    ],
    "finance": [
        ("Charles Schwab - San Fran", "$8.95 online equity trades. Western clearing accounts.", "www.Schwab.com"),
        ("Buy Gold Coins - Local CA", "American Eagles & Maple Leafs. Insured delivery in CA/NV.", "www.PacificBullion.com"),
        ("Compare CA Credit Unions", "Local Sacramento member-owned checking. FDIC/NCUA insured.", "www.Golden1.com"),
    ],
    "school": [
        ("Used College Textbooks", "Save up to 70% on Geography, GIS & Urban Planning books.", "www.Half.com"),
        ("ESRI ArcGIS Student Ed.", "Shapefiles, DEM rasters & tutorials for GIS coursework.", "www.ESRI.com/education"),
        ("Sacramento Student Apts", "1BR & studios near CSUS / J Street. Utilities included.", "www.SacRentals2009.com"),
    ],
    "gaming": [
        ("Left 4 Dead 2 - Pre-Order", "Out Nov 17! Save 10% on Steam or pick up at GameStop.", "store.steampowered.com"),
        ("Newegg: 500GB Hard Drives", "WD Caviar Blue & Seagate Barracuda from $52.99. CA ship.", "www.Newegg.com"),
        ("Vent & TeamSpeak Hosting", "Low-ping Los Angeles & Seattle voice servers from $4/mo.", "www.TypeFrag.com"),
    ],
    "default": [
        ("Get Gmail on Your Phone", "Fast mobile access for BlackBerry, iPhone & Android.", "m.google.com/mail"),
        ("PG&E Energy Rebates 2009", "Save on programmable thermostats & space heaters in CA.", "www.PGE.com/rebates"),
        ("Travelex Foreign Currency", "Order Canadian Dollars & Euros delivered to CA homes.", "www.Travelex.com"),
    ],
}

# Threads list. Ordered newest-first for Inbox.
# folder: "inbox" | "sent" | "drafts" | "spam" | "trash"
# Note: threads in "inbox" that also contain messages from "me" automatically appear in Sent Mail too!
# Each message:
#   sender_name, sender_email, to_str, date_full, date_short, age_str,
#   body (plain text) OR html_body (rich 2009 HTML),
#   has_blocked_images (bool — shows authentic 2009 "Images are not displayed. Display images below" bar!),
#   attachments: list of {"name": str, "size": str, "img": optional asset key, "kind": "img"|"pdf"|"doc"|"zip"}
#   mailed_by, signed_by (for "show details")
THREADS = [
    # 1 — Official County / Emergency Gov bulletin (Nov 5 afternoon)
    {
        "id": "t01",
        "folder": "inbox",
        "unread": True,
        "starred": True,
        "labels": ["Gov & Alerts"],
        "ad_cat": "emergency",
        "subject": "Advisory 09-11-05: Millington TN Incident — No Fallout Plume Expected in Sacramento Valley",
        "date_list": "4:12 pm",
        "snippet": "SACRAMENTO COUNTY OFFICE OF EMERGENCY SERVICES — Public Information Bulletin #09-114. Following the November 4 detonation near Millington, Tennessee...",
        "messages": [
            {
                "sender_name": "Sacramento County OES",
                "sender_email": "alerts@saccounty-oes.gov",
                "to_str": "Sacramento Resident Alert List <subscribers@saccounty-oes.gov>",
                "date_full": "Thu, Nov 5, 2009 at 4:12 PM",
                "age_str": "18 minutes ago",
                "mailed_by": "saccounty-oes.gov",
                "signed_by": "saccounty-oes.gov",
                "attachments": [
                    {"name": "OES_RadNet_Nov5_2009.pdf", "size": "148K", "kind": "pdf"}
                ],
                "body": """SACRAMENTO COUNTY OFFICE OF EMERGENCY SERVICES
PUBLIC INFORMATION BULLETIN #09-114
Issued: Thursday, November 5, 2009 — 16:05 PST

1. CURRENT RADIOLOGICAL STATUS: NORMAL
Following the nuclear detonation reported at 13:41 PST on November 4 near Millington, Tennessee (Shelby County), the U.S. Environmental Protection Agency RadNet western monitoring array (Sacramento, Fresno, Reno, and Bakersfield stations) continues to record normal background radiation levels (0.009 to 0.012 mR/hr).

Upper-level jet stream modeling from the National Weather Service office in Sacramento confirms prevailing west-to-east winds. NO radioactive plume or fallout deposition is projected for California, Nevada, or Arizona.

2. POTASSIUM IODIDE (KI) ADVISORY
Residents are strongly advised NOT to take potassium iodide tablets unless specifically instructed by County Health Officers. Unnecessary ingestion of KI carries medical risks, particularly for individuals with thyroid conditions. County clinics are NOT distributing KI at this time.

3. NOVEMBER RATION BOOKLET DISTRIBUTION
Zone 4 (Arden-Arcade, Carmichael, Citrus Heights, Roseville corridor) distribution of November federal fuel and staple coupon booklets remains on schedule:
  Saturday, Nov 7, 2009 — 08:00 to 14:00
  Arden-Dimick Library Parking Lot (891 Watt Ave)
  Bring valid California Driver License/ID and one current utility bill.

4. CURFEW & TRAFFIC
Nighttime curfew for the City of Sacramento (23:00–05:00) remains unchanged. Interstate 80 and Highway 50 are open to civilian traffic.

Do not reply to this automated message. For 24-hour updates tune to KFBK 1530 AM or NOAA Weather Radio 162.550 MHz.
--
Sacramento County Office of Emergency Services
3720 Dudley Blvd, McClellan Park, CA 95652""",
            }
        ],
    },

    # 2 — Family 3-message conversation thread (Mom & Brian!)
    {
        "id": "t02",
        "folder": "inbox",
        "unread": True,
        "starred": False,
        "labels": ["Family"],
        "ad_cat": "default",
        "subject": "Re: Thanksgiving + did you see the news??",
        "date_list": "3:48 pm",
        "snippet": "Okay good. Dad went to Costco on Blackstone anyway and they limited everyone to ONE 20lb bag of rice and wouldn't let him fill both gas cans...",
        "messages": [
            {
                "sender_name": "Mom",
                "sender_email": "linda.miller52@sbcglobal.net",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Wed, Nov 4, 2009 at 6:15 PM",
                "age_str": "22 hours ago",
                "mailed_by": "sbcglobal.net",
                "body": """Brian call me when you get home. Dad has CNN on and they just said another bomb went off near Memphis. I tried calling your cell twice and got the fast busy signal. Are you okay? Did they close the campus?

Mom""",
            },
            {
                "sender_name": "Brian Miller",
                "sender_email": "bmiller79@gmail.com",
                "is_me": True,
                "to_str": "Mom <linda.miller52@sbcglobal.net>",
                "date_full": "Wed, Nov 4, 2009 at 7:02 PM",
                "age_str": "21 hours ago",
                "mailed_by": "gmail.com",
                "body": """Hey mom im fine, AT&T circuits were jammed for like an hour after the news broke. Just got back to the apartment, everybody left GIS lab early anyway. Memphis is 1,800 miles away so we're fine here. Tell dad to stop buying bottled water at Save Mart, the tap water is fine.

I'll try calling the landline around 8:30.

-Brian""",
            },
            {
                "sender_name": "Mom",
                "sender_email": "linda.miller52@sbcglobal.net",
                "to_str": "Brian Miller <bmiller79@gmail.com>",
                "date_full": "Thu, Nov 5, 2009 at 3:48 PM",
                "age_str": "42 minutes ago",
                "mailed_by": "sbcglobal.net",
                "body": """Okay good, glad we talked last night. Dad went to the Costco on Blackstone this morning anyway and they limited everyone to ONE 20lb bag of rice and wouldn't let him fill both gas cans. He said the line was back past the tire center at 9:30.

Anyway, Jen emailed me from Portland this morning — she said the wait at the Red Bluff checkpoint into Jefferson is 4 hours and she's not sure her transit stamp will clear in time for Thanksgiving. If she can't make it down we'll still do dinner here in Fresno, just the three of us and maybe the Hendersons from down the street. Let me know if you need any of our tan gas coupons to get down 99, dad doesn't drive much anymore since the shop cut back to 3 days.

Also have you tried calling Aunt Carol's house lately? Your dad tried again last night just in case the lines came back up. Still nothing.

Love,
Mom

Sent from my Verizon Wireless BlackBerry""",
            },
        ],
    },

    # 3 — Casual friend email (Dave Kowalski)
    {
        "id": "t03",
        "folder": "inbox",
        "unread": True,
        "starred": False,
        "labels": [],
        "ad_cat": "gaming",
        "subject": "dude dont bother going to costco on exposition",
        "date_list": "2:55 pm",
        "snippet": "just waited 40 mins to get in the lot and they put signs on the pallets — 1 bag rice, 1 flat water, 10 gal max at the pump...",
        "messages": [
            {
                "sender_name": "Dave Kowalski",
                "sender_email": "dkowalski81@yahoo.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Thu, Nov 5, 2009 at 2:55 PM",
                "age_str": "1 hour ago",
                "mailed_by": "yahoo.com",
                "signed_by": "yahoo.com",
                "body": """hey man,

just a heads up dont bother going to the costco by cal expo today. waited 40 mins just to get into the parking lot and they already have handwritten signs taped on the pallets — 1 bag rice, 1 flat of water, 10 gal max at the gas pumps. some guy in a dodge ram almost threw punches with the receipt checker over flour lol.

half the guys from my shift left early to pull cash out after they heard wells fargo capped ATMs in arizona at $300. i hit the golden 1 ATM on fair oaks and it still spit out $400 fine though.

u still coming over tomorrow night for beers + left 4 dead or what? bring my external drive if u still have the arrested development rips on it, comcast keeps cutting out every time it drizzles.

-dave""",
            }
        ],
    },

    # 4 — Himalayan Rock Salt Lamp & Aromatherapy HTML Promo Ad (with generated photo!)
    {
        "id": "t04",
        "folder": "inbox",
        "unread": True,
        "starred": False,
        "labels": ["Promo"],
        "ad_cat": "wellness",
        "subject": "Stressed by the News? Purify Your Home Air with Genuine Himalayan Pink Rock Salt Lamps (40% OFF)",
        "date_list": "2:19 pm",
        "snippet": "HIMALAYAN GLOW DIRECT — Hand-Carved Pakistani Rock Salt Lamps + FREE Organic Lavender & Eucalyptus Essential Oil! Ships from Los Angeles...",
        "messages": [
            {
                "sender_name": "Himalayan Glow Direct",
                "sender_email": "deals@himalayanglowdirect.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Thu, Nov 5, 2009 at 2:19 PM",
                "age_str": "2 hours ago",
                "mailed_by": "mail4.himalayanglowdirect.com",
                "has_blocked_images": True,
                "html_body": """<div style="max-width:540px;border:2px solid #c87b3e;background:#fffbf2;font-family:Verdana,Arial,sans-serif;color:#3b2614;">
  <div style="background:#8a3b12;color:#fff5dc;padding:10px 14px;text-align:center;">
    <div style="font-size:18px;font-weight:bold;letter-spacing:1px;">&#10022; HIMALAYAN GLOW DIRECT &#10022;</div>
    <div style="font-size:10px;color:#ffd9a0;margin-top:2px;">Authentic Khewra Mine Pink Rock Salt &amp; Pure Aromatherapy Since 2003</div>
  </div>
  <div style="padding:14px;">
    <div style="background:#ffe8b6;border:1px dashed #b85c1b;padding:7px 10px;text-align:center;font-size:12px;font-weight:bold;color:#7a2900;margin-bottom:12px;">
      FALL CALMNESS SALE: 40% OFF ALL HIMALAYAN SALT LAMPS + FREE ESSENTIAL OIL!
    </div>
    <div style="text-align:center;margin-bottom:12px;">
      <img data-blocked-src="__IMG_promo_salt_lamp__" alt="Himalayan Pink Rock Salt Lamp and Essential Oils" width="440" height="329" style="border:1px solid #d4b08c;display:block;margin:0 auto;">
    </div>
    <p style="font-size:12px;line-height:1.5;margin:0 0 10px;">
      <b>Feeling overwhelmed by nonstop news and sleepless nights?</b> Bring warm, soothing amber light into your bedroom or office with a genuine hand-carved <b>7&ndash;10 lb Pakistani Himalayan Pink Rock Salt Lamp</b>.
    </p>
    <p style="font-size:12px;line-height:1.5;margin:0 0 10px;">
      When warmed by its 15-watt bulb, authentic Khewra Himalayan crystal salt naturally releases <b>purifying negative ions</b> that help neutralize stale indoor air, dust, allergens, and positive-ion &ldquo;electronic smog&rdquo; from televisions and computer monitors!
    </p>
    <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse:collapse;background:#fff;border:1px solid #e0c5a8;font-size:11px;margin-bottom:12px;">
      <tr style="background:#f5e4cf;font-weight:bold;">
        <td>Item</td><td align="right">Regular</td><td align="right">Sale Price</td>
      </tr>
      <tr style="border-top:1px solid #ead6be;">
        <td>Natural Crystal Himalayan Salt Lamp (7&ndash;10 lb, UL Cord)</td><td align="right" style="text-decoration:line-through;color:#888;">$44.95</td><td align="right" style="color:#b82200;font-weight:bold;">$24.95</td>
      </tr>
      <tr style="border-top:1px solid #ead6be;">
        <td>Ceramic Oil Burner + 3-Pack Aromatherapy Oils (Lavender, Eucalyptus, Peppermint)</td><td align="right" style="text-decoration:line-through;color:#888;">$32.00</td><td align="right" style="color:#b82200;font-weight:bold;">$18.95</td>
      </tr>
      <tr style="border-top:1px solid #ead6be;">
        <td><b>COMBO BUNDLE:</b> 2 Salt Lamps + Complete Aromatherapy Starter Set</td><td align="right" style="text-decoration:line-through;color:#888;">$119.90</td><td align="right" style="color:#b82200;font-weight:bold;">$59.95 + FREE Gift!</td>
      </tr>
    </table>
    <div style="text-align:center;margin:12px 0;">
      <a href="#" style="display:inline-block;background:#c44500;color:#ffffff;font-weight:bold;font-size:13px;padding:8px 20px;text-decoration:none;border:2px outset #ff8533;">ORDER NOW &mdash; USE CODE: CALM2009 &raquo;</a>
    </div>
    <p style="font-size:11px;color:#555;text-align:center;margin:8px 0 0;">
      <b>FAST WEST COAST SHIPPING:</b> All orders ship within 24 hours via UPS Ground from our <b>Torrance, CA</b> warehouse! (No East Coast carrier delays. Orders to CA, AZ, NV, OR &amp; WA arrive in 2&ndash;3 days.)
    </p>
  </div>
  <div style="background:#efe3d3;padding:8px 12px;font-size:10px;color:#666;border-top:1px solid #d9c2a6;text-align:center;">
    Himalayan Glow Direct LLC &bull; 2140 Sepulveda Blvd, Suite B, Torrance, CA 90501 &bull; Toll-Free: 1-800-555-0194<br>
    You received this email because you subscribed at HimalayanGlowDirect.com or a wellness partner site. <a href="#">Unsubscribe</a> | <a href="#">Privacy Policy</a>
  </div>
</div>""",
            }
        ],
    },

    # 5 — University professor email (CSUS Sacramento State)
    {
        "id": "t05",
        "folder": "inbox",
        "unread": True,
        "starred": False,
        "labels": ["CSUS"],
        "ad_cat": "school",
        "subject": "GEOG 109 - Lab 6 deadline moved to Monday + shapefile note",
        "date_list": "1:42 pm",
        "snippet": "Class, Because of yesterday's news and the campus power dip around 2pm, Lab 6 (Watershed Delineation) is pushed to Monday Nov 9 at 5pm...",
        "messages": [
            {
                "sender_name": "Takahashi, Hiroshi",
                "sender_email": "htakahashi@csus.edu",
                "to_str": "geog109-fall09@csus.edu",
                "date_full": "Thu, Nov 5, 2009 at 1:42 PM",
                "age_str": "2 hours ago",
                "mailed_by": "csus.edu",
                "attachments": [
                    {"name": "GEOG109_Lab6_CaSIL_Instructions.doc", "size": "42K", "kind": "doc"}
                ],
                "body": """Class,

Because of yesterday's news and the brief campus power dip around 2:15 pm, Lab 6 (Watershed Delineation in ArcGIS 9.3) is pushed back to Monday, Nov 9 at 5:00 pm. Drop your printed maps in the box outside Amador Hall 550 as usual.

Please stop emailing me about the USGS Seamless Data Server timing out. As I mentioned on the first day of class, the Reston, VA servers have been offline since March and are not coming back anytime soon. Use the California Spatial Information Library (CaSIL) mirror already cached on the lab Z:\\GEOG109\\CaSIL_DEM\\ drive instead. I attached updated instructions if you're running ArcMap on your own laptop.

Also, campus police reminded department chairs this morning that they are checking OneCards at the Guy West Bridge and J Street entrance after 6:00 pm now, so don't forget your student ID if you're staying late in the computer lab.

Office hours today 3:00-4:30 pm are still on.

--
Hiroshi Takahashi, Ph.D.
Associate Professor, Department of Geography
California State University, Sacramento
Amador Hall 553B | (916) 278-5504""",
            }
        ],
    },

    # 6 — Wells Fargo Bank push alert (ties into news.py!)
    {
        "id": "t06",
        "folder": "inbox",
        "unread": True,
        "starred": False,
        "labels": ["Receipts"],
        "ad_cat": "finance",
        "subject": "Important Notice: Temporary ATM Cash Withdrawal Limits",
        "date_list": "11:18 am",
        "snippet": "Wells Fargo Account Alert — Effective Thursday, November 5, 2009 at 9:00 a.m. PT, temporary daily ATM cash withdrawal limits are in effect...",
        "messages": [
            {
                "sender_name": "Wells Fargo Online",
                "sender_email": "alerts@notify.wellsfargo.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Thu, Nov 5, 2009 at 11:18 AM",
                "age_str": "5 hours ago",
                "mailed_by": "notify.wellsfargo.com",
                "signed_by": "notify.wellsfargo.com",
                "html_body": """<div style="max-width:520px;border:1px solid #ccc;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#222;">
  <div style="background:#cc0000;color:#fff;padding:8px 14px;border-bottom:4px solid #ffcc00;font-weight:bold;font-size:15px;">WELLS FARGO</div>
  <div style="padding:14px;line-height:1.5;">
    <p style="margin:0 0 10px;">Dear Brian Miller,</p>
    <p style="margin:0 0 10px;">Due to elevated cash withdrawal volume across western branches following yesterday's events, Wells Fargo has implemented temporary daily ATM cash withdrawal limits effective <b>Thursday, November 5, 2009 at 9:00 a.m. PT</b>:</p>
    <ul style="margin:0 0 10px;padding-left:20px;">
      <li><b>California &amp; Nevada ATMs:</b> $500.00 daily cash limit per card</li>
      <li><b>Arizona ATMs:</b> $300.00 daily cash limit per card</li>
    </ul>
    <p style="margin:0 0 10px;">Your funds remain safe and FDIC insured. <b>Check Card (debit) point-of-sale purchases, Online Bill Pay, and direct deposits are NOT affected</b> by this ATM cash limit. Larger cash withdrawals remain available inside branch lobbies with valid photo identification.</p>
    <p style="margin:0 0 10px;color:#555;font-size:11px;">Account ending in: XXXX-7194<br>Please do not reply to this automated alert. Wells Fargo will never ask for your PIN or password by email.</p>
  </div>
  <div style="background:#f3f3f3;padding:7px 14px;font-size:10px;color:#666;border-top:1px solid #ddd;">
    &copy; 2009 Wells Fargo Bank, N.A. Member FDIC. 420 Montgomery Street, San Francisco, CA 94104.
  </div>
</div>""",
            }
        ],
    },

    # 7 — THE SCARY "FORWARD OR DIE" CHAIN LETTER PRANK EMAIL (with our generated cursed_hallway.jpg!)
    {
        "id": "t07",
        "folder": "inbox",
        "unread": True,
        "starred": False,
        "labels": [],
        "ad_cat": "default",
        "subject": "FW: FW: FW: READ THIS OR CLARISSA WILL STAND BY UR BED AT 3AM (NOT A JOKE!!)",
        "date_list": "10:04 am",
        "snippet": "lol sorry bro my little sister forwarded this to everyone in my address book and now im paranoid, just pass it on idk -----Original Message-----",
        "messages": [
            {
                "sender_name": "Kyle Ramirez",
                "sender_email": "kyle_r_916@hotmail.com",
                "to_str": "bmiller79@gmail.com, dkowalski81@yahoo.com, +13 others",
                "date_full": "Thu, Nov 5, 2009 at 10:04 AM",
                "age_str": "6 hours ago",
                "mailed_by": "hotmail.com",
                "attachments": [
                    {"name": "IMG_0042.JPG", "size": "7.5K", "kind": "img", "img": "cursed_hallway"}
                ],
                "html_body": """<div style="font-family:Arial,sans-serif;font-size:12px;color:#000;line-height:1.45;">
<p style="margin:0 0 10px;">lol sorry bro my little sister forwarded this to everyone in my address book and now im paranoid, with the way 2009 is going im not taking any chances lmao just pass it on</p>
<p style="margin:0 0 10px;">-kyle</p>
<div style="border-left:2px solid #999;padding-left:10px;color:#333;margin-top:8px;">
<div style="font-size:11px;color:#666;margin-bottom:6px;">
-----Original Message-----<br>
From: ashley_rose_sac@hotmail.com<br>
Sent: Wednesday, November 04, 2009 11:47 PM<br>
To: kyle_r_916@hotmail.com; xX_bAbYgIrL94_Xx@aim.com; +18 others<br>
Subject: FW: FW: READ THIS OR CLARISSA WILL STAND BY UR BED AT 3AM (NOT A JOKE!!)
</div>
<div style="border-left:2px solid #bbb;padding-left:8px;">
<div style="font-size:11px;color:#666;margin-bottom:6px;">
&gt; From: tyler.b.2009@yahoo.com<br>
&gt; Date: Tue, Nov 3, 2009 at 10:19 PM<br>
&gt; Subject: FW: READ THIS OR CLARISSA WILL STAND BY UR BED AT 3AM (NOT A JOKE!!)<br>
&gt;<br>
&gt; omg dont delete this im serious my friend jenna got a call from a blocked number at 3am right after she closed it!!
</div>
<div style="background:#0a0a0a;color:#e8e8e8;padding:12px 14px;border:2px solid #880000;font-family:'Times New Roman',Georgia,serif;">
  <div style="color:#ff1e1e;font-size:16px;font-weight:bold;text-align:center;letter-spacing:1px;margin-bottom:8px;">
    *** DO NOT DELETE THIS EMAIL — IT IS ALREADY TOO LATE ***
  </div>
  <p style="font-size:13px;line-height:1.5;margin:0 0 8px;">
    MY NAME IS <b>CLARISSA</b>. IN NOVEMBER 1998 I WAS 13 YEARS OLD AND LOCKED IN THE BASEMENT HALLWAY OF MY HOUSE IN DAYTON, OHIO. NOBODY EVER CAME TO OPEN THE DOOR.
  </p>
  <p style="font-size:13px;line-height:1.5;margin:0 0 8px;color:#ff8080;">
    BECAUSE YOU OPENED THIS MESSAGE, <b>TONIGHT AT 3:00 AM</b> YOU WILL HEAR THREE SOFT KNOCKS ON YOUR BEDROOM DOOR. DO NOT LOOK IN THE HALLWAY. SHE WILL STAND AT THE FOOT OF YOUR BED WITH NO EYES AND WHISPER YOUR NAME.
  </p>
  <p style="font-size:12px;line-height:1.45;margin:0 0 8px;color:#cccccc;">
    THE ONLY WAY TO STOP HER IS TO <span style="color:#ffff00;font-weight:bold;text-decoration:underline;">FORWARD THIS EMAIL TO 15 PEOPLE WITHIN 10 MINUTES</span> OF READING IT. DO NOT SEND IT BACK TO THE PERSON WHO SENT IT TO YOU — IT WILL NOT COUNT!!
  </p>
  <p style="font-size:12px;line-height:1.45;margin:0 0 8px;">
    <b>THIS IS 100% REAL!! LOOK AT WHAT HAPPENED:</b><br>
    &bull; <i>Jason M. from Bakersfield</i> laughed and hit Delete. Two mornings later he broke both legs falling down his porch stairs.<br>
    &bull; <i>Heather K. from Modesto</i> only sent it to 6 people. At 3:04 AM her closet door opened by itself and her dog wouldn't stop barking at the empty corner for a week.<br>
    &bull; <i>Devon R. from San Jose</i> forwarded it to 15 people in 4 minutes — the next day he found $40 on the sidewalk and passed his midterm!!
  </p>
  <p style="font-size:12px;color:#ff3333;font-weight:bold;text-align:center;margin:10px 0 4px;">
    LOOK AT THE ATTACHED PHOTO TAKEN BY THE LAST GUY WHO BROKE THE CHAIN (IMG_0042.JPG) — ZOOM IN ON THE DOORWAY...
  </p>
  <div style="text-align:center;font-size:14px;color:#ffff00;font-weight:bold;margin-top:8px;">
    SEND TO 15 PEOPLE NOW OR YOU WILL DIE IN 7 DAYS!!!!
  </div>
</div>
</div>
</div>
<div style="margin-top:10px;font-size:11px;color:#666;">_________________________________________________________________<br>Windows Live&trade; Hotmail&reg;: Your friends can get your Facebook updates, right from Hotmail&reg;.</div>
</div>""",
            }
        ],
    },

    # 8 — Facebook 2009 notification email
    {
        "id": "t08",
        "folder": "inbox",
        "unread": True,
        "starred": False,
        "labels": [],
        "ad_cat": "default",
        "subject": "Rachel Morales commented on your status.",
        "date_list": "9:31 am",
        "snippet": "Rachel commented on your status: 'yeah mine too, and my sister in Mesa said the Wells Fargo ATM line was out to the street this morning...'",
        "messages": [
            {
                "sender_name": "Facebook",
                "sender_email": "notification+zq8v2k@facebookmail.com",
                "to_str": "Brian Miller <bmiller79@gmail.com>",
                "date_full": "Thu, Nov 5, 2009 at 9:31 AM",
                "age_str": "7 hours ago",
                "mailed_by": "facebookmail.com",
                "signed_by": "facebookmail.com",
                "html_body": """<div style="max-width:520px;border:1px solid #d8dfea;font-family:'Lucida Grande',Tahoma,Verdana,Arial,sans-serif;font-size:12px;color:#333;">
  <div style="background:#3b5998;color:#fff;padding:6px 12px;font-weight:bold;font-size:15px;letter-spacing:-0.3px;">facebook</div>
  <div style="padding:14px;background:#fff;line-height:1.5;">
    <p style="margin:0 0 10px;">Hi Brian,</p>
    <p style="margin:0 0 8px;"><b>Rachel Morales</b> commented on your status.</p>
    <div style="background:#f7f7f7;border-top:1px solid #d8dfea;border-bottom:1px solid #d8dfea;padding:8px 10px;margin:8px 0 12px;">
      <div style="color:#666;font-size:11px;margin-bottom:4px;">Your status: &ldquo;anyone else's Comcast dropping every 20 minutes since last night?&rdquo;</div>
      <b>Rachel Morales</b> wrote:<br>
      &ldquo;yeah mine too, and my sister in Mesa said the Wells Fargo ATM line was out to the street this morning. also my cousin said Costco on Arden was a madhouse. stay safe brian&rdquo;
    </div>
    <p style="margin:0 0 10px;">To see the comment thread, follow the link below:<br>
    <a href="#">http://www.facebook.com/n/?profile.php&amp;id=614820912&amp;story_fbid=174920381412</a></p>
    <p style="margin:0;color:#777;font-size:11px;">Thanks,<br>The Facebook Team</p>
  </div>
  <div style="background:#f2f2f2;padding:8px 12px;font-size:10px;color:#888;border-top:1px solid #e2e2e2;">
    This message was intended for bmiller79@gmail.com. Want to control which emails you receive from Facebook? Go to: <a href="#">http://www.facebook.com/editaccount.php?notifications</a><br>
    Facebook's offices are located at 1601 S. California Ave., Palo Alto, CA 94304.
  </div>
</div>""",
            }
        ],
    },

    # 9 — FCC Emergency Directive 09-4A notice (cross-references the yellow Google homepage banner!)
    {
        "id": "t09",
        "folder": "inbox",
        "unread": True,
        "starred": False,
        "labels": ["Gov & Alerts"],
        "ad_cat": "emergency",
        "subject": "Public Advisory: FCC Emergency Directive 09-4A & Search Indexing",
        "date_list": "8:05 am",
        "snippet": "FEDERAL COMMUNICATIONS COMMISSION — Provisional Field Office, Sacramento, CA. Notice regarding search engine indexing notices under Directive 09-4A...",
        "messages": [
            {
                "sender_name": "FCC Public Affairs",
                "sender_email": "public-notice@fcc-sac.gov",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Thu, Nov 5, 2009 at 8:05 AM",
                "age_str": "8 hours ago",
                "mailed_by": "fcc-sac.gov",
                "signed_by": "fcc-sac.gov",
                "attachments": [
                    {"name": "FCC_Directive_09-4A_FAQ.pdf", "size": "86K", "kind": "pdf"}
                ],
                "body": """FEDERAL COMMUNICATIONS COMMISSION
Provisional Western Field Office — 501 I Street, Sacramento, CA 95814

PUBLIC ADVISORY — EMERGENCY DIRECTIVE 09-4A (DOMESTIC SECURITY & COMMUNICATIONS ACT)

You are receiving this notice because your address is registered on the FCC Consumer & Civilian Communications Bulletin list.

In response to public inquiries following yesterday's incident in Tennessee:

1. Search engine notices displayed on Google.com and other U.S.-operated portals pursuant to Emergency Directive 09-4A (issued September 22, 2009) remain in effect. Indexing of certain domestic infrastructure schematics, military convoy frequencies, and unverified casualty rosters remains suspended by federal order.

2. Personal electronic mail, civilian banking, educational networks, and routine domestic browsing are NOT suspended under Directive 09-4A.

3. Amateur radio operators (FCC Part 97 licensees) and online forum administrators are reminded that transmitting or republishing real-time locations of National Guard checkpoints, federal airlift flights, or utility substation damage is prohibited under federal emergency regulations.

For the full text of Directive 09-4A and citizen obligations, see the attached FAQ or visit http://www.fcc.gov/emergency09-4a/.""",
            }
        ],
    },

    # 10 — PG&E Utility Bill Push Email
    {
        "id": "t10",
        "folder": "inbox",
        "unread": True,
        "starred": False,
        "labels": ["Receipts"],
        "ad_cat": "default",
        "subject": "Your PG&E Paperless Statement is Ready - Account ending in 4821",
        "date_list": "6:12 am",
        "snippet": "Total Amount Due: $142.87 | Due Date: November 24, 2009. Stage 2 Conservation Advisory remains in effect for Sacramento and Placer counties...",
        "messages": [
            {
                "sender_name": "Pacific Gas and Electric",
                "sender_email": "ebills@pge.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Thu, Nov 5, 2009 at 6:12 AM",
                "age_str": "10 hours ago",
                "mailed_by": "pge.com",
                "html_body": """<div style="max-width:500px;border:1px solid #b8c9d9;font-family:Arial,sans-serif;font-size:12px;color:#222;">
  <div style="background:#005a9c;color:#fff;padding:8px 12px;font-weight:bold;font-size:14px;">PG&amp;E &mdash; Pacific Gas and Electric Company</div>
  <div style="padding:12px;line-height:1.5;">
    <p style="margin:0 0 10px;">Hello Brian Miller,</p>
    <p style="margin:0 0 10px;">Your October 2009 gas and electric statement is now available online.</p>
    <table cellpadding="5" cellspacing="0" width="100%" style="background:#f4f8fc;border:1px solid #cfdce8;font-size:12px;margin-bottom:10px;">
      <tr><td><b>Account Number:</b></td><td>XXXX-XXXX-4821</td></tr>
      <tr><td><b>Service Address:</b></td><td>2418 Fulton Ave, Apt 204, Sacramento, CA</td></tr>
      <tr><td><b>Statement Date:</b></td><td>November 4, 2009</td></tr>
      <tr><td><b>Total Amount Due:</b></td><td><b style="color:#005a9c;">$142.87</b></td></tr>
      <tr><td><b>Payment Due Date:</b></td><td>November 24, 2009</td></tr>
    </table>
    <div style="background:#fff9dc;border:1px solid #e6d17a;padding:7px 9px;font-size:11px;margin-bottom:10px;">
      <b>Grid Conservation Notice:</b> A Stage 2 Conservation Advisory remains in effect for Sacramento and Placer counties due to reduced out-of-state transmission imports. Please limit electric space heaters and laundry appliances between 4:00 PM and 8:00 PM. Rotating outages are <b>not</b> currently scheduled for Rotating Outage Block 14B.
    </div>
    <p style="margin:0;font-size:11px;color:#555;"><a href="#">Sign in to My Energy</a> to view your full PDF statement or schedule a payment.</p>
  </div>
</div>""",
            }
        ],
    },

    # 11 — Second Aromatherapy & Himalayan Salt Promo Ad (with promo_aromatherapy.jpg!)
    {
        "id": "t11",
        "folder": "inbox",
        "unread": True,
        "starred": False,
        "labels": ["Promo"],
        "ad_cat": "wellness",
        "subject": "Breathe Easy Tonight: 30% Off Aromatherapy Essential Oils, Incense & Himalayan Bath Salts",
        "date_list": "Nov 4",
        "snippet": "SERENITY BOTANICALS — Santa Cruz, CA. Melt Away Tension Naturally with Organic Lavender, Sandalwood, Eucalyptus & Pink Himalayan Bath Soaks...",
        "messages": [
            {
                "sender_name": "Serenity Botanicals",
                "sender_email": "newsletter@serenitybotanicals.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Wed, Nov 4, 2009 at 9:44 PM",
                "age_str": "19 hours ago",
                "mailed_by": "list.serenitybotanicals.com",
                "has_blocked_images": True,
                "html_body": """<div style="max-width:520px;border:1px solid #8aa07a;background:#fafbf7;font-family:Georgia,'Times New Roman',serif;color:#2f3a28;">
  <div style="background:#4b633d;color:#f6f9f2;padding:10px 14px;text-align:center;">
    <div style="font-size:19px;letter-spacing:1px;">Serenity Botanicals &amp; Aromatherapy</div>
    <div style="font-family:Arial,sans-serif;font-size:10px;color:#d6e4cc;margin-top:2px;">Small-Batch Essential Oils &bull; Incense &bull; Himalayan Mineral Bath Salts &bull; Santa Cruz, California</div>
  </div>
  <div style="padding:14px;">
    <img data-blocked-src="__IMG_promo_aromatherapy__" alt="Himalayan bath salt crystals, sandalwood incense, eucalyptus and essential oils" width="480" height="268" style="display:block;margin:0 auto 12px;border:1px solid #c9d4be;">
    <h3 style="margin:0 0 8px;font-size:15px;color:#3d5231;">Create a Quiet Sanctuary at Home This November</h3>
    <p style="font-family:Arial,sans-serif;font-size:12px;line-height:1.55;margin:0 0 10px;color:#333;">
      When the world outside feels loud and unpredictable, a 20-minute evening ritual makes all the difference. Save <b>30% storewide</b> through Sunday on our pure steam-distilled essential oils, hand-rolled Mysore sandalwood incense, and coarse <b>Pink Himalayan Mineral Bath Salts</b>.
    </p>
    <div style="font-family:Arial,sans-serif;font-size:12px;background:#eef3e8;border-left:4px solid #4b633d;padding:8px 10px;margin:0 0 12px;">
      <b>Customer Favorites This Week:</b><br>
      &bull; <i>Deep Rest Roll-On</i> (French Lavender + Roman Chamomile) &mdash; <b>$9.80</b><br>
      &bull; <i>Clear Air Diffuser Blend</i> (Eucalyptus, Rosemary &amp; Cedarwood) &mdash; <b>$11.20</b><br>
      &bull; <i>2 lb Himalayan Pink Salt &amp; Bergamot Soak</i> (with wooden scoop) &mdash; <b>$13.95</b>
    </div>
    <p style="font-family:Arial,sans-serif;font-size:11px;color:#444;margin:0 0 10px;">
      <b>FREE glass dropper &amp; sandalwood sample</b> on all orders over $35. Ships USPS Priority Mail directly from our Santa Cruz workshop.
    </p>
    <div style="text-align:center;">
      <a href="#" style="font-family:Arial,sans-serif;display:inline-block;background:#4b633d;color:#fff;padding:7px 18px;text-decoration:none;font-weight:bold;font-size:12px;">Shop Fall Serenity Sale &raquo;</a>
    </div>
  </div>
  <div style="background:#e8eee2;padding:7px 12px;font-family:Arial,sans-serif;font-size:10px;color:#666;text-align:center;border-top:1px solid #cdd8c3;">
    Serenity Botanicals &bull; 1108 Pacific Ave, Santa Cruz, CA 95060 &bull; <a href="#">Unsubscribe</a> | <a href="#">Forward to a friend</a>
  </div>
</div>""",
            }
        ],
    },

    # 12 — Bank of America HQ Relocation to San Francisco (ties into docs/MARKETS_2009.md!)
    {
        "id": "t12",
        "folder": "inbox",
        "unread": True,
        "starred": False,
        "labels": ["Receipts"],
        "ad_cat": "finance",
        "subject": "Notice of Corporate Headquarters Relocation to San Francisco, CA",
        "date_list": "Nov 4",
        "snippet": "Bank of America has completed the relocation of its corporate headquarters to 555 California Street, San Francisco. Your routing number remains active...",
        "messages": [
            {
                "sender_name": "Bank of America",
                "sender_email": "onlinebanking@ealerts.bankofamerica.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Wed, Nov 4, 2009 at 5:30 PM",
                "age_str": "23 hours ago",
                "mailed_by": "ealerts.bankofamerica.com",
                "signed_by": "ealerts.bankofamerica.com",
                "html_body": """<div style="max-width:520px;border:1px solid #d0d0d0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#222;">
  <div style="background:#012169;color:#fff;padding:9px 14px;font-weight:bold;font-size:14px;">Bank of America <span style="color:#e31837;">&#9632;</span> <span style="font-weight:normal;font-size:11px;">Online Banking</span></div>
  <div style="padding:14px;line-height:1.5;">
    <p style="margin:0 0 10px;">Dear Valued Customer,</p>
    <p style="margin:0 0 10px;">Bank of America has completed the formal relocation of its corporate and western clearing headquarters to <b>555 California Street, San Francisco, CA 94104</b>, operating under the supervision of the Federal Reserve Bank of San Francisco.</p>
    <p style="margin:0 0 10px;"><b>What this means for your account:</b></p>
    <ul style="margin:0 0 10px;padding-left:20px;">
      <li>Your California account number, ABA routing number (121000358), checks, and Visa Check Card continue working without interruption.</li>
      <li>Direct deposits, California payroll, and Pacific Exchange brokerage transfers process normally.</li>
      <li>Outgoing domestic wire transfers and ACH debits to institutions located inside suspended eastern clearing zones remain temporarily unavailable.</li>
    </ul>
    <p style="margin:0;font-size:11px;color:#555;">Thank you for banking with Bank of America.<br>Customer Service: 1-800-432-1000 (Western Operations Center, Concord/Rancho Cordova).</p>
  </div>
</div>""",
            }
        ],
    },

    # 13 — Online hobbyist/forum mailing list (Yahoo! Groups Shortwave Radio)
    {
        "id": "t13",
        "folder": "inbox",
        "unread": True,
        "starred": False,
        "labels": [],
        "ad_cat": "emergency",
        "subject": "[WestCoastSWL] Re: 7415 kHz / 40m traffic after 1400 PT",
        "date_list": "Nov 4",
        "snippet": "Picking up Memphis ARTCC backup freqs dead silent since 2145Z, lots of MARS traffic on 7305 USB. Anyone in Reno hearing WWV out of Fort Collins?...",
        "messages": [
            {
                "sender_name": "WestCoastSWL",
                "sender_email": "westcoastswl@yahoogroups.com",
                "to_str": "westcoastswl@yahoogroups.com",
                "date_full": "Wed, Nov 4, 2009 at 4:52 PM",
                "age_str": "23 hours ago",
                "mailed_by": "returns.groups.yahoo.com",
                "body": """From: "Don K. (KA6DRT)" <ka6drt_folsom@sbcglobal.net>
Date: Wed Nov 4, 2009 4:50 pm

> Anybody copy 7415 or 7305 USB right after the Memphis news broke?
> My Icom R75 went crazy with EAMs on 11175 kHz around 1410 PT.

Yeah copied at least four long EAMs on 11175 USB between 1405 and 1440 PT here in Folsom on a 40-ft random wire. Also noticed Memphis ARTCC HF backup went totally dead after 2145Z.

Unrelated question — is anybody else getting terrible copy on WWV 10000 kHz out of Fort Collins this week? Barely S3 here, WWVH Hawaii is actually stomping all over it in the afternoon now. Heard on 75 meters last night that Fort Collins has been running reduced transmitter power on diesel since September.

Reminder to the new folks who joined this month: please do NOT post exact unit callsigns or base flight numbers to the list. Keep it to freqs, SINPO reports, and propagation so Yahoo doesn't yank the group under the FCC directive.

73,
Don / KA6DRT (Folsom, CA)

------------------------------------

Yahoo! Groups Links
<*> To visit your group on the web, go to:
    http://groups.yahoo.com/group/WestCoastSWL/
<*> To unsubscribe from this group, send an email to:
    WestCoastSWL-unsubscribe@yahoogroups.com""",
            }
        ],
    },

    # 14 — Steam Weekend Deal / Left 4 Dead 2 Pre-order (Nov 17, 2009!)
    {
        "id": "t14",
        "folder": "inbox",
        "unread": True,
        "starred": False,
        "labels": ["Promo"],
        "ad_cat": "gaming",
        "subject": "Pre-Purchase Left 4 Dead 2 and Save 10% — Plus L4D1 50% Off!",
        "date_list": "Nov 4",
        "snippet": "Steam — Left 4 Dead 2 unlocks November 17! Pre-purchase now for $44.99 and get early access to the demo plus the exclusive Baseball Bat...",
        "messages": [
            {
                "sender_name": "Steam",
                "sender_email": "noreply@steampowered.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Wed, Nov 4, 2009 at 1:15 PM",
                "age_str": "1 day ago",
                "mailed_by": "steampowered.com",
                "html_body": """<div style="max-width:520px;background:#1b1b1b;color:#d6d6d6;font-family:Arial,Helvetica,sans-serif;font-size:12px;border:1px solid #3c3c3c;">
  <div style="background:#000;padding:10px 14px;border-bottom:2px solid #5c7e10;">
    <span style="color:#fff;font-weight:bold;font-size:16px;letter-spacing:2px;">STEAM</span>
    <span style="color:#888;font-size:11px;margin-left:10px;">The Ultimate Online Game Platform</span>
  </div>
  <div style="padding:14px;line-height:1.5;">
    <div style="background:#2b3a12;border:1px solid #5c7e10;padding:10px 12px;margin-bottom:12px;">
      <div style="color:#b6e649;font-size:15px;font-weight:bold;">LEFT 4 DEAD 2 &mdash; PRE-PURCHASE &amp; SAVE 10%</div>
      <div style="color:#e0e0e0;font-size:12px;margin-top:4px;">Unlocks <b>November 17, 2009</b> &bull; $44.99 USD (Four-Pack: $134.99)</div>
    </div>
    <p style="margin:0 0 10px;">Set in the American South from Savannah to New Orleans, Valve's highly anticipated co-op sequel introduces new Survivors, melee weapons, and the AI Director 2.0. Pre-purchase on Steam today to get instant access to the <b>Left 4 Dead 2 Demo</b>.</p>
    <p style="margin:0 0 10px;"><b>Midweek Madness:</b> Original <b>Left 4 Dead</b> is 50% off ($14.99) through Thursday 4:00 PM PST!</p>
    <p style="margin:0;font-size:11px;color:#999;border-top:1px solid #333;padding-top:8px;">
      <i>Download Tip:</i> For fastest speeds in North America, open Steam &gt; Settings &gt; Downloads and select <b>US - Seattle</b>, <b>US - San Jose</b>, or <b>US - Los Angeles</b>. Valve Corporation, Bellevue, WA.
    </p>
  </div>
</div>""",
            }
        ],
    },

    # 15 — Sister Jen in Portland (Cascadia!) — 2-message thread
    {
        "id": "t15",
        "folder": "inbox",
        "unread": False,
        "starred": True,
        "labels": ["Family"],
        "ad_cat": "default",
        "subject": "Re: Red Bluff crossing / coming down for Thanksgiving?",
        "date_list": "Nov 4",
        "snippet": "Ugh I went to the DMV on Powell yesterday to ask about the transit stamp and waited 2 hours just to get told they need a separate Jefferson...",
        "messages": [
            {
                "sender_name": "Brian Miller",
                "sender_email": "bmiller79@gmail.com",
                "is_me": True,
                "to_str": "Jen Miller <jen.miller.pdx@gmail.com>",
                "date_full": "Tue, Nov 3, 2009 at 8:40 PM",
                "age_str": "2 days ago",
                "mailed_by": "gmail.com",
                "body": """Hey Jen,

Mom's already stressing about Thanksgiving. Are you gonna try driving down I-5 or taking Amtrak? Heard Cascades still runs to Eugene but not sure what's going on past Medford anymore. If you do drive down, stop by my place in Sac first and we can caravan down 99 to Fresno.

Also did you ever find my Canon battery charger from when you visited in January?

-Brian""",
            },
            {
                "sender_name": "Jen Miller",
                "sender_email": "jen.miller.pdx@gmail.com",
                "to_str": "Brian Miller <bmiller79@gmail.com>",
                "date_full": "Wed, Nov 4, 2009 at 11:20 AM",
                "age_str": "1 day ago",
                "mailed_by": "gmail.com",
                "body": """Ugh I went to the DMV on Powell yesterday to ask about the Cascadia exit/re-entry transit stamp and waited 2 hours just to get told they can't guarantee how long the State of Jefferson inspection post at Yreka/Red Bluff takes on holiday weekends. Girl at my coffee shop drove to Redding last week and sat in line almost 4 hours while they checked trunks for fuel cans.

Amtrak Coast Starlight hasn't run south of Klamath Falls since July so driving is the only real option unless I want to pay $480 for a Horizon Air flight to SMF (no thanks!). I'm gonna see if I can get Tuesday off so I can leave early.

Things up here are honestly pretty normal except produce is weirdly expensive — $2.50 for ONE avocado at Fred Meyer because the Central Valley trucks get stuck at the border. On the plus side my roommate's dumb cat finally stopped peeing on my backpack.

And YES I have your Canon charger in my desk drawer! I'll mail it if I can't make it down.

-Jen""",
            },
        ],
    },

    # 16 — Netflix 2009 Red Envelope DVD email
    {
        "id": "t16",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": ["Receipts"],
        "ad_cat": "default",
        "subject": "We have received No Country for Old Men",
        "date_list": "Nov 3",
        "snippet": "Netflix — We received your DVD of No Country for Old Men on Tuesday, Nov 3, 2009. Shipping next from Sacramento hub: The Dark Knight...",
        "messages": [
            {
                "sender_name": "Netflix",
                "sender_email": "info@netflix.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Tue, Nov 3, 2009 at 4:09 PM",
                "age_str": "2 days ago",
                "mailed_by": "netflix.com",
                "html_body": """<div style="max-width:500px;border:1px solid #ccc;font-family:Arial,sans-serif;font-size:12px;color:#333;">
  <div style="background:#b9090b;color:#fff;padding:8px 14px;font-weight:bold;font-size:18px;letter-spacing:1px;">NETFLIX</div>
  <div style="padding:14px;line-height:1.5;">
    <p style="margin:0 0 10px;">Dear Brian,</p>
    <p style="margin:0 0 10px;">We have received the following DVD you returned:</p>
    <div style="background:#f5f5f5;border:1px solid #ddd;padding:8px 10px;margin-bottom:10px;">
      <b>No Country for Old Men</b> (2007)<br>
      <span style="color:#666;font-size:11px;">Received: Tuesday, November 3, 2009 &bull; Sacramento Distribution Center</span>
    </div>
    <p style="margin:0 0 10px;"><b>Shipping Next from Your Queue:</b><br>
    <b>The Dark Knight</b> (2008) &mdash; Expected arrival: <b>Thursday, Nov 5, 2009</b></p>
    <p style="margin:0;font-size:11px;color:#666;">Tip: Watch thousands of movies &amp; TV episodes instantly on your PC with Watch Instantly (included free with your $8.99/mo plan).<br>&copy; 1997-2009 Netflix, Inc. 100 Winchester Circle, Los Gatos, CA 95032.</p>
  </div>
</div>""",
            }
        ],
    },

    # 17 — School Library Overdue Notice (CSUS)
    {
        "id": "t17",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": ["CSUS"],
        "ad_cat": "school",
        "subject": "Courtesy Overdue Notice - Sacramento State Library",
        "date_list": "Nov 3",
        "snippet": "The following item is 4 days overdue: Cadillac Desert: The American West and Its Disappearing Water (Reisner, Marc). Current fine: $1.00...",
        "messages": [
            {
                "sender_name": "CSUS University Library",
                "sender_email": "circ@lib.csus.edu",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Tue, Nov 3, 2009 at 8:00 AM",
                "age_str": "2 days ago",
                "mailed_by": "lib.csus.edu",
                "body": """CALIFORNIA STATE UNIVERSITY, SACRAMENTO
UNIVERSITY LIBRARY — CIRCULATION SERVICES

Patron: MILLER, BRIAN
Barcode: 2048900184721

The following library material is now OVERDUE:

  Title:      Cadillac Desert: The American West and Its Disappearing Water
  Author:     Reisner, Marc
  Call No.:   HD1695.W4 R45 1993
  Due Date:   10-30-09
  Accrued:    $1.00 ($0.25/day)

Please return the item to the 2nd floor Circulation Desk or renew online via Eureka (http://eureka.lib.csus.edu) before registration holds are applied. Note: Interlibrary Loan (ILL) requests to universities outside California, Oregon, Washington, and Arizona remain suspended until further notice.""",
            }
        ],
    },

    # 18 — Online gaming friend (网友 — WoW / Tichondrius)
    {
        "id": "t18",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": [],
        "ad_cat": "gaming",
        "subject": "u transferring off stormrage or staying??",
        "date_list": "Nov 2",
        "snippet": "yo brian, half the guild rerolled horde on Tichondrius cuz Blizzard said the east coast server cluster isn't coming back anytime soon...",
        "messages": [
            {
                "sender_name": "Mark Henderson",
                "sender_email": "m_henderson88@gmail.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Mon, Nov 2, 2009 at 11:47 PM",
                "age_str": "2 days ago",
                "mailed_by": "gmail.com",
                "body": """yo brian,

haven't seen u on xfire or vent all week. half the old raid group finally gave up and rerolled horde on Tichondrius (LA datacenter) cuz blizzard posted on the forums that the boston/nyc server cluster isn't coming back online anytime soon (no shit lol). my old pally is basically stuck in limbo forever.

im already lvl 66 on a death knight, me and jay are running hellfire ramparts most nights after 9pm PST. ping is like 28ms from sacramento. also blizzard Irvine is letting people transfer off dead east realms for free if u open a GM ticket, took like 3 days for mine.

lmk if u roll on tich, whisper Kaelthar or add me on aim (mhendo88).

-mark""",
            }
        ],
    },

    # 19 — Craigslist reply (local Sacramento kerosene heater barter/sale)
    {
        "id": "t19",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": [],
        "ad_cat": "emergency",
        "subject": "Re: Kerosene heater + 2 cans (Citrus Heights)",
        "date_list": "Nov 2",
        "snippet": "Hi Brian, yes I still have the DuraHeat 23,000 BTU heater. Wick is brand new from Ace Hardware last winter. I'm firm on $75 cash OR $50 + 4 tan...",
        "messages": [
            {
                "sender_name": "Tom (craigslist)",
                "sender_email": "sale-9xkp4-1448902112@craigslist.org",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Mon, Nov 2, 2009 at 6:18 PM",
                "age_str": "3 days ago",
                "mailed_by": "craigslist.org",
                "body": """Hi Brian,

Yes I still have the DuraHeat 23,000 BTU kerosene heater. Wick is brand new from Ace Hardware last winter and it comes with two empty 5-gallon blue cans (sorry no fuel, used the last of it in August).

I'm firm on $75 cash OR $50 + 4 tan federal gas coupons. No personal checks. I'm off Sunrise and Greenback in Citrus Heights and can meet in the Safeway parking lot before 5pm (don't like driving around after dark anymore).

Call me at 916-555-0148 if you want to look at it tomorrow.

-Tom

> On Mon, Nov 2, 2009 at 4:02 PM, Brian Miller <bmiller79@gmail.com> wrote:
> Hi, is the kerosene heater from your Sacramento craigslist ad still available?
> Would you take $60 cash? I can pick up after work.""",
            }
        ],
    },

    # 20 — Amazon.com 2009 Shipping Confirmation
    {
        "id": "t20",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": ["Receipts"],
        "ad_cat": "emergency",
        "subject": "Your Amazon.com order has shipped (#104-8829143-5521009)",
        "date_list": "Nov 1",
        "snippet": "Amazon.com has shipped the following items from Fernley, NV: Eton FR360 Solarlink Weather Radio, Sanyo Eneloop AA (8-Pack), The Road...",
        "messages": [
            {
                "sender_name": "Amazon.com",
                "sender_email": "ship-confirm@amazon.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Sun, Nov 1, 2009 at 3:22 PM",
                "age_str": "4 days ago",
                "mailed_by": "bounces.amazon.com",
                "signed_by": "amazon.com",
                "body": """Greetings from Amazon.com.

We thought you'd like to know that Amazon.com shipped your items, and that this completes your order.

=====================================================================
SHIPPING DETAILS
=====================================================================
Order #:          104-8829143-5521009
Shipping Method:  UPS Ground (from Fernley, NV Fulfillment Center)
Tracking #:       1Z999AA10123456784
Estimated Arrival: November 4, 2009

Ship to:
  Brian Miller
  2418 Fulton Ave Apt 204
  Sacramento, CA 95825

Items Shipped:
  1  Eton FR360 Solarlink Self-Powered AM/FM/NOAA Weather Radio   $49.99
  1  Sanyo Eneloop AA NiMH Rechargeable Batteries (8-Pack)        $21.49
  1  The Road (Paperback) — Cormac McCarthy                       $11.95

  Item Subtotal:       $83.43
  Shipping & Handling:  $0.00 (Free Super Saver Shipping)
  CA Sales Tax:         $5.88
  Total Charged:       $89.31 (Visa ending in 7194)

Note: Due to ongoing carrier disruptions east of the Rocky Mountains, some third-party Marketplace sellers are temporarily unavailable for California delivery.

Thank you for shopping at Amazon.com!
http://www.amazon.com""",
            }
        ],
    },

    # 21 — Friend Rachel Morales (2-message thread)
    {
        "id": "t21",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": [],
        "ad_cat": "default",
        "subject": "Re: Halloween party at Chris's?",
        "date_list": "Oct 31",
        "snippet": "hey sorry we bailed early, curfew in midtown starts at 11 now and chris's street was already crawling with CHP. thanks for bringing the chili!...",
        "messages": [
            {
                "sender_name": "Brian Miller",
                "sender_email": "bmiller79@gmail.com",
                "is_me": True,
                "to_str": "Rachel Morales <rachel.m.82@gmail.com>",
                "date_full": "Sat, Oct 31, 2009 at 8:05 PM",
                "age_str": "5 days ago",
                "mailed_by": "gmail.com",
                "body": """Hey Rachel, you guys make it home alright? Saw you left your grey hoodie on the back of Chris's couch so I grabbed it before leaving. Let me know when you want me to drop it off.""",
            },
            {
                "sender_name": "Rachel Morales",
                "sender_email": "rachel.m.82@gmail.com",
                "to_str": "Brian Miller <bmiller79@gmail.com>",
                "date_full": "Sat, Oct 31, 2009 at 9:12 PM",
                "age_str": "5 days ago",
                "mailed_by": "gmail.com",
                "body": """hey!! yeah we made it back by 10:45, curfew in midtown starts at 11 now and J street already had CHP checkpoints up by the park. didn't feel like getting pulled over in a dumb vampire costume lol.

thanks so much for grabbing my hoodie!! honestly keep it til next week, im working doubles at Sutter General all weekend anyway (we're still getting overflow patients from the Cal Expo camp whenever it drops below 45 at night). Also thanks for bringing the chili, it was awesome.

-rachel""",
            },
        ],
    },

    # 22 — Google Alerts (2009 digest!)
    {
        "id": "t22",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": ["Gov & Alerts"],
        "ad_cat": "finance",
        "subject": 'Google Alert - "Sacramento" OR "Pacific Exchange"',
        "date_list": "Oct 30",
        "snippet": "Google News Alert for: Sacramento OR Pacific Exchange — Interim Congress debates winter heating fuel allocation; Wilshire 5000 finishes flat...",
        "messages": [
            {
                "sender_name": "Google Alerts",
                "sender_email": "googlealerts-noreply@google.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Fri, Oct 30, 2009 at 7:03 AM",
                "age_str": "6 days ago",
                "mailed_by": "google.com",
                "html_body": """<div style="font-family:Arial,sans-serif;font-size:12px;color:#000;line-height:1.5;">
  <div style="font-size:14px;margin-bottom:8px;"><b>Google News Alert</b> for: <b>&quot;Sacramento&quot; OR &quot;Pacific Exchange&quot;</b></div>
  <div style="margin-bottom:10px;">
    <a href="#" style="color:#0000cc;font-weight:bold;">Interim Congress debates winter heating fuel reserve for western states</a><br>
    <span style="color:#008000;font-size:11px;">Sacramento Bee - Sacramento, CA</span><br>
    Lawmakers meeting at the Sacramento Memorial Auditorium heard testimony Thursday from Energy Department officials warning that propane and heating oil shipments to northern Arizona and eastern Nevada face winter bottlenecks...
  </div>
  <div style="margin-bottom:10px;">
    <a href="#" style="color:#0000cc;font-weight:bold;">Wilshire 5000 finishes flat in light San Francisco trading</a><br>
    <span style="color:#008000;font-size:11px;">MarketWatch - San Francisco, CA</span><br>
    Trading at the Pacific Exchange on Pine Street closed nearly unchanged Thursday ahead of next week's San Francisco Fed Treasury auction, with gold holding near $2,710 an ounce...
  </div>
  <div style="margin-bottom:10px;">
    <a href="#" style="color:#0000cc;font-weight:bold;">Cal Expo camp seeks winter coats and blankets before November rains</a><br>
    <span style="color:#008000;font-size:11px;">KCRA 3 - Sacramento, CA</span><br>
    Volunteer coordinators at the Cal Expo evacuee shelter say donations have slowed since September even as nighttime temperatures dip into the low 40s...
  </div>
  <div style="border-top:1px solid #ccc;padding-top:6px;font-size:11px;color:#666;">
    This as-it-happens Google Alert is brought to you by Google. <a href="#">Remove this alert</a> | <a href="#">Manage your alerts</a>
  </div>
</div>""",
            }
        ],
    },

    # 23 — Sacramento County Ration Booklet Schedule (Oct 29)
    {
        "id": "t23",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": ["Gov & Alerts"],
        "ad_cat": "emergency",
        "subject": "November 2009 Federal Ration Coupon Booklets — Pickup Schedule",
        "date_list": "Oct 29",
        "snippet": "Distribution of November 2009 Federal Ration Booklets (Series C) begins Nov 2. Single adult allotment: 16 Tan (Fuel), 8 Green (Dairy/Eggs)...",
        "messages": [
            {
                "sender_name": "Sacramento County OES",
                "sender_email": "alerts@saccounty-oes.gov",
                "to_str": "subscribers@saccounty-oes.gov",
                "date_full": "Thu, Oct 29, 2009 at 2:10 PM",
                "age_str": "7 days ago",
                "mailed_by": "saccounty-oes.gov",
                "body": """SACRAMENTO COUNTY OFFICE OF EMERGENCY SERVICES
FEDERAL RATION DISTRIBUTION NOTICE — NOVEMBER 2009 (SERIES C)

November 2009 Federal Ration Coupon Booklets will be issued by residential ZIP zone beginning Monday, November 2.

Standard Single-Adult Monthly Allotment (Series C):
  - TAN Coupons (Motor Fuel):         16 coupons (2 gal/coupon at participating stations)
  - GREEN Coupons (Dairy & Eggs):      8 coupons
  - BLUE Coupons (Dry Staples/Rice):   6 coupons

Unused October (Series B) coupons expire at 11:59 PM on November 3, 2009.
Selling ration coupons for cash is a federal misdemeanor; workplace carpool pooling of Tan coupons remains permitted under USDA/DOE Emergency Rule 09-18.

Zone 4 Pickup (95821, 95825, 95608): Arden-Dimick Library, 891 Watt Ave, Mon–Sat 8:00 AM–2:00 PM.""",
            }
        ],
    },

    # 24 — CSUS Bursar Financial Aid / Registration
    {
        "id": "t24",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": ["CSUS"],
        "ad_cat": "school",
        "subject": "Spring 2010 Priority Registration & Federal Aid Deferment Notice",
        "date_list": "Oct 28",
        "snippet": "California State University, Sacramento — Spring 2010 registration opens Nov 16. Students awaiting federal Stafford/Pell verification from Sacramento...",
        "messages": [
            {
                "sender_name": "Bursar's Office - CSUS",
                "sender_email": "bursar@csus.edu",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Wed, Oct 28, 2009 at 10:15 AM",
                "age_str": "8 days ago",
                "mailed_by": "csus.edu",
                "body": """CALIFORNIA STATE UNIVERSITY, SACRAMENTO
Office of the Bursar — Lassen Hall 1001

Dear Brian Miller (ID: 201948210),

Your Spring 2010 Priority Registration appointment opens Monday, November 16, 2009 at 10:30 AM via My Sac State (https://my.csus.edu).

IMPORTANT NOTICE FOR FEDERAL AID RECIPIENTS:
Because the provisional U.S. Department of Education office in Sacramento is still reconstructing pre-February 2009 FAFSA and National Student Loan Data System records formerly housed in Washington, D.C., CSUS has automatically extended all Fall/Spring tuition fee deferments through December 15, 2009. You will NOT be disenrolled while your verification is pending.

Current Account Balance: $0.00 (Fall 2009 Paid)
Parking Permit Renewal (Spring 2010): $156.00

Questions? Visit Lassen Hall Window 3, Mon–Fri 8:30 AM–4:00 PM.""",
            }
        ],
    },

    # 25 — YouTube 2009 New Video Notification
    {
        "id": "t25",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": [],
        "ad_cat": "default",
        "subject": 'New video from sac_scanner_916: "I-80 Westbound Convoy near Davis 10/26/09"',
        "date_list": "Oct 27",
        "snippet": "YouTube — sac_scanner_916 has uploaded a new video: I-80 Westbound Convoy near Davis 10/26/09 (2:14) Shot from the Mace Blvd overpass...",
        "messages": [
            {
                "sender_name": "YouTube",
                "sender_email": "service@youtube.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Tue, Oct 27, 2009 at 5:44 PM",
                "age_str": "9 days ago",
                "mailed_by": "youtube.com",
                "html_body": """<div style="max-width:500px;border:1px solid #ccc;font-family:Arial,sans-serif;font-size:12px;color:#333;">
  <div style="background:#eee;padding:8px 12px;border-bottom:1px solid #ccc;">
    <b style="font-size:16px;color:#000;">You<span style="background:#cc181e;color:#fff;padding:1px 4px;border-radius:3px;">Tube</span></b>
    <span style="font-size:11px;color:#666;margin-left:6px;">Broadcast Yourself&trade;</span>
  </div>
  <div style="padding:12px;line-height:1.5;">
    <p style="margin:0 0 8px;"><b>sac_scanner_916</b> has uploaded a new video:</p>
    <div style="background:#f9f9f9;border:1px solid #ddd;padding:8px 10px;margin-bottom:10px;">
      <a href="#" style="color:#0033cc;font-weight:bold;font-size:13px;">I-80 Westbound Convoy near Davis 10/26/09</a> <span style="color:#666;font-size:11px;">(02:14)</span><br>
      <span style="font-size:11px;color:#555;">Shot from the Mace Blvd overpass around 4:15pm on my Canon SD1100. Counted 14 flatbeds heading west toward Travis/Fairfield...</span>
    </div>
    <p style="margin:0;font-size:11px;color:#666;">Watch it now: <a href="#">http://www.youtube.com/watch?v=9kX4mPqR82w</a><br>YouTube, LLC &bull; 901 Cherry Ave., San Bruno, CA 94066</p>
  </div>
</div>""",
            }
        ],
    },

    # 26 — eBay Outbid Notification (Page 2!)
    {
        "id": "t26",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": [],
        "ad_cat": "emergency",
        "subject": "You've been outbid! Sony ICF-SW7600GR Shortwave Receiver",
        "date_list": "Oct 26",
        "snippet": "eBay — Someone else has outbid you on Sony ICF-SW7600GR AM/FM Shortwave World Band Receiver. Current bid: $182.50 (San Jose, CA)...",
        "messages": [
            {
                "sender_name": "eBay",
                "sender_email": "ebay@ebay.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Mon, Oct 26, 2009 at 8:19 PM",
                "age_str": "10 days ago",
                "mailed_by": "ebay.com",
                "body": """Dear bmiller79,

You have been outbid on the following eBay item:

  Item:        Sony ICF-SW7600GR AM/FM Shortwave World Band Receiver (Mint w/ Box)
  Item #:      270474819204
  Your Max Bid: $175.00
  Current Bid:  $182.50
  Time Left:    1 day 4 hours
  Seller Loc.:  San Jose, CA (Ships to US West Coast & Canada only)

Bid again before this listing ends:
http://cgi.ebay.com/ws/eBayISAPI.dll?ViewItem&item=270474819204

eBay Inc., 2145 Hamilton Avenue, San Jose, CA 95125""",
            }
        ],
    },

    # 27 — Newegg.com Order Confirmation (Page 2!)
    {
        "id": "t27",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": ["Receipts"],
        "ad_cat": "gaming",
        "subject": "Newegg.com - Order Confirmation (Order #88412904)",
        "date_list": "Oct 24",
        "snippet": "Thank you for shopping at Newegg.com! Ships from City of Industry, CA: WD Caviar Blue 500GB SATA, APC Back-UPS ES 550VA Battery Backup...",
        "messages": [
            {
                "sender_name": "Newegg.com",
                "sender_email": "info@newegg.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Sat, Oct 24, 2009 at 1:05 PM",
                "age_str": "12 days ago",
                "mailed_by": "newegg.com",
                "body": """NEWEGG.COM — ORDER CONFIRMATION
Order #: 88412904   Date: 10/24/2009 1:04:19 PM PST
Shipping Warehouse: City of Industry, CA

  1x Western Digital Caviar Blue WD5000AAKS 500GB 7200 RPM SATA 3.0Gb/s     $54.99
  1x APC Back-UPS ES 550VA 8-Outlet Battery Backup Surge Protector          $64.99

  Subtotal:  $119.98
  Tax (CA):   $10.50
  UPS 3-Day:   $7.99
  TOTAL:     $138.47

Thank you for your business!
Newegg.com — Once You Know, You Newegg.""",
            }
        ],
    },

    # 28 — California DMV Smog & Registration Renewal (mundane bureaucracy!)
    {
        "id": "t28",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": ["Gov & Alerts"],
        "ad_cat": "default",
        "subject": "Vehicle Registration Renewal Reminder - 2002 Subaru Outback",
        "date_list": "Oct 21",
        "snippet": "California Department of Motor Vehicles — Your registration for license plate 5KTR812 expires 12/14/2009. Amount due: $168.00. SMOG required...",
        "messages": [
            {
                "sender_name": "CA DMV Online",
                "sender_email": "noreply@dmv.ca.gov",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Wed, Oct 21, 2009 at 9:00 AM",
                "age_str": "15 days ago",
                "mailed_by": "dmv.ca.gov",
                "body": """STATE OF CALIFORNIA — DEPARTMENT OF MOTOR VEHICLES
VEHICLE REGISTRATION RENEWAL REMINDER

License Plate:  5KTR812
Vehicle:        2002 SUBARU OUTBACK WGN
Expiration:     December 14, 2009
Renewal Fee:    $168.00
Smog Required:  YES (Test-Only Station Required)

A valid California Smog Check certificate must be electronically transmitted before your 2010 registration sticker can be issued. Proof of current California liability insurance is also required on file.

Renew online at http://www.dmv.ca.gov or by mail to P.O. Box 942894, Sacramento, CA 94294.""",
            }
        ],
    },

    # 29 — Blockbuster Online Promo (peak 2009 nostalgia!)
    {
        "id": "t29",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": ["Promo"],
        "ad_cat": "default",
        "subject": "Rent Up to 3 Movies at a Time — First 2 Weeks FREE!",
        "date_list": "Oct 19",
        "snippet": "BLOCKBUSTER Total Access — Exchange DVDs by mail OR in-store at any California Blockbuster location! Watch Star Trek, District 9 & more...",
        "messages": [
            {
                "sender_name": "Blockbuster Online",
                "sender_email": "offers@blockbuster.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Mon, Oct 19, 2009 at 11:30 AM",
                "age_str": "17 days ago",
                "mailed_by": "email.blockbuster.com",
                "body": """BLOCKBUSTER TOTAL ACCESS — 2 WEEKS FREE!

Tired of waiting for the mail? With BLOCKBUSTER Total Access, return your mail DVDs at your neighborhood Sacramento Blockbuster store and walk out with a new movie the same night!

New Releases Coming This Month:
- Star Trek (2009)
- Up (Disney/Pixar)
- Public Enemies
- The Hangover

Start your FREE 2-week trial today at http://www.blockbuster.com.
To unsubscribe, click here.""",
            }
        ],
    },

    # 30 — Haunting Starred Thread: Uncle Ray in Worcester, Massachusetts (last heard Feb 27, 2009!)
    {
        "id": "t30",
        "folder": "inbox",
        "unread": False,
        "starred": True,
        "labels": ["Family"],
        "ad_cat": "default",
        "subject": "Re: Checking in from Worcester",
        "date_list": "Jun 4",
        "snippet": "Still checking this thread. If you guys got out to Vermont or up into Canada and can get to a library computer, call Mom's cell or email me here...",
        "messages": [
            {
                "sender_name": "Ray Miller",
                "sender_email": "ray.miller.ma@verizon.net",
                "to_str": "Brian Miller <bmiller79@gmail.com>",
                "date_full": "Fri, Feb 27, 2009 at 6:41 PM",
                "age_str": "8 months ago",
                "mailed_by": "verizon.net",
                "body": """Hey Brian,

Got your email from last week, sorry it took a few days. Verizon DSL has been going up and down here since Tuesday night. We are doing alright — still have oil heat and plenty of stuff in the basement freezer.

Things look pretty strange out on the roads though. They put Humvees at the I-290 ramps and closed the Mass Pike heading east into Boston. Weirdest thing happened this morning: Aunt Carol went to Shaw's for milk and bread and her debit card got declined at the register. The store manager told her all the banks in Massachusetts froze women's accounts overnight because of some emergency order out of Washington. Everybody in the checkout line thought it was a computer glitch. I had to go down there with cash.

Anyway, don't let your mom worry too much, we're staying put at the house and I'll try calling Sunday night once the phone circuits stop jamming up. Hope school is going well out in California.

Love,
Uncle Ray""",
            },
            {
                "sender_name": "Brian Miller",
                "sender_email": "bmiller79@gmail.com",
                "is_me": True,
                "to_str": "Ray Miller <ray.miller.ma@verizon.net>",
                "date_full": "Thu, Mar 12, 2009 at 9:14 PM",
                "age_str": "7 months ago",
                "mailed_by": "gmail.com",
                "body": """Uncle Ray,

Mom hasn't heard from you guys since the 27th and your home phone just gives a fast busy signal. Did you get my voicemail? Please email back even just one line when the internet comes back up so we know you and Aunt Carol are okay.

-Brian""",
            },
            {
                "sender_name": "Brian Miller",
                "sender_email": "bmiller79@gmail.com",
                "is_me": True,
                "to_str": "Ray Miller <ray.miller.ma@verizon.net>",
                "date_full": "Thu, Jun 4, 2009 at 11:52 PM",
                "age_str": "5 months ago",
                "mailed_by": "gmail.com",
                "body": """Still checking this thread just in case. If you guys got out to Vermont or up across the border into Canada and can get to a library computer, call Mom's cell or email me here. Thinking about you both.

-Brian""",
            },
        ],
    },

    # ================= SENT MAIL (standalone) =================
    {
        "id": "t31",
        "folder": "sent",
        "unread": False,
        "starred": False,
        "labels": ["Receipts"],
        "ad_cat": "default",
        "subject": "November rent check - Apt 204",
        "date_list": "Nov 1",
        "snippet": "Hi Mr. Delgado, Just letting you know I dropped the November rent check ($785) in the office mail slot this morning...",
        "messages": [
            {
                "sender_name": "Brian Miller",
                "sender_email": "bmiller79@gmail.com",
                "is_me": True,
                "to_str": "Carlos Delgado <oakparkmgmt@sbcglobal.net>",
                "date_full": "Sun, Nov 1, 2009 at 9:10 AM",
                "age_str": "4 days ago",
                "mailed_by": "gmail.com",
                "body": """Hi Mr. Delgado,

Just letting you know I dropped the November rent check ($785) in the office mail slot this morning. Also the hallway fluorescent bulb outside 204 has been flickering nonstop whenever you have a spare.

Thanks,
Brian Miller
Apt 204""",
            }
        ],
    },
    {
        "id": "t32",
        "folder": "sent",
        "unread": False,
        "starred": False,
        "labels": [],
        "ad_cat": "default",
        "subject": "Re: Kings game Friday?",
        "date_list": "Oct 29",
        "snippet": "cant make it to arco, gas is $5.40 at the chevron on fair oaks and im saving my tan coupons for getting down to fresno next month...",
        "messages": [
            {
                "sender_name": "Brian Miller",
                "sender_email": "bmiller79@gmail.com",
                "is_me": True,
                "to_str": "Dave Kowalski <dkowalski81@yahoo.com>",
                "date_full": "Thu, Oct 29, 2009 at 8:22 PM",
                "age_str": "7 days ago",
                "mailed_by": "gmail.com",
                "body": """cant make it to arco man, gas is $5.40 at the chevron on fair oaks and im saving my tan coupons for driving down to mom's for thanksgiving. come over here we can watch it on channel 10 and order a pizza from round table

-b""",
            }
        ],
    },

    # ================= DRAFTS =================
    {
        "id": "t33",
        "folder": "drafts",
        "unread": False,
        "starred": False,
        "labels": ["Family"],
        "ad_cat": "default",
        "subject": "Re: Red Bluff crossing / coming down for Thanksgiving?",
        "date_list": "3:55 pm",
        "snippet": "Hey Jen, Mom just emailed me saying Red Bluff is backed up 4 hours. If you decide to drive down anyway, don't take I-5 after dark...",
        "messages": [
            {
                "sender_name": "Draft",
                "sender_email": "bmiller79@gmail.com",
                "is_me": True,
                "is_draft": True,
                "to_str": "Jen Miller <jen.miller.pdx@gmail.com>",
                "date_full": "Thu, Nov 5, 2009 at 3:55 PM (Draft)",
                "age_str": "35 minutes ago",
                "body": """Hey Jen,

Mom just emailed me saying Red Bluff is backed up 4 hours. If you decide to drive down anyway, don't take I-5 after dark — Dave's brother said Jefferson troopers are stopping every out-of-state plate south of Yreka to check """,
            }
        ],
    },
    {
        "id": "t34",
        "folder": "drafts",
        "unread": False,
        "starred": False,
        "labels": ["CSUS"],
        "ad_cat": "school",
        "subject": "Question about Lab 6 DEM raster",
        "date_list": "Nov 4",
        "snippet": "Hi Prof. Takahashi, I tried downloading the American River watershed DEM from the USGS site before I remembered...",
        "messages": [
            {
                "sender_name": "Draft",
                "sender_email": "bmiller79@gmail.com",
                "is_me": True,
                "is_draft": True,
                "to_str": "Takahashi, Hiroshi <htakahashi@csus.edu>",
                "date_full": "Wed, Nov 4, 2009 at 2:08 PM (Draft)",
                "age_str": "1 day ago",
                "body": """Hi Prof. Takahashi,

I tried downloading the American River watershed DEM from the USGS site before I remembered """,
            }
        ],
    },

    # ================= SPAM (6 classic 2009 spam/phishing emails!) =================
    {
        "id": "t35",
        "folder": "spam",
        "unread": True,
        "starred": False,
        "labels": [],
        "ad_cat": "default",
        "subject": "URGENT & CONFIDENTIAL: $14,500,000 USD DEPOSIT IN SAFEKEEPING",
        "date_list": "1:09 pm",
        "snippet": "DEAR SIR/MADAM, I AM BARRISTER EMMANUEL OKAFOR SOLICITOR IN LONDON. MY LATE CLIENT AN AMERICAN CONTRACTOR WHO PERISHED IN THE WASHINGTON...",
        "messages": [
            {
                "sender_name": "Barrister Emmanuel Okafor",
                "sender_email": "e.okafor_chambers88@live.co.uk",
                "to_str": "undisclosed-recipients:;",
                "date_full": "Thu, Nov 5, 2009 at 1:09 PM",
                "age_str": "3 hours ago",
                "mailed_by": "live.co.uk",
                "body": """DEAR SIR / MADAM,

PLEASE ACCEPT MY APOLOGIES FOR THIS UNSOLICITED MESSAGE. I AM BARRISTER EMMANUEL OKAFOR, PERSONAL ATTORNEY TO MR. RICHARD MILLER (SAME SURNAME AS YOURS!), AN AMERICAN ENGINEERING CONTRACTOR WHO TRAGICALLY PERISHED DURING THE FEBRUARY 2009 EVENTS IN WASHINGTON D.C.

BEFORE HIS UNTIMELY PASSING, MY LATE CLIENT DEPOSITED THE SUM OF FOURTEEN MILLION FIVE HUNDRED THOUSAND UNITED STATES DOLLARS ($14,500,000.00 USD) IN A PRIVATE SECURITY BANK VAULT IN ZURICH, SWITZERLAND.

BECAUSE ALL OFFICIAL RECORDS IN WASHINGTON ARE NOW CLOSED, THE BANK HAS GIVEN ME 14 DAYS TO PRESENT A NEXT-OF-KIN OR THE FUNDS WILL BE CONFISCATED. I WISH TO PRESENT YOU AS THE BENEFICIARY SO WE MAY SHARE THE SUM 60% FOR ME AND 40% FOR YOU.

PLEASE REPLY URGENTLY WITH YOUR FULL NAME, TELEPHONE NUMBER, AND WESTERN UNION DETAILS.

GOD BLESS YOU,
BARRISTER E. OKAFOR ESQ.""",
            }
        ],
    },
    {
        "id": "t36",
        "folder": "spam",
        "unread": True,
        "starred": False,
        "labels": [],
        "ad_cat": "wellness",
        "subject": "R3: Cheap V1agra, C1alis & FDA Potassium Iodide 130mg!! No Rx!!",
        "date_list": "7:42 am",
        "snippet": "CANADIAN MAPLE PHARMACY — Best pr1ces online! V1agra $1.29/pill, C1alis $1.65/pill, PLUS 130mg KI Rad1ation Tablets in st0ck! Sh1ps from Vancouver BC!",
        "messages": [
            {
                "sender_name": "Canadian Health & Rx",
                "sender_email": "orders@maple-rx-direct2009.biz",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Thu, Nov 5, 2009 at 7:42 AM",
                "age_str": "9 hours ago",
                "mailed_by": "maple-rx-direct2009.biz",
                "body": """*** CANADIAN MAPLE DIRECT PHARMACY — DISCREET WEST COAST DELIVERY ***

Worried about the news?? Dont pay $90 on Craiglist!!
We have GENUINE 130mg Potass1um Iod1de (KI) tablets IN STOCK TODAY + ALL YOUR FAVORITE MEN'S HEALTH MEDS!!

  - Gener1c V1agra 100mg .......... $1.29 / pill
  - Gener1c C1alis 20mg ........... $1.65 / pill
  - Potass1um Iod1de 130mg (14pk) . $19.95 (LIMIT 10 PACKS)
  - Amb1en / Xan@x ................ NO PRESCRIPTION NEEDED!!

Ships FAST via Canada Post Air from Vanc0uver, B.C. directly to California, Arizona & Oregon!
>>> CLICK HERE: http://www.maple-rx-direct2009.biz/?ref=8821 <<<""",
            }
        ],
    },
    {
        "id": "t37",
        "folder": "spam",
        "unread": True,
        "starred": False,
        "labels": [],
        "ad_cat": "finance",
        "subject": "URGENT: Your Account Has Been Flagged Under Emergency Banking Order 09-12",
        "date_list": "Nov 4",
        "snippet": "Dear Wells Fargo Customer, Your checking account has been temporarily frozen under Federal Emergency Banking Order 09-12. Verify your ATM PIN...",
        "messages": [
            {
                "sender_name": "Wells Fargo Security Dept",
                "sender_email": "security-verify@wellsfargo-confirm-ca.info",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Wed, Nov 4, 2009 at 10:19 PM",
                "age_str": "18 hours ago",
                "mailed_by": "wellsfargo-confirm-ca.info",
                "body": """Dear Wells Fargo Online Customer,

Due to Federal Emergency Banking Order 09-12 your account have been flagged for mandatory western zone re-verification. If you do not confirm your identity within 24 hours your funds will be transferred to federal holding.

Please click the secure link below to enter your:
- Online Banking Username & Password
- 16-Digit Debit Card Number & 4-Digit ATM PIN
- Social Security Number

VERIFY NOW: http://208.113.149.72/wellsfargo-ca-verify/login.php

Wells Fargo Security Team""",
            }
        ],
    },
    {
        "id": "t38",
        "folder": "spam",
        "unread": True,
        "starred": False,
        "labels": [],
        "ad_cat": "default",
        "subject": "Single Mom Makes $3,480/Week Working From Home Using Google!!",
        "date_list": "Nov 4",
        "snippet": "LOCAL SACRAMENTO MOM DISCOVERS SIMPLE GOOGLE LOOPHOLE! Even in this economy, ordinary people are earning $74/hr posting links from home...",
        "messages": [
            {
                "sender_name": "Jenna's Home Income",
                "sender_email": "jenna.riches2009@yahoo.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Wed, Nov 4, 2009 at 3:02 PM",
                "age_str": "1 day ago",
                "mailed_by": "yahoo.com",
                "body": """Hi neighbor!

Did you see the special report on Channel 3?! After getting laid off in March, local Sacramento mom Julie T. started using a simple 3-step Google Kit from her kitchen table and made $3,480 LAST WEEK ALONE!

No selling! No cold calling! Works anywhere you have internet access!
Only 4 spots left for California residents — pay just $1.95 S&H for your starter CD-ROM!

Visit: http://www.google-cash-blueprint2009.info/sacramento""",
            }
        ],
    },
    {
        "id": "t39",
        "folder": "spam",
        "unread": True,
        "starred": False,
        "labels": [],
        "ad_cat": "wellness",
        "subject": "DOCTORS HATE THIS: Pink Himalayan Salt Blocks Radiation + FREE Aromatherapy Kit!",
        "date_list": "Nov 3",
        "snippet": "SECRET ANCIENT HIMALAYAN CRYSTAL REMEDY! Why pay for expensive filters when 100% pure Himalayan Rock Salt & Essential Oils cleanse toxins...",
        "messages": [
            {
                "sender_name": "Pure Himalayan Miracle",
                "sender_email": "promo@rocksalt-radiation-shield.info",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Tue, Nov 3, 2009 at 11:55 PM",
                "age_str": "2 days ago",
                "mailed_by": "rocksalt-radiation-shield.info",
                "body": """*** BIG PHARMA DOESN'T WANT YOU TO READ THIS ***

Did you know 250-million-year-old Himalayan Pink Crystal Salt contains 84 trace minerals that form an invisible NEGATIVE-ION SHIELD around your home??

Combine our Jumbo 15-lb Himalayan Rock Salt Lamp with our Miracle Eucalyptus & Tea Tree Aromatherapy Vaporizer and sleep soundly no matter what happens on the news!

SPECIAL CRISIS PRICING: BUY 1 GET 2 FREE ($39.95 + $19.95 S&H)!!
ORDER BEFORE STOCK RUNS OUT: http://www.rocksalt-radiation-shield.info/offer99""",
            }
        ],
    },
    {
        "id": "t40",
        "folder": "spam",
        "unread": True,
        "starred": False,
        "labels": [],
        "ad_cat": "default",
        "subject": "CONGRATULATIONS bmiller79@gmail.com! Claim Your FREE 32GB iPod Touch!",
        "date_list": "Nov 2",
        "snippet": "You have been selected as our November winner! Complete just 2 quick sponsor offers (Blockbuster, Columbia House) to receive your FREE iPod Touch!",
        "messages": [
            {
                "sender_name": "RewardZone USA",
                "sender_email": "win@rewardzone-usa-2009.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Mon, Nov 2, 2009 at 4:11 PM",
                "age_str": "3 days ago",
                "mailed_by": "rewardzone-usa-2009.com",
                "body": """CONGRATULATIONS bmiller79@gmail.com!!

Your email address was randomly selected to receive a BRAND NEW Apple iPod Touch 32GB (3rd Generation) absolutely FREE!!

Simply verify your Sacramento shipping address and complete 2 Silver Sponsor Offers (like FreeCreditReport.com or Columbia House DVD Club) to claim your prize before midnight!

CLAIM NOW >>> http://www.rewardzone-usa-2009.com/claim?u=bmiller79""",
            }
        ],
    },

    # ================= TRASH (3 deleted emails) =================
    {
        "id": "t41",
        "folder": "trash",
        "unread": False,
        "starred": False,
        "labels": [],
        "ad_cat": "finance",
        "subject": "Gold Just Hit $2,700+! Mail Your Broken Jewelry Today in Our Free RefPak!",
        "date_list": "Nov 1",
        "snippet": "CASH4GOLD — Gold prices are at ALL-TIME RECORD HIGHS! Turn your old class rings, broken chains & gold coins into fast cash in 24 hours...",
        "messages": [
            {
                "sender_name": "Cash4Gold",
                "sender_email": "offers@cash4gold.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Sun, Nov 1, 2009 at 10:12 AM",
                "age_str": "4 days ago",
                "mailed_by": "cash4gold.com",
                "body": """GOLD IS OVER $2,700 AN OUNCE — DON'T WAIT!

As seen on TV! Cash4Gold pays TOP DOLLAR for unwanted gold rings, broken chains, class rings, and gold teeth. Request your FREE insured RefPak envelope today — now processed at our new Phoenix, AZ Western Refinery!

Get paid by check within 24 hours of receipt. Visit http://www.cash4gold.com.""",
            }
        ],
    },
    {
        "id": "t42",
        "folder": "trash",
        "unread": False,
        "starred": False,
        "labels": ["Promo"],
        "ad_cat": "default",
        "subject": 'Preview Our Early Holiday Deals — 42" 1080p LCD TVs Starting at $699!',
        "date_list": "Oct 30",
        "snippet": "Best Buy Reward Zone — Shop early and save on Sony BRAVIA, Samsung 1080p HDTVs, PlayStation 3 Slim 120GB ($299.99) & GPS units...",
        "messages": [
            {
                "sender_name": "Best Buy",
                "sender_email": "bestbuy@emailinfo.bestbuy.com",
                "to_str": "bmiller79@gmail.com",
                "date_full": "Fri, Oct 30, 2009 at 6:05 AM",
                "age_str": "6 days ago",
                "mailed_by": "emailinfo.bestbuy.com",
                "body": """BEST BUY — EARLY HOLIDAY SAVINGS

- PlayStation 3 Slim 120GB System — $299.99
- Insignia 42" Class 1080p 60Hz LCD HDTV — $699.99
- Garmin nuvi 255W Widescreen GPS — $149.99
- Energizer AA 24-Pack Batteries — $11.99 (Limit 2 per customer)

Valid at Sacramento, Roseville, and Elk Grove Best Buy stores.""",
            }
        ],
    },
    {
        "id": "t43",
        "folder": "trash",
        "unread": False,
        "starred": False,
        "labels": [],
        "ad_cat": "default",
        "subject": "Fwd: Fwd: SEND TO 10 PEOPLE IN 5 MIN OR 7 YRS BAD LUCK (NO JOKE!!)",
        "date_list": "Oct 25",
        "snippet": "omg dont break the chain!! if u send this to 10 people before 12am your crush will text you tomorrow, if u delete it u will have 7 years of...",
        "messages": [
            {
                "sender_name": "Ashley Rose",
                "sender_email": "ashley_rose_sac@hotmail.com",
                "to_str": "bmiller79@gmail.com, +22 others",
                "date_full": "Sun, Oct 25, 2009 at 11:38 PM",
                "age_str": "11 days ago",
                "mailed_by": "hotmail.com",
                "body": """>>> READ EVERY WORD!! <<<

Tonight at midnight your true love will realize they love you!! Something GOOD will happen to you between 1:00 and 4:00 PM tomorrow — BUT ONLY IF YOU FORWARD THIS TO 10 PEOPLE IN THE NEXT 5 MINUTES!!

If you break the chain you will have 7 YEARS OF TERRIBLE LUCK!! A girl in Stockton ignored this and failed her driving test AND dropped her Razr in the toilet the same day!!

DON'T RISK IT!! FORWARD TO 10 PEOPLE NOW!! <3 <3 <3""",
            }
        ],
    },

    # ================= EXTRA INBOX ITEMS (LinkedIn 2009 + Spooky Chain #2) =================
    {
        "id": "t44",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": [],
        "ad_cat": "default",
        "subject": "LinkedIn: Invitation to connect from Scott Nguyen",
        "date_list": "Oct 18",
        "snippet": "I'd like to add you to my professional network on LinkedIn. - Scott Nguyen, GIS Analyst at Placer County Planning Dept (Auburn, CA)...",
        "messages": [
            {
                "sender_name": "Scott Nguyen (LinkedIn)",
                "sender_email": "invitations@linkedin.com",
                "to_str": "Brian Miller <bmiller79@gmail.com>",
                "date_full": "Sun, Oct 18, 2009 at 4:15 PM",
                "age_str": "18 days ago",
                "mailed_by": "bounce.linkedin.com",
                "html_body": """<div style="max-width:500px;border:1px solid #ccc;font-family:Arial,sans-serif;font-size:12px;color:#333;">
  <div style="background:#eef5fa;padding:8px 12px;border-bottom:2px solid #006699;">
    <b style="font-size:16px;color:#000;">Linked<span style="background:#006699;color:#fff;padding:0 3px;border-radius:2px;">in</span></b>
  </div>
  <div style="padding:14px;line-height:1.5;">
    <p style="margin:0 0 10px;"><b>Scott Nguyen</b> has indicated you are a colleague from <i>California State University, Sacramento</i>:</p>
    <div style="background:#f7f7f7;border:1px solid #ddd;padding:9px 11px;margin-bottom:12px;">
      &ldquo;Hey Brian, saw you're still finishing up the GIS program at Sac State. We might have a temp parcel-digitizing opening up here in Auburn next month if Placer County gets the state grant. Let's stay in touch.&rdquo;<br>
      <span style="color:#666;font-size:11px;">&mdash; Scott Nguyen, GIS Analyst, Placer County Planning Dept.</span>
    </div>
    <p style="margin:0 0 10px;"><a href="#" style="font-weight:bold;color:#006699;">Accept Invitation</a> &nbsp;|&nbsp; <a href="#" style="color:#666;">View Scott's profile</a></p>
    <p style="margin:0;font-size:10px;color:#888;">&copy; 2009, LinkedIn Corporation &bull; 2029 Stierlin Ct., Mountain View, CA 94043</p>
  </div>
</div>""",
            }
        ],
    },
    {
        "id": "t45",
        "folder": "inbox",
        "unread": False,
        "starred": False,
        "labels": [],
        "ad_cat": "default",
        "subject": "Fwd: URGENT WARNING!! DO NOT ANSWER CALLS FROM 777-7777 TONIGHT (HIGH FREQUENCY KILLER)",
        "date_list": "Oct 15",
        "snippet": "PASS THIS ON TO EVERYBODY WITH A CELL PHONE!! MY COUSIN'S COWORKER AT SPRINT SAID IF YOUR PHONE RINGS WITH RED NUMBERS 777-7777...",
        "messages": [
            {
                "sender_name": "Aunt Denise",
                "sender_email": "denise.k.fresno@aol.com",
                "to_str": "linda.miller52@sbcglobal.net, bmiller79@gmail.com, +11 others",
                "date_full": "Thu, Oct 15, 2009 at 7:51 PM",
                "age_str": "21 days ago",
                "mailed_by": "aol.com",
                "body": """Brian and Linda please read this just in case, Sherry from church sent it to me this morning. Love Aunt Denise

--- Forwarded Message ---
PASS THIS ON TO EVERYBODY WITH A CELL PHONE RIGHT NOW!!

A FRIEND WHO WORKS AT SPRINT / VERIZON SAID THAT STARTING TONIGHT HACKERS ARE CALLING CELL PHONES IN CALIFORNIA FROM THE NUMBER "777-7777" OR "999-9999" SHOWING IN RED LETTERS ON YOUR SCREEN!!

DO NOT ANSWER IT!! IF YOU PRESS TALK IT SENDS A HIGH FREQUENCY PULSE THROUGH THE EARPIECE THAT CAUSES INSTANT BRAIN HEMORRHAGE AND DESTROYS YOUR SIM CARD!! 17 PEOPLE IN PHOENIX AND BAKERSFIELD ALREADY DIED THIS WEEK AND CNN IS NOT ALLOWED TO REPORT IT BECAUSE OF THE EMERGENCY ACT!!

FORWARD THIS TO AT LEAST 12 PEOPLE YOU CARE ABOUT BEFORE MIDNIGHT SO THEY DONT PICK UP!!

GOD BLESS AMERICA""",
            }
        ],
    },

    # ================= SAVED GOOGLE TALK CHATS (Chats folder — authentic 2009 Gmail!) =================
    {
        "id": "t46",
        "folder": "chats",
        "unread": False,
        "starred": False,
        "labels": [],
        "ad_cat": "default",
        "subject": "Chat with Dave Kowalski",
        "date_list": "Nov 4",
        "snippet": "Dave: turn on CNN right now   me: im in amador lab why   Dave: something went off near memphis, looks like another nuke...",
        "messages": [
            {
                "sender_name": "Dave Kowalski",
                "sender_email": "dkowalski81@yahoo.com",
                "is_chat": True,
                "to_str": "Brian Miller <bmiller79@gmail.com>",
                "date_full": "Wed, Nov 4, 2009 at 2:04 PM",
                "age_str": "1 day ago",
                "body": """2:04 PM  Dave Kowalski: turn on cnn or kcra right now
2:05 PM  me: im in amador computer lab why, whats going on
2:05 PM  Dave Kowalski: something big went off near memphis, millingon navy base or something
2:05 PM  Dave Kowalski: looks like another nuke man
2:06 PM  me: jesus christ. cnn.com wont load here, just timing out
2:06 PM  Dave Kowalski: yeah internet is crawling. guy in our breakroom has it on the little tv. mushroom cloud from 15 miles away
2:07 PM  me: alright prof just told everyone to pack up, im heading back to my place
2:08 PM  Dave Kowalski: stop for gas on the way if the line isnt crazy yet""",
            }
        ],
    },
    {
        "id": "t47",
        "folder": "chats",
        "unread": False,
        "starred": True,
        "labels": ["Family"],
        "ad_cat": "default",
        "subject": "Chat with Ray Miller",
        "date_list": "Feb 17",
        "snippet": "me: Uncle Ray you there??   Ray Miller: Yeah I'm here Brian. Still in shock. Carol is crying in the kitchen...",
        "messages": [
            {
                "sender_name": "Ray Miller",
                "sender_email": "ray.miller.ma@verizon.net",
                "is_chat": True,
                "to_str": "Brian Miller <bmiller79@gmail.com>",
                "date_full": "Tue, Feb 17, 2009 at 10:18 AM",
                "age_str": "8 months ago",
                "body": """10:18 AM  me: Uncle Ray you there??
10:19 AM  Ray Miller: Yeah I'm here Brian. Still in shock. Carol is sitting at the kitchen table watching the local news.
10:19 AM  me: Thank god. Mom couldn't get through on your landline all night.
10:20 AM  Ray Miller: Phones are completely dead for long distance. Somehow Verizon DSL still works though. Tell your mom we're okay.
10:21 AM  me: Are you guys going in to work today?
10:22 AM  Ray Miller: No, the governor closed state offices and my boss called at 6am saying stay home. Did you hear the radio? Some general in Washington just went on TV saying the Constitution is suspended until they catch who did it.
10:23 AM  me: Yeah KCRA just played a clip of Attorney General Calloway saying he got sworn in somewhere out west. Nobody knows what's real right now.
10:24 AM  Ray Miller: Crazy stuff. I'm gonna run out to Shaw's before the snow starts and grab some canned soup and batteries. Talk later kid.""",
            }
        ],
    },
]

