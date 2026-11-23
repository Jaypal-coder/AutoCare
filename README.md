# 🚗 AutoCare – Vehicle Maintenance & Service Tracking Platform

AutoCare is a frontend web app that helps vehicle owners keep all their cars, bikes and scooters in one place, and never miss a service date.

It is built with **React.js (Vite)** and plain **CSS**. There is no backend: everything is saved in the browser (localStorage), so your data is still there after a refresh.


---

## ✨ Features

### Available now
- **Sign Up page**
  - Full form validation (name, email, optional phone, password, confirm password, terms)
  - Show / Hide password buttons
  - Live password strength bar
- **Dashboard**
  - Summary cards: total vehicles, upcoming services, overdue tasks, total expenses
  - Monthly expenses bar chart (built with plain CSS, no chart library)
  - Upcoming reminders created from your vehicles' next service dates
  - Recent services table
  - Bell icon with the number of reminders that need attention
- **My Vehicles**
  - Vehicle cards with image, registration number, fuel type, odometer and status (Good / Due soon / Overdue)
  - Search by name or registration number
  - Filter by vehicle type and fuel type
  - Delete a vehicle (with a confirmation)
- **Add Vehicle**
  - Form with validation
  - Duplicate registration numbers are blocked
  - Optional next service date, used for the Dashboard reminders

### Coming soon
- Service History
- Maintenance
- Expenses
- Settings

---

## 🛠️ Tech stack

| Technology | Used for |
| ---------- | -------- |
| React.js (Vite) | Building the user interface |
| CSS (Flexbox and Grid) | Styling and responsive layout |
| localStorage | Saving data in the browser |

### React concepts used
- Components and props
- `useState` and `useEffect`
- A small custom hook (`useLocalStorage`)
- `map()` and `filter()` for lists, search and filters
- Controlled forms with validation
- Conditional rendering to switch between pages (no router needed)

---

## 🚀 How to run the project

1. Clone the repository

   ```bash
   git clone https://github.com/Jaypal-coder/AutoCare.git
   cd AutoCare
   ```

2. Install the packages

   ```bash
   npm install
   ```

3. Start the development server

   ```bash
   npm run dev
   ```

4. Open the link shown in the terminal (usually http://localhost:5173)

---

## 📖 How to use

1. Fill in the **Sign Up** form and create your account.
2. You land on the **Dashboard**. Three sample vehicles are already added so you can see how the app looks.
3. Open **My Vehicles** to search, filter or delete vehicles.
4. Click **+ Add Vehicle** to add your own vehicle. Give it a next service date and a reminder will appear on the Dashboard.

To start again from zero, click **Sign out**, or clear the site data in the browser (DevTools → Application → Local Storage).

---

## 📁 Project structure

```
src/
├── App.jsx        All pages and logic (Sign Up, Dashboard, My Vehicles, Add Vehicle)
├── App.css        All styles
├── main.jsx       Starts the app
└── assets/        Icons and vehicle images
```

---

## 📝 Notes

- This is a **frontend-only** project, so there is no login. Only sign up is built.
- The password is checked in the form but **never saved**, because a frontend project must not store passwords in the browser.
- Only the name, email and phone are saved in localStorage.

---

## 👨‍💻 Author

**Jaypal Solanki**
- GitHub: [Jaypal-coder](https://github.com/Jaypal-coder)
- LinkedIn: [jaypal-solanki](https://www.linkedin.com/in/jaypal-solanki-997039327)
