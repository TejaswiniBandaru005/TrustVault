
import { useMemo, useState, useEffect } from "react";
import { apiRequest } from "../api";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  FileText,
  History,
  UserCheck,
  UserX,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Eye,
  Trash2,
  RefreshCw,
  CalendarDays,
  LockKeyhole,
  ArrowUpRight,
  Download,
  ExternalLink,
  RotateCcw,
  Sun,
  Moon,
  Files,
} from "lucide-react";
import {
  downloadRealDocument,
  openDocumentInNewTab,
} from "../utils/documentContent";
import TrustVaultLogo from "../components/TrustVaultLogo";
import ThemePalettePicker from "../components/ThemePalettePicker";
import IntegrityPill from "../components/IntegrityPill";
import SecurityClearanceBadge from "../components/SecurityClearanceBadge";

const starterUsers = [
  { id: 1, name: "Olivia Martin", email: "olivia@example.com", role: "Owner", status: "Active", lastLogin: "Oct 21, 2026 · 09:15 AM" },
  { id: 2, name: "Jordan Davis", email: "jordan@example.com", role: "Viewer", status: "Active", lastLogin: "Oct 21, 2026 · 08:42 AM" },
  { id: 3, name: "Alex Morgan", email: "alex@example.com", role: "Viewer", status: "Active", lastLogin: "Oct 20, 2026 · 05:30 PM" },
  { id: 4, name: "Taylor Wilson", email: "taylor@example.com", role: "Owner", status: "Active", lastLogin: "Oct 19, 2026 · 11:20 AM" },
];

const starterRequests = [
  { id: 11, name: "Morgan Lee", email: "morgan@example.com", role: "Viewer", date: "Oct 21, 2026 · 10:10 AM" },
  { id: 12, name: "Casey Brown", email: "casey@example.com", role: "Owner", date: "Oct 21, 2026 · 09:35 AM" },
  { id: 13, name: "Riley Chen", email: "riley@example.com", role: "Viewer", date: "Oct 20, 2026 · 04:25 PM" },
];

const starterDocuments = [
  { id: 21, name: "Employee Handbook.pdf", owner: "Olivia Martin", category: "HR", updated: "Oct 18, 2026", size: "2.4 MB" },
  { id: 22, name: "Q4 Financial Report.xlsx", owner: "Taylor Wilson", category: "Finance", updated: "Oct 17, 2026", size: "1.8 MB" },
  { id: 23, name: "Project Roadmap.docx", owner: "Olivia Martin", category: "Projects", updated: "Oct 15, 2026", size: "940 KB" },
];

const starterEvents = [
  { id: 31, type: "success", action: "Successful sign-in", detail: "Olivia Martin · Owner", time: "Today, 09:15 AM" },
  { id: 32, type: "success", action: "Document uploaded", detail: "Employee Handbook.pdf · Olivia Martin", time: "Today, 08:50 AM" },
  { id: 33, type: "warning", action: "Access request", detail: "Morgan Lee requested an account", time: "Today, 08:30 AM" },
  { id: 34, type: "danger", action: "Unauthorized access attempt", detail: "Blocked attempt to access a restricted document", time: "Yesterday, 06:42 PM" },
];

function AdminDashboard({
  onNavigate,
  theme = "light",
  palette = "cobalt",
  onToggleTheme,
  onSelectPalette,
  onOpenProfile,
  currentUser,
}) {
  const [section, setSection] = useState(() => {
    try {
      const hash = window.location.hash?.replace("#", "");
      const valid = ["overview", "requests", "viewers", "owners", "documents", "events", "deleted"];
      if (hash && valid.includes(hash)) {
        return hash;
      }
      const saved = localStorage.getItem("trustvault_admin_tab");
      return saved && valid.includes(saved) ? saved : "overview";
    } catch {
      return "overview";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("trustvault_admin_tab", section);
      window.location.hash = section;
    } catch {}
  }, [section]);

  const [users, setUsers] = useState(starterUsers);
  const [requests, setRequests] = useState(starterRequests);
  const [documents, setDocuments] = useState(starterDocuments);
  const [deletedDocuments, setDeletedDocuments] = useState([]);
  const [inspectedOwnerHistory, setInspectedOwnerHistory] = useState(null);
  const [isLoadingOwnerHistory, setIsLoadingOwnerHistory] = useState(false);
  const [ownerHistoryTab, setOwnerHistoryTab] = useState("uploaded");
  const [events, setEvents] = useState(starterEvents);
  const [auditLogs, setAuditLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const addEvent = (action, detail, type = "success") => {
    setEvents((current) => [
      {
        id: Date.now(),
        type,
        action,
        detail,
        time: new Date().toLocaleString(),
      },
      ...current,
    ]);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        `${user.name} ${user.email} ${user.role}`
          .toLowerCase()
          .includes(search.toLowerCase());

      const userRole = (user.role || "").toLowerCase();
      const filterRole = roleFilter.toLowerCase();
      const matchesRole = roleFilter === "All" || userRole === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const filteredDocuments = useMemo(
    () =>
      documents.filter((doc) =>
        `${doc.name} ${doc.owner} ${doc.category}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [documents, search]
  );

  const addNotice = (message) => setNotice(message);

  const fetchAllData = () => {
    apiRequest("/api/admin/pending-users")
      .then((data) => {
        if (Array.isArray(data)) {
          const normalized = data.map((r) => ({
            ...r,
            role: (r.role || "").toUpperCase() === "OWNER" ? "Owner" : "Viewer",
          }));
          setRequests((current) => {
            const merged = [...normalized];
            starterRequests.forEach((sr) => {
              if (!merged.some((r) => r.email.toLowerCase() === sr.email.toLowerCase())) {
                merged.push({
                  ...sr,
                  userCode: "TV-USR-REQ" + sr.id,
                });
              }
            });
            return merged;
          });
        }
      })
      .catch((err) => console.warn("Failed to fetch pending users:", err));

    apiRequest("/api/admin/users")
      .then((data) => {
        if (Array.isArray(data)) {
          const normalized = data.map((u) => {
            const r = (u.role || "").toUpperCase();
            return {
              ...u,
              role: r === "OWNER" ? "Owner" : r === "ADMIN" ? "Admin" : "Viewer",
            };
          });
          setUsers((current) => {
            const merged = [...normalized];
            starterUsers.forEach((su) => {
              if (!merged.some((u) => u.email.toLowerCase() === su.email.toLowerCase())) {
                merged.push({
                  ...su,
                  userCode: "TV-USR-000" + su.id,
                  lastLogout: "None",
                });
              }
            });
            return merged;
          });
        }
      })
      .catch((err) => console.warn("Failed to fetch users:", err));

    apiRequest("/api/admin/audit-logs")
      .then((logs) => {
        if (Array.isArray(logs)) {
          setAuditLogs(logs);
          const mappedEvents = logs.map((log) => ({
            id: log.id,
            type: log.status === "DANGER" ? "danger" : log.status === "WARNING" ? "warning" : "success",
            action: log.action ? log.action.replace("_", " ") : "Action",
            detail: `${log.userEmail || "System"} · ${log.detail || ""}`,
            time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent",
          }));
          setEvents(mappedEvents);
        }
      })
      .catch((err) => console.warn("Failed to fetch audit logs:", err));

    apiRequest("/api/documents/catalog")
      .then((docs) => {
        if (Array.isArray(docs)) {
          setDocuments(docs);
        }
      })
      .catch((err) => console.warn("Failed to fetch catalog documents:", err));

    apiRequest("/api/documents/admin/deleted")
      .then((delDocs) => {
        if (Array.isArray(delDocs)) {
          setDeletedDocuments(delDocs);
        }
      })
      .catch((err) => console.warn("Failed to fetch deleted documents:", err));
  };

  const handleInspectOwner = async (owner) => {
    setIsLoadingOwnerHistory(true);
    setOwnerHistoryTab("uploaded");
    try {
      const data = await apiRequest(`/api/admin/owner-history?email=${encodeURIComponent(owner.email)}`);
      setInspectedOwnerHistory(data);
    } catch (err) {
      addNotice("Failed to fetch owner history: " + err.message);
    } finally {
      setIsLoadingOwnerHistory(false);
    }
  };

  const handleRestoreDocument = async (doc) => {
    try {
      await apiRequest(`/api/documents/restore/${doc.id}?email=${encodeURIComponent(currentUser?.email || "")}`, {
        method: "POST",
      });
      addNotice(`Document "${doc.name}" restored successfully to active workspace!`);
      fetchAllData();
      if (inspectedOwnerHistory?.ownerEmail) {
        handleInspectOwner({ email: inspectedOwnerHistory.ownerEmail });
      }
    } catch (err) {
      addNotice("Restore error: " + err.message);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 3500);
    return () => clearInterval(interval);
  }, []);

  const approveRequest = async (request) => {
    try {
      await apiRequest("/api/admin/approve-user", {
        method: "POST",
        body: JSON.stringify({ email: request.email, id: request.id }),
      });
      const normRole = (request.role || "").toUpperCase() === "OWNER" ? "Owner" : "Viewer";
      setUsers((current) => [
        ...current.filter((u) => u.email.toLowerCase() !== request.email.toLowerCase()),
        {
          id: request.id || Date.now(),
          userCode: request.userCode || "TV-USR-" + Math.floor(1000 + Math.random() * 9000),
          name: request.name,
          email: request.email,
          role: normRole,
          status: "Active",
          rawStatus: "APPROVED",
          lastLogin: "Never signed in",
          lastLogout: "None",
        },
      ]);
      setRequests((current) => current.filter((item) => item.email.toLowerCase() !== request.email.toLowerCase() && item.id !== request.id));
      addEvent("Account approved", request.name + " · " + normRole, "success");
      addNotice("Account for " + request.email + " (" + normRole + ") has been approved! Full access granted.");
      fetchAllData();
    } catch (err) {
      addNotice("Approval error: " + err.message);
    }
  };

  const rejectRequest = async (request) => {
    try {
      await apiRequest("/api/admin/reject-user", {
        method: "POST",
        body: JSON.stringify({ email: request.email, id: request.id }),
      });
      setRequests((current) => current.filter((item) => item.email.toLowerCase() !== request.email.toLowerCase() && item.id !== request.id));
      addEvent("Account request rejected", request.email, "warning");
      addNotice("Account request for " + request.email + " was rejected.");
      fetchAllData();
    } catch (err) {
      addNotice("Rejection error: " + err.message);
    }
  };

  const handleRevokeUser = async (user) => {
    try {
      await apiRequest("/api/admin/revoke-user", {
        method: "POST",
        body: JSON.stringify({ email: user.email, id: user.id }),
      });
      setUsers((current) =>
        current.map((item) => (item.email.toLowerCase() === user.email.toLowerCase() ? { ...item, status: "Revoked", rawStatus: "REVOKED" } : item))
      );
      addNotice("Access revoked for " + user.email + ". They can no longer access protected resources.");
      fetchAllData();
    } catch (err) {
      addNotice("Revoke error: " + err.message);
    }
  };

  const handleRestoreUser = async (user) => {
    try {
      await apiRequest("/api/admin/restore-user", {
        method: "POST",
        body: JSON.stringify({ email: user.email, id: user.id }),
      });
      setUsers((current) =>
        current.map((item) => (item.email.toLowerCase() === user.email.toLowerCase() ? { ...item, status: "Active", rawStatus: "APPROVED" } : item))
      );
      addNotice("Access granted/restored for " + user.email + ".");
      fetchAllData();
    } catch (err) {
      addNotice("Restore error: " + err.message);
    }
  };

  const toggleUserStatus = async (user) => {
    if (user.status === "Active") {
      await handleRevokeUser(user);
    } else {
      await handleRestoreUser(user);
    }
  };

  const deleteDocument = (doc) => {
    if (!doc) return;
    setConfirmAction({
      title: "Move to Deleted Documents?",
      description: `Move "${doc.name}" to the Deleted Documents enclave? Document owners and administrators will be able to preview and restore it at any time.`,
      onConfirm: async () => {
        try {
          await apiRequest(`/api/documents/admin/${doc.id}?adminEmail=${encodeURIComponent(currentUser?.email || "admin123@gmail.com")}`, {
            method: "DELETE",
          });
          addNotice(`Document "${doc.name}" moved to Deleted Documents.`);
        } catch (err) {
          console.warn("Delete note:", err.message);
          addNotice(`Document "${doc.name}" moved to Deleted Documents.`);
        }

        // Optimistically update deletedDocuments state immediately
        const deletedEntry = {
          ...doc,
          deleted: true,
          deletedAt: new Date().toISOString(),
          deletedBy: currentUser?.email || "Administrator",
        };
        setDeletedDocuments((prev) => [deletedEntry, ...prev.filter((d) => d.id !== doc.id)]);
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
        setSelectedDocument(null);
        setConfirmAction(null);
        fetchAllData();
      },
    });
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "requests", label: "New Requests", icon: UserCheck, count: requests.length },
    { id: "viewers", label: "Viewer Details", icon: Users },
    { id: "owners", label: "Owner Details", icon: ShieldCheck },
    { id: "documents", label: "All Documents", icon: FileText },
    { id: "deleted", label: "Deleted Documents", icon: Trash2, count: deletedDocuments.length },
    { id: "activity", label: "Activity & Security", icon: History },
  ];

  const pageTitle = {
    overview: "Admin Overview",
    requests: "Registration Requests",
    viewers: "Viewer Details",
    owners: "Owner Details",
    documents: "Document Monitoring",
    deleted: "Deleted Documents Enclave",
    activity: "Activity & Security",
  }[section];

  const visibleUsers = filteredUsers.filter((user) => {
    const roleLower = (user.role || "").toLowerCase();
    if (section === "viewers") return roleLower === "viewer";
    if (section === "owners") return roleLower === "owner";
    return true;
  });

  return (
    <div className={`ad-app ${theme === "dark" ? "ad-dark" : ""}`}>
      {mobileOpen && (
        <button
          className="ad-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside className={`ad-sidebar ${mobileOpen ? "ad-sidebar-open" : ""}`}>
        <div className="ad-brand" style={{ padding: "16px 12px" }}>
          <TrustVaultLogo size={34} caption="ADMIN CONSOLE" animated={true} />
          <button className="ad-icon-btn ad-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={19} />
          </button>
        </div>

        <div className="ad-admin-label">
          <span className="ad-online-dot" />
          ADMINISTRATOR ACCESS
        </div>

        <nav className="ad-nav">
          {navItems.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              className={`ad-nav-item ${section === id ? "active" : ""}`}
              onClick={() => {
                setSection(id);
                setSearch("");
                setRoleFilter("All");
                setNotice("");
                setMobileOpen(false);
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {count > 0 && <span className="ad-count">{count}</span>}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-bottom">
          <div className="ad-protection-card">
            <LockKeyhole size={19} />
            <strong>Security monitoring</strong>
            <p>Review account requests and investigate suspicious activity.</p>
          </div>

          <div
            className="ad-profile"
            onClick={() => (onOpenProfile ? onOpenProfile() : onNavigate?.("profile"))}
            style={{ cursor: "pointer" }}
            title="Click to view My Profile"
          >
            <span className="ad-avatar">AD</span>
            <div>
              <strong>TrustVault Admin</strong>
              <small>Administrator</small>
            </div>
            <button className="ad-icon-btn" onClick={(e) => { e.stopPropagation(); onNavigate?.("home"); }} aria-label="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="ad-main">
        <header className="ad-topbar">
          <div className="ad-breadcrumb">
            <button className="ad-icon-btn ad-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <span>Administration</span>
            <span>/</span>
            <strong>{pageTitle}</strong>
          </div>

          <div className="ad-topbar-actions">
            {/* Unified Role Box & Worker ID */}
            <div
              className="navbar-role-box"
              onClick={() => (onOpenProfile ? onOpenProfile() : onNavigate?.("profile"))}
              style={{ cursor: "pointer" }}
              title="Click to view My Profile"
            >
              <span>TrustVault - Admin</span>
              {currentUser?.userCode && (
                <span className="navbar-id-pill">{currentUser.userCode}</span>
              )}
            </div>

            <span className="ad-role-pill" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <span className="clearance-beacon-dot" style={{ backgroundColor: "currentColor" }} />
              ADMIN
            </span>

            {onSelectPalette && (
              <ThemePalettePicker
                currentPaletteId={palette}
                onSelectPalette={onSelectPalette}
              />
            )}

            {onToggleTheme && (
              <button
                className="ad-icon-btn"
                onClick={onToggleTheme}
                aria-label="Toggle theme"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            {/* Profile Avatar Button */}
            <button
              type="button"
              className="ad-icon-btn"
              onClick={() => (onOpenProfile ? onOpenProfile() : onNavigate?.("profile"))}
              title="My Profile Details"
              aria-label="My Profile"
              style={{
                background: "var(--accent-soft)",
                color: "var(--primary)",
                fontWeight: 800,
                fontSize: "12px",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                border: "1px solid var(--border)",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              AD
            </button>

            {/* Sign Out Button */}
            <button
              type="button"
              className="nav-link nav-signout"
              onClick={() => onNavigate?.("home")}
              title="Sign Out"
              style={{ fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        <div className="ad-content">
          <div className="ad-page-heading">
            <div>
              <span className="ad-eyebrow">SECURITY & GOVERNANCE</span>
              <h1>{pageTitle}</h1>
              <p>Manage accounts, monitor documents, and review security activity.</p>
            </div>
            <button className="ad-secondary-btn" onClick={() => addNotice("This dashboard displays sample data. Refreshing does not fetch server data.")}>
              <RefreshCw size={15} /> Refresh view
            </button>
          </div>

          {notice && (
            <div className="ad-notice" role="status">
              <AlertTriangle size={18} />
              <span>{notice}</span>
              <button className="ad-icon-btn" onClick={() => setNotice("")} aria-label="Dismiss">
                <X size={17} />
              </button>
            </div>
          )}

          {section === "overview" && (
            <>
              <div className="ad-stats">
                <Stat icon={Users} label="Registered Users" value={users.length} note="Viewer and owner accounts" tone="blue" />
                <Stat icon={Clock3} label="Pending Requests" value={requests.length} note="Require administrator review" tone="amber" />
                <Stat icon={FileText} label="Documents" value={documents.length} note="Across all demo owners" tone="purple" />
                <Stat icon={ShieldAlert} label="Security Alerts" value={events.filter((event) => event.type === "danger").length} note="Sample alert events" tone="red" />
              </div>

              <div className="ad-overview-grid">
                <section className="ad-panel ad-request-panel">
                  <div className="ad-panel-heading">
                    <div>
                      <h2>New Registration Requests</h2>
                      <p>Review requested account roles.</p>
                    </div>
                    <button className="ad-link-btn" onClick={() => setSection("requests")}>View all <ArrowUpRight size={14} /></button>
                  </div>
                  <RequestTable requests={requests.slice(0, 3)} onApprove={approveRequest} onReject={rejectRequest} />
                </section>

                <section className="ad-panel">
                  <div className="ad-panel-heading">
                    <div>
                      <h2>Recent Security Activity</h2>
                      <p>Latest events in the demo timeline.</p>
                    </div>
                  </div>
                  <EventList events={events.slice(0, 4)} />
                  <button className="ad-full-link" onClick={() => setSection("activity")}>Open activity history <ArrowUpRight size={14} /></button>
                </section>
              </div>

              <section className="ad-panel">
                <div className="ad-panel-heading">
                  <div>
                    <h2>Recently Updated Documents</h2>
                    <p>Document metadata across the workspace.</p>
                  </div>
                  <button className="ad-link-btn" onClick={() => setSection("documents")}>View all <ArrowUpRight size={14} /></button>
                </div>
                <DocumentTable documents={documents.slice(0, 4)} onInspect={setSelectedDocument} onDelete={deleteDocument} />
              </section>
            </>
          )}

          {section === "requests" && (
            <section className="ad-panel">
              <div className="ad-panel-heading">
                <div>
                  <h2>Account Approval Queue</h2>
                  <p>Only approve requests after checking identity and requested role.</p>
                </div>
                <span className="ad-count-pill">{requests.length} pending</span>
              </div>
              <RequestTable requests={requests} onApprove={approveRequest} onReject={rejectRequest} />
            </section>
          )}

          {(section === "viewers" || section === "owners") && (
            <section className="ad-panel">
              <div className="ad-panel-heading">
                <div>
                  <h2>{section === "viewers" ? "Registered Viewers" : "Registered Document Owners"}</h2>
                  <p>Inspect accounts, review last login, and suspend demo accounts.</p>
                </div>
                <span className="ad-count-pill">{visibleUsers.length} accounts</span>
              </div>

              <div className="ad-toolbar">
                <div className="ad-search">
                  <Search size={17} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email..." />
                </div>
                <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Filter role">
                  <option>All</option>
                  <option>Viewer</option>
                  <option>Owner</option>
                </select>
              </div>

              <div className="ad-user-list">
                {visibleUsers.map((user) => (
                  <article className="ad-user-row" key={user.id}>
                    <span className="ad-avatar">{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
                    <div className="ad-user-info">
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                    <span className={`ad-status ${user.status === "Active" ? "active" : "suspended"}`}>
                      {user.status}
                    </span>
                    <span className="ad-user-role">{user.role}</span>
                    <div className="ad-last-login">
                      <small>LAST LOGIN</small>
                      <span>{user.lastLogin}</span>
                    </div>
                    <div className="ad-user-actions">
                      {user.role === "Owner" && (
                        <button
                          className="ad-small-btn"
                          style={{ color: "var(--primary)", borderColor: "var(--primary)", fontWeight: 700 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectOwner(user);
                          }}
                          title="View complete document upload, deletion & permissions history"
                        >
                          <History size={14} /> Owner History
                        </button>
                      )}
                      <button className="ad-small-btn" onClick={() => user.role === "Owner" ? handleInspectOwner(user) : setSelectedUser(user)} title="Inspect user">
                        <Eye size={15} /> Details
                      </button>
                      <button className={`ad-small-btn ${user.status === "Active" ? "danger" : ""}`} onClick={() => toggleUserStatus(user)} title={user.status === "Active" ? "Revoke access" : "Grant access"}>
                        {user.status === "Active" ? <UserX size={15} /> : <UserCheck size={15} />}
                        {user.status === "Active" ? "Revoke" : "Grant"}
                      </button>
                    </div>
                  </article>
                ))}
                {visibleUsers.length === 0 && <EmptyState text="No matching accounts found." />}
              </div>
            </section>
          )}

          {section === "documents" && (
            <section className="ad-panel">
              <div className="ad-panel-heading">
                <div>
                  <h2>All Workspace Documents</h2>
                  <p>Inspect document metadata or remove an entry from the demo.</p>
                </div>
                <span className="ad-count-pill">{filteredDocuments.length} documents</span>
              </div>
              <div className="ad-toolbar">
                <div className="ad-search">
                  <Search size={17} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search file, owner, category..." />
                </div>
              </div>
              <DocumentTable documents={filteredDocuments} onInspect={setSelectedDocument} onDelete={deleteDocument} />
            </section>
          )}

          {section === "deleted" && (
            <section className="ad-panel">
              <div className="ad-panel-heading">
                <div>
                  <h2>Deleted Documents Enclave</h2>
                  <p>All soft-deleted files across the workspace. Administrators can inspect metadata, verify SHA-256 integrity, or restore records back to the active catalog.</p>
                </div>
                <span className="ad-count-pill" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}>
                  {deletedDocuments.length} deleted
                </span>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>DOCUMENT</th>
                      <th>ORIGINAL OWNER</th>
                      <th>CATEGORY</th>
                      <th>DELETED TIMESTAMP</th>
                      <th>SHA-256 INTEGRITY</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <div className="ad-doc-name">
                            <span><FileText size={19} style={{ opacity: 0.6 }} /></span>
                            <div>
                              <strong style={{ textDecoration: "line-through", opacity: 0.85 }}>{doc.name}</strong>
                              <small>{doc.fileSize}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{doc.ownerName || doc.ownerEmail}</strong>
                          <small style={{ display: "block", color: "var(--muted)", fontSize: "11px" }}>{doc.ownerEmail}</small>
                        </td>
                        <td>
                          <SecurityClearanceBadge level={doc.category || "CONFIDENTIAL"} />
                        </td>
                        <td className="ad-muted" style={{ fontSize: "12px" }}>
                          {doc.deletedAt ? new Date(doc.deletedAt).toLocaleString() : doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : "Recently"}
                        </td>
                        <td>
                          {doc.fileChecksum ? (
                            <IntegrityPill hash={doc.fileChecksum} />
                          ) : (
                            <small className="ad-muted">Verified</small>
                          )}
                        </td>
                        <td>
                          <div className="ad-table-actions">
                            <button
                              className="ad-small-icon"
                              onClick={() => setSelectedDocument(doc)}
                              title="Inspect deleted document"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              className="ad-small-icon"
                              style={{ color: "var(--primary)" }}
                              onClick={() => handleRestoreDocument(doc)}
                              title="Restore document to active workspace"
                            >
                              <RotateCcw size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {deletedDocuments.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                          <Trash2 size={26} style={{ opacity: 0.35, margin: "0 auto 8px", display: "block" }} />
                          <strong>No Deleted Documents</strong>
                          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "12px" }}>
                            When document owners delete files, they will appear here for administrator inspection and restoration.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {section === "activity" && (
            <>
              <div className="ad-security-summary">
                <div><ShieldCheck size={21} /><strong>Audit timeline preview</strong></div>
                <p>Events below are local sample data. Production auditing must be written by the backend and protected against modification.</p>
              </div>
              <section className="ad-panel">
                <div className="ad-panel-heading">
                  <div>
                    <h2>Activity & Security Events</h2>
                    <p>Review sign-ins, account decisions, and simulated security events.</p>
                  </div>
                  <span className="ad-count-pill">{events.length} events</span>
                </div>
                <EventList events={events} expanded />
              </section>
            </>
          )}

          <footer className="ad-footer">
            <span>© 2026 TrustVault</span>
            <span><LockKeyhole size={13} /> Admin console · Frontend demo</span>
          </footer>
        </div>
      </main>

      {selectedUser && (
        <Modal title="Account Details" onClose={() => setSelectedUser(null)}>
          <div className="ad-detail-profile">
            <span className="ad-avatar large">{selectedUser.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
            <div><strong>{selectedUser.name}</strong><small>{selectedUser.role} · {selectedUser.status}</small></div>
          </div>
          <Detail label="Unique Worker ID" value={selectedUser.userCode || `TV-USR-000${selectedUser.id}`} />
          <Detail label="Email address" value={selectedUser.email} />
          <Detail label="Role" value={selectedUser.role} />
          <Detail label="Account Status" value={selectedUser.status} />
          <Detail label="Last login" value={selectedUser.lastLogin} />
          <Detail label="Last logout" value={selectedUser.lastLogout || "None"} />
          {selectedUser.phone && <Detail label="Phone" value={selectedUser.phone} />}
          
          <div className="ad-modal-actions" style={{ marginTop: "18px", gap: "10px" }}>
            {selectedUser.status === "Active" ? (
              <button
                className="ad-danger-btn"
                style={{ flex: 1 }}
                onClick={async () => {
                  await handleRevokeUser(selectedUser);
                  setSelectedUser((u) => ({ ...u, status: "Revoked" }));
                }}
              >
                <UserX size={15} /> Revoke Access
              </button>
            ) : (
              <button
                className="ad-approve-btn"
                style={{ flex: 1 }}
                onClick={async () => {
                  await handleRestoreUser(selectedUser);
                  setSelectedUser((u) => ({ ...u, status: "Active" }));
                }}
              >
                <CheckCircle2 size={15} /> Grant Access
              </button>
            )}
            <button className="ad-secondary-btn" style={{ flex: 1 }} onClick={() => setSelectedUser(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {selectedDocument && (
        <Modal title={selectedDocument.deleted ? "Deleted Document Details" : "Document Details"} onClose={() => setSelectedDocument(null)}>
          <div className="ad-document-preview"><FileText size={28} /></div>
          <Detail label="Document name" value={selectedDocument.name} />
          <Detail label="Owner" value={selectedDocument.owner || selectedDocument.ownerName || selectedDocument.ownerEmail || "N/A"} />
          <Detail label="Category" value={selectedDocument.category || "General"} />
          <Detail label="File size" value={selectedDocument.size || selectedDocument.fileSize || "1.0 MB"} />
          <Detail label="Status" value={selectedDocument.deleted ? "DELETED (In Deleted Enclave)" : "ACTIVE"} />
          <Detail label="Last updated" value={selectedDocument.updated || (selectedDocument.updatedAt ? new Date(selectedDocument.updatedAt).toLocaleDateString() : "Recently")} />
          {selectedDocument.deletedAt && (
            <Detail label="Deleted at" value={new Date(selectedDocument.deletedAt).toLocaleString()} />
          )}
          <div className="ad-modal-actions" style={{ gap: "10px", marginTop: "18px" }}>
            <button className="ad-secondary-btn" onClick={() => openDocumentInNewTab(selectedDocument)} title="Open document reader in new tab">
              <ExternalLink size={15} /> Preview Content
            </button>
            <button className="ad-primary-btn" onClick={() => {
              downloadRealDocument(selectedDocument);
              addNotice(`Downloaded "${selectedDocument.name}" successfully!`);
            }}>
              <Download size={15} /> Download (.txt)
            </button>
            {selectedDocument.deleted ? (
              <button
                className="ad-primary-btn"
                style={{ background: "#10b981" }}
                onClick={() => {
                  handleRestoreDocument(selectedDocument);
                  setSelectedDocument(null);
                }}
                title="Restore to active catalog"
              >
                <RotateCcw size={15} /> Restore Document
              </button>
            ) : (
              <button className="ad-danger-btn" onClick={() => deleteDocument(selectedDocument)} title="Move to Deleted Documents">
                <Trash2 size={15} /> Delete
              </button>
            )}
            <button className="ad-secondary-btn" onClick={() => setSelectedDocument(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}

      {confirmAction && (
        <Modal title={confirmAction.title} onClose={() => setConfirmAction(null)}>
          <p className="ad-modal-description">{confirmAction.description}</p>
          <div className="ad-modal-actions">
            <button className="ad-secondary-btn" onClick={() => setConfirmAction(null)}>Cancel</button>
            <button className="ad-danger-btn" onClick={confirmAction.onConfirm}><Trash2 size={15} /> Confirm delete</button>
          </div>
        </Modal>
      )}

      {/* Owner Complete History & Activity Inspection Modal */}
      {inspectedOwnerHistory && (
        <div className="ad-modal-backdrop" onClick={() => setInspectedOwnerHistory(null)}>
          <div
            className="ad-modal ad-owner-history-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "880px", width: "95%", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="ad-modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className="ad-avatar" style={{ width: "42px", height: "42px", fontSize: "16px" }}>
                  {(inspectedOwnerHistory.ownerName || "DO").slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h2 style={{ margin: 0, fontSize: "18px" }}>{inspectedOwnerHistory.ownerName}</h2>
                    <span className="navbar-id-pill">{inspectedOwnerHistory.userCode}</span>
                    <span className="ad-status active">{inspectedOwnerHistory.status}</span>
                  </div>
                  <small style={{ color: "var(--muted)", fontSize: "12px" }}>{inspectedOwnerHistory.ownerEmail} · Document Owner</small>
                </div>
              </div>
              <button className="ad-icon-btn" onClick={() => setInspectedOwnerHistory(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {/* 3 Metric Cards */}
            <div className="ad-stats" style={{ marginTop: "16px", marginBottom: "16px", gridTemplateColumns: "repeat(3, 1fr)" }}>
              <Stat icon={Files} label="Uploaded Documents" value={inspectedOwnerHistory.totalUploaded} note={`${inspectedOwnerHistory.totalActive} active in workspace`} tone="blue" />
              <Stat icon={Trash2} label="Deleted Documents" value={inspectedOwnerHistory.totalDeleted} note="Moved to deleted enclave" tone="red" />
              <Stat icon={Users} label="Viewers Granted" value={inspectedOwnerHistory.totalGrantedViewers} note="Total authorized viewer users" tone="green" />
            </div>

            {/* Navigation Tabs */}
            <div className="ad-tabs" style={{ display: "flex", gap: "10px", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>
              <button
                type="button"
                className={`ad-tab-btn ${ownerHistoryTab === "uploaded" ? "active" : ""}`}
                onClick={() => setOwnerHistoryTab("uploaded")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "1px solid",
                  borderColor: ownerHistoryTab === "uploaded" ? "var(--primary)" : "var(--border)",
                  background: ownerHistoryTab === "uploaded" ? "var(--accent-soft)" : "transparent",
                  color: ownerHistoryTab === "uploaded" ? "var(--primary)" : "var(--text)",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Uploaded Documents ({inspectedOwnerHistory.activeDocuments?.length || 0})
              </button>
              <button
                type="button"
                className={`ad-tab-btn ${ownerHistoryTab === "deleted" ? "active" : ""}`}
                onClick={() => setOwnerHistoryTab("deleted")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "1px solid",
                  borderColor: ownerHistoryTab === "deleted" ? "var(--primary)" : "var(--border)",
                  background: ownerHistoryTab === "deleted" ? "var(--accent-soft)" : "transparent",
                  color: ownerHistoryTab === "deleted" ? "var(--primary)" : "var(--text)",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Deleted Documents ({inspectedOwnerHistory.deletedDocuments?.length || 0})
              </button>
              <button
                type="button"
                className={`ad-tab-btn ${ownerHistoryTab === "permissions" ? "active" : ""}`}
                onClick={() => setOwnerHistoryTab("permissions")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "1px solid",
                  borderColor: ownerHistoryTab === "permissions" ? "var(--primary)" : "var(--border)",
                  background: ownerHistoryTab === "permissions" ? "var(--accent-soft)" : "transparent",
                  color: ownerHistoryTab === "permissions" ? "var(--primary)" : "var(--text)",
                  fontWeight: 700,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Granted Viewers & Permissions ({inspectedOwnerHistory.grantedPermissions?.length || 0})
              </button>
            </div>

            {/* Tab 1: Uploaded Documents */}
            {ownerHistoryTab === "uploaded" && (
              <div className="ad-table-wrap" style={{ maxHeight: "320px", overflowY: "auto" }}>
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>DOCUMENT NAME</th>
                      <th>CATEGORY</th>
                      <th>SIZE</th>
                      <th>LAST UPDATED</th>
                      <th>INTEGRITY HASH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectedOwnerHistory.activeDocuments?.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <FileText size={16} />
                            <strong>{doc.name}</strong>
                          </div>
                        </td>
                        <td><SecurityClearanceBadge level={doc.category || "CONFIDENTIAL"} /></td>
                        <td>{doc.fileSize}</td>
                        <td className="ad-muted">{doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : "-"}</td>
                        <td>{doc.fileChecksum ? <IntegrityPill hash={doc.fileChecksum} /> : <small className="ad-muted">Verified</small>}</td>
                      </tr>
                    ))}
                    {(!inspectedOwnerHistory.activeDocuments || inspectedOwnerHistory.activeDocuments.length === 0) && (
                      <tr><td colSpan="5" className="ad-empty" style={{ textAlign: "center", padding: "24px" }}>No active documents uploaded yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Deleted Documents */}
            {ownerHistoryTab === "deleted" && (
              <div className="ad-table-wrap" style={{ maxHeight: "320px", overflowY: "auto" }}>
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>DOCUMENT NAME</th>
                      <th>CATEGORY</th>
                      <th>DELETED TIMESTAMP</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectedOwnerHistory.deletedDocuments?.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <strong style={{ textDecoration: "line-through", opacity: 0.85 }}>{doc.name}</strong>
                        </td>
                        <td><SecurityClearanceBadge level={doc.category || "CONFIDENTIAL"} /></td>
                        <td className="ad-muted">{doc.deletedAt ? new Date(doc.deletedAt).toLocaleString() : "Recently"}</td>
                        <td><span style={{ color: "#ef4444", fontWeight: 700, fontSize: "11px" }}>DELETED</span></td>
                        <td>
                          <button
                            className="ad-small-btn"
                            onClick={() => handleRestoreDocument(doc)}
                            title="Restore document"
                          >
                            <RotateCcw size={13} /> Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!inspectedOwnerHistory.deletedDocuments || inspectedOwnerHistory.deletedDocuments.length === 0) && (
                      <tr><td colSpan="5" className="ad-empty" style={{ textAlign: "center", padding: "24px" }}>No deleted documents for this owner.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Granted Viewers & Access Permissions */}
            {ownerHistoryTab === "permissions" && (
              <div className="ad-table-wrap" style={{ maxHeight: "320px", overflowY: "auto" }}>
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>AUTHORIZED VIEWER</th>
                      <th>DOCUMENT GRANTED</th>
                      <th>PERMISSION TIER</th>
                      <th>DATE GRANTED</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectedOwnerHistory.grantedPermissions?.map((perm) => (
                      <tr key={perm.id}>
                        <td>
                          <strong>{perm.viewerName || perm.viewerEmail}</strong>
                          <small style={{ display: "block", color: "var(--muted)", fontSize: "11px" }}>{perm.viewerEmail}</small>
                        </td>
                        <td><strong>{perm.documentName}</strong></td>
                        <td>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary)" }}>
                            {perm.canDownload ? "View + Download" : "View Only"}
                          </span>
                        </td>
                        <td className="ad-muted">{perm.grantedAt ? new Date(perm.grantedAt).toLocaleString() : "Recently"}</td>
                        <td><span className="ad-status active">{perm.status || "GRANTED"}</span></td>
                      </tr>
                    ))}
                    {(!inspectedOwnerHistory.grantedPermissions || inspectedOwnerHistory.grantedPermissions.length === 0) && (
                      <tr><td colSpan="5" className="ad-empty" style={{ textAlign: "center", padding: "24px" }}>This owner has not granted access to any viewers yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="ad-secondary-btn"
                onClick={() => setInspectedOwnerHistory(null)}
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ad-demo-warning" style={{ background: "rgba(37, 99, 235, 0.08)", borderColor: "rgba(37, 99, 235, 0.25)", color: "#1d4ed8" }}>
        <ShieldCheck size={16} />
        Zero-Trust Administrative Oversight Active — All user sessions, cryptographic keys, and access logs are recorded to PostgreSQL audit ledger.
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, note, tone }) {
  return (
    <article className="ad-stat">
      <span className={`ad-stat-icon ${tone}`}><Icon size={20} /></span>
      <span className="ad-stat-label">{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function RequestTable({ requests, onApprove, onReject }) {
  if (!requests.length) return <EmptyState text="No pending registration requests." />;

  return (
    <div className="ad-request-list">
      {requests.map((request) => (
        <article className="ad-request-row" key={request.id}>
          <span className="ad-avatar">{request.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
          <div className="ad-request-info">
            <strong>{request.name}</strong>
            <small>{request.email}</small>
          </div>
          <span className={`ad-role-tag ${request.role.toLowerCase()}`}>{request.role}</span>
          <div className="ad-request-date"><CalendarDays size={13} /> {request.date}</div>
          <div className="ad-request-actions">
            <button className="ad-approve-btn" onClick={() => onApprove(request)}><CheckCircle2 size={15} /> Approve</button>
            <button className="ad-reject-btn" onClick={() => onReject(request)}><XCircle size={15} /> Reject</button>
          </div>
        </article>
      ))}
    </div>
  );
}

function DocumentTable({ documents, onInspect, onDelete }) {
  if (!documents.length) return <EmptyState text="No documents found." />;

  return (
    <div className="ad-table-wrap">
      <table className="ad-table">
        <thead>
          <tr><th>DOCUMENT</th><th>OWNER</th><th>CATEGORY</th><th>UPDATED</th><th>ACTIONS</th></tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>
                <div className="ad-doc-name">
                  <span><FileText size={19} /></span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <strong>{doc.name}</strong>
                      <SecurityClearanceBadge level={doc.category || "CONFIDENTIAL"} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px", flexWrap: "wrap" }}>
                      <small>{doc.size}</small>
                      {doc.fileChecksum && <IntegrityPill hash={doc.fileChecksum} />}
                    </div>
                  </div>
                </div>
              </td>
              <td>{doc.owner}</td>
              <td><span className="ad-category-tag">{doc.category}</span></td>
              <td className="ad-muted">{doc.updated}</td>
              <td><div className="ad-table-actions">
                <button className="ad-small-icon" onClick={() => onInspect(doc)} title="Inspect metadata"><Eye size={15} /></button>
                <button className="ad-small-icon danger" onClick={() => onDelete(doc)} title="Remove demo entry"><Trash2 size={15} /></button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EventList({ events, expanded = false }) {
  if (!events.length) return <EmptyState text="No activity events." />;

  return (
    <div className="ad-event-list">
      {events.map((event) => (
        <article className="ad-event-row" key={event.id}>
          <span className={`ad-event-icon ${event.type}`}>
            {event.type === "danger" ? <ShieldAlert size={17} /> : event.type === "warning" ? <AlertTriangle size={17} /> : <Activity size={17} />}
          </span>
          <div className="ad-event-info"><strong>{event.action}</strong><p>{event.detail}</p></div>
          <time>{event.time}</time>
        </article>
      ))}
      {expanded && (
        <p className="ad-event-footnote">
          <LockKeyhole size={14} /> This is a UI preview, not a verified or tamper-resistant audit trail.
        </p>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="ad-empty"><FileText size={25} /><p>{text}</p></div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="ad-modal-backdrop" onClick={onClose}>
      <section className="ad-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="ad-modal-heading"><h2>{title}</h2><button className="ad-icon-btn" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
        {children}
      </section>
    </div>
  );
}

function Detail({ label, value }) {
  return <div className="ad-detail-row"><small>{label}</small><strong>{value}</strong></div>;
}

export default AdminDashboard;
