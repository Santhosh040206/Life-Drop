# LifeDrop — Blood Bank Management Website

A responsive Blood Bank Management website that streamlines donor registration, blood inventory management, and blood request processing.

## Features
- **Live blood inventory** dashboard by group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- **Donor registration** with validation
- **Blood search** by group and city
- **Blood request** submission with urgency levels
- **Admin dashboard** with tabs to manage donors, inventory, and requests (approve/reject)
- Fully **responsive** (desktop, tablet, mobile)
- Data persisted in `localStorage` (no backend required)

## Run
Just open `index.html` in a browser — that's it. No build step.

```
index.html
├── css/styles.css
└── js/app.js
```

## Tech
Pure HTML + CSS + Vanilla JavaScript. No dependencies.

## Admin
The **Admin** tab is exposed on the same page for demo purposes. In production, guard it behind authentication.
