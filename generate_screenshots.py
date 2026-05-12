"""
Hospital PMS — GitHub Screenshot Generator
Generates professional PNG mockup screenshots for all modules.
Run with: python generate_screenshots.py
"""

from PIL import Image, ImageDraw, ImageFont
import os

# ── Output folder ─────────────────────────────────────────────
OUT = "hospital_pms_screenshots"
os.makedirs(OUT, exist_ok=True)

# ── Dimensions ────────────────────────────────────────────────
W, H = 1280, 720

# ── Colour palette ────────────────────────────────────────────
DARK_BLUE   = "#1E3A5F"
MED_BLUE    = "#2563EB"
SIDEBAR_BG  = "#1E3A5F"
SIDEBAR_ACT = "#2E5C9E"
PAGE_BG     = "#F3F4F6"
WHITE       = "#FFFFFF"
CARD_BG     = "#FFFFFF"
TEXT_PRI    = "#111827"
TEXT_SEC    = "#6B7280"
TEXT_MUTED  = "#9CA3AF"
GREEN       = "#10B981"
AMBER       = "#F59E0B"
RED         = "#EF4444"
PURPLE      = "#8B5CF6"
TEAL        = "#14B8A6"
BORDER      = "#E5E7EB"
BADGE_GREEN = "#DCFCE7"
BADGE_GTEXT = "#166534"
BADGE_AMB   = "#FEF9C3"
BADGE_ATEXT = "#854D0E"
BADGE_BLUE  = "#DBEAFE"
BADGE_BTEXT = "#1E40AF"
BADGE_RED   = "#FEE2E2"
BADGE_RTEXT = "#991B1B"

# ── Helper: try loading a font, fall back to default ──────────
def font(size, bold=False):
    try:
        paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold
            else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold
            else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        ]
        for p in paths:
            if os.path.exists(p):
                return ImageFont.truetype(p, size)
    except Exception:
        pass
    return ImageFont.load_default()

# ── Drawing helpers ───────────────────────────────────────────
def rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=fill,
                            outline=outline, width=width)

def text(draw, pos, txt, fnt, color=TEXT_PRI, anchor="la"):
    draw.text(pos, txt, font=fnt, fill=color, anchor=anchor)

def sidebar(draw, active_item, items):
    """Draw the left sidebar."""
    draw.rectangle([0, 0, 210, H], fill=SIDEBAR_BG)
    # logo
    draw.rectangle([0, 0, 210, 70], fill="#162D4A")
    text(draw, (20, 18), "🏥 Hospital PMS", font(13, True), WHITE)
    text(draw, (20, 40), "হাসপাতাল সিস্টেম", font(10), "#94A3B8")
    icons = ["📊","👥","📅","💰","💊","🔬","📈"]
    for i, (label, ico) in enumerate(zip(items, icons)):
        y = 80 + i * 46
        active = (label == active_item)
        if active:
            draw.rectangle([0, y - 4, 210, y + 38], fill=SIDEBAR_ACT)
            draw.rectangle([0, y - 4, 4, y + 38], fill=MED_BLUE)
        text(draw, (18, y + 8), ico, font(14), WHITE)
        text(draw, (44, y + 9), label, font(11, active), WHITE if active else "#CBD5E1")
    # user badge at bottom
    draw.rectangle([0, H - 70, 210, H], fill="#162D4A")
    draw.ellipse([14, H - 54, 38, H - 30], fill=MED_BLUE)
    text(draw, (26, H - 47), "A", font(11, True), WHITE, "mm")
    text(draw, (46, H - 52), "admin", font(11, True), WHITE)
    text(draw, (46, H - 36), "ADMIN", font(9), "#94A3B8")
    draw.rectangle([12, H - 20, 198, H - 6], fill="#EF4444", outline=None)
    rounded_rect(draw, [12, H - 22, 198, H - 6], 6, "#EF4444")
    text(draw, (105, H - 14), "Logout", font(10, True), WHITE, "mm")

def topbar(draw, title, subtitle=""):
    draw.rectangle([210, 0, W, 60], fill=WHITE)
    draw.line([210, 60, W, 60], fill=BORDER, width=1)
    text(draw, (228, 14), title, font(16, True), TEXT_PRI)
    if subtitle:
        text(draw, (228, 36), subtitle, font(10), TEXT_SEC)

def stat_card(draw, x, y, w, h, label, value, sub, accent):
    rounded_rect(draw, [x, y, x+w, y+h], 10, CARD_BG, BORDER, 1)
    draw.rectangle([x, y, x+4, y+h], fill=accent)
    text(draw, (x+14, y+14), label, font(10), TEXT_SEC)
    text(draw, (x+14, y+32), value, font(20, True), TEXT_PRI)
    text(draw, (x+14, y+60), sub, font(9), TEXT_MUTED)

def badge(draw, x, y, txt, bg, fg, r=8):
    f = font(9)
    bb = f.getbbox(txt)
    tw = bb[2] - bb[0]
    pad = 10
    rounded_rect(draw, [x, y, x + tw + pad*2, y + 18], r, bg)
    text(draw, (x + pad, y + 4), txt, f, fg)
    return x + tw + pad*2 + 6

def table_header(draw, y, cols, xs, bg=PAGE_BG):
    draw.rectangle([228, y, W-12, y+30], fill="#F9FAFB")
    draw.line([228, y+30, W-12, y+30], fill=BORDER, width=1)
    for col, x in zip(cols, xs):
        text(draw, (x, y+9), col.upper(), font(9, True), TEXT_SEC)

def table_row(draw, y, vals, xs, alt=False):
    if alt:
        draw.rectangle([228, y, W-12, y+34], fill="#F9FAFB")
    draw.line([228, y+34, W-12, y+34], fill=BORDER, width=1)
    for val, x in zip(vals, xs):
        text(draw, (x, y+10), str(val), font(10), TEXT_PRI)

MENU = ["Dashboard","Patients","Appointments","Billing","Prescriptions","Lab","Reports"]

# ════════════════════════════════════════════════════════════════
#  1. LOGIN PAGE
# ════════════════════════════════════════════════════════════════
def make_login():
    img = Image.new("RGB", (W, H), "#1D4ED8")
    draw = ImageDraw.Draw(img)
    # gradient-like background dots
    for i in range(0, W, 60):
        for j in range(0, H, 60):
            draw.ellipse([i-1,j-1,i+1,j+1], fill="#2563EB")
    # card
    cx, cy, cw, ch = 440, 120, 400, 460
    rounded_rect(draw, [cx, cy, cx+cw, cy+ch], 16, WHITE)
    # hospital icon circle
    draw.ellipse([cx+160, cy+24, cx+240, cy+104], fill="#DBEAFE")
    text(draw, (cx+200, cy+64), "🏥", font(28), MED_BLUE, "mm")
    # titles
    text(draw, (cx+200, cy+120), "Hospital PMS", font(20, True), DARK_BLUE, "mm")
    text(draw, (cx+200, cy+148), "হাসপাতাল ব্যবস্থাপনা সিস্টেম", font(11), TEXT_SEC, "mm")
    # username field
    text(draw, (cx+28, cy+180), "Username", font(10, True), TEXT_SEC)
    rounded_rect(draw, [cx+24, cy+196, cx+376, cy+228], 8, WHITE, BORDER, 1)
    text(draw, (cx+36, cy+207), "admin", font(11), TEXT_PRI)
    # password field
    text(draw, (cx+28, cy+240), "Password", font(10, True), TEXT_SEC)
    rounded_rect(draw, [cx+24, cy+256, cx+376, cy+288], 8, WHITE, BORDER, 1)
    text(draw, (cx+36, cy+267), "••••", font(14), TEXT_SEC)
    # login button
    rounded_rect(draw, [cx+24, cy+308, cx+376, cy+344], 8, MED_BLUE)
    text(draw, (cx+200, cy+326), "Login", font(13, True), WHITE, "mm")
    # footer
    text(draw, (cx+200, cy+380), "Hospital Patient Management System v1.0", font(9), TEXT_MUTED, "mm")
    text(draw, (cx+200, cy+400), "Bangladesh 🇧🇩", font(9), TEXT_MUTED, "mm")
    # watermark top-left
    text(draw, (40, 30), "Hospital PMS — Login", font(14, True), "#93C5FD")
    img.save(f"{OUT}/01_login_page.png")
    print("✅ 01_login_page.png")

# ════════════════════════════════════════════════════════════════
#  2. DASHBOARD
# ════════════════════════════════════════════════════════════════
def make_dashboard():
    img = Image.new("RGB", (W, H), PAGE_BG)
    draw = ImageDraw.Draw(img)
    sidebar(draw, "Dashboard", MENU)
    topbar(draw, "Dashboard", "Welcome back, admin! 👋")
    # stat cards row
    cards = [
        (228, 72, 228, 90, "Total Patients", "2", "↑ Active", MED_BLUE),
        (466, 72, 228, 90, "Appointments", "1", "Scheduled", GREEN),
        (704, 72, 228, 90, "Total Revenue", "৳1,400", "Paid invoices", TEAL),
        (942, 72, 328, 90, "Pending Payments", "৳0", "Outstanding", AMBER),
    ]
    for x,y,w,h,lbl,val,sub,acc in cards:
        stat_card(draw, x, y, w, h, lbl, val, sub, acc)
    # second row cards
    s2 = [
        (228,174, "1", "Total Invoices", MED_BLUE),
        (406,174, "1", "Prescriptions", GREEN),
        (584,174, "1", "Lab Orders", PURPLE),
        (762,174, "1", "Lab Completed", TEAL),
    ]
    for x,y,val,lbl,acc in s2:
        rounded_rect(draw, [x,y,x+166,y+72], 10, CARD_BG, BORDER, 1)
        text(draw, (x+83, y+22), val, font(22,True), acc, "mm")
        text(draw, (x+83, y+50), lbl, font(9), TEXT_SEC, "mm")
    # recent patients table
    rounded_rect(draw, [228,258, 714,H-12], 10, CARD_BG, BORDER, 1)
    text(draw, (242,270), "Recent Patients", font(12,True), TEXT_PRI)
    text(draw, (690,274), "2 total", font(9), TEXT_MUTED, "ra")
    table_header(draw, 292, ["ID","Name","District","Blood","Status"],
                 [242,320,460,570,640])
    rows = [
        ("P-2026-0002","Fazlur Rahman","Sylhet","A+","Active"),
        ("P-2026-0001","Rahim Ahmed","Dhaka","B+","Active"),
    ]
    for i,(pid,nm,dst,bg,st) in enumerate(rows):
        y=326+i*36
        table_row(draw,y,[pid,nm,dst,"",""],[242,320,460,570,640],i%2==1)
        text(draw,(242,y+10),pid,font(9),MED_BLUE)
        badge(draw,570,y+8,bg,BADGE_RED,BADGE_RTEXT)
        badge(draw,640,y+8,st,BADGE_GREEN,BADGE_GTEXT)
    # departments panel
    rounded_rect(draw, [726,258,W-12,H-12], 10, CARD_BG, BORDER, 1)
    text(draw, (740,270), "Departments", font(12,True), TEXT_PRI)
    depts = [("MED","Medicine",MED_BLUE),("CARD","Cardiology",RED),
             ("GYN","Gynecology",PURPLE),("PED","Pediatrics",AMBER),("SUR","Surgery",GREEN)]
    for i,(code,name,c) in enumerate(depts):
        y=296+i*72
        rounded_rect(draw,[738,y,W-24,y+60],8,CARD_BG,c,2)
        text(draw,(748,y+10),code,font(9,True),c)
        text(draw,(748,y+28),name,font(11,True),TEXT_PRI)
        badge(draw,748,y+42,"Active",BADGE_GREEN,BADGE_GTEXT)
    img.save(f"{OUT}/02_dashboard.png")
    print("✅ 02_dashboard.png")

# ════════════════════════════════════════════════════════════════
#  3. PATIENTS
# ════════════════════════════════════════════════════════════════
def make_patients():
    img = Image.new("RGB", (W, H), PAGE_BG)
    draw = ImageDraw.Draw(img)
    sidebar(draw, "Patients", MENU)
    topbar(draw, "Patients", "Manage all registered patients")
    # add button
    rounded_rect(draw, [W-176,14,W-12,46], 8, MED_BLUE)
    text(draw, (W-94,30), "+ Add Patient", font(11,True), WHITE, "mm")
    # search bar
    rounded_rect(draw, [228,72,W-12,106], 10, CARD_BG, BORDER, 1)
    text(draw, (244,84), "🔍  Search by name, phone, patient ID or NID...", font(10), TEXT_MUTED)
    # add patient form (expanded)
    rounded_rect(draw, [228,116,W-12,330], 10, CARD_BG, "#BFDBFE", 2)
    text(draw, (242,128), "Register New Patient", font(12,True), DARK_BLUE)
    fields = [
        (242,154,"First Name *","Fazlur",280,154,"Last Name *","Rahman"),
        (242,208,"Date of Birth *","1999-01-15",280,208,"Gender *","Male"),
        (242,262,"Blood Group","B+",280,262,"Phone *","01918224367"),
    ]
    for x1,y1,l1,v1,x2,y2,l2,v2 in fields:
        text(draw,(x1,y1),l1,font(9,True),TEXT_SEC)
        rounded_rect(draw,[x1,y1+14,x1+220,y1+36],6,WHITE,BORDER,1)
        text(draw,(x1+8,y1+20),v1,font(10),TEXT_PRI)
        text(draw,(x1+x2,y1),l2,font(9,True),TEXT_SEC)
        rounded_rect(draw,[x1+x2,y1+14,x1+x2+220,y1+36],6,WHITE,BORDER,1)
        text(draw,(x1+x2+8,y1+20),v2,font(10),TEXT_PRI)
    # district field
    text(draw,(242,316),"District *",font(9,True),TEXT_SEC)
    rounded_rect(draw,[242,330,480,352],6,WHITE,BORDER,1)
    text(draw,(250,336),"Sylhet",font(10),TEXT_PRI)
    # save button
    rounded_rect(draw,[242,358,400,384],8,MED_BLUE)
    text(draw,(321,371),"Register Patient",font(11,True),WHITE,"mm")
    # patient table
    rounded_rect(draw, [228,334,W-12,H-12], 10, CARD_BG, BORDER, 1)
    text(draw,(242,344),"Patient List",font(12,True),TEXT_PRI)
    cols=["PATIENT ID","NAME","AGE","GENDER","BLOOD","PHONE","DISTRICT","STATUS"]
    xs   =[242,340,460,510,555,605,720,820]
    table_header(draw,364,cols,xs)
    rows=[
        ("P-2026-0002","Fazlur Rahman","27","Male","A+","01918224367","Sylhet","Active"),
        ("P-2026-0001","Rahim Ahmed","40","Male","B+","01711234567","Dhaka","Active"),
    ]
    for i,(pid,nm,age,gen,bg,ph,dst,st) in enumerate(rows):
        y=398+i*38
        table_row(draw,y,["",nm,age,gen,"",ph,dst,""],[242,340,460,510,555,605,720,820],i%2==1)
        text(draw,(242,y+10),pid,font(9),MED_BLUE)
        badge(draw,555,y+8,bg,BADGE_RED,BADGE_RTEXT)
        badge(draw,820,y+8,st,BADGE_GREEN,BADGE_GTEXT)
    text(draw,(242,H-22),"Total: 2 patient(s)",font(9),TEXT_MUTED)
    img.save(f"{OUT}/03_patients.png")
    print("✅ 03_patients.png")

# ════════════════════════════════════════════════════════════════
#  4. APPOINTMENTS
# ════════════════════════════════════════════════════════════════
def make_appointments():
    img = Image.new("RGB", (W, H), PAGE_BG)
    draw = ImageDraw.Draw(img)
    sidebar(draw, "Appointments", MENU)
    topbar(draw, "Appointments", "Manage patient appointments")
    rounded_rect(draw,[W-200,14,W-12,46],8,MED_BLUE)
    text(draw,(W-106,30),"+ Book Appointment",font(11,True),WHITE,"mm")
    # filters
    rounded_rect(draw,[228,72,W-12,110],10,CARD_BG,BORDER,1)
    text(draw,(236,82),"Filter by Date",font(9,True),TEXT_SEC)
    rounded_rect(draw,[228,96,460,118],6,WHITE,BORDER,1)
    text(draw,(236,102),"mm/dd/yyyy",font(10),TEXT_MUTED)
    text(draw,(474,82),"Filter by Status",font(9,True),TEXT_SEC)
    rounded_rect(draw,[474,96,720,118],6,WHITE,BORDER,1)
    text(draw,(482,102),"All Status",font(10),TEXT_PRI)
    rounded_rect(draw,[734,96,800,118],6,"#F3F4F6",BORDER,1)
    text(draw,(767,102),"Clear",font(10),TEXT_SEC,"mm")
    # table
    rounded_rect(draw,[228,122,W-12,H-12],10,CARD_BG,BORDER,1)
    cols=["PATIENT","DOCTOR","DEPARTMENT","DATE & TIME","TYPE","SYMPTOMS","STATUS"]
    xs  =[242,360,500,620,760,860,1000]
    table_header(draw,138,cols,xs)
    rows=[
        ("Rahim Ahmed","Dr. Abdul Karim","Medicine","May 10, 2026 10:00 AM","OPD","Fever and headache","SCHEDULED"),
    ]
    for i,(pat,doc,dept,dt,typ,sym,st) in enumerate(rows):
        y=172+i*40
        table_row(draw,y,[pat,doc,dept,dt,"",sym,""],[242,360,500,620,760,860,1000],False)
        badge(draw,760,y+8,typ,BADGE_BLUE,BADGE_BTEXT)
        badge(draw,1000,y+8,st,BADGE_BLUE,BADGE_BTEXT)
    text(draw,(242,H-22),"Total: 1 appointment(s)",font(9),TEXT_MUTED)
    img.save(f"{OUT}/04_appointments.png")
    print("✅ 04_appointments.png")

# ════════════════════════════════════════════════════════════════
#  5. BILLING
# ════════════════════════════════════════════════════════════════
def make_billing():
    img = Image.new("RGB", (W, H), PAGE_BG)
    draw = ImageDraw.Draw(img)
    sidebar(draw, "Billing", MENU)
    topbar(draw, "Billing", "Manage invoices and payments")
    rounded_rect(draw,[W-160,14,W-12,46],8,MED_BLUE)
    text(draw,(W-86,30),"+ New Invoice",font(11,True),WHITE,"mm")
    # summary cards
    sc = [(228,72,"Total Collected","৳1,400","Paid invoices",GREEN),
          (566,72,"Pending Amount","৳0","Unpaid invoices",AMBER),
          (904,72,"Total Invoices","1","All time",MED_BLUE)]
    for x,y,lbl,val,sub,acc in sc:
        rounded_rect(draw,[x,y,x+326,y+86],10,CARD_BG,BORDER,1)
        draw.rectangle([x,y,x+4,y+86],fill=acc)
        text(draw,(x+14,y+12),lbl,font(10),TEXT_SEC)
        text(draw,(x+14,y+30),val,font(20,True),TEXT_PRI)
        text(draw,(x+14,y+60),sub,font(9),acc)
    # filter
    rounded_rect(draw,[228,170,W-12,202],10,CARD_BG,BORDER,1)
    rounded_rect(draw,[236,178,400,196],6,WHITE,BORDER,1)
    text(draw,(244,183),"All Invoices",font(10),TEXT_PRI)
    # table
    rounded_rect(draw,[228,212,W-12,H-12],10,CARD_BG,BORDER,1)
    cols=["INVOICE #","PATIENT","TOTAL (৳)","PAID (৳)","METHOD","DATE","STATUS","ACTION"]
    xs  =[242,380,520,620,720,820,920,1040]
    table_header(draw,226,cols,xs)
    rows=[("INV-2026-0001","Rahim Ahmed","1,400","1,400","CASH","5/9/2026","PAID")]
    for i,row in enumerate(rows):
        y=260+i*40
        table_row(draw,y,list(row)+[""],[242,380,520,620,720,820,920,1040],False)
        text(draw,(242,y+10),row[0],font(9),MED_BLUE)
        badge(draw,920,y+8,"PAID",BADGE_GREEN,BADGE_GTEXT)
        text(draw,(1040,y+10),"✅ Paid",font(9),GREEN)
        rounded_rect(draw,[1090,y+6,1160,y+26],6,"#EFF6FF",BORDER,1)
        text(draw,(1125,y+16),"🖨️ Print",font(9),MED_BLUE,"mm")
    text(draw,(242,H-22),"Total: 1 invoice(s)",font(9),TEXT_MUTED)
    img.save(f"{OUT}/05_billing.png")
    print("✅ 05_billing.png")

# ════════════════════════════════════════════════════════════════
#  6. BILLING — PAYMENT MODAL
# ════════════════════════════════════════════════════════════════
def make_payment_modal():
    img = Image.new("RGB", (W, H), PAGE_BG)
    draw = ImageDraw.Draw(img)
    sidebar(draw, "Billing", MENU)
    topbar(draw, "Billing", "Manage invoices and payments")
    # dim overlay
    overlay = Image.new("RGBA", (W-210, H-60), (0,0,0,130))
    img.paste(Image.new("RGB",(W-210,H-60),"#000000"), (210,60), overlay)
    # modal card
    mx,my,mw,mh = 430,100,420,460
    rounded_rect(draw,[mx,my,mx+mw,my+mh],16,WHITE)
    text(draw,(mx+20,my+18),"Collect Payment",font(14,True),TEXT_PRI)
    text(draw,(mx+mw-16,my+22),"×",font(16),TEXT_SEC,"ra")
    # invoice summary box
    rounded_rect(draw,[mx+16,my+50,mx+mw-16,my+140],10,"#EFF6FF","#BFDBFE",1)
    text(draw,(mx+28,my+62),"Invoice",font(9),TEXT_SEC)
    text(draw,(mx+28,my+76),"INV-2026-0001",font(11,True),MED_BLUE)
    text(draw,(mx+28,my+96),"Patient",font(9),TEXT_SEC)
    text(draw,(mx+28,my+110),"Rahim Ahmed",font(11,True),TEXT_PRI)
    text(draw,(mx+28,my+128),"৳1,400",font(18,True),TEXT_PRI)
    text(draw,(mx+120,my+136),"total",font(9),TEXT_SEC)
    # payment methods
    text(draw,(mx+20,my+156),"Payment Method",font(10,True),TEXT_SEC)
    methods=[("💵","Cash",False),("📱","bKash",True),("📱","Nagad",False),("🚀","Rocket",False),("💳","Card",False)]
    for j,(ico,lbl,active) in enumerate(methods):
        bx=mx+16+j*78
        by=my+174
        bg = "#EFF6FF" if active else WHITE
        brd = MED_BLUE if active else BORDER
        rounded_rect(draw,[bx,by,bx+70,by+54],8,bg,brd,2 if active else 1)
        text(draw,(bx+35,by+18),ico,font(14),MED_BLUE if active else TEXT_SEC,"mm")
        text(draw,(bx+35,by+40),lbl,font(9,active),MED_BLUE if active else TEXT_SEC,"mm")
    # transaction id
    text(draw,(mx+20,my+242),"Transaction ID *",font(9,True),TEXT_SEC)
    rounded_rect(draw,[mx+16,my+256,mx+mw-16,my+278],6,WHITE,BORDER,1)
    text(draw,(mx+24,my+262),"e.g. 8N7A3K2D1M",font(10),TEXT_MUTED)
    # amount
    text(draw,(mx+20,my+290),"Amount Received (৳)",font(9,True),TEXT_SEC)
    rounded_rect(draw,[mx+16,my+304,mx+mw-16,my+326],6,WHITE,BORDER,1)
    text(draw,(mx+24,my+310),"1400",font(11),TEXT_PRI)
    # confirm button
    rounded_rect(draw,[mx+16,my+342,mx+200,my+372],8,GREEN)
    text(draw,(mx+108,my+357),"✅ Confirm Payment",font(11,True),WHITE,"mm")
    rounded_rect(draw,[mx+208,my+342,mx+mw-16,my+372],8,"#F3F4F6",BORDER,1)
    text(draw,(mx+316,my+357),"Cancel",font(11),TEXT_SEC,"mm")
    img.save(f"{OUT}/06_billing_payment_modal.png")
    print("✅ 06_billing_payment_modal.png")

# ════════════════════════════════════════════════════════════════
#  7. PRINT INVOICE
# ════════════════════════════════════════════════════════════════
def make_print_invoice():
    img = Image.new("RGB", (W, H), "#F8FAFC")
    draw = ImageDraw.Draw(img)
    # browser bar mock
    draw.rectangle([0,0,W,36],fill="#E5E7EB")
    rounded_rect(draw,[80,6,W-80,28],4,WHITE,BORDER,1)
    text(draw,(W//2,17),"about:blank",font(10),TEXT_SEC,"mm")
    # invoice paper
    px,py,pw = 240,50,800
    rounded_rect(draw,[px,py,px+pw,H-10],8,WHITE)
    # header
    draw.line([px,py+80,px+pw,py+80],fill=MED_BLUE,width=2)
    text(draw,(px+pw//2,py+20),"🏥  Hospital PMS",font(20,True),MED_BLUE,"mm")
    text(draw,(px+pw//2,py+50),"হাসপাতাল ব্যবস্থাপনা সিস্টেম  |  Dhaka, Bangladesh",font(10),TEXT_SEC,"mm")
    text(draw,(px+pw//2,py+68),"INVOICE",font(14,True),DARK_BLUE,"mm")
    # info grid
    rounded_rect(draw,[px+20,py+94,px+380,py+160],8,"#F8FAFC",BORDER,1)
    text(draw,(px+32,py+102),"INVOICE NUMBER",font(8,True),TEXT_SEC)
    text(draw,(px+32,py+116),"INV-2026-0001",font(12,True),MED_BLUE)
    text(draw,(px+32,py+136),"DATE",font(8,True),TEXT_SEC)
    text(draw,(px+32,py+150),"May 9, 2026",font(11),TEXT_PRI)
    rounded_rect(draw,[px+400,py+94,px+pw-20,py+160],8,"#F8FAFC",BORDER,1)
    text(draw,(px+412,py+102),"PATIENT",font(8,True),TEXT_SEC)
    text(draw,(px+412,py+116),"Rahim Ahmed",font(12,True),TEXT_PRI)
    text(draw,(px+412,py+136),"STATUS",font(8,True),TEXT_SEC)
    badge(draw,px+412,py+148,"PAID",BADGE_GREEN,BADGE_GTEXT)
    # items table
    draw.rectangle([px+20,py+172,px+pw-20,py+200],fill=MED_BLUE)
    for lbl,x in [("#",px+28),("Description",px+70),("Qty",px+350),("Unit Price (৳)",px+440),("Total (৳)",px+600)]:
        text(draw,(x,py+182),lbl,font(9,True),WHITE)
    for i,(n,desc,qty,up,tot) in enumerate([
        ("1","Consultation fee","1","800","800"),
        ("2","Lab Test CBC","1","600","600"),
    ]):
        y=py+202+i*30
        if i%2==0: draw.rectangle([px+20,y,px+pw-20,y+28],fill="#F9FAFB")
        draw.line([px+20,y+28,px+pw-20,y+28],fill=BORDER,width=1)
        for val,x in [(n,px+28),(desc,px+70),(qty,px+350),(up,px+440),(tot,px+600)]:
            text(draw,(x,y+8),val,font(10),TEXT_PRI)
    # totals
    ty=py+264
    for lbl,val in [("Subtotal","৳1,400"),("Discount","- ৳0"),("Tax","৳0")]:
        text(draw,(px+pw-230,ty),lbl,font(10),TEXT_SEC,"la")
        text(draw,(px+pw-28,ty),val,font(10),TEXT_SEC,"ra")
        ty+=22
    draw.line([px+pw-240,ty-2,px+pw-20,ty-2],fill=MED_BLUE,width=1)
    text(draw,(px+pw-230,ty+2),"Total",font(12,True),TEXT_PRI,"la")
    text(draw,(px+pw-28,ty+2),"৳1,400",font(14,True),MED_BLUE,"ra")
    # payment details
    rounded_rect(draw,[px+20,ty+30,px+pw-20,ty+68],8,"#EFF6FF","#BFDBFE",1)
    text(draw,(px+32,ty+38),"Payment Details",font(10,True),DARK_BLUE)
    text(draw,(px+32,ty+54),"Method: CASH   |   Amount Paid: ৳1,400",font(10),TEXT_SEC)
    # footer
    draw.line([px+20,H-60,px+pw-20,H-60],fill=BORDER,width=1)
    text(draw,(px+pw//2,H-46),"Thank you for choosing Hospital PMS",font(10),TEXT_SEC,"mm")
    text(draw,(px+pw//2,H-28),"Computer-generated invoice. No signature required.",font(9),TEXT_MUTED,"mm")
    img.save(f"{OUT}/07_print_invoice.png")
    print("✅ 07_print_invoice.png")

# ════════════════════════════════════════════════════════════════
#  8. PRESCRIPTIONS
# ════════════════════════════════════════════════════════════════
def make_prescriptions():
    img = Image.new("RGB", (W, H), PAGE_BG)
    draw = ImageDraw.Draw(img)
    sidebar(draw, "Prescriptions", MENU)
    topbar(draw, "Prescriptions", "Manage patient prescriptions")
    rounded_rect(draw,[W-200,14,W-12,46],8,MED_BLUE)
    text(draw,(W-106,30),"+ New Prescription",font(11,True),WHITE,"mm")
    # table
    rounded_rect(draw,[228,72,W-12,H-12],10,CARD_BG,BORDER,1)
    cols=["PATIENT","DOCTOR","DIAGNOSIS","MEDICINES","FOLLOW-UP","DATE","ACTION"]
    xs  =[242,380,520,720,820,940,1060]
    table_header(draw,88,cols,xs)
    rows=[("Rahim Ahmed","Dr. Abdul Karim","High fever and cough","1 medicine(s)","2026-08-18","5/9/2026")]
    for i,row in enumerate(rows):
        y=122+i*40
        table_row(draw,y,list(row)+[""],[242,380,520,720,820,940,1060],False)
        badge(draw,720,y+8,"1 medicine(s)",BADGE_BLUE,BADGE_BTEXT)
        rounded_rect(draw,[1060,y+6,1140,y+26],6,"#EFF6FF",BORDER,1)
        text(draw,(1100,y+16),"View Rx",font(9,True),MED_BLUE,"mm")
    text(draw,(242,H-22),"Total: 1 prescription(s)",font(9),TEXT_MUTED)
    img.save(f"{OUT}/08_prescriptions.png")
    print("✅ 08_prescriptions.png")

# ════════════════════════════════════════════════════════════════
#  9. PRESCRIPTION DETAIL MODAL
# ════════════════════════════════════════════════════════════════
def make_rx_modal():
    img = Image.new("RGB", (W, H), PAGE_BG)
    draw = ImageDraw.Draw(img)
    sidebar(draw, "Prescriptions", MENU)
    topbar(draw, "Prescriptions", "Manage patient prescriptions")
    overlay = Image.new("RGBA",(W-210,H-60),(0,0,0,130))
    img.paste(Image.new("RGB",(W-210,H-60),"#000000"),(210,60),overlay)
    mx,my,mw,mh = 320,60,640,540
    rounded_rect(draw,[mx,my,mx+mw,my+mh],16,WHITE)
    draw.line([mx,my+60,mx+mw,my+60],fill=BORDER,width=1)
    text(draw,(mx+20,my+20),"🏥 Prescription",font(16,True),TEXT_PRI)
    text(draw,(mx+20,my+44),"May 9, 2026",font(9),TEXT_MUTED)
    text(draw,(mx+mw-16,my+26),"×",font(16),TEXT_SEC,"ra")
    # patient/doctor
    rounded_rect(draw,[mx+16,my+74,mx+300,my+120],8,"#EFF6FF","#BFDBFE",1)
    text(draw,(mx+28,my+84),"Patient",font(9),TEXT_SEC)
    text(draw,(mx+28,my+100),"Rahim Ahmed",font(12,True),TEXT_PRI)
    rounded_rect(draw,[mx+316,my+74,mx+mw-16,my+120],8,"#ECFDF5","#A7F3D0",1)
    text(draw,(mx+328,my+84),"Doctor",font(9),TEXT_SEC)
    text(draw,(mx+328,my+100),"Dr. Abdul Karim",font(12,True),TEXT_PRI)
    # diagnosis
    text(draw,(mx+20,my+132),"DIAGNOSIS",font(8,True),TEXT_SEC)
    rounded_rect(draw,[mx+16,my+146,mx+mw-16,my+176],8,"#F9FAFB",BORDER,1)
    text(draw,(mx+24,my+156),"High fever and cough",font(11),TEXT_PRI)
    # medicines table
    text(draw,(mx+20,my+186),"MEDICINES (1)",font(8,True),TEXT_SEC)
    rounded_rect(draw,[mx+16,my+200,mx+mw-16,my+290],8,WHITE,BORDER,1)
    draw.rectangle([mx+16,my+200,mx+mw-16,my+224],fill="#F9FAFB")
    for lbl,x in [("#",mx+26),("Medicine",mx+60),("Dosage",mx+200),("Frequency",mx+310),("Duration",mx+430),("Instructions",mx+530)]:
        text(draw,(x,my+210),lbl,font(8,True),TEXT_SEC)
    draw.line([mx+16,my+224,mx+mw-16,my+224],fill=BORDER,width=1)
    for val,x in [("1",mx+26),("Paracetamol",mx+60),("500mg",mx+200),("",mx+310),("7 days",mx+430),("—",mx+530)]:
        text(draw,(x,my+234),val,font(10),TEXT_PRI)
    badge(draw,mx+310,my+230,"Once daily","#F3E8FF","#7C3AED")
    # advice
    text(draw,(mx+20,my+300),"ADVICE",font(8,True),TEXT_SEC)
    rounded_rect(draw,[mx+16,my+314,mx+mw-16,my+350],8,"#FFFBEB","#FDE68A",1)
    text(draw,(mx+24,my+328),"Take rest.",font(11),TEXT_PRI)
    # follow-up
    rounded_rect(draw,[mx+16,my+362,mx+mw-16,my+400],8,"#FFF7ED","#FED7AA",1)
    text(draw,(mx+24,my+370),"Follow-up Date",font(9),TEXT_SEC)
    text(draw,(mx+24,my+386),"2026-08-18",font(13,True),AMBER)
    img.save(f"{OUT}/09_prescription_detail.png")
    print("✅ 09_prescription_detail.png")

# ════════════════════════════════════════════════════════════════
#  10. LAB MODULE
# ════════════════════════════════════════════════════════════════
def make_lab():
    img = Image.new("RGB", (W, H), PAGE_BG)
    draw = ImageDraw.Draw(img)
    sidebar(draw, "Lab", MENU)
    topbar(draw, "Lab & Diagnostics", "Manage lab orders and test results")
    rounded_rect(draw,[W-200,14,W-12,46],8,MED_BLUE)
    text(draw,(W-106,30),"+ New Lab Order",font(11,True),WHITE,"mm")
    # stat cards
    for x,lbl,val,acc in [(228,"Total Orders","1",MED_BLUE),(566,"Pending","0",AMBER),(904,"Completed","1",GREEN)]:
        rounded_rect(draw,[x,72,x+326,148],10,CARD_BG,BORDER,1)
        draw.rectangle([x,72,x+4,148],fill=acc)
        text(draw,(x+14,84),lbl,font(10),TEXT_SEC)
        text(draw,(x+14,102),val,font(22,True),TEXT_PRI)
    # filter
    rounded_rect(draw,[228,160,W-12,192],10,CARD_BG,BORDER,1)
    rounded_rect(draw,[236,168,460,186],6,WHITE,BORDER,1)
    text(draw,(244,173),"All Orders",font(10),TEXT_PRI)
    # table
    rounded_rect(draw,[228,202,W-12,H-12],10,CARD_BG,BORDER,1)
    cols=["ORDER #","PATIENT","DOCTOR","TESTS","DATE","STATUS","ACTIONS"]
    xs  =[242,380,530,680,780,880,1000]
    table_header(draw,216,cols,xs)
    rows=[("LAB-2026-0001","Rahim Ahmed","Dr. Abdul Karim","1 test(s)","5/9/2026","COMPLETED")]
    for i,row in enumerate(rows):
        y=250+i*40
        table_row(draw,y,list(row)+[""],[242,380,530,680,780,880,1000],False)
        text(draw,(242,y+10),row[0],font(9),MED_BLUE)
        badge(draw,680,y+8,"1 test(s)",BADGE_BLUE,BADGE_BTEXT)
        badge(draw,880,y+8,"COMPLETED",BADGE_GREEN,BADGE_GTEXT)
        rounded_rect(draw,[1000,y+6,1060,y+26],6,"#EFF6FF",BORDER,1)
        text(draw,(1030,y+16),"View",font(9,True),MED_BLUE,"mm")
    text(draw,(242,H-22),"Total: 1 order(s)",font(9),TEXT_MUTED)
    img.save(f"{OUT}/10_lab_diagnostics.png")
    print("✅ 10_lab_diagnostics.png")

# ════════════════════════════════════════════════════════════════
#  11. REPORTS
# ════════════════════════════════════════════════════════════════
def make_reports():
    img = Image.new("RGB", (W, H), PAGE_BG)
    draw = ImageDraw.Draw(img)
    sidebar(draw, "Reports", MENU)
    topbar(draw, "Reports & Analytics", "Hospital performance overview")
    rounded_rect(draw,[W-130,14,W-12,46],8,"#EFF6FF","#BFDBFE",1)
    text(draw,(W-71,30),"🔄 Refresh",font(10,True),MED_BLUE,"mm")
    # main stats
    main_cards=[
        (228,72,"Total Patients","2","👥",MED_BLUE),
        (466,72,"Appointments","1","📅",PURPLE),
        (704,72,"Total Revenue","৳1,400","💰",GREEN),
        (942,72,"Pending Payments","৳0","⏳",RED),
    ]
    for x,y,lbl,val,ico,acc in main_cards:
        rounded_rect(draw,[x,y,x+226,y+86],10,CARD_BG,BORDER,1)
        draw.rectangle([x,y,x+4,y+86],fill=acc)
        text(draw,(x+14,y+12),lbl,font(10),TEXT_SEC)
        text(draw,(x+14,y+30),val,font(20,True),TEXT_PRI)
        text(draw,(x+200,y+40),ico,font(22),acc,"rm")
    # secondary stats
    for x,val,lbl,acc in [(228,174,"1","Total Invoices",MED_BLUE),(414,174,"1","Prescriptions",GREEN),
                           (600,174,"1","Lab Orders",PURPLE),(786,174,"1","Lab Completed",TEAL)]:
        rounded_rect(draw,[x,174,x+174,246],10,CARD_BG,BORDER,1)
        text(draw,(x+87,198),val,font(22,True),acc,"mm")
        text(draw,(x+87,228),lbl,font(9),TEXT_SEC,"mm")
    # recent patients
    rounded_rect(draw,[228,258,714,H-12],10,CARD_BG,BORDER,1)
    text(draw,(242,270),"Recent Patients",font(12,True),TEXT_PRI)
    text(draw,(700,274),"2 total",font(9),TEXT_MUTED,"ra")
    table_header(draw,290,["ID","Name","District","Blood"],[242,320,500,620])
    for i,(pid,nm,dst,bg) in enumerate([("P-2026-0002","Fazlur Rahman","Sylhet","A+"),
                                         ("P-2026-0001","Rahim Ahmed","Dhaka","B+")]):
        y=324+i*36
        table_row(draw,y,["",nm,dst,""],[242,320,500,620],i%2==1)
        text(draw,(242,y+10),pid,font(9),MED_BLUE)
        badge(draw,620,y+8,bg,BADGE_RED,BADGE_RTEXT)
    # departments
    rounded_rect(draw,[726,258,W-12,H-12],10,CARD_BG,BORDER,1)
    text(draw,(740,270),"Departments Overview",font(12,True),TEXT_PRI)
    depts=[("MED","Medicine",MED_BLUE),("CARD","Cardiology",RED),
           ("GYN","Gynecology",PURPLE),("PED","Pediatrics",AMBER),("SUR","Surgery",GREEN)]
    for i,(code,name,c) in enumerate(depts):
        y=296+i*72
        rounded_rect(draw,[738,y,W-24,y+60],8,CARD_BG,c,2)
        text(draw,(748,y+10),code,font(9,True),c)
        text(draw,(748,y+28),name,font(11,True),TEXT_PRI)
        badge(draw,748,y+42,"Active",BADGE_GREEN,BADGE_GTEXT)
    img.save(f"{OUT}/11_reports_analytics.png")
    print("✅ 11_reports_analytics.png")

# ════════════════════════════════════════════════════════════════
#  12. DJANGO ADMIN PANEL
# ════════════════════════════════════════════════════════════════
def make_admin():
    img = Image.new("RGB", (W, H), "#F8F8F8")
    draw = ImageDraw.Draw(img)
    # top bar
    draw.rectangle([0,0,W,50],fill="#20AA76")
    text(draw,(16,16),"Django administration",font(16,True),WHITE)
    text(draw,(W-120,16),"WELCOME, ADMIN.",font(10),WHITE)
    text(draw,(W-48,16),"LOG OUT",font(10),"#A7F3D0","ra")
    # breadcrumb
    draw.rectangle([0,50,W,80],fill="#EEEEEE")
    text(draw,(16,62),"Home",font(10),"#0C447C")
    # sidebar nav
    draw.rectangle([0,80,220,H],fill="#F5F5F5")
    draw.line([220,80,220,H],fill="#DDDDDD",width=1)
    text(draw,(12,92),"Start typing to filter...",font(9),TEXT_MUTED)
    draw.rectangle([0,110,220,136],fill="#20AA76")
    text(draw,(12,120),"APPOINTMENTS",font(9,True),WHITE)
    for i,item in enumerate(["Appointments","Departments","Doctors"]):
        y=138+i*24
        text(draw,(20,y),item,font(10),"#0C447C")
    draw.rectangle([0,214,220,240],fill="#20AA76")
    text(draw,(12,224),"AUTHENTICATION",font(9,True),WHITE)
    text(draw,(20,242),"Users",font(10),"#0C447C")
    draw.rectangle([0,266,220,292],fill="#20AA76")
    text(draw,(12,276),"BILLING",font(9,True),WHITE)
    for i,item in enumerate(["Invoice items","Invoices"]):
        text(draw,(20,294+i*24),item,font(10),"#0C447C")
    draw.rectangle([0,342,220,368],fill="#20AA76")
    text(draw,(12,352),"LAB",font(9,True),WHITE)
    for i,item in enumerate(["Lab order items","Lab orders","Lab tests"]):
        text(draw,(20,370+i*24),item,font(10),"#0C447C")
    draw.rectangle([0,442,220,468],fill="#20AA76")
    text(draw,(12,452),"PATIENTS",font(9,True),WHITE)
    text(draw,(20,470),"Patients",font(10),"#0C447C")
    draw.rectangle([0,494,220,520],fill="#20AA76")
    text(draw,(12,504),"PRESCRIPTIONS",font(9,True),WHITE)
    # main content
    text(draw,(240,90),"Site administration",font(14,True),TEXT_PRI)
    # module boxes
    modules=[
        (240,120,"APPOINTMENTS",["Appointments","Departments","Doctors"]),
        (640,120,"AUTHENTICATION",["Users"]),
        (240,260,"BILLING",["Invoice items","Invoices"]),
        (640,260,"LAB",["Lab order items","Lab orders","Lab tests"]),
        (240,420,"PATIENTS",["Patients"]),
        (640,420,"PRESCRIPTIONS",["Prescriptions","Prescription items"]),
    ]
    for bx,by,title,items in modules:
        bw=380; bh=30+len(items)*36
        rounded_rect(draw,[bx,by,bx+bw,by+bh],4,WHITE,"#DDDDDD",1)
        draw.rectangle([bx,by,bx+bw,by+28],fill="#20AA76")
        text(draw,(bx+8,by+8),title,font(10,True),WHITE)
        for j,item in enumerate(items):
            iy=by+32+j*36
            text(draw,(bx+10,iy),item,font(10),"#0C447C")
            text(draw,(bx+bw-70,iy),"+ Add",font(9),"#0C447C","la")
            text(draw,(bx+bw-20,iy),"✏ Change",font(9),"#0C447C","ra")
            draw.line([bx,iy+18,bx+bw,iy+18],fill="#EEEEEE",width=1)
    img.save(f"{OUT}/12_django_admin_panel.png")
    print("✅ 12_django_admin_panel.png")

# ════════════════════════════════════════════════════════════════
#  RUN ALL
# ════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("\n🏥 Hospital PMS — Generating GitHub Screenshots\n" + "─"*46)
    make_login()
    make_dashboard()
    make_patients()
    make_appointments()
    make_billing()
    make_payment_modal()
    make_print_invoice()
    make_prescriptions()
    make_rx_modal()
    make_lab()
    make_reports()
    make_admin()
    print("\n" + "─"*46)
    print(f"✅ All 12 screenshots saved to: ./{OUT}/")
    print("📁 Files ready for your GitHub repository!")
