import { useEffect, useState } from "react";

import api from "./api";

import "./App.css";

function App() {

  const [page, setPage] = useState("login");

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [activeTab, setActiveTab] = useState("Home");

  const [destinations, setDestinations] = useState([]);
  const [citySearch, setCitySearch] = useState("");
  const [famousPlaces, setFamousPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState("");
  const [placesSearched, setPlacesSearched] = useState(false);

  const [trips, setTrips] = useState([]);

  const [safetyInfo, setSafetyInfo] = useState([]);

  const [emergencyServices, setEmergencyServices] = useState([]);

  const [safetyLoading, setSafetyLoading] = useState(false);

  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [adminStats, setAdminStats] = useState({totalUsers: 0,totalIncidents: 0,totalTrips: 0,totalPlaces: 0,
  });

  const [adminError, setAdminError] = useState("");

  const [adminUsers, setAdminUsers] = useState([]);
  const [adminTrips, setAdminTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);

  const [safetyError, setSafetyError] = useState("");
  const [adminPlaces, setAdminPlaces] = useState([]);
  
  const [adminIncidents, setAdminIncidents] = useState([]);
  const [incidentsLoading, setIncidentsLoading] = useState(false);
  const [incidentsError, setIncidentsError] = useState("");

  const [emergencyError, setEmergencyError] = useState("");

  const [incidentType, setIncidentType] = useState("SAFETY");

  const [incidentDescription, setIncidentDescription] = useState("");

  const [incidentLocation, setIncidentLocation] = useState("");

  const [incidentMessage, setIncidentMessage] = useState("");

  const [tripDestination, setTripDestination] = useState("");

  const [plannedReturnTime, setPlannedReturnTime] = useState("");

  const [tripMessage, setTripMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
  if (user?.role !== "ADMIN") return;

  api.get("/admin/dashboard/stats")
    .then((response) => {
      setAdminStats(response.data);
      setAdminError("");
    })
    .catch(() => {
      setAdminError("Could not load dashboard statistics.");
    });
  }, [user]);


  // REGISTER

  async function handleRegister(e) {

    e.preventDefault();

    setLoading(true);

    setError("");

    setMessage("");

    try {

      await api.post("/auth/register", {

        name,

        email,

        password,

        role: "TOURIST",

      });

      setMessage("Account created! Please sign in.");

      setName("");

      setPassword("");

      setPage("login");

    } catch (err) {

      setError(

        err.response?.data?.message ||

          "Registration failed. Please check your details."

      );

    } finally {

      setLoading(false);

    }

  }
  async function loadAdminUsers() {
  setUsersLoading(true);
  setAdminError("");

  try {
    const response = await api.get("/admin/users");
    setAdminUsers(response.data);
  } catch (error) {
    setAdminError("Could not load users. Please try again.");
  } finally {
    setUsersLoading(false);
  }
}

async function loadAdminPlaces() {
  setPlacesLoading(true);
  setPlacesError("");

  try {
    const response = await api.get("/tourist-places");
    setAdminPlaces(response.data);
  } catch (error) {
    setPlacesError("Could not load tourist places.");
  } finally {
    setPlacesLoading(false);
  }
}


async function loadAdminIncidents() {
  setIncidentsLoading(true);
  setIncidentsError("");

  try {
    const response = await api.get("/admin/incidents");
    setAdminIncidents(response.data);
  } catch (error) {
    setIncidentsError("Could not load incident reports.");
  } finally {
    setIncidentsLoading(false);
  }
}
async function loadAdminTrips() {
  setTripsLoading(true);
  setTripsError("");

  try {
    const response = await api.get("/trips");
    setAdminTrips(response.data);
  } catch (error) {
    setTripsError("Could not load trips.");
  } finally {
    setTripsLoading(false);
  }
}
  // LOGIN

  async function handleLogin(e) {

    e.preventDefault();

    setLoading(true);

    setError("");

    setMessage("");

    try {

      const response = await api.post("/auth/login", {

        email,

        password,

      });

      setUser({

        ...response.data,

        email: response.data.email || email,

      });

      setPassword("");

      setActiveTab(
      response.data.role === "ADMIN"
      ? "Admin Dashboard"
      : "Home"
    );

      setPage("dashboard");

    } catch (err) {

      setError(

        err.response?.data?.message ||

          "Login failed. Check your email and password."

      );

    } finally {

      setLoading(false);

    }

  }

  // LOAD DESTINATIONS

  useEffect(() => {

    if (page !== "dashboard" || activeTab !== "Destinations") {

      return;

    }

    let cancelled = false;

    async function loadDestinations() {

      setLoading(true);

      setError("");

      try {

        const response = await api.get("/destinations");

        if (!cancelled) {

          setDestinations(response.data);

        }

      } catch {

        if (!cancelled) {

          setError("Unable to load destinations. Check the backend.");

        }

      } finally {

        if (!cancelled) {

          setLoading(false);

        }

      }

    }

    loadDestinations();

    return () => {

      cancelled = true;

    };

  }, [page, activeTab]);

  // SEARCH FAMOUS PLACES BY CITY
  async function handlePlaceSearch(e) {
    e.preventDefault();

    const city = citySearch.trim();
    if (!city) {
      setPlacesError("Please enter a city name.");
      setFamousPlaces([]);
      setPlacesSearched(false);
      return;
    }

    setPlacesLoading(true);
    setPlacesError("");
    setPlacesSearched(true);

    try {
      const response = await api.get("/tourist-places/search", {
        params: { location: city }
      });
      setFamousPlaces(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setPlacesError(
        err.response?.data?.message ||
          "Unable to search famous places. Please check the backend."
      );
      setFamousPlaces([]);
    } finally {
      setPlacesLoading(false);
    }
  }

  // LOAD SAFETY INFORMATION

  useEffect(() => {

    if (page !== "dashboard" || activeTab !== "Safety Information") return;

    let cancelled = false;

    async function loadSafetyInfo() {

      setSafetyLoading(true);

      setSafetyError("");

      try {

        const response = await api.get("/safety");

        const data = response.data;

        const records = Array.isArray(data) ? data : data ? [data] : [];

        if (!cancelled) setSafetyInfo(records);

      } catch (err) {

        if (!cancelled) {

          setSafetyError(err.response?.data?.message || "Unable to load safety information. Check the backend.");

        }

      } finally {

        if (!cancelled) setSafetyLoading(false);

      }

    }

    loadSafetyInfo();

    return () => { cancelled = true; };

  }, [page, activeTab]);

  // LOAD EMERGENCY SERVICES

  useEffect(() => {

    if (page !== "dashboard" || activeTab !== "Emergency Services") return;

    let cancelled = false;

    async function loadEmergencyServices() {

      setEmergencyLoading(true);

      setEmergencyError("");

      try {

        const response = await api.get("/emergency-services");

        const data = response.data;

        const records = Array.isArray(data) ? data : data ? [data] : [];

        if (!cancelled) setEmergencyServices(records);

      } catch (err) {

        if (!cancelled) {

          setEmergencyError(err.response?.data?.message || "Unable to load emergency services. Check the backend.");

        }

      } finally {

        if (!cancelled) setEmergencyLoading(false);

      }

    }

    loadEmergencyServices();

    return () => { cancelled = true; };

  }, [page, activeTab]);

  // LOAD TRIPS

  async function loadTrips() {

    setLoading(true);

    setError("");

    setTripMessage("");

    try {

      const response = await api.get("/trips");

      const allTrips = Array.isArray(response.data) ? response.data : [];

      // Client-side filtering only; this is not server-side authorization.

      setTrips(

        allTrips.filter(

          (trip) =>

            trip.touristEmail?.toLowerCase() === user?.email?.toLowerCase()

        )

      );

    } catch {

      setError("Unable to load trips. Check the backend.");

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    if (page === "dashboard" && activeTab === "My Trips" && user?.email) {

      loadTrips();

    }

  }, [page, activeTab, user?.email]);

  // CREATE TRIP

  async function handleCreateTrip(e) {

    e.preventDefault();

    setLoading(true);

    setError("");

    setTripMessage("");

    if (!user?.email) {

      setError("Please sign in again before creating a trip.");

      setLoading(false);

      return;

    }

    if (new Date(plannedReturnTime) <= new Date()) {

      setError("Please select a return time in the future.");

      setLoading(false);

      return;

    }

    try {

      await api.post("/trips", {

        touristEmail: user.email,

        destination: tripDestination,

        plannedReturnTime: plannedReturnTime,

      });

      setTripMessage("Trip created successfully!");

      setTripDestination("");

      setPlannedReturnTime("");

      await loadTrips();

    } catch (err) {

      setError(

        err.response?.data?.message ||

          err.response?.data?.error ||

          "Could not create trip. Check the details and try again."

      );

    } finally {

      setLoading(false);

    }

  }

  // UPDATE TRIP STATUS

  async function completeTrip(id) {

    setLoading(true);

    setError("");

    setTripMessage("");

    try {

      await api.patch(`/trips/${id}/status`, {

        status: "COMPLETED",

      });

      setTripMessage("Trip marked as completed.");

      await loadTrips();

    } catch {

      setError("Could not update the trip status.");

    } finally {

      setLoading(false);

    }

  }

  // DELETE TRIP

  async function deleteTrip(id) {

    const confirmed = window.confirm("Are you sure you want to delete this trip?");

    if (!confirmed) return;

    setLoading(true);

    setError("");

    setTripMessage("");

    try {

      await api.delete(`/trips/${id}`);

      setTripMessage("Trip deleted successfully.");

      await loadTrips();

    } catch {

      setError("Could not delete the trip.");

    } finally {

      setLoading(false);

    }

  }

  // REPORT INCIDENT

  async function handleIncidentSubmit(e) {

    e.preventDefault();

    setLoading(true);

    setError("");

    setIncidentMessage("");

    try {

      await api.post("/incidents", {

        touristEmail: user?.email,

        incidentType,

        description: incidentDescription,

        location: incidentLocation,

      });

      setIncidentMessage("Incident reported successfully!");

      setIncidentType("SAFETY");

      setIncidentDescription("");

      setIncidentLocation("");

    } catch (err) {

      setError(

        err.response?.data?.message ||

          "Could not submit the incident. Please try again."

      );

    } finally {

      setLoading(false);

    }

  }

  // LOGOUT

  function logout() {

    setUser(null);

    setEmail("");

    setPassword("");

    setPage("login");

    setActiveTab("Home");

    setError("");

    setMessage("");

    setIncidentMessage("");

    setTripMessage("");

    setTrips([]);

  }

  // LOGIN / REGISTRATION

  if (page === "login" || page === "register") {

    const registering = page === "register";

    return (

      <div className="auth-page">

        <div className="auth-brand">

          <span className="auth-logo">🛡️</span>

          <h1>SmartTourist</h1>

          <p>Travel safely. Explore freely.</p>

          <div className="auth-illustration">🌍</div>

          <h2>Your journey, your safety.</h2>

          <p>

            Discover destinations, plan trips, and find help

            when you need it.

          </p>

        </div>

        <div className="auth-form-area">

          <form

            className="auth-form"

            onSubmit={registering ? handleRegister : handleLogin}

          >

            <span className="eyebrow">WELCOME TO SMARTTOURIST</span>

            <h2>{registering ? "Create your account" : "Welcome back!"}</h2>

            <p className="auth-subtitle">

              {registering

                ? "Sign up for a safer travel journey."

                : "Sign in to continue your journey."}

            </p>

            {registering && (

              <label>

                Full name

                <input

                  type="text"

                  placeholder="Enter your name"

                  value={name}

                  onChange={(e) => setName(e.target.value)}

                  required

                />

              </label>

            )}

            <label>

              Email address

              <input

                type="email"

                placeholder="Enter your email"

                value={email}

                onChange={(e) => setEmail(e.target.value)}

                required

              />

            </label>

            <label>

              Password

              <input

                type="password"

                placeholder="Enter your password"

                value={password}

                onChange={(e) => setPassword(e.target.value)}

                required

                minLength={6}

              />

            </label>

            {error && <p className="auth-error">{error}</p>}

            {message && <p className="auth-success">{message}</p>}

            <button className="auth-submit" disabled={loading}>

              {loading

                ? "Please wait..."

                : registering

                  ? "Create Account"

                  : "Sign In"}

            </button>

            <p className="auth-switch">

              {registering

                ? "Already have an account?"

                : "New to SmartTourist?"}{" "}

              <button

                type="button"

                onClick={() => {

                  setPage(registering ? "login" : "register");

                  setError("");

                  setMessage("");

                }}

              >

                {registering ? "Sign in" : "Create an account"}

              </button>

            </p>

            <p className="auth-note">

              Your safety matters. Travel with confidence ❤️

            </p>

          </form>

        </div>

      </div>

    );

  }
  // SEPARATE ADMIN DASHBOARD
if (user?.role === "ADMIN") {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>🛡️ SmartTourist</h2>
        <p>Administration Panel</p>

        <nav>
          <button
            className="admin-nav-active"
            onClick={() => setActiveTab("Admin Dashboard")}
          >
            📊 Dashboard
          </button>

          <button
  onClick={() => {
    setActiveTab("Manage Users");
    loadAdminUsers();
  }}
>
  👥 Manage Users
</button>

         <button
  onClick={() => {
    setActiveTab("Manage Places");
    loadAdminPlaces();
  }}
>
  📍 Manage Places
</button>

          
<button
  onClick={() => {
    setActiveTab("Manage Incidents");
    loadAdminIncidents();
  }}
>
  🚨 Manage Incidents
</button>


          <button
  onClick={() => {
    setActiveTab("Manage Trips");
    loadAdminTrips();
  }}
>
  🧳 Manage Trips
</button>
        </nav>

        <button className="admin-logout" onClick={logout}>
          Sign Out
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p>SMARTTOURIST SAFETY</p>
            <h1>{activeTab}</h1>
          </div>
          <span>👤 {user.name || "Administrator"}</span>
        </header>

        {activeTab === "Admin Dashboard" && (
          <>
            <section className="admin-welcome">
              <h2>Welcome, Administrator! 👋</h2>
              <p>
                Manage tourist safety, users, destinations and travel
                activities from one place.
              </p>
            </section>

            {adminError && <p>{adminError}</p>}

            <section className="admin-stats">
              <div className="admin-stat-card">
                <span>👥</span>
                <p>Total Users</p>
                <h2>{adminStats.totalUsers}</h2>
              </div>

              <div className="admin-stat-card">
                <span>🚨</span>
                <p>Total Incidents</p>
                <h2>{adminStats.totalIncidents}</h2>
              </div>

              <div className="admin-stat-card">
                <span>🧳</span>
                <p>Total Trips</p>
                <h2>{adminStats.totalTrips}</h2>
              </div>

              <div className="admin-stat-card">
                <span>📍</span>
                <p>Tourist Places</p>
                <h2>{adminStats.totalPlaces}</h2>
              </div>
            </section>
            
<section className="admin-stats">
  <div className="admin-stat-card">
    <span>🟠</span>
    <p>Reported</p>
    <h2>{adminStats.reportedIncidents ?? 0}</h2>
  </div>

  <div className="admin-stat-card">
    <span>🔵</span>
    <p>In Progress</p>
    <h2>{adminStats.inProgressIncidents ?? 0}</h2>
  </div>

  <div className="admin-stat-card">
    <span>🟢</span>
    <p>Resolved</p>
    <h2>{adminStats.resolvedIncidents ?? 0}</h2>
  </div>
</section>


            <section className="admin-info-card">
              <h2>Quick Management</h2>
              <p>Choose a section from the sidebar to manage records.</p>

              
<button
  onClick={() => {
    setActiveTab("Manage Incidents");
    loadAdminIncidents();
  }}
>
  Review Incidents →
</button>

<button
  onClick={() => {
    setActiveTab("Manage Places");
    loadAdminPlaces();
  }}
>
  Manage Places →
</button>

            </section>
          </>
        )}

        {activeTab === "Manage Users" && (
  <section className="admin-info-card">
    <h2>Registered Users</h2>
    <p>Users registered in SmartTouristSafety.</p>

    {usersLoading && <p>Loading users...</p>}

    {adminError && <p>{adminError}</p>}

    {!usersLoading && !adminError && (
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {adminUsers.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name || "Not provided"}</td>
                <td>{item.email}</td>
                <td>
  <span
    className={
      item.role === "ADMIN"
        ? "admin-role-badge"
        : "tourist-role-badge"
    }
  >
    {item.role}
  </span>
</td>
              </tr>
            ))}
          </tbody>
        </table>

        {adminUsers.length === 0 && (
          <p>No registered users found.</p>
        )}
      </div>
    )}
  </section>
)}


{activeTab === "Manage Places" && (
  <section className="admin-info-card">
    <h2>📍 Tourist Places</h2>
    <p>Destinations saved in SmartTouristSafety.</p>

    {placesLoading && <p>Loading tourist places...</p>}

    {placesError && <p>{placesError}</p>}

    {!placesLoading && !placesError && (
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Place Name</th>
              <th>Category</th>
              <th>Location</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {adminPlaces.map((place) => (
              <tr key={place.id}>
                <td>{place.id}</td>
                <td>{place.name}</td>
                <td>{place.category || "—"}</td>
                <td>{place.location || "—"}</td>
                <td>{place.rating ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {adminPlaces.length === 0 && (
          <p>No tourist places found.</p>
        )}
      </div>
    )}
  </section>
)}

{activeTab === "Manage Incidents" && (
  <section className="admin-info-card">
    <h2>🚨 Manage Incident Reports</h2>
    <p>View and manage safety incidents reported by tourists.</p>

    {incidentsLoading && <p>Loading incidents...</p>}

    {incidentsError && <p>{incidentsError}</p>}

    {!incidentsLoading && !incidentsError && (
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Description</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {adminIncidents.map((incident) => (
              <tr key={incident.id}>
                <td>{incident.id}</td>
                <td>{incident.type || incident.incidentType || "—"}</td>
                <td>{incident.description || "—"}</td>
                <td>{incident.location || "—"}</td>
                <td>{incident.status || "—"}</td>
                <td>
                  <select
                    value={incident.status || "REPORTED"}
                    onChange={async (e) => {
                      const newStatus = e.target.value;

                      try {
                        const response = await api.patch(
                          `/admin/incidents/${incident.id}/status`,
                          { status: newStatus }
                        );

                        setAdminIncidents((previous) =>
                          previous.map((item) =>
                            item.id === incident.id
                              ? response.data
                              : item
                          )
                        );
                      } catch (error) {
                        setIncidentsError(
                          "Could not update incident status."
                        );
                      }
                    }}
                  >
                    <option value="REPORTED">REPORTED</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {adminIncidents.length === 0 && (
          <p>No incident reports found.</p>
        )}
      </div>
    )}
  </section>
)}

{activeTab === "Manage Trips" && (
  <section className="admin-info-card">
    <h2>🧳 Manage Trips</h2>
    <p>View trips saved by tourists in SmartTouristSafety.</p>

    {tripsLoading && <p>Loading trips...</p>}

    {tripsError && <p>{tripsError}</p>}

    {!tripsLoading && !tripsError && (
      <div style={{ overflowX: "auto" }}>
        
<table>
  <thead>
    <tr>
      <th>Trip ID</th>
      <th>Tourist Email</th>
      <th>Destination</th>
      <th>Start Time</th>
      <th>Planned Return</th>
      <th>Status</th>
    </tr>
  </thead>

  <tbody>
    {adminTrips.map((trip) => (
      <tr key={trip.id}>
        <td>{trip.id}</td>
        <td>{trip.touristEmail || "—"}</td>
        <td>{trip.destination || "—"}</td>
        <td>
          {trip.startTime
            ? new Date(trip.startTime).toLocaleString()
            : "—"}
        </td>
        <td>
          {trip.plannedReturnTime
            ? new Date(trip.plannedReturnTime).toLocaleString()
            : "—"}
        </td>
        <td>
          <span className="trip-status">
            {trip.status || "NOT SET"}
          </span>
        </td>
      </tr>
    ))}
  </tbody>
</table>


        {adminTrips.length === 0 && (
          <p>No trips found.</p>
        )}
      </div>
    )}
  </section>
)}




{activeTab !== "Admin Dashboard" &&
  activeTab !== "Manage Users" &&
  activeTab !== "Manage Places" &&
  activeTab !== "Manage Incidents" &&
  activeTab !== "Manage Trips" && (
    <section className="admin-info-card">
      <h2>{activeTab}</h2>
      <p>This management section will be connected next.</p>
      <button onClick={() => setActiveTab("Admin Dashboard")}>
        ← Back to Dashboard
      </button>
    </section>
  )}


      </main>
    </div>
  );
}

  // DASHBOARD

  const menuItems =
  user?.role === "ADMIN"
    ? [
        "Admin Dashboard",
        "Home",
        "Destinations",
        "Report Incident",
        "My Trips",
        "Safety Information",
        "Emergency Services",
      ]
    : [
        "Home",
        "Destinations",
        "Report Incident",
        "My Trips",
        "Safety Information",
        "Emergency Services",
      ];

  return (

    <div className="app">

      <aside className="sidebar">

        <h2>🛡️ SmartTourist</h2>

        <p className="tagline">Travel safely. Explore freely.</p>

        <nav>

          {menuItems.map((item) => (

            <button

              key={item}

              className={activeTab === item ? "nav-item active" : "nav-item"}

              onClick={() => {

                setActiveTab(item);

                setError("");

                setIncidentMessage("");

                setTripMessage("");

              }}

            >

              {item}

            </button>

          ))}

        </nav>

        <div className="sidebar-bottom">

          <p>Your safety matters ❤️</p>

          <button className="logout-btn" onClick={logout}>

            Sign Out

          </button>

        </div>

      </aside>

      <main className="main-content">

        <header className="topbar">

          <div>

            <h1>{activeTab}</h1>

            <p>Welcome to your SmartTouristSafety dashboard.</p>

          </div>

          <span className="profile">

            👤 {user?.name || user?.email || "Tourist"}

          </span>

        </header>

        {/* HOME */}

        
{/* HOME */}
{activeTab === "Home" && (
  <div className="adventure-home">

    {/* Colourful travel hero */}
    <section className="adventure-hero">
      <div className="adventure-hero-content">
        <span className="adventure-eyebrow">
          YOUR NEXT ADVENTURE STARTS HERE
        </span>

        <h2>Collect moments, not just miles.</h2>

        <p>
          Discover amazing places, plan your trips, and travel
          with greater confidence.
        </p>

        <button
          className="adventure-primary-btn"
          onClick={() => setActiveTab("Destinations")}
        >
          Discover Destinations <span>→</span>
        </button>
      </div>
    </section>

    {/* Colourful quick access cards */}
    <div className="adventure-section-heading">
      <div>
        <span className="adventure-kicker">YOUR TRAVEL TOOLS</span>
        <h2>Where to next?</h2>
        <p>Everything you need for a smoother journey.</p>
      </div>
    </div>

    <section className="adventure-quick-grid">

      <button
        className="adventure-quick-card adventure-card-coral"
        onClick={() => setActiveTab("Destinations")}
      >
        <span className="adventure-card-icon">📍</span>
        <span className="adventure-card-label">EXPLORE</span>
        <strong>Destinations</strong>
        <small>Find places worth visiting.</small>
        <span className="adventure-card-arrow">↗</span>
      </button>

      <button
        className="adventure-quick-card adventure-card-blue"
        onClick={() => setActiveTab("Report Incident")}
      >
        <span className="adventure-card-icon">🚨</span>
        <span className="adventure-card-label">STAY SAFE</span>
        <strong>Report an Incident</strong>
        <small>Get your safety concern reported.</small>
        <span className="adventure-card-arrow">↗</span>
      </button>

      <button
        className="adventure-quick-card adventure-card-yellow"
        onClick={() => setActiveTab("My Trips")}
      >
        <span className="adventure-card-icon">🧳</span>
        <span className="adventure-card-label">YOUR PLANS</span>
        <strong>My Trips</strong>
        <small>Keep your travel plans organised.</small>
        <span className="adventure-card-arrow">↗</span>
      </button>

      <button
        className="adventure-quick-card adventure-card-mint"
        onClick={() => setActiveTab("Emergency Services")}
      >
        <span className="adventure-card-icon">🩺</span>
        <span className="adventure-card-label">NEED HELP?</span>
        <strong>Emergency Services</strong>
        <small>Find important emergency information.</small>
        <span className="adventure-card-arrow">↗</span>
      </button>

    </section>

    {/* Featured destination from existing API data */}
    <section className="adventure-spotlight">
      <div className="adventure-spotlight-image">
        <span className="adventure-spotlight-tag">
          ✦ DESTINATION SPOTLIGHT
        </span>
      </div>

      <div className="adventure-spotlight-content">
        <span className="adventure-kicker">A PLACE TO DISCOVER</span>

        <h2>Your Next Adventure</h2>

        <p>
  Discover new places, explore beautiful destinations, and
  find inspiration for your next journey.
</p>

        <button
          className="adventure-spotlight-btn"
          onClick={() => setActiveTab("Destinations")}
        >
          Explore Places <span>→</span>
        </button>
      </div>
    </section>

  </div>
)}


        {/* DESTINATIONS */}

        {activeTab === "Destinations" && (
          <section>
            <h2 className="section-title">Discover Famous Places</h2>
            <p>Enter a city to find tourist attractions saved in our database.</p>

            <form
              className="incident-form"
              onSubmit={handlePlaceSearch}
              style={{ maxWidth: "650px", marginBottom: "24px" }}
            >
              <label>
                City name
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Try Hyderabad"
                  required
                />
              </label>
              <button className="auth-submit" type="submit" disabled={placesLoading}>
                {placesLoading ? "Searching..." : "Search Famous Places"}
              </button>
            </form>

            {placesError && <p className="auth-error">{placesError}</p>}
            {placesLoading && <p>Finding famous places...</p>}

            {!placesLoading && placesSearched && !placesError && famousPlaces.length === 0 && (
              <p className="empty-message">
                No places found for "{citySearch}". Try another city or add places to the database.
              </p>
            )}

            {!placesLoading && famousPlaces.length > 0 && (
              <>
                <h3 className="section-title">
                  Famous places in {citySearch.trim()}
                </h3>
                <div className="cards">
                  {famousPlaces.map((place) => (
                    <div className="card" key={place.id}>
                      <span className="card-icon">📍</span>
                      <h3>{place.name}</h3>
                      <p><strong>Category:</strong> {place.category || "Not specified"}</p>
                      <p><strong>Location:</strong> {place.location || "Not specified"}</p>
                      <p>{place.description || "No description available."}</p>
                      <p><strong>Opening hours:</strong> {place.openingHours || "Please check before visiting"}</p>
                      <p>
                        <strong>Rating:</strong>{" "}
                        {Number(place.rating) > 0 ? `${place.rating} / 5` : "Not rated yet"}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* INCIDENT REPORTING */}

        {activeTab === "Report Incident" && (

          <section className="content-panel incident-panel">

            <div className="panel-icon">🚨</div>

            <h2>Report a Safety Incident</h2>

            <p>Share the details so your incident can be recorded.</p>

            <form className="incident-form" onSubmit={handleIncidentSubmit}>

              <label>

                Incident Type

                <select

                  value={incidentType}

                  onChange={(e) => setIncidentType(e.target.value)}

                  required

                >

                  <option value="SAFETY">Safety Concern</option>

                  <option value="THEFT">Theft</option>

                  <option value="ACCIDENT">Accident</option>

                  <option value="MEDICAL">Medical Emergency</option>

                  <option value="HARASSMENT">Harassment</option>

                  <option value="OTHER">Other</option>

                </select>

              </label>

              <label>

                Incident Location

                <input

                  value={incidentLocation}

                  onChange={(e) => setIncidentLocation(e.target.value)}

                  placeholder="Enter the location"

                  required

                />

              </label>

              <label>

                Description

                <textarea

                  value={incidentDescription}

                  onChange={(e) => setIncidentDescription(e.target.value)}

                  placeholder="Describe what happened..."

                  rows="5"

                  required

                />

              </label>

              {error && <p className="auth-error">{error}</p>}

              {incidentMessage && (

                <p className="auth-success">{incidentMessage}</p>

              )}

              <button className="auth-submit" disabled={loading}>

                {loading ? "Submitting..." : "Submit Incident"}

              </button>

            </form>

          </section>

        )}

        {/* MY TRIPS */}

        {activeTab === "My Trips" && (

          <section>

            <div className="content-panel incident-panel">

              <div className="panel-icon">🧳</div>

              <h2>Plan a Trip</h2>

              <p>Enter your destination and planned return time.</p>

              <form className="incident-form" onSubmit={handleCreateTrip}>

                <label>

                  Destination

                  <input

                    type="text"

                    value={tripDestination}

                    onChange={(e) => setTripDestination(e.target.value)}

                    placeholder="e.g. Charminar, Hyderabad"

                    required

                  />

                </label>

                <label>

                  Planned Return Time

                  <input

                    type="datetime-local"

                    value={plannedReturnTime}

                    onChange={(e) => setPlannedReturnTime(e.target.value)}

                    min={new Date(Date.now() + 60000)

                      .toISOString()

                      .slice(0, 16)}

                    required

                  />

                </label>

                {error && <p className="auth-error">{error}</p>}

                {tripMessage && <p className="auth-success">{tripMessage}</p>}

                <button className="auth-submit" disabled={loading}>

                  {loading ? "Please wait..." : "Create Trip"}

                </button>

              </form>

            </div>

            <div className="trips-heading">

              <h2 className="section-title">My Trips</h2>

              <button

                className="refresh-btn"

                onClick={loadTrips}

                disabled={loading}

              >

                ↻ Refresh

              </button>

            </div>

            {loading && <p>Loading trips...</p>}

            {!loading && !error && trips.length === 0 && (

              <p className="empty-message">

                No trips found. Create your first trip above!

              </p>

            )}

            <section className="cards trips-list">

              {trips.map((trip) => (

                <div className="card" key={trip.id}>

                  <span className="card-icon">🧭</span>

                  <h3>{trip.destination}</h3>

                  <p>

                    <strong>Status:</strong> {trip.status}

                  </p>

                  <p>

                    <strong>Started:</strong>{" "}

                    {trip.startTime

                      ? new Date(trip.startTime).toLocaleString()

                      : "Not available"}

                  </p>

                  <p>

                    <strong>Planned return:</strong>{" "}

                    {trip.plannedReturnTime

                      ? new Date(trip.plannedReturnTime).toLocaleString()

                      : "Not available"}

                  </p>

                  {trip.status !== "COMPLETED" && (

                    <button

                      onClick={() => completeTrip(trip.id)}

                      disabled={loading}

                    >

                      Mark Completed

                    </button>

                  )}

                  <button

                    className="delete-trip-btn"

                    onClick={() => deleteTrip(trip.id)}

                    disabled={loading}

                  >

                    Delete Trip

                  </button>

                </div>

              ))}

            </section>

          </section>

        )}

        {/* SAFETY INFORMATION */}

        {activeTab === "Safety Information" && (

          <section>

            <h2 className="section-title">Safety Information</h2>

            {safetyLoading && <p>Loading safety information...</p>}

            {safetyError && <p className="auth-error">{safetyError}</p>}

            {!safetyLoading && !safetyError && safetyInfo.length === 0 && (

              <p className="empty-message">No safety information is available yet.</p>

            )}

<section className="cards">
  {safetyInfo.map((info, index) => {
    const categories = [
      {
        title: "General Travel Safety",
        icon: "🛡️",
      },
      {
        title: "Destination & Area Safety",
        icon: "📍",
      },
      {
        title: "Weather & Health Precautions",
        icon: "🌤️",
      },
      {
        title: "Emergency Preparedness",
        icon: "🚨",
      },
    ];

    const category = categories[index % categories.length];

    return (
      <div className="card" key={info.id ?? index}>
        <span className="card-icon">{category.icon}</span>

        <h3>{category.title}</h3>

        {info.riskLevel && (
          <p>
            <strong>Risk Level:</strong> {info.riskLevel}
          </p>
        )}

        {info.safetyInstructions && (
          <p>
            <strong>Safety Instructions:</strong>{" "}
            {info.safetyInstructions}
          </p>
        )}

        {info.hazardousAreas && (
          <p>
            <strong>Hazardous Areas:</strong> {info.hazardousAreas}
          </p>
        )}

        {info.emergencyContact && (
          <p>
            <strong>Emergency Contact:</strong> {info.emergencyContact}
          </p>
        )}

        {info.weatherConditions && (
          <p>
            <strong>Weather Conditions:</strong> {info.weatherConditions}
          </p>
        )}
      </div>
    );
  })}
</section>
            <button className="primary-btn" onClick={() => setActiveTab("Home")}>← Back to Home</button>
          </section>


        )}

        {/* EMERGENCY SERVICES */}

        {activeTab === "Emergency Services" && (

          <section>

            <h2 className="section-title">Emergency Services</h2>

            <p>Use these details to find emergency help while travelling.</p>

            {emergencyLoading && <p>Loading emergency services...</p>}

            {emergencyError && <p className="auth-error">{emergencyError}</p>}

            {!emergencyLoading && !emergencyError && emergencyServices.length === 0 && (

              <p className="empty-message">No emergency service details are available yet.</p>

            )}

            <section className="cards emergency-list">
              {emergencyServices.map((service, index) => (

                <div className="card" key={service.id ?? index}>

                  <span className="card-icon">🚑</span>

                  <h3>{service.name || service.serviceName || service.type || "Emergency Service"}</h3>

                  {Object.entries(service).filter(([key, value]) => !["id", "name", "serviceName", "type"].includes(key) && value != null && value !== "").map(([key, value]) => (

                    <p key={key}>

                      <strong>{key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}:</strong>{" "}

                      {String(value)}

                    </p>

                  ))}

                  {(service.phone || service.phoneNumber || service.contactNumber) && (

                    <a href={`tel:${service.phone || service.phoneNumber || service.contactNumber}`}>

                      Call {service.phone || service.phoneNumber || service.contactNumber}

                    </a>

                  )}

                </div>

              ))}

            </section>

            <p><strong>India emergency helpline:</strong> 112</p>

            <button className="primary-btn" onClick={() => setActiveTab("Home")}>← Back to Home</button>

          </section>

        )}

        {/* OTHER SECTIONS */}

        {activeTab !== "Home" &&

          activeTab !== "Destinations" &&

          activeTab !== "Report Incident" &&

          activeTab !== "My Trips" &&

          activeTab !== "Safety Information" &&

          activeTab !== "Emergency Services" && (

            <section className="content-panel">

              <div className="panel-icon">✨</div>

              <h2>{activeTab}</h2>

              <p>This section is not connected yet.</p>

              <button

                className="primary-btn"

                onClick={() => setActiveTab("Home")}

              >

                ← Back to Home

              </button>

            </section>

          )}

        <footer>

          SmartTouristSafety © 2026 · Making every journey safer.

        </footer>

      </main>

    </div>

  );

}

export default App;