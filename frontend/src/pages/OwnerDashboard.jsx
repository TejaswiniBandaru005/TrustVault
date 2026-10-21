
import { useState } from "react";
import {
  LayoutDashboard,
  Files,
  ShieldCheck,
  History,
  Upload,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  FileText,
  File,
  FileSpreadsheet,
  Eye,
  Download,
  Pencil,
  Trash2,
  Check,
  X,
  Clock,
  Users,
  Plus,
  Menu,
  X as CloseIcon,
  LockKeyhole,
} from "lucide-react";

const initialDocuments = [
  {
    id: 1,
    name: "Business Proposal.pdf",
    category: "Business",
    type: "PDF",
    updated: "Oct 20, 2026",
    size: "2.4 MB",
    viewers: 3,
  },
  {
    id: 2,
    name: "Financial Report.docx",
    category: "Finance",
    type: "Word",
    updated: "Oct 18, 2026",
    size: "1.8 MB",
    viewers: 2,
  },
  {
    id: 3,
    name: "Project Requirements.pdf",
    category: "Technical",
    type: "PDF",
    updated: "Oct 15, 2026",
    size: "950 KB",
    viewers: 1,
  },
];

const initialPermissions = [
  {
    id: 1,
    document: "Business Proposal.pdf",
    viewer: "viewer@example.com",
    access: "View only",
    expires: "Oct 30, 2026",
    status: "Active",
  },
  {
    id: 2,
    document: "Financial Report.docx",
    viewer: "analyst@example.com",
    access: "View + Download",
    expires: "Nov 05, 2026",
    status: "Active",
  },
];

const initialRequests = [
  {
    id: 1,
    document: "Project Requirements.pdf",
    viewer: "student@example.com",
    requested: "Oct 21, 2026",
  },
  {
    id: 2,
    document: "Business Proposal.pdf",
    viewer: "team@example.com",
    requested: "Oct 20, 2026",
  },
];

const initialHistory = [
  {
    id: 1,
    action: "Document uploaded",
    document: "Business Proposal.pdf",
    user: "You",
    time: "Today, 10:30 AM",
  },
  {
    id: 2,
    action: "Viewer access granted",
    document: "Financial Report.docx",
    user: "You",
    time: "Yesterday, 4:15 PM",
  },
  {
    id: 3,
    action: "Document viewed",
    document: "Project Requirements.pdf",
    user: "student@example.com",
    time: "Yesterday, 2:10 PM",
  },
];

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "documents", label: "My Documents", icon: Files },
  { id: "permissions", label: "User Permissions", icon: ShieldCheck },
  { id: "history", label: "Activity History", icon: History },
  { id: "upload", label: "New Upload", icon: Upload },
];

function getFileIcon(type) {
  if (type === "Word") return FileText;
  if (type === "Excel") return FileSpreadsheet;
  return File;
}

export default function OwnerDashboard({
  theme = "light",
  onNavigate,
  onToggleTheme,
}) {
  const [activeSection, setActiveSection] = useState("overview");
  const [documents, setDocuments] = useState(initialDocuments);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [requests, setRequests] = useState(initialRequests);
  const [history, setHistory] = useState(initialHistory);
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Business");
  const [uploadType, setUploadType] = useState("PDF");
  const [uploadFile, setUploadFile] = useState(null);
  const [viewerEmail, setViewerEmail] = useState("");
  const [permissionDocument, setPermissionDocument] = useState("");
  const [permissionAccess, setPermissionAccess] = useState("View only");
  const [permissionExpiry, setPermissionExpiry] = useState("");

  const addHistory = (action, documentName, user = "You") => {
    setHistory((previous) => [
      {
        id: Date.now(),
        action,
        document: documentName,
        user,
        time: new Date().toLocaleString(),
      },
      ...previous,
    ]);
  };

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const approveRequest = (request) => {
    const newPermission = {
      id: Date.now(),
      document: request.document,
      viewer: request.viewer,
      access: "View only",
      expires: "Not set",
      status: "Active",
    };

    setPermissions((previous) => [...previous, newPermission]);
    setRequests((previous) =>
      previous.filter((item) => item.id !== request.id)
    );
    addHistory("Demo access granted", request.document, request.viewer);
    showNotice("Demo request approved. This is not real access control.");
  };

  const rejectRequest = (request) => {
    setRequests((previous) =>
      previous.filter((item) => item.id !== request.id)
    );
    addHistory("Demo access request rejected", request.document, request.viewer);
    showNotice("Demo request rejected.");
  };

  const revokePermission = (permission) => {
    setPermissions((previous) =>
      previous.filter((item) => item.id !== permission.id)
    );
    addHistory("Demo permission revoked", permission.document, permission.viewer);
    showNotice(
      "Removed from this demo list only. Real access must be revoked by the backend."
    );
  };

  const deleteDocument = (document) => {
    const confirmed = window.confirm(
      `Remove "${document.name}" from this demo dashboard?`
    );

    if (!confirmed) return;

    setDocuments((previous) =>
      previous.filter((item) => item.id !== document.id)
    );
    setPermissions((previous) =>
      previous.filter((item) => item.document !== document.name)
    );
    addHistory("Demo document removed", document.name);
    setSelectedDocument(null);
    showNotice(
      "Removed from the demo list only. No real file was deleted."
    );
  };

  const handleUpload = (event) => {
    event.preventDefault();

    if (!uploadName.trim()) {
      showNotice("Please enter a document name.");
      return;
    }

    if (!uploadFile) {
      showNotice("Please select a file to continue.");
      return;
    }

    const newDocument = {
      id: Date.now(),
      name: uploadName.trim(),
      category: uploadCategory,
      type: uploadType,
      updated: new Date().toLocaleDateString(),
      size: `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB`,
      viewers: 0,
    };

    setDocuments((previous) => [newDocument, ...previous]);
    addHistory("Demo upload recorded", newDocument.name);
    setUploadName("");
    setUploadFile(null);
    event.target.reset();
    setActiveSection("documents");

    showNotice(
      "Demo entry added. The selected file has NOT been uploaded to a server."
    );
  };

  const grantPermission = (event) => {
    event.preventDefault();

    if (!viewerEmail.trim() || !permissionDocument) {
      showNotice("Enter a viewer email and choose a document.");
      return;
    }

    const newPermission = {
      id: Date.now(),
      document: permissionDocument,
      viewer: viewerEmail.trim(),
      access: permissionAccess,
      expires: permissionExpiry || "Not set",
      status: "Active",
    };

    setPermissions((previous) => [...previous, newPermission]);
    addHistory("Demo permission created", permissionDocument, viewerEmail);
    setViewerEmail("");
    setPermissionExpiry("");
    setPermissionDocument("");
    showNotice(
      "Demo permission added. The backend is not connected yet."
    );
  };

  const filteredDocuments = documents.filter((document) =>
    `${document.name} ${document.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const renderDocuments = (compact = false) => (
    <div className="od-table-wrap">
      <table className="od-table">
        <thead>
          <tr>
            <th>Document</th>
            <th>Category</th>
            <th>Last updated</th>
            <th>Viewers</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(compact ? documents.slice(0, 3) : filteredDocuments).map(
            (document) => {
              const Icon = getFileIcon(document.type);

              return (
                <tr key={document.id}>
                  <td>
                    <div className="od-file-cell">
                      <span className="od-file-icon">
                        <Icon size={19} />
                      </span>
                      <span>
                        <strong>{document.name}</strong>
                        <small>{document.size}</small>
                      </span>
                    </div>
                  </td>
                  <td>{document.category}</td>
                  <td>{document.updated}</td>
                  <td>{document.viewers}</td>
                  <td>
                    <div className="od-actions">
                      <button
                        className="od-icon-button"
                        title="View metadata"
                        onClick={() => setSelectedDocument(document)}
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        className="od-icon-button"
                        title="Demo replace document"
                        onClick={() => {
                          setSelectedDocument(document);
                          showNotice(
                            "Document replacement will be connected to secure storage later."
                          );
                        }}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        className="od-icon-button od-danger"
                        title="Remove demo entry"
                        onClick={() => deleteDocument(document)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }
          )}

          {filteredDocuments.length === 0 && !compact && (
            <tr>
              <td colSpan="5" className="od-empty">
                No matching documents found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderOverview = () => (
    <>
      <div className="od-welcome">
        <div>
          <span className="od-eyebrow">OWNER WORKSPACE</span>
          <h1>Welcome back, Document Owner</h1>
          <p>Manage your documents, sharing permissions, and activity.</p>
        </div>
        <button
          className="od-primary-button"
          onClick={() => setActiveSection("upload")}
        >
          <Plus size={18} /> New Upload
        </button>
      </div>

      <div className="od-stat-grid">
        <div className="od-stat-card">
          <span className="od-stat-icon"><Files size={21} /></span>
          <span className="od-stat-label">My Documents</span>
          <strong>{documents.length}</strong>
          <small>Demo document entries</small>
        </div>
        <div className="od-stat-card">
          <span className="od-stat-icon"><Users size={21} /></span>
          <span className="od-stat-label">Active Permissions</span>
          <strong>{permissions.length}</strong>
          <small>Entries in this demo</small>
        </div>
        <div className="od-stat-card">
          <span className="od-stat-icon"><Clock size={21} /></span>
          <span className="od-stat-label">Pending Requests</span>
          <strong>{requests.length}</strong>
          <small>Requests awaiting review</small>
        </div>
        <div className="od-stat-card">
          <span className="od-stat-icon"><History size={21} /></span>
          <span className="od-stat-label">Activity Events</span>
          <strong>{history.length}</strong>
          <small>Demo activity entries</small>
        </div>
      </div>

      <section className="od-panel">
        <div className="od-panel-heading">
          <div>
            <h2>Recent Documents</h2>
            <p>Your recently listed documents</p>
          </div>
          <button
            className="od-text-button"
            onClick={() => setActiveSection("documents")}
          >
            View all
          </button>
        </div>
        {renderDocuments(true)}
      </section>

      <section className="od-panel">
        <div className="od-panel-heading">
          <div>
            <h2>Access Requests</h2>
            <p>Review requests from potential viewers</p>
          </div>
          <button
            className="od-text-button"
            onClick={() => setActiveSection("permissions")}
          >
            Manage requests
          </button>
        </div>

        {requests.length === 0 ? (
          <p className="od-empty">No pending requests in this demo.</p>
        ) : (
          <div className="od-request-list">
            {requests.slice(0, 3).map((request) => (
              <div className="od-request-row" key={request.id}>
                <span className="od-avatar">
                  {request.viewer.charAt(0).toUpperCase()}
                </span>
                <div className="od-request-info">
                  <strong>{request.viewer}</strong>
                  <small>Requested access to {request.document}</small>
                </div>
                <div className="od-request-actions">
                  <button
                    className="od-approve-button"
                    onClick={() => approveRequest(request)}
                  >
                    <Check size={15} /> Approve demo
                  </button>
                  <button
                    className="od-reject-button"
                    onClick={() => rejectRequest(request)}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );

  const renderPermissions = () => (
    <>
      <div className="od-page-heading">
        <div>
          <h1>User Permissions</h1>
          <p>Manage demo access entries and review incoming requests.</p>
        </div>
      </div>

      <section className="od-panel">
        <div className="od-panel-heading">
          <div>
            <h2>Grant Demo Permission</h2>
            <p>This form updates local demo state only.</p>
          </div>
          <LockKeyhole size={22} />
        </div>

        <form className="od-permission-form" onSubmit={grantPermission}>
          <label>
            Viewer email
            <input
              type="email"
              placeholder="viewer@example.com"
              value={viewerEmail}
              onChange={(event) => setViewerEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Document
            <select
              value={permissionDocument}
              onChange={(event) => setPermissionDocument(event.target.value)}
              required
            >
              <option value="">Choose a document</option>
              {documents.map((document) => (
                <option key={document.id} value={document.name}>
                  {document.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Permission level
            <select
              value={permissionAccess}
              onChange={(event) => setPermissionAccess(event.target.value)}
            >
              <option>View only</option>
              <option>View + Download</option>
            </select>
          </label>

          <label>
            Access expiry
            <input
              type="datetime-local"
              value={permissionExpiry}
              onChange={(event) => setPermissionExpiry(event.target.value)}
            />
          </label>

          <button type="submit" className="od-primary-button">
            <ShieldCheck size={17} /> Add demo permission
          </button>
        </form>
      </section>

      <section className="od-panel">
        <div className="od-panel-heading">
          <div>
            <h2>Pending Requests</h2>
            <p>Review each request before deciding.</p>
          </div>
          <span className="od-count-badge">{requests.length}</span>
        </div>

        {requests.length === 0 ? (
          <p className="od-empty">No pending requests.</p>
        ) : (
          <div className="od-request-list">
            {requests.map((request) => (
              <div className="od-request-row" key={request.id}>
                <span className="od-avatar">
                  {request.viewer.charAt(0).toUpperCase()}
                </span>
                <div className="od-request-info">
                  <strong>{request.viewer}</strong>
                  <small>{request.document} · {request.requested}</small>
                </div>
                <div className="od-request-actions">
                  <button
                    className="od-approve-button"
                    onClick={() => approveRequest(request)}
                  >
                    <Check size={15} /> Approve demo
                  </button>
                  <button
                    className="od-reject-button"
                    onClick={() => rejectRequest(request)}
                  >
                    <X size={15} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="od-panel">
        <div className="od-panel-heading">
          <div>
            <h2>Current Permission Entries</h2>
            <p>Entries currently displayed in this demo.</p>
          </div>
        </div>

        <div className="od-table-wrap">
          <table className="od-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Viewer</th>
                <th>Access</th>
                <th>Expires</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission) => (
                <tr key={permission.id}>
                  <td><strong>{permission.document}</strong></td>
                  <td>{permission.viewer}</td>
                  <td>{permission.access}</td>
                  <td>{permission.expires}</td>
                  <td>
                    <button
                      className="od-reject-button"
                      onClick={() => revokePermission(permission)}
                    >
                      Revoke demo
                    </button>
                  </td>
                </tr>
              ))}
              {permissions.length === 0 && (
                <tr>
                  <td colSpan="5" className="od-empty">
                    No permission entries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  const renderUpload = () => (
    <>
      <div className="od-page-heading">
        <div>
          <h1>New Upload</h1>
          <p>Add a document entry to preview the upload workflow.</p>
        </div>
      </div>

      <section className="od-panel od-upload-panel">
        <div className="od-upload-heading">
          <span className="od-upload-icon"><Upload size={25} /></span>
          <h2>Document details</h2>
          <p>
            This form does not transmit files. Actual secure storage will be
            implemented with the backend.
          </p>
        </div>

        <form className="od-upload-form" onSubmit={handleUpload}>
          <label>
            Document name
            <input
              type="text"
              placeholder="e.g. Business Proposal"
              value={uploadName}
              onChange={(event) => setUploadName(event.target.value)}
              required
            />
          </label>

          <div className="od-form-grid">
            <label>
              Document category
              <select
                value={uploadCategory}
                onChange={(event) => setUploadCategory(event.target.value)}
              >
                <option>Business</option>
                <option>Finance</option>
                <option>Legal</option>
                <option>Technical</option>
                <option>Personal</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              File type
              <select
                value={uploadType}
                onChange={(event) => setUploadType(event.target.value)}
              >
                <option>PDF</option>
                <option>Word</option>
                <option>Excel</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          <label className="od-file-picker">
            Select a file
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={(event) =>
                setUploadFile(event.target.files?.[0] || null)
              }
              required
            />
            <small>
              {uploadFile
                ? `${uploadFile.name} (${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)`
                : "PDF, Word, Excel, or text files"}
            </small>
          </label>

          <div className="od-security-note">
            <LockKeyhole size={18} />
            <span>
              <strong>Security reminder</strong>
              <small>
                File type and size must also be validated on the server. Never
                rely on browser validation alone.
              </small>
            </span>
          </div>

          <button type="submit" className="od-primary-button">
            <Upload size={17} /> Add demo document
          </button>
        </form>
      </section>
    </>
  );

  const renderHistory = () => (
    <>
      <div className="od-page-heading">
        <div>
          <h1>Activity History</h1>
          <p>Review the sample events recorded in this dashboard.</p>
        </div>
      </div>

      <section className="od-panel">
        <div className="od-panel-heading">
          <div>
            <h2>Recent Activity</h2>
            <p>Newest entries appear first.</p>
          </div>
          <History size={21} />
        </div>

        <div className="od-timeline">
          {history.map((item) => (
            <div className="od-timeline-item" key={item.id}>
              <span className="od-timeline-dot"><History size={15} /></span>
              <div className="od-timeline-content">
                <strong>{item.action}</strong>
                <p>{item.document}</p>
                <small>{item.user} · {item.time}</small>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <p className="od-empty">No activity entries.</p>
          )}
        </div>

        <p className="od-security-footnote">
          This is a temporary client-side activity list, not a tamper-resistant
          audit log. Production audit events must be recorded and protected by
          the server.
        </p>
      </section>
    </>
  );

  return (
    <div className={`od-app ${theme === "dark" ? "od-dark" : ""}`}>
      {mobileMenuOpen && (
        <button
          className="od-mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`od-sidebar ${mobileMenuOpen ? "od-sidebar-open" : ""}`}>
        <div className="od-brand">
          <span className="od-brand-mark"><LockKeyhole size={23} /></span>
          <span>
            <strong>TrustVault</strong>
            <small>Secure document space</small>
          </span>
          <button
            className="od-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="od-role-label">OWNER WORKSPACE</div>

        <nav className="od-navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`od-nav-item ${
                  activeSection === item.id ? "od-nav-active" : ""
                }`}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileMenuOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.id === "permissions" && requests.length > 0 && (
                  <span className="od-nav-count">{requests.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="od-sidebar-bottom">
          <div className="od-profile">
            <span className="od-profile-avatar">DO</span>
            <span>
              <strong>Document Owner</strong>
              <small>owner@example.com</small>
            </span>
          </div>

          <button
            className="od-nav-item od-logout"
            onClick={() => onNavigate?.("home")}
          >
            <LogOut size={18} />
            <span>Back to Home</span>
          </button>
        </div>
      </aside>

      <main className="od-main">
        <header className="od-topbar">
          <button
            className="od-icon-button od-menu-button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="od-breadcrumb">
            <span>TrustVault</span>
            <span>/</span>
            <strong>
              {navigation.find((item) => item.id === activeSection)?.label}
            </strong>
          </div>

          <div className="od-topbar-actions">
            <span className="od-demo-label">DEMO MODE</span>
            <button
              className="od-icon-button"
              onClick={() =>
                showNotice("Notifications are sample-only in this prototype.")
              }
              title="Notifications"
            >
              <Bell size={19} />
            </button>
            <button
              className="od-icon-button"
              onClick={onToggleTheme}
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </header>

        <div className="od-content">
          <div className="od-demo-warning">
            <LockKeyhole size={19} />
            <span>
              <strong>Frontend prototype only.</strong> Documents, permissions,
              and audit entries are sample/local state. No real authentication,
              file storage, or authorization is active yet.
            </span>
          </div>

          {notice && (
            <div className="od-notice" role="status">
              {notice}
              <button onClick={() => setNotice("")} aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          )}

          {activeSection === "overview" && renderOverview()}

          {activeSection === "documents" && (
            <>
              <div className="od-page-heading">
                <div>
                  <h1>My Documents</h1>
                  <p>Browse and manage your document entries.</p>
                </div>
                <button
                  className="od-primary-button"
                  onClick={() => setActiveSection("upload")}
                >
                  <Plus size={17} /> New Upload
                </button>
              </div>

              <section className="od-panel">
                <div className="od-search">
                  <Search size={19} />
                  <input
                    type="search"
                    placeholder="Search documents or categories..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                {renderDocuments()}
              </section>
            </>
          )}

          {activeSection === "permissions" && renderPermissions()}
          {activeSection === "upload" && renderUpload()}
          {activeSection === "history" && renderHistory()}
        </div>
      </main>

      {selectedDocument && (
        <div
          className="od-modal-backdrop"
          onClick={() => setSelectedDocument(null)}
        >
          <section
            className="od-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="od-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="od-modal-heading">
              <div>
                <span className="od-eyebrow">DOCUMENT DETAILS</span>
                <h2 id="od-modal-title">{selectedDocument.name}</h2>
              </div>
              <button
                className="od-icon-button"
                onClick={() => setSelectedDocument(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="od-metadata-list">
              <div><span>Category</span><strong>{selectedDocument.category}</strong></div>
              <div><span>File type</span><strong>{selectedDocument.type}</strong></div>
              <div><span>Size</span><strong>{selectedDocument.size}</strong></div>
              <div><span>Last updated</span><strong>{selectedDocument.updated}</strong></div>
              <div><span>Viewer count</span><strong>{selectedDocument.viewers}</strong></div>
            </div>

            <div className="od-modal-note">
              <Eye size={17} />
              This preview displays metadata only. Real document viewing and
              replacement will require secure backend endpoints.
            </div>

            <button
              className="od-primary-button od-full-button"
              onClick={() => setSelectedDocument(null)}
            >
              Close details
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
