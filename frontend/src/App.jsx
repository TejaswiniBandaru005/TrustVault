import { useEffect, useState } from "react";
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
  LogOut,
} from "lucide-react";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import PendingApproval from "./pages/PendingApproval";
import ViewerDashboard from "./pages/ViewerDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { apiRequest } from "./api";

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
  
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("trustvault_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [selectedRole, setSelectedRole] = useState(() => {
    try {
      return localStorage.getItem("trustvault_role") || "viewer";
    } catch {
      return "viewer";
    }
  });

  const [page, setPage] = useState(() => {
    try {
      const savedPage = localStorage.getItem("trustvault_page");
      const rawUser = localStorage.getItem("trustvault_user");
      const user = rawUser ? JSON.parse(rawUser) : null;
      if (savedPage) {
        if (["admin", "owner", "viewer"].includes(savedPage) && !user) {
          return "login";
        }
        return savedPage;
      }
      if (user) {
        const r = (user.role || "").toUpperCase();
        return r === "ADMIN" ? "admin" : r === "OWNER" ? "owner" : "viewer";
      }
      return "home";
    } catch {
      return "home";
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState("checking");
  const [pendingUserData, setPendingUserData] = useState(() => {
    try {
      const raw = sessionStorage.getItem("trustvault_pending_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("trustvault_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("trustvault_user");
      }
    } catch (e) {
      console.warn("localStorage user error", e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem("trustvault_page", page);
    } catch (e) {
      console.warn("localStorage page error", e);
    }
  }, [page]);

  useEffect(() => {
    try {
      localStorage.setItem("trustvault_role", selectedRole);
    } catch (e) {
      console.warn("localStorage role error", e);
    }
  }, [selectedRole]);

  const changePage = (nextPage, data = null) => {
    if (data) {
      setPendingUserData(data);
      try {
        sessionStorage.setItem("trustvault_pending_user", JSON.stringify(data));
      } catch (e) {}
    }
    setPage(nextPage);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    let isActive = true;

    apiRequest("/api/health")
      .then(() => {
        if (isActive) setServerStatus("online");
      })
      .catch(() => {
        if (isActive) setServerStatus("offline");
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleAuthenticated = (user) => {
    const nextPage = {
      ADMIN: "admin",
      OWNER: "owner",
      VIEWER: "viewer",
    }[user.role?.toUpperCase()];

    if (!nextPage) {
      throw new Error("The server returned an unsupported account role.");
    }

    setCurrentUser(user);
    setSelectedRole(nextPage);
    changePage(nextPage);
  };

  const handlePreviewLogin = (role, email = "") => {
    const normRole = (role || "viewer").toUpperCase();
    const dest = {
      ADMIN: "admin",
      OWNER: "owner",
      VIEWER: "viewer",
    }[normRole] || "viewer";

    const previewUser = {
      email: email || `guest-${dest}@trustvault.local`,
      userCode: "TV-USR-PREVIEW",
      role: normRole,
      status: "PENDING_APPROVAL",
      isPreview: true,
      isPendingApproval: true,
    };

    setCurrentUser(previewUser);
    setSelectedRole(dest);
    changePage(dest);
  };

  const handleSignOut = () => {
    if (currentUser?.email) {
      apiRequest("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ email: currentUser.email }),
      }).catch(() => {});
    }
    try {
      localStorage.removeItem("trustvault_user");
      localStorage.setItem("trustvault_page", "home");
      localStorage.setItem("trustvault_role", "viewer");
      sessionStorage.removeItem("trustvault_pending_user");
    } catch (e) {}
    setCurrentUser(null);
    setSelectedRole("viewer");
    changePage("home");
  };

  return (
    <div className={`app ${theme}`}>
      <header className="navbar">
        <button
          type="button"
          className="brand"
          onClick={() => {
            if (currentUser) {
              const dash = {
                ADMIN: "admin",
                OWNER: "owner",
                VIEWER: "viewer",
              }[currentUser.role?.toUpperCase()] || "home";
              changePage(dash);
            } else {
              changePage("home");
            }
          }}
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
          type="button"
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`nav-actions ${mobileMenuOpen ? "nav-open" : ""}`}>
          {!currentUser ? (
            <>
              <button type="button" className="nav-link" onClick={() => changePage("home")}>
                Home
              </button>

              <button
                type="button"
                className="nav-link"
                onClick={() => changePage("login")}
              >
                Sign in
              </button>

              <button
                type="button"
                className="button button-primary nav-register"
                onClick={() => changePage("register")}
              >
                Get started <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              {/* Designated role textbox & distinct Worker Unique ID */}
              <div className="navbar-role-box">
                <span>
                  {(currentUser.role || "").toUpperCase() === "ADMIN"
                    ? "TrustVault - Admin"
                    : (currentUser.role || "").toUpperCase() === "OWNER"
                    ? "TrustVault - Owner"
                    : "TrustVault - Viewer"}
                </span>
                {currentUser.userCode && (
                  <span className="navbar-id-pill">{currentUser.userCode}</span>
                )}
              </div>

              <button
                type="button"
                className="nav-link nav-signout"
                onClick={handleSignOut}
              >
                <LogOut size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "5px" }} />
                {currentUser.isPreview ? "Exit Preview" : "Sign out"}
              </button>
            </>
          )}

          <button
            type="button"
            className="theme-toggle"
            onClick={() =>
              setTheme(theme === "light" ? "dark" : "light")
            }
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            title="Toggle theme"
          >
            {theme === "light" ? <Moon size={19} /> : <Sun size={19} />}
          </button>
        </nav>
      </header>

      {/* Global Preview Mode Alert Banner */}
      {currentUser?.isPreview && (
        <aside className="preview-global-banner" role="status">
          <div className="preview-banner-content">
            <Eye size={18} />
            <span>
              <strong>Preview Mode:</strong>{" "}
              {currentUser.isPendingApproval
                ? "Your account is awaiting Administrator approval. You are exploring TrustVault in clean Preview Mode."
                : "You are exploring this workspace in Preview Mode. Real changes require an active approved account."}
            </span>
          </div>
          <button
            type="button"
            className="preview-banner-close-btn"
            onClick={handleSignOut}
          >
            Exit Preview
          </button>
        </aside>
      )}

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
                  type="button"
                  className="button button-primary button-large"
                  onClick={() =>
                    document
                      .getElementById("role-selection")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explore TrustVault <ArrowRight size={18} />
                </button>

                {currentUser ? (
                  <button
                    type="button"
                    className="button button-secondary button-large"
                    onClick={() =>
                      changePage(
                        {
                          ADMIN: "admin",
                          OWNER: "owner",
                          VIEWER: "viewer",
                        }[currentUser.role] || "home"
                      )
                    }
                  >
                    Open your dashboard <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="button button-secondary button-large"
                    onClick={() => changePage("login")}
                  >
                    Sign in to your account
                  </button>
                )}
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
                    <span /> {serverStatus === "checking"
                      ? "CONNECTING"
                      : serverStatus === "online"
                        ? "SERVER ONLINE"
                        : "SERVER OFFLINE"}
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
                    type="button"
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
                type="button"
                className="button button-primary button-large"
                onClick={() => {
                  if (currentUser) {
                    changePage(
                      {
                        ADMIN: "admin",
                        OWNER: "owner",
                        VIEWER: "viewer",
                      }[currentUser.role] || "home"
                    );
                  } else {
                    changePage("login");
                  }
                }}
              >
                {currentUser ? "Open your dashboard" : "Continue to sign in"} <ArrowRight size={18} />
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
          initialEmail={pendingUserData?.email}
          onNavigate={changePage}
          onAuthenticated={handleAuthenticated}
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
          currentUser={currentUser}
          onNavigate={(dest) => (dest === "home" ? handleSignOut() : changePage(dest))}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      ) : page === "owner" ? (
        <OwnerDashboard
          theme={theme}
          currentUser={currentUser}
          onNavigate={(dest) => (dest === "home" ? handleSignOut() : changePage(dest))}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      ) : page === "admin" ? (
        <AdminDashboard
          theme={theme}
          currentUser={currentUser}
          onNavigate={(dest) => (dest === "home" ? handleSignOut() : changePage(dest))}
          onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      ) : (
        <PendingApproval
          pendingData={pendingUserData}
          onNavigate={changePage}
          onPreview={handlePreviewLogin}
        />
      )}

      <footer className="footer">
        <button type="button" className="footer-brand" onClick={() => changePage("home")}>
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
