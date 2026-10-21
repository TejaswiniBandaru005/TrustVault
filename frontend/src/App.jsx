import { useState } from "react";
import {
  ShieldCheck,
  Eye,
  Files,
  UserRoundCog,
  Sun,
  Moon,
  LockKeyhole,
  ArrowRight,
  FileCheck2,
  History,
  Search,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import PendingApproval from "./pages/PendingApproval";
import ViewerDashboard from "./pages/ViewerDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";


const roles = [
  {
    id: "viewer",
    title: "Viewer",
    description: "Discover documents and securely access files shared with you.",
    icon: Eye,
    features: ["Request document access", "Read authorized files"],
  },
  {
    id: "owner",
    title: "Document Owner",
    description: "Manage your documents and control exactly who can access them.",
    icon: Files,
    features: ["Upload and manage files", "Grant or revoke access"],
  },
  {
    id: "admin",
    title: "Administrator",
    description: "Manage accounts, review activity, and monitor platform security.",
    icon: UserRoundCog,
    features: ["Manage user requests", "Monitor security events"],
  },
];

function App() {
  const [theme, setTheme] = useState("light");
  const [selectedRole, setSelectedRole] = useState("viewer");
  const [page, setPage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const changePage = (nextPage) => {
    setPage(nextPage);
    setMobileMenuOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    alert(
      "Frontend demo only. Authentication and account approval will be connected to the secure backend in a later step."
    );
  };

  return (
    <div className={`app ${theme}`}>
      <header className="navbar">
        <button
          className="brand"
          onClick={() => changePage("home")}
          aria-label="TrustVault home"
        >
          <span className="brand-icon">
            <ShieldCheck size={25} />
          </span>
          <span>
            <span className="brand-name">TrustVault</span>
            <span className="brand-caption">SECURE DOCUMENTS</span>
          </span>
        </button>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`nav-actions ${mobileMenuOpen ? "nav-open" : ""}`}>
          <button className="nav-link" onClick={() => changePage("home")}>
            Home
          </button>

          <button
            className="nav-link"
            onClick={() => changePage("login")}
          >
            Sign in
          </button>

          <button
            className="theme-toggle"
            onClick={() =>
              setTheme(theme === "light" ? "dark" : "light")
            }
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            title="Toggle theme"
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>

          <button
            className="button button-primary nav-register"
            onClick={() => changePage("register")}
          >
            Get started <ArrowRight size={16} />
          </button>
        </nav>
      </header>

      {page === "home" ? (
        <main>
          <section className="hero">
            <div className="hero-content">
              <div className="eyebrow">
                <span className="status-dot" />
                PRIVATE BY DESIGN. ACCOUNTABLE BY DEFAULT.
              </div>

              <h1>
                Your documents.
                <br />
                <span>Your control.</span>
              </h1>

              <p className="hero-description">
                Share confidential documents with confidence. Control who
                can view or download every file, set access expiration, and
                maintain a clear record of document activity.
              </p>

              <div className="hero-buttons">
                <button
                  className="button button-primary button-large"
                  onClick={() =>
                    document
                      .getElementById("role-selection")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explore TrustVault <ArrowRight size={18} />
                </button>

                <button
                  className="button button-secondary button-large"
                  onClick={() => changePage("login")}
                >
                  Sign in to your account
                </button>
              </div>

              <div className="hero-trust">
                <span>
                  <CheckCircle2 size={16} /> Document-level permissions
                </span>
                <span>
                  <CheckCircle2 size={16} /> Activity tracking
                </span>
              </div>
            </div>

            <div className="security-preview">
              <div className="preview-glow" />

              <div className="preview-card">
                <div className="preview-heading">
                  <div className="preview-heading-icon">
                    <ShieldCheck size={23} />
                  </div>
                  <div>
                    <h3>Security overview</h3>
                    <p>Document access control</p>
                  </div>
                  <span className="live-indicator">
                    <span /> DEMO
                  </span>
                </div>

                <div className="preview-document">
                  <div className="document-icon">
                    <FileCheck2 size={24} />
                  </div>
                  <div className="document-details">
                    <strong>Confidential_Report.pdf</strong>
                    <span>PDF document · Private storage</span>
                  </div>
                  <LockKeyhole size={19} className="locked-icon" />
                </div>

                <div className="preview-permissions">
                  <div className="permissions-header">
                    <span>ACCESS POLICY</span>
                    <span className="policy-badge">Restricted</span>
                  </div>

                  <div className="permission-row">
                    <div className="permission-symbol">
                      <Eye size={17} />
                    </div>
                    <div className="permission-copy">
                      <strong>Read access</strong>
                      <span>Granted users only</span>
                    </div>
                    <CheckCircle2 size={18} className="check-icon" />
                  </div>

                  <div className="permission-row">
                    <div className="permission-symbol">
                      <Files size={17} />
                    </div>
                    <div className="permission-copy">
                      <strong>Download access</strong>
                      <span>Separate permission required</span>
                    </div>
                    <LockKeyhole size={17} className="locked-icon" />
                  </div>
                </div>

                <div className="preview-audit">
                  <div className="audit-icon">
                    <History size={18} />
                  </div>
                  <div>
                    <strong>Auditable activity</strong>
                    <p>Access events and permission changes</p>
                  </div>
                  <span className="audit-arrow">
                    <ArrowRight size={18} />
                  </span>
                </div>

                <p className="preview-disclaimer">
                  Illustrative preview · No real security events yet
                </p>
              </div>
            </div>
          </section>

          <section className="security-strip">
            <div>
              <LockKeyhole size={21} />
              <span>Private file access</span>
            </div>
            <div>
              <History size={21} />
              <span>Auditable activity</span>
            </div>
            <div>
              <UserRoundCog size={21} />
              <span>Controlled permissions</span>
            </div>
          </section>

          <section className="roles-section" id="role-selection">
            <div className="section-heading">
              <span className="section-kicker">GET STARTED</span>
              <h2>One secure workspace. Three roles.</h2>
              <p>
                Choose the role associated with your account to continue.
                Your actual permissions will be verified after sign-in.
              </p>
            </div>

            <div className="role-grid">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;

                return (
                  <button
                    key={role.id}
                    className={`role-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedRole(role.id)}
                    aria-pressed={isSelected}
                  >
                    <div className="role-card-top">
                      <div className="role-icon">
                        <Icon size={25} />
                      </div>
                      <span className="role-radio">
                        {isSelected && <span />}
                      </span>
                    </div>

                    <h3>{role.title}</h3>
                    <p className="role-description">{role.description}</p>

                    <div className="role-features">
                      {role.features.map((feature) => (
                        <span key={feature}>
                          <CheckCircle2 size={15} />
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="role-card-footer">
                      <span>{isSelected ? "Selected" : "Select role"}</span>
                      <ArrowRight size={18} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="role-continue">
              <div>
                <span className="continue-label">SELECTED ROLE</span>
                <strong>
                  {roles.find((role) => role.id === selectedRole)?.title}
                </strong>
              </div>

              <button
                className="button button-primary button-large"
                onClick={() => changePage("login")}
              >
                Continue to sign in <ArrowRight size={18} />
              </button>
            </div>
          </section>

          <section className="feature-section">
            <div className="section-heading">
              <span className="section-kicker">BUILT AROUND TRUST</span>
              <h2>Control access at every step.</h2>
              <p>
                A document-sharing experience designed around permission,
                accountability, and controlled access.
              </p>
            </div>

            <div className="feature-grid">
              <article className="feature-card">
                <div className="feature-icon">
                  <LockKeyhole size={23} />
                </div>
                <h3>Document-level control</h3>
                <p>
                  Manage permissions for each document rather than
                  automatically exposing an entire folder.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">
                  <History size={23} />
                </div>
                <h3>Traceable activity</h3>
                <p>
                  Record document operations, permission changes, and
                  denied access attempts for review.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">
                  <Search size={23} />
                </div>
                <h3>Discover without opening</h3>
                <p>
                  Find documents in the catalog while keeping their
                  contents protected until access is granted.
                </p>
              </article>
            </div>
          </section>
        </main>
      ) : page === "login" ? (
        <Login
          role={selectedRole}
          onNavigate={changePage}
        />
      ) : page === "register" ? (
        <Register
          role={selectedRole}
          onNavigate={changePage}
        />
      ) : page === "forgot" ? (
        <ForgotPassword
          onNavigate={changePage}
        />
      ) : page === "viewer" ? (
        <ViewerDashboard
          theme={theme}
          onNavigate={changePage}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
        ) : page === "owner" ? (
          <OwnerDashboard
            theme={theme}
            onNavigate={changePage}
            onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
      ) : page === "admin" ? (
        <AdminDashboard
          theme={theme}
          onNavigate={changePage}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      ) : (
        <PendingApproval onNavigate={changePage} />
      )}

      <footer className="footer">
        <button className="footer-brand" onClick={() => changePage("home")}>
          <ShieldCheck size={19} />
          TrustVault
        </button>
        <span>Secure document sharing · Built around accountability</span>
        <span>© {new Date().getFullYear()} TrustVault</span>
      </footer>
    </div>
    
  );
}

export default App;