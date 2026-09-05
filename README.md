# rightslandingpagerefined

אתר מידע בעברית לקראת המעבר מגמלת ילד נכה לזכויות בגיל 18.

## מבנה האתר
- `index.html` — דף הבית
- `disability.html` — נכות כללית
- `special-services.html` — שירותים מיוחדים (שר״ם)
- `vocational-rehab.html` — שיקום מקצועי
- `insurance.html` — דמי ביטוח
- `links.html` — קישורים וכלי עזר
- `accessibility.html` — הצהרת נגישות
- `styles.css` — עיצוב
- `script.js` — חיפוש, נגישות ואינטראקציות
- `search-index.js` — אינדקס החיפוש באתר

## פרסום ב-Vercel
יש לחבר את ה-repository ל-Vercel ולבחור את branch `main`.
אין צורך בפקודת Build — זהו אתר סטטי.

> לפני פרסום רשמי יש לבצע בדיקה מקצועית של תוכן, נגישות וקישורים.


## Pilot update
This version includes:
- corrected homepage benefits link
- removed "trial version" wording
- improved mobile layout and mobile navigation
- feedback button on all core pages
- new `feedback.html` page
- removal of retirement/old-age calculator content
- search index rebuilt from the updated pages

### Feedback behavior
The feedback form does not collect or store personal data on a server.
On mobile, the respondent can use the device Share sheet to send the prepared feedback back through WhatsApp, email, SMS, etc.
On desktop, the feedback can be copied and pasted into a reply.

### Deploy
Upload/replace these files in the GitHub `main` branch. Vercel should deploy automatically.
