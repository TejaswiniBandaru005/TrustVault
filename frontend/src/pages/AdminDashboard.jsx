
import { useMemo, useState } from "react";
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
} from "lucide-react";

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

function AdminDashboard({ onNavigate, theme = "light", onToggleTheme }) {
  const [section, setSection] = useState("overview");
  const [users, setUsers] = useState(starterUsers);
  const [requests, setRequests] = useState(starterRequests);
  const [documents, setDocuments] = useState(starterDocuments);
  const [events, setEvents] = useState(starterEvents);
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

      const matchesRole = roleFilter === "All" || user.role === roleFilter;
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

  const approveRequest = (request) => {
    setUsers((current) => [
      ...current,
      {
        id: Date.now(),
        name: request.name,
        email: request.email,
        role: request.role,
        status: "Active",
        lastLogin: "Never signed in",
      },
    ]);

    setRequests((current) => current.filter((item) => item.id !== request.id));
    addEvent("Account approved (demo)", `${request.name} · ${request.role}`);
    addNotice(
      "Demo request approved locally. A real backend must enforce approval before login."
    );
  };

  const rejectRequest = (request) => {
    setRequests((current) => current.filter((item) => item.id !== request.id));
    addEvent("Account request rejected (demo)", request.email, "warning");
    addNotice("Demo request rejected locally; no server record was changed.");
  };

  const toggleUserStatus = (user) => {
    const nextStatus = user.status === "Active" ? "Suspended" : "Active";

    setUsers((current) =>
      current.map((item) =>
        item.id === user.id ? { ...item, status: nextStatus } : item
      )
    );

    addEvent(
      `User ${nextStatus.toLowerCase()} (demo)`,
      `${user.name} · ${user.email}`,
      nextStatus === "Suspended" ? "warning" : "success"
    );

    addNotice(
      `User marked ${nextStatus.toLowerCase()} in this demo only. Backend login and session checks are still required.`
    );
  };

  const deleteDocument = (doc) => {
    setConfirmAction({
      title: "Delete document?",
      description: `This removes "${doc.name}" from the local demo list. This cannot delete a real server file.`,
      onConfirm: () => {
        setDocuments((current) => current.filter((item) => item.id !== doc.id));
        addEvent("Document removed (demo)", `${doc.name} · ${doc.owner}`, "warning");
        setSelectedDocument(null);
        setConfirmAction(null);
        addNotice("Document removed from local demo state only.");
      },
    });
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "requests", label: "New Requests", icon: UserCheck, count: requests.length },
    { id: "viewers", label: "Viewer Details", icon: Users },
    { id: "owners", label: "Owner Details", icon: ShieldCheck },
    { id: "documents", label: "All Documents", icon: FileText },
    { id: "activity", label: "Activity & Security", icon: History },
  ];

  const pageTitle = {
    overview: "Admin Overview",
    requests: "Registration Requests",
    viewers: "Viewer Details",
    owners: "Owner Details",
    documents: "Document Monitoring",
    activity: "Activity & Security",
  }[section];

  const visibleUsers = filteredUsers.filter((user) => {
    if (section === "viewers") return user.role === "Viewer";
    if (section === "owners") return user.role === "Owner";
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
        <div className="ad-brand">
          <span className="ad-brand-icon"><ShieldCheck size={24} /></span>
          <div>
            <strong>TrustVault</strong>
            <small>ADMIN CONSOLE</small>
          </div>
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

          <div className="ad-profile">
            <span className="ad-avatar">AD</span>
            <div>
              <strong>TrustVault Admin</strong>
              <small>Administrator · Demo</small>
            </div>
            <button className="ad-icon-btn" onClick={() => onNavigate?.("home")} aria-label="Sign out">
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
            <span className="ad-role-pill">ADMIN</span>
            {onToggleTheme && (
              <button className="ad-icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
                {theme === "dark" ? "☀" : "☾"}
              </button>
            )}
            <button className="ad-icon-btn" onClick={() => { setSection("requests"); addNotice(`${requests.length} request(s) awaiting review.`); }} aria-label="Notifications">
              <Bell size={18} />
              {requests.length > 0 && <span className="ad-bell-dot" />}
            </button>
            <span className="ad-avatar">AD</span>
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
                      <button className="ad-small-btn" onClick={() => setSelectedUser(user)} title="Inspect user">
                        <Eye size={15} /> Details
                      </button>
                      <button className={`ad-small-btn ${user.status === "Active" ? "danger" : ""}`} onClick={() => toggleUserStatus(user)}>
                        {user.status === "Active" ? <UserX size={15} /> : <UserCheck size={15} />}
                        {user.status === "Active" ? "Suspend" : "Activate"}
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
          <Detail label="Email address" value={selectedUser.email} />
          <Detail label="Last login" value={selectedUser.lastLogin} />
          <Detail label="Account ID (demo)" value={String(selectedUser.id)} />
          <p className="ad-modal-note">This is sample account information. Login history and session revocation require backend integration.</p>
          <button className="ad-primary-btn full" onClick={() => setSelectedUser(null)}>Close details</button>
        </Modal>
      )}

      {selectedDocument && (
        <Modal title="Document Details" onClose={() => setSelectedDocument(null)}>
          <div className="ad-document-preview"><FileText size={28} /></div>
          <Detail label="Document name" value={selectedDocument.name} />
          <Detail label="Owner" value={selectedDocument.owner} />
          <Detail label="Category" value={selectedDocument.category} />
          <Detail label="File size" value={selectedDocument.size} />
          <Detail label="Last updated" value={selectedDocument.updated} />
          <p className="ad-modal-note">Admin document inspection is metadata-only in this demo. Protected file content is not loaded.</p>
          <div className="ad-modal-actions">
            <button className="ad-secondary-btn" onClick={() => setSelectedDocument(null)}>Close</button>
            <button className="ad-danger-btn" onClick={() => deleteDocument(selectedDocument)}><Trash2 size={15} /> Delete entry</button>
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

      <div className="ad-demo-warning">
        <ShieldAlert size={16} />
        Frontend prototype only — no real account, document, or security action is performed.
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
              <td><div className="ad-doc-name"><span><FileText size={19} /></span><div><strong>{doc.name}</strong><small>{doc.size}</small></div></div></td>
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
