import { useState, useEffect } from "react";
import "./App.css";
import carLogo from "./assets/car.png";
import sideCar from "./assets/side-car.png";
import service from "./assets/service.png";
import clock from "./assets/clock.png";
import exp from "./assets/exp.png";
import homeIcon from "./assets/home.png";
import settingsIcon from "./assets/settings.png";
import bellIcon from "./assets/bell.png";
import warningIcon from "./assets/warning.png";
import bikeImage from "./assets/bike.png";
import scooterImage from "./assets/scooter.png";
import suvImage from "./assets/suv.png";

/* =====================================================================
   SHARED HELPERS
   Small things that are used by more than one page.
   ===================================================================== */

// Choices for the dropdowns
const VEHICLE_TYPES = ["Car", "SUV", "Bike", "Scooter"];
const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "CNG"];
const SERVICE_TYPES = [
  "Oil Change",
  "Full Service",
  "Brake Service",
  "Tyres & Battery",
  "Repair",
  "Insurance & PUC",
];

// The picture shown for each vehicle type
const vehicleImages = {
  Car: sideCar,
  SUV: suvImage,
  Bike: bikeImage,
  Scooter: scooterImage,
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ---------- Dates ----------
// Dates are saved as text like "2026-11-23" (year-month-day),
// because that is the format the <input type="date"> uses.

function toDateString(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// A date some days from today. Use a negative number for the past: addDays(-3)
function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

// How many days are left until a date? A negative number means it is already over.
function daysUntil(dateString) {
  const today = parseDate(toDateString(new Date()));
  const target = parseDate(dateString);
  return Math.round((target - today) / 86400000); // 86400000 milliseconds = 1 day
}

// "2026-11-23" becomes "23 Nov 2026"
function formatDate(dateString) {
  if (!dateString) return "Not set";
  const date = parseDate(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

// ---------- Numbers and names ----------
// Shows a number as money: 6200 becomes ₹6,200
function formatMoney(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

// 48200 becomes "48,200 km"
function formatKm(km) {
  return km.toLocaleString("en-IN") + " km";
}

function getVehicleName(vehicle) {
  return `${vehicle.make} ${vehicle.model} ${vehicle.year}`;
}

// Finds a vehicle by its id and returns its name (used by the service pages)
function getVehicleNameById(vehicles, vehicleId) {
  const vehicle = vehicles.find((item) => item.id === vehicleId);
  return vehicle ? getVehicleName(vehicle) : "Deleted vehicle";
}

// Creates a unique id for every new vehicle or service
function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- Service status ----------
// Looks at the next service date and tells us which group it belongs to:
// "overdue", "week" (within 7 days), "upcoming" or "none" (no date given).
function getServiceStatus(dateString) {
  if (!dateString) {
    return { group: "none", label: "No date", tagClass: "tag-grey" };
  }

  const days = daysUntil(dateString);

  if (days < 0) {
    const late = Math.abs(days);
    return { group: "overdue", label: `${late} ${late === 1 ? "day" : "days"} late`, tagClass: "tag-red" };
  }
  if (days === 0) {
    return { group: "week", label: "Due today", tagClass: "tag-orange" };
  }
  if (days <= 7) {
    return { group: "week", label: `In ${days} ${days === 1 ? "day" : "days"}`, tagClass: "tag-orange" };
  }
  if (days <= 30) {
    return { group: "upcoming", label: `In ${days} days`, tagClass: "tag-blue" };
  }
  return { group: "upcoming", label: `In ${days} days`, tagClass: "tag-green" };
}

// The small coloured tag shown on a vehicle card: Overdue / Due soon / Good / Not set
function getCardStatus(dateString) {
  const status = getServiceStatus(dateString);

  if (status.group === "overdue") return { label: "Overdue", tagClass: "tag-red" };
  if (status.group === "week") return { label: "Due soon", tagClass: "tag-orange" };
  if (status.group === "none") return { label: "Not set", tagClass: "tag-grey" };
  return { label: "Good", tagClass: "tag-green" };
}

// Every vehicle with a next service date becomes one reminder.
// The list is sorted so the earliest date comes first.
function getReminders(vehicles) {
  return vehicles
    .filter((vehicle) => vehicle.nextServiceDate)
    .map((vehicle) => {
      const status = getServiceStatus(vehicle.nextServiceDate);
      return {
        id: vehicle.id,
        task: vehicle.nextServiceType,
        vehicle: getVehicleName(vehicle),
        dueDate: vehicle.nextServiceDate,
        group: status.group,
        label: status.label,
        tagClass: status.tagClass,
      };
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

// ---------- Demo vehicles ----------
// These are shown the first time the app is opened, so the pages are not empty.
// You can delete them, or add your own vehicles.
const sampleVehicles = [
  {
    id: "v1",
    make: "Honda",
    model: "City",
    year: 2019,
    type: "Car",
    fuelType: "Petrol",
    regNumber: "GJ-06-AB-1234",
    odometer: 48200,
    nextServiceType: "Oil Change",
    nextServiceDate: addDays(5),
  },
  {
    id: "v2",
    make: "Royal Enfield",
    model: "Classic 350",
    year: 2021,
    type: "Bike",
    fuelType: "Petrol",
    regNumber: "GJ-06-XY-7788",
    odometer: 21450,
    nextServiceType: "Tyres & Battery",
    nextServiceDate: addDays(-3),
  },
  {
    id: "v3",
    make: "Honda",
    model: "Activa 6G",
    year: 2022,
    type: "Scooter",
    fuelType: "Petrol",
    regNumber: "GJ-06-MN-4521",
    odometer: 9800,
    nextServiceType: "Insurance & PUC",
    nextServiceDate: addDays(45),
  },
  {
    id: "v4",
    make: "Tata",
    model: "Nexon EV",
    year: 2023,
    type: "SUV",
    fuelType: "Electric",
    regNumber: "GJ-06-EV-0099",
    odometer: 12300,
    nextServiceType: "Full Service",
    nextServiceDate: addDays(76),
  },
];

// ---------- Demo services ----------
// Each service belongs to one vehicle (vehicleId is the id of that vehicle).
const sampleServices = [
  { id: "s1", vehicleId: "v1", type: "Full Service", date: addDays(-12), cost: 6200, odometer: 48000, notes: "Oil, filters and general check" },
  { id: "s2", vehicleId: "v2", type: "Repair", date: addDays(-22), cost: 1850, odometer: 21300, notes: "Clutch cable replaced" },
  { id: "s3", vehicleId: "v3", type: "Oil Change", date: addDays(-31), cost: 450, odometer: 9500, notes: "" },
  { id: "s4", vehicleId: "v1", type: "Brake Service", date: addDays(-45), cost: 3400, odometer: 47200, notes: "Front brake pads changed" },
  { id: "s5", vehicleId: "v4", type: "Full Service", date: addDays(-60), cost: 5200, odometer: 11000, notes: "" },
  { id: "s6", vehicleId: "v2", type: "Oil Change", date: addDays(-80), cost: 1200, odometer: 20100, notes: "" },
  { id: "s7", vehicleId: "v1", type: "Tyres & Battery", date: addDays(-100), cost: 8400, odometer: 45800, notes: "4 new tyres and a new battery" },
  { id: "s8", vehicleId: "v3", type: "Repair", date: addDays(-130), cost: 950, odometer: 8200, notes: "" },
  { id: "s9", vehicleId: "v2", type: "Full Service", date: addDays(-150), cost: 2800, odometer: 18700, notes: "" },
];

// Adds up the cost of all services for each of the last 6 months.
// Result looks like: [{ month: "Jun", amount: 5100 }, { month: "Jul", amount: 4100 }, ...]
function getMonthlyExpenses(services) {
  const result = [];
  const today = new Date();

  // i = 5 is five months ago, i = 0 is the current month
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = toDateString(date).slice(0, 7); // for example "2026-11"

    const amount = services
      .filter((service) => service.date.slice(0, 7) === monthKey)
      .reduce((sum, service) => sum + service.cost, 0);

    result.push({ month: MONTH_NAMES[date.getMonth()], amount: amount });
  }
  return result;
}

// ---------- Saving data in the browser ----------
// This works exactly like useState, but the value is also saved in the browser's
// localStorage. So after a page refresh, the data is still there.
//
// Usage:  const [vehicles, setVehicles] = useLocalStorage("autocare_vehicles", []);
function useLocalStorage(key, initialValue) {
  // Step 1: when the page loads, try to read the saved value.
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      // If localStorage is blocked or the data is broken, use the starting value.
      return initialValue;
    }
  });

  // Step 2: every time the value changes, save it again.
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

/* =====================================================================
   PART 1: SIGN UP PAGE
   ===================================================================== */

// An empty form. We use it at the start and again after signing out.
const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  agree: false,
};

// Works out how strong a password is.
// Each rule that is satisfied adds one point (maximum of 4).
function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];
  return { score, label: password ? labels[score] : "" };
}

// Checks every field and returns an object with one message per invalid field.
function validateForm(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Please enter your full name.";
  }

  if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = "Please enter a valid email address.";
  }

  // The phone number is optional, so we only check it when something is typed.
  if (form.phone && !/^[0-9+\-\s]{10,15}$/.test(form.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters long.";
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!form.agree) {
    errors.agree = "You need to accept the terms to continue.";
  }

  return errors;
}

// App is the "boss" component. It keeps the important data (user, vehicles, current page)
// and decides what to show: the sign-up page, or the pages after sign up.
function App() {
  // ----- Sign-up form -----
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ----- Data that is saved in the browser -----
  // "user" is empty (null) until someone signs up.
  const [user, setUser] = useLocalStorage("autocare_user", null);
  const [vehicles, setVehicles] = useLocalStorage("autocare_vehicles", sampleVehicles);
  const [allServices, setServices] = useLocalStorage("autocare_services", sampleServices);

  // ----- Which page is open after sign up -----
  // One of: "dashboard", "vehicles", "addVehicle", "services", "addService", "maintenance", "expenses", "settings"
  const [page, setPage] = useState("dashboard");

  const strength = getPasswordStrength(form.password);

  // One handler for every input. Checkboxes use "checked", the rest use "value".
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const foundErrors = validateForm(form);
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length === 0) {
      // Sign up worked: remember the user, so the Dashboard is shown.
      // The password is not kept, because this project has no backend.
      setUser({
        name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      setPage("dashboard");
    }
  };

  // Goes back to a fresh sign-up page
  const handleSignOut = () => {
    setUser(null);
    setForm(emptyForm);
    setErrors({});
    setShowPassword(false);
    setShowConfirm(false);
    setPage("dashboard");
  };

  // ----- Moving between pages -----
  function goTo(newPage) {
    setPage(newPage);
    window.scrollTo(0, 0); // start every page from the top
  }

  // ----- Vehicle actions -----
  function addVehicle(newVehicle) {
    setVehicles([...vehicles, newVehicle]);
    goTo("vehicles");
  }

  function deleteVehicle(vehicleId) {
    const sure = window.confirm("Do you want to delete this vehicle? Its services will also be deleted.");
    if (!sure) return;
    setVehicles(vehicles.filter((vehicle) => vehicle.id !== vehicleId));
    setServices(allServices.filter((service) => service.vehicleId !== vehicleId));
  }

  function loadSampleVehicles() {
    setVehicles(sampleVehicles);
    setServices(sampleServices);
  }

  // ----- Service actions -----
  // "nextService" is optional. When the user fills it, the vehicle's reminder is updated too.
  function addService(newService, nextService) {
    setServices([...allServices, newService]);

    setVehicles(
      vehicles.map((vehicle) => {
        if (vehicle.id !== newService.vehicleId) return vehicle;

        const updatedVehicle = { ...vehicle };
        // The odometer only goes up, never down
        if (newService.odometer > vehicle.odometer) {
          updatedVehicle.odometer = newService.odometer;
        }
        if (nextService.date) {
          updatedVehicle.nextServiceDate = nextService.date;
          updatedVehicle.nextServiceType = nextService.type;
        }
        return updatedVehicle;
      })
    );
    goTo("services");
  }

  function deleteService(serviceId) {
    const sure = window.confirm("Do you want to delete this service record?");
    if (!sure) return;
    setServices(allServices.filter((service) => service.id !== serviceId));
  }

  // ---------------------------------------------------------------
  // After sign up: show the layout (sidebar + bell) with the chosen page inside
  // ---------------------------------------------------------------
  if (user) {
    const reminders = getReminders(vehicles);

    // Only keep services whose vehicle still exists
    const services = allServices.filter((service) =>
      vehicles.some((vehicle) => vehicle.id === service.vehicleId)
    );

    // The bell shows how many reminders are overdue or due within 7 days
    const alertCount = reminders.filter((r) => r.group === "overdue" || r.group === "week").length;

    return (
      <Layout
        user={user}
        currentPage={page}
        alertCount={alertCount}
        onNavigate={goTo}
        onSignOut={handleSignOut}
      >
        {page === "dashboard" && (
          <Dashboard
            user={user}
            vehicles={vehicles}
            services={services}
            reminders={reminders}
            onNavigate={goTo}
            onLoadSample={loadSampleVehicles}
          />
        )}

        {page === "vehicles" && (
          <MyVehicles
            vehicles={vehicles}
            onAddClick={() => goTo("addVehicle")}
            onDelete={deleteVehicle}
            onLoadSample={loadSampleVehicles}
          />
        )}

        {page === "addVehicle" && (
          <AddVehicle
            vehicles={vehicles}
            onSave={addVehicle}
            onCancel={() => goTo("vehicles")}
          />
        )}

        {/* These pages are not built yet, so they show a simple message */}
        {page === "services" && (
          <ServiceHistory
            vehicles={vehicles}
            services={services}
            onAddClick={() => goTo("addService")}
            onDelete={deleteService}
          />
        )}

        {page === "addService" && (
          <AddService
            vehicles={vehicles}
            onSave={addService}
            onCancel={() => goTo("services")}
            onAddVehicle={() => goTo("addVehicle")}
          />
        )}

        {page === "maintenance" && <ComingSoon title="Maintenance" />}
        {page === "expenses" && <ComingSoon title="Expenses" />}
        {page === "settings" && <ComingSoon title="Settings" />}
      </Layout>
    );
  }

  // ---------------------------------------------------------------
  // Not signed up yet: show the sign-up page
  // ---------------------------------------------------------------
  return (
    // Sign-up page
    <div className="page">
      {/* ---------- Left side: branding ---------- */}
      <div className="left">
        <div className="logo">
          <span className="icon">
            <img src={carLogo} alt="AutoCare" />
          </span>
          <span className="brand">AutoCare</span>
        </div>

        <div className="tagline">
          <h1>
            Keep your vehicles <span id="healthy">healthy</span>,
          </h1>
          <h1>stress-free.</h1>
        </div>

        <div className="tag2">
          <p>One place for service history, maintenance reminders and</p>
          <p>expenses of all your cars and bikes.</p>
        </div>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">
              <img src={sideCar} alt="car" />
            </span>
            <div className="feature-text">
              <h3>Register all your vehicles</h3>
              <p>Cars, bikes, scooters and EVs</p>
            </div>
          </div>

          <div className="feature">
            <span className="feature-icon">
              <img src={service} alt="service" />
            </span>
            <div className="feature-text">
              <h3>Track every service</h3>
              <p>Complete history with bills</p>
            </div>
          </div>

          <div className="feature">
            <span className="feature-icon">
              <img src={clock} alt="clock" />
            </span>
            <div className="feature-text">
              <h3>Never miss maintenance</h3>
              <p>Smart reminders by date and km</p>
            </div>
          </div>

          <div className="feature">
            <span className="feature-icon">
              <img src={exp} alt="expenses" />
            </span>
            <div className="feature-text">
              <h3>Monitor expenses</h3>
              <p>Charts by month and vehicle</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Right side: sign-up form ---------- */}
      <div className="right">
        <form className="form-wrap" onSubmit={handleSubmit} noValidate>
          <h2>Create your account</h2>
          <p className="form-sub">Start tracking your vehicle maintenance today</p>

          {/* Full name */}
          <div className="field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Your name"
              value={form.fullName}
              onChange={handleChange}
              className={errors.fullName ? "input-error" : ""}
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </div>

          {/* Email */}
          <div className="field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Phone (optional) */}
          <div className="field">
            <label htmlFor="phone">
              Phone Number <span className="optional">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              className={errors.phone ? "input-error" : ""}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          {/* Password */}
          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-box">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "input-error" : ""}
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Strength bar: four small segments that fill up as the password improves */}
            <div className={`strength strength-${strength.score}`}>
              <i></i>
              <i></i>
              <i></i>
              <i></i>
            </div>
            <span className="hint">
              {strength.label
                ? `Password strength: ${strength.label}`
                : "Use 8+ characters with letters, numbers and symbols"}
            </span>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Confirm password */}
          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-box">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-error" : ""}
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Terms and conditions */}
          <div className="terms">
            <label className="check-label">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
              />
              <span>
                I agree to the <a href="#terms">Terms of Service</a> and{" "}
                <a href="#privacy">Privacy Policy</a>
              </span>
            </label>
            {errors.agree && <span className="error-text">{errors.agree}</span>}
          </div>

          <button type="submit" className="primary-btn">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}

/* =====================================================================
   PART 2: LAYOUT (sidebar + bell icon), used by every page after sign up
   ===================================================================== */

// "children" is the page that is placed inside this frame.
function Layout({ user, currentPage, alertCount, onNavigate, onSignOut, children }) {
  // The two "Add" forms belong to the menu item of their list page
  let activePage = currentPage;
  if (currentPage === "addVehicle") activePage = "vehicles";
  if (currentPage === "addService") activePage = "services";

  // The menu item of the page you are on gets the extra class "active"
  function linkClass(pageName) {
    return activePage === pageName ? "side-link active" : "side-link";
  }

  const firstLetter = user.name.charAt(0).toUpperCase();

  return (
    <div className="app-layout">
      {/* ================= Sidebar ================= */}
      <aside className="sidebar">
        <div className="side-brand">
          <span className="side-brand-icon">
            <img src={carLogo} alt="AutoCare" />
          </span>
          <span className="side-brand-name">AutoCare</span>
        </div>

        <nav className="side-nav">
          <button className={linkClass("dashboard")} onClick={() => onNavigate("dashboard")}>
            <img src={homeIcon} alt="" />
            Dashboard
          </button>
          <button className={linkClass("vehicles")} onClick={() => onNavigate("vehicles")}>
            <img src={sideCar} alt="" />
            My Vehicles
          </button>
          <button className={linkClass("services")} onClick={() => onNavigate("services")}>
            <img src={service} alt="" />
            Service History
          </button>
          <button className={linkClass("maintenance")} onClick={() => onNavigate("maintenance")}>
            <img src={clock} alt="" />
            Maintenance
          </button>
          <button className={linkClass("expenses")} onClick={() => onNavigate("expenses")}>
            <img src={exp} alt="" />
            Expenses
          </button>
          <button className={linkClass("settings")} onClick={() => onNavigate("settings")}>
            <img src={settingsIcon} alt="" />
            Settings
          </button>
        </nav>

        <div className="side-user">
          <div className="side-avatar">{firstLetter}</div>
          <div className="side-user-info">
            <b>{user.name}</b>
            <span>Vehicle Owner</span>
            <button className="signout-btn" onClick={onSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ================= Main content ================= */}
      <main className="app-main">
        {/* Bell icon with the number of reminders that need attention */}
        <button className="bell" title="View reminders" onClick={() => onNavigate("maintenance")}>
          <img src={bellIcon} alt="Reminders" />
          {alertCount > 0 && <span className="bell-badge">{alertCount}</span>}
        </button>

        {children}
      </main>
    </div>
  );
}

// The title block at the top of every page.
// Anything written between <PageHeader> and </PageHeader> (usually a button)
// is shown on the right side.
function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      <div className="page-actions">{children}</div>
    </div>
  );
}

// A simple page for the menu items that are not built yet
function ComingSoon({ title }) {
  return (
    <div>
      <PageHeader title={title} subtitle="This page will be added next" />
      <div className="card coming-soon">
        <h3>{title} is coming soon</h3>
        <p>We are still building this page. Please check back later.</p>
      </div>
    </div>
  );
}

/* =====================================================================
   PART 3: DASHBOARD
   ===================================================================== */

// "user" comes from the sign-up form. Vehicles, reminders and services are all real data.
function Dashboard({ user, vehicles, services, reminders, onNavigate, onLoadSample }) {
  // ----- Numbers for the four summary cards -----
  const overdueCount = reminders.filter((r) => r.group === "overdue").length;
  const upcomingCount = reminders.length - overdueCount;
  const totalSpent = services.reduce((sum, service) => sum + service.cost, 0);

  // Money spent in each of the last 6 months (for the bar chart)
  const monthlyExpenses = getMonthlyExpenses(services);

  // The 4 newest services (newest date first)
  const recentServices = [...services].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  // The tallest bar is 100% high, the others are smaller in the same proportion
  // (we use at least 1 so we never divide by zero when there are no expenses)
  const biggestAmount = Math.max(1, ...monthlyExpenses.map((item) => item.amount));

  const firstName = user.name.split(" ")[0];

  return (
    <div>
      {/* Page title */}
      <PageHeader title="Dashboard" subtitle={`Welcome, ${firstName}! Here's your vehicle overview`}>
        <button className="btn" onClick={() => onNavigate("addVehicle")}>
          + Add Vehicle
        </button>
      </PageHeader>

      {/* Shown only when there are no vehicles */}
      {vehicles.length === 0 && (
        <div className="card welcome-card">
          <div>
            <h3>Let's get started</h3>
            <p>Add your first vehicle, or load a few sample vehicles to see how the app looks.</p>
          </div>
          <div className="welcome-buttons">
            <button className="btn" onClick={() => onNavigate("addVehicle")}>
              Add vehicle
            </button>
            <button className="btn btn-light" onClick={onLoadSample}>
              Load sample vehicles
            </button>
          </div>
        </div>
      )}

      {/* Four summary cards */}
      <div className="stats-grid">
        <div className="card stat-card">
          <span className="stat-icon" style={{ background: "#ffedd5" }}>
            <img src={sideCar} alt="" />
          </span>
          <div className="stat-text">
            <b className="stat-value">{vehicles.length}</b>
            <span className="stat-label">Total Vehicles</span>
          </div>
        </div>

        <div className="card stat-card">
          <span className="stat-icon" style={{ background: "#dbeafe" }}>
            <img src={clock} alt="" />
          </span>
          <div className="stat-text">
            <b className="stat-value">{upcomingCount}</b>
            <span className="stat-label">Upcoming Services</span>
          </div>
        </div>

        <div className="card stat-card">
          <span className="stat-icon" style={{ background: "#fee2e2" }}>
            <img src={warningIcon} alt="" />
          </span>
          <div className="stat-text">
            <b className="stat-value">{overdueCount}</b>
            <span className="stat-label">Overdue Tasks</span>
          </div>
        </div>

        <div className="card stat-card">
          <span className="stat-icon" style={{ background: "#dcfce7" }}>
            <img src={exp} alt="" />
          </span>
          <div className="stat-text">
            <b className="stat-value">{formatMoney(totalSpent)}</b>
            <span className="stat-label">Total Expenses</span>
          </div>
        </div>
      </div>

      {/* Chart on the left, reminders on the right */}
      <div className="two-col">
        <div className="card">
          <h3 className="card-title">
            Monthly Expenses <span className="card-note">Last 6 months</span>
          </h3>

          <div className="bar-chart">
            {monthlyExpenses.map((item, index) => (
              <div className="bar-col" key={item.month}>
                <span className="bar-value">{formatMoney(item.amount)}</span>
                <div className="bar-track">
                  {/* The last bar (current month) is darker */}
                  <div
                    className={index === monthlyExpenses.length - 1 ? "bar bar-current" : "bar"}
                    style={{ height: `${(item.amount / biggestAmount) * 100}%` }}
                  ></div>
                </div>
                <span className="bar-label">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">
            Upcoming Reminders
            <button className="link-btn" onClick={() => onNavigate("maintenance")}>
              View all
            </button>
          </h3>

          {reminders.length === 0 && (
            <p className="empty-text">No reminders yet. Add a next service date to a vehicle.</p>
          )}

          {/* Only the first 4 reminders are shown here */}
          {reminders.slice(0, 4).map((reminder) => (
            <div className="reminder" key={reminder.id}>
              <span className={`reminder-icon reminder-icon-${reminder.group}`}>
                <img src={reminder.group === "overdue" ? warningIcon : clock} alt="" />
              </span>

              <div className="reminder-text">
                <b>{reminder.task}</b>
                <span>
                  {reminder.vehicle} · due {formatDate(reminder.dueDate)}
                </span>
              </div>

              <span className={`tag ${reminder.tagClass}`}>{reminder.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent services table */}
      <div className="card">
        <h3 className="card-title">
          Recent Services
          <button className="link-btn" onClick={() => onNavigate("services")}>
            View history
          </button>
        </h3>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Service</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {recentServices.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.date)}</td>
                  <td>{getVehicleNameById(vehicles, item.vehicleId)}</td>
                  <td>{item.type}</td>
                  <td>{formatMoney(item.cost)}</td>
                </tr>
              ))}
              {recentServices.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    No services added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   PART 4: MY VEHICLES
   ===================================================================== */

// One vehicle box. The page gives it the vehicle and a delete function.
function VehicleCard({ vehicle, onDelete }) {
  const status = getCardStatus(vehicle.nextServiceDate);

  return (
    <div className="card vehicle-card">
      {/* Picture with a soft background colour (different for each type) */}
      <div className={`vehicle-image vehicle-image-${vehicle.type.toLowerCase()}`}>
        <img src={vehicleImages[vehicle.type]} alt={vehicle.type} />
      </div>

      <div className="vehicle-body">
        <h3>{getVehicleName(vehicle)}</h3>
        <p>
          {vehicle.regNumber} · {vehicle.fuelType}
        </p>

        <div className="vehicle-meta">
          <div>
            <span>Odometer</span>
            <b>{formatKm(vehicle.odometer)}</b>
          </div>
          <div>
            <span>Next Service</span>
            <b>{formatDate(vehicle.nextServiceDate)}</b>
          </div>
          <span className={`tag ${status.tagClass}`}>{status.label}</span>
        </div>
      </div>

      <button className="btn-delete" onClick={() => onDelete(vehicle.id)}>
        Delete vehicle
      </button>
    </div>
  );
}

function MyVehicles({ vehicles, onAddClick, onDelete, onLoadSample }) {
  // What the user typed in the search box and chose in the two dropdowns
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [fuelFilter, setFuelFilter] = useState("All");

  // Keep only the vehicles that match the search text and both dropdowns
  const visibleVehicles = vehicles.filter((vehicle) => {
    const text = search.trim().toLowerCase();

    const matchesSearch =
      getVehicleName(vehicle).toLowerCase().includes(text) ||
      vehicle.regNumber.toLowerCase().includes(text);
    const matchesType = typeFilter === "All" || vehicle.type === typeFilter;
    const matchesFuel = fuelFilter === "All" || vehicle.fuelType === fuelFilter;

    return matchesSearch && matchesType && matchesFuel;
  });

  return (
    <div>
      <PageHeader title="My Vehicles" subtitle="Manage all your registered vehicles">
        <button className="btn" onClick={onAddClick}>
          + Add Vehicle
        </button>
      </PageHeader>

      {/* Search box and the two dropdown filters */}
      <div className="filters-row">
        <input
          className="filter-input filter-search"
          type="text"
          placeholder="Search by name or registration number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-input"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          {VEHICLE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          className="filter-input"
          value={fuelFilter}
          onChange={(e) => setFuelFilter(e.target.value)}
        >
          <option value="All">Fuel: All</option>
          {FUEL_TYPES.map((fuel) => (
            <option key={fuel} value={fuel}>
              {fuel}
            </option>
          ))}
        </select>
      </div>

      {/* Messages for the two "nothing to show" situations */}
      {vehicles.length === 0 && (
        <div className="empty-box">
          <p className="empty-text">You have not added any vehicle yet.</p>
          <button className="btn btn-light" onClick={onLoadSample}>
            Load sample vehicles
          </button>
        </div>
      )}
      {vehicles.length > 0 && visibleVehicles.length === 0 && (
        <p className="empty-text">No vehicles match your search or filters.</p>
      )}

      <div className="vehicles-grid">
        {visibleVehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} onDelete={onDelete} />
        ))}

        {/* The dashed box at the end of the list */}
        <button className="add-vehicle-card" onClick={onAddClick}>
          <span>+</span>
          Add new vehicle
        </button>
      </div>
    </div>
  );
}

/* =====================================================================
   PART 5: ADD VEHICLE (form page)
   ===================================================================== */

function AddVehicle({ vehicles, onSave, onCancel }) {
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    type: "Car",
    fuelType: "Petrol",
    regNumber: "",
    odometer: "",
    nextServiceType: SERVICE_TYPES[0],
    nextServiceDate: "",
  });
  const [errors, setErrors] = useState({});

  // One handler for all the inputs: it updates the field with the same "name".
  // It also hides the error of that field, so the user sees it disappear while fixing it.
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ----- Check every field -----
    const newErrors = {};
    const nextYear = new Date().getFullYear() + 1;
    const regNumber = form.regNumber.trim().toUpperCase();

    if (!form.make.trim()) newErrors.make = "Please enter the make (brand).";
    if (!form.model.trim()) newErrors.model = "Please enter the model.";

    if (!form.year || Number(form.year) < 1980 || Number(form.year) > nextYear) {
      newErrors.year = `Enter a year between 1980 and ${nextYear}.`;
    }

    if (!regNumber) {
      newErrors.regNumber = "Please enter the registration number.";
    } else if (vehicles.some((vehicle) => vehicle.regNumber === regNumber)) {
      newErrors.regNumber = "A vehicle with this registration number already exists.";
    }

    if (form.odometer === "" || Number(form.odometer) < 0) {
      newErrors.odometer = "Please enter the current odometer reading.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return; // stop here if something is wrong

    // ----- Everything is fine: send the new vehicle to App -----
    onSave({
      id: makeId(),
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      type: form.type,
      fuelType: form.fuelType,
      regNumber: regNumber,
      odometer: Number(form.odometer),
      nextServiceType: form.nextServiceType,
      nextServiceDate: form.nextServiceDate,
    });
  };

  return (
    <div>
      <PageHeader title="Add Vehicle" subtitle="Register a new car, bike or scooter" />

      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="make">Make (Brand)</label>
            <input id="make" name="make" type="text" placeholder="Honda" value={form.make} onChange={handleChange} />
            {errors.make && <span className="form-error">{errors.make}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="model">Model</label>
            <input id="model" name="model" type="text" placeholder="City" value={form.model} onChange={handleChange} />
            {errors.model && <span className="form-error">{errors.model}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="year">Year</label>
            <input id="year" name="year" type="number" placeholder="2019" value={form.year} onChange={handleChange} />
            {errors.year && <span className="form-error">{errors.year}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="type">Vehicle Type</label>
            <select id="type" name="type" value={form.type} onChange={handleChange}>
              {VEHICLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fuelType">Fuel Type</label>
            <select id="fuelType" name="fuelType" value={form.fuelType} onChange={handleChange}>
              {FUEL_TYPES.map((fuel) => (
                <option key={fuel} value={fuel}>
                  {fuel}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="regNumber">Registration Number</label>
            <input id="regNumber" name="regNumber" type="text" placeholder="GJ-06-AB-1234" value={form.regNumber} onChange={handleChange} />
            {errors.regNumber && <span className="form-error">{errors.regNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="odometer">Current Odometer (km)</label>
            <input id="odometer" name="odometer" type="number" placeholder="48200" value={form.odometer} onChange={handleChange} />
            {errors.odometer && <span className="form-error">{errors.odometer}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="nextServiceType">Next Service Type</label>
            <select id="nextServiceType" name="nextServiceType" value={form.nextServiceType} onChange={handleChange}>
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nextServiceDate">Next Service Date (optional)</label>
            <input id="nextServiceDate" name="nextServiceDate" type="date" value={form.nextServiceDate} onChange={handleChange} />
            <span className="form-hint">This date is used for the reminders on the Dashboard.</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn">
            Save Vehicle
          </button>
          <button type="button" className="btn btn-light" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* =====================================================================
   PART 6: SERVICE HISTORY
   ===================================================================== */

function ServiceHistory({ vehicles, services, onAddClick, onDelete }) {
  // What the user chose in the two dropdowns
  const [vehicleFilter, setVehicleFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Keep only the services that match both dropdowns, newest first
  const visibleServices = services
    .filter((service) => vehicleFilter === "All" || service.vehicleId === vehicleFilter)
    .filter((service) => typeFilter === "All" || service.type === typeFilter)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalCost = visibleServices.reduce((sum, service) => sum + service.cost, 0);

  return (
    <div>
      <PageHeader title="Service History" subtitle="All the services done on your vehicles">
        <button className="btn" onClick={onAddClick}>
          + Add Service
        </button>
      </PageHeader>

      {/* Two dropdown filters */}
      <div className="filters-row">
        <select
          className="filter-input filter-search"
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
        >
          <option value="All">All Vehicles</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {getVehicleName(vehicle)}
            </option>
          ))}
        </select>

        <select
          className="filter-input filter-search"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">All Service Types</option>
          {SERVICE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <h3 className="card-title">
          {visibleServices.length} {visibleServices.length === 1 ? "service" : "services"}
          <span className="card-note">Total cost: {formatMoney(totalCost)}</span>
        </h3>

        {services.length === 0 && (
          <p className="empty-text">No services added yet. Click "+ Add Service" to add your first one.</p>
        )}
        {services.length > 0 && visibleServices.length === 0 && (
          <p className="empty-text">No services match your filters.</p>
        )}

        {visibleServices.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Service</th>
                  <th>Odometer</th>
                  <th>Cost</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleServices.map((service) => (
                  <tr key={service.id}>
                    <td>{formatDate(service.date)}</td>
                    <td>{getVehicleNameById(vehicles, service.vehicleId)}</td>
                    <td>{service.type}</td>
                    <td>{service.odometer ? formatKm(service.odometer) : "-"}</td>
                    <td>{formatMoney(service.cost)}</td>
                    <td>{service.notes || "-"}</td>
                    <td>
                      <button className="btn-delete" onClick={() => onDelete(service.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   PART 7: ADD SERVICE (form page)
   ===================================================================== */

function AddService({ vehicles, onSave, onCancel, onAddVehicle }) {
  const today = toDateString(new Date());

  const [form, setForm] = useState({
    vehicleId: vehicles.length > 0 ? vehicles[0].id : "",
    type: SERVICE_TYPES[0],
    date: today,
    cost: "",
    odometer: "",
    notes: "",
    nextServiceType: SERVICE_TYPES[0],
    nextServiceDate: "",
  });
  const [errors, setErrors] = useState({});

  // A service needs a vehicle, so if there is none we ask the user to add one first
  if (vehicles.length === 0) {
    return (
      <div>
        <PageHeader title="Add Service" subtitle="Record a service done on your vehicle" />
        <div className="card coming-soon">
          <h3>No vehicles yet</h3>
          <p>Please add a vehicle first, then you can add its services.</p>
          <button className="btn" onClick={onAddVehicle}>
            + Add Vehicle
          </button>
        </div>
      </div>
    );
  }

  // One handler for all the inputs, same idea as the Add Vehicle form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ----- Check every field -----
    const newErrors = {};

    if (!form.date) {
      newErrors.date = "Please choose the service date.";
    } else if (form.date > today) {
      newErrors.date = "The service date cannot be in the future.";
    }

    if (form.cost === "" || Number(form.cost) <= 0) {
      newErrors.cost = "Please enter the cost (more than 0).";
    }

    if (form.odometer !== "" && Number(form.odometer) < 0) {
      newErrors.odometer = "Odometer cannot be negative.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return; // stop here if something is wrong

    // ----- Everything is fine: send the new service to App -----
    const newService = {
      id: makeId(),
      vehicleId: form.vehicleId,
      type: form.type,
      date: form.date,
      cost: Number(form.cost),
      odometer: form.odometer === "" ? 0 : Number(form.odometer),
      notes: form.notes.trim(),
    };
    const nextService = { type: form.nextServiceType, date: form.nextServiceDate };

    onSave(newService, nextService);
  };

  return (
    <div>
      <PageHeader title="Add Service" subtitle="Record a service done on your vehicle" />

      <form className="card form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="vehicleId">Vehicle</label>
            <select id="vehicleId" name="vehicleId" value={form.vehicleId} onChange={handleChange}>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {getVehicleName(vehicle)} ({vehicle.regNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="type">Service Type</label>
            <select id="type" name="type" value={form.type} onChange={handleChange}>
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Service Date</label>
            <input id="date" name="date" type="date" max={today} value={form.date} onChange={handleChange} />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="cost">Cost (₹)</label>
            <input id="cost" name="cost" type="number" placeholder="3500" value={form.cost} onChange={handleChange} />
            {errors.cost && <span className="form-error">{errors.cost}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="odometer">Odometer (km, optional)</label>
            <input id="odometer" name="odometer" type="number" placeholder="48500" value={form.odometer} onChange={handleChange} />
            {errors.odometer && <span className="form-error">{errors.odometer}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <input id="notes" name="notes" type="text" placeholder="Front brake pads changed" value={form.notes} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="nextServiceType">Next Service Type (optional)</label>
            <select id="nextServiceType" name="nextServiceType" value={form.nextServiceType} onChange={handleChange}>
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="nextServiceDate">Next Service Date (optional)</label>
            <input id="nextServiceDate" name="nextServiceDate" type="date" value={form.nextServiceDate} onChange={handleChange} />
            <span className="form-hint">If you set a date, the reminder of this vehicle is updated.</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn">
            Save Service
          </button>
          <button type="button" className="btn btn-light" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;