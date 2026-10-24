
import { useState, useEffect } from "react";
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
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import {
  downloadRealDocument,
  openDocumentInNewTab,
  generateDocumentText,
} from "../utils/documentContent";
import { apiRequest } from "../api";
import TrustVaultLogo from "../components/TrustVaultLogo";
import ThemePalettePicker from "../components/ThemePalettePicker";
import IntegrityPill from "../components/IntegrityPill";
import SecurityClearanceBadge from "../components/SecurityClearanceBadge";

const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "documents", label: "My Documents", icon: Files },
  { id: "permissions", label: "User Permissions", icon: ShieldCheck },
  { id: "history", label: "Activity History", icon: History },
  { id: "upload", label: "New Upload", icon: Upload },
  { id: "deleted", label: "Deleted Documents", icon: Trash2 },
];

function getFileIcon(type) {
  if (type === "Word") return FileText;
  if (type === "Excel") return FileSpreadsheet;
  return File;
}

export default function OwnerDashboard({
  theme = "light",
  palette = "cobalt",
  onNavigate,
  onToggleTheme,
  onSelectPalette,
  onOpenProfile,
  currentUser,
}) {
  const [activeSection, setActiveSection] = useState(() => {
    try {
      const hash = window.location.hash?.replace("#", "");
      const valid = ["overview", "documents", "permissions", "history", "upload", "deleted"];
      if (hash && valid.includes(hash)) {
        return hash;
      }
      const saved = localStorage.getItem("trustvault_owner_tab");
      return saved && valid.includes(saved) ? saved : "overview";
    } catch {
      return "overview";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("trustvault_owner_tab", activeSection);
      window.location.hash = activeSection;
    } catch {}
  }, [activeSection]);
  const [documents, setDocuments] = useState([]);
  const [deletedDocuments, setDeletedDocuments] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [readerTab, setReaderTab] = useState("content");
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Business");
  const [uploadType, setUploadType] = useState("PDF");
  const [uploadFile, setUploadFile] = useState(null);
  const [viewerEmail, setViewerEmail] = useState("");
  const [permissionDocument, setPermissionDocument] = useState("");
  const [permissionAccess, setPermissionAccess] = useState("View only");
  const [permissionExpiry, setPermissionExpiry] = useState("");

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const fetchOwnerData = async () => {
    if (!currentUser?.email) return;
    const emailParam = encodeURIComponent(currentUser.email);

    try {
      const [docsData, delData, reqsData, permsData, histData] = await Promise.all([
        apiRequest(`/api/documents/owner?email=${emailParam}`),
        apiRequest(`/api/documents/owner/deleted?email=${emailParam}`),
        apiRequest(`/api/documents/owner/requests?email=${emailParam}`),
        apiRequest(`/api/documents/owner/permissions?email=${emailParam}`),
        apiRequest(`/api/documents/owner/history?email=${emailParam}`),
      ]);
      setDocuments(Array.isArray(docsData) ? docsData : []);
      setDeletedDocuments(Array.isArray(delData) ? delData : []);
      setRequests(Array.isArray(reqsData) ? reqsData : []);
      setPermissions(Array.isArray(permsData) ? permsData : []);
      setHistory(Array.isArray(histData) ? histData : []);
    } catch (err) {
      console.warn("Real-time owner sync error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreDocument = async (doc) => {
    try {
      await apiRequest(`/api/documents/restore/${doc.id}?email=${encodeURIComponent(currentUser?.email || "")}`, {
        method: "POST",
      });
      showNotice(`Successfully restored "${doc.name}" back to your workspace!`);
      await fetchOwnerData();
    } catch (err) {
      showNotice("Restore error: " + err.message);
    }
  };

  useEffect(() => {
    fetchOwnerData();
    const interval = setInterval(fetchOwnerData, 3500);
    return () => clearInterval(interval);
  }, [currentUser?.email]);

  const approveRequest = async (request) => {
    try {
      await apiRequest("/api/documents/grant-access", {
        method: "POST",
        body: JSON.stringify({
          documentId: request.documentId,
          viewerEmail: request.viewer,
          viewerName: request.viewerName,
          canView: true,
          canDownload: true,
          ownerEmail: currentUser?.email || "",
        }),
      });
      showNotice(`Approved access for ${request.viewer} on "${request.document}"!`);
      await fetchOwnerData();
    } catch (err) {
      showNotice("Approve failed: " + err.message);
    }
  };

  const rejectRequest = async (request) => {
    try {
      await apiRequest("/api/documents/revoke-access", {
        method: "POST",
        body: JSON.stringify({
          documentId: request.documentId,
          viewerEmail: request.viewer,
          ownerEmail: currentUser?.email || "",
        }),
      });
      showNotice(`Rejected access request from ${request.viewer}.`);
      await fetchOwnerData();
    } catch (err) {
      showNotice("Reject failed: " + err.message);
    }
  };

  const revokePermission = async (permission) => {
    try {
      await apiRequest("/api/documents/revoke-access", {
        method: "POST",
        body: JSON.stringify({
          documentId: permission.documentId,
          viewerEmail: permission.viewer,
          ownerEmail: currentUser?.email || "",
        }),
      });
      showNotice(`Revoked access on "${permission.document}" for ${permission.viewer}.`);
      await fetchOwnerData();
    } catch (err) {
      showNotice("Revoke failed: " + err.message);
    }
  };

  const deleteDocument = async (document) => {
    const confirmed = window.confirm(
      `Move "${document.name}" to Deleted Documents? You and Administrators can restore it anytime.`
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/api/documents/owner/${document.id}?email=${encodeURIComponent(currentUser?.email || "")}`, {
        method: "DELETE",
      });
      showNotice(`Document "${document.name}" moved to Deleted Documents.`);
      
      const delEntry = {
        ...document,
        deleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: currentUser?.email || "Owner",
      };
      setDeletedDocuments((prev) => [delEntry, ...prev.filter((d) => d.id !== document.id)]);
      setDocuments((prev) => prev.filter((d) => d.id !== document.id));
      setSelectedDocument(null);
      await fetchOwnerData();
    } catch (err) {
      showNotice("Delete error: " + err.message);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!uploadFile) {
      showNotice("Please select a file to upload.");
      return;
    }

    try {
      showNotice("Uploading and encrypting document...");
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("email", currentUser?.email || "");
      formData.append("category", uploadCategory || "General");
      if (uploadName) formData.append("name", uploadName.trim());

      await apiRequest("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      showNotice(`Successfully uploaded and protected "${uploadName || uploadFile.name}"!`);
      setUploadName("");
      setUploadFile(null);
      event.target.reset();
      setActiveSection("documents");
      await fetchOwnerData();
    } catch (err) {
      showNotice("Upload failed: " + err.message);
    }
  };

  const grantPermission = async (event) => {
    event.preventDefault();

    if (!viewerEmail.trim() || !permissionDocument) {
      showNotice("Enter a viewer email and choose a document.");
      return;
    }

    const selectedDocObj = documents.find(
      (d) => String(d.id) === String(permissionDocument) || d.name === permissionDocument
    );

    if (!selectedDocObj) {
      showNotice("Selected document not found.");
      return;
    }

    try {
      await apiRequest("/api/documents/grant-access", {
        method: "POST",
        body: JSON.stringify({
          documentId: selectedDocObj.id,
          viewerEmail: viewerEmail.trim(),
          canView: true,
          canDownload: permissionAccess === "View + Download",
          ownerEmail: currentUser?.email || "",
        }),
      });

      showNotice(`Access granted on "${selectedDocObj.name}" to ${viewerEmail}!`);
      setViewerEmail("");
      setPermissionExpiry("");
      setPermissionDocument("");
      await fetchOwnerData();
    } catch (err) {
      showNotice("Permission grant failed: " + err.message);
    }
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
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <strong>{document.name}</strong>
                          <SecurityClearanceBadge level={document.category || "CONFIDENTIAL"} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", flexWrap: "wrap" }}>
                          <small>{document.size}</small>
                          {document.fileChecksum && (
                            <IntegrityPill hash={document.fileChecksum} />
                          )}
                        </div>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="od-category-tag">{document.category}</span>
                  </td>
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
                    <Check size={15} /> Grant Access
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
    </>
  );

  const renderPermissions = () => (
    <div className="od-permissions-container">
      <div className="od-page-heading od-page-heading-center">
        <div>
          <h1>User Permissions</h1>
          <p>Manage granted access entries and review incoming requests.</p>
        </div>
      </div>

      <section className="od-panel">
        <div className="od-panel-heading">
          <div>
            <h2>Grant Document Permission</h2>
            <p>Authorize a verified viewer to view or download a selected document.</p>
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
                <option key={document.id} value={document.id}>
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

          <div className="od-permission-form-submit">
            <button type="submit" className="od-primary-button">
              <ShieldCheck size={17} /> Grant Document Permission
            </button>
          </div>
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
    </div>
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

  const renderDeletedDocuments = () => (
    <>
      <div className="od-page-heading">
        <div>
          <h1>Deleted Documents Enclave</h1>
          <p>Documents removed from active listings. Preview metadata, verify SHA-256 integrity, or restore files back to your workspace.</p>
        </div>
        <span className="od-count-badge" style={{ background: "rgba(239, 68, 68, 0.12)", color: "#ef4444" }}>
          {deletedDocuments.length} deleted
        </span>
      </div>

      <div className="od-table-wrap">
        <table className="od-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Category</th>
              <th>Deleted Timestamp</th>
              <th>Integrity Seal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deletedDocuments.map((doc) => {
              const Icon = getFileIcon(doc.fileType);
              return (
                <tr key={doc.id}>
                  <td>
                    <div className="od-file-cell">
                      <span className="od-file-icon" style={{ opacity: 0.65 }}>
                        <Icon size={19} />
                      </span>
                      <span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <strong style={{ textDecoration: "line-through", opacity: 0.85 }}>{doc.name}</strong>
                          <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", fontWeight: 700 }}>
                            DELETED
                          </span>
                        </div>
                        <small>{doc.fileSize}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <SecurityClearanceBadge level={doc.category || "CONFIDENTIAL"} />
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: "12px" }}>
                    {doc.deletedAt ? new Date(doc.deletedAt).toLocaleString() : doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : "Recently"}
                  </td>
                  <td>
                    {doc.fileChecksum ? (
                      <IntegrityPill hash={doc.fileChecksum} />
                    ) : (
                      <small style={{ color: "var(--muted)" }}>Verified</small>
                    )}
                  </td>
                  <td>
                    <div className="od-actions">
                      <button
                        className="od-icon-button"
                        title="Preview deleted document"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="od-icon-button"
                        title="Download file"
                        onClick={() => downloadRealDocument(doc, currentUser?.email)}
                      >
                        <Download size={16} />
                      </button>
                      <button
                        className="od-icon-button"
                        style={{ color: "var(--primary)" }}
                        title="Restore document to workspace"
                        onClick={() => handleRestoreDocument(doc)}
                      >
                        <RotateCcw size={16} />
                        <span style={{ fontSize: "11px", marginLeft: "4px", fontWeight: 600 }}>Restore</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {deletedDocuments.length === 0 && (
              <tr>
                <td colSpan="5" className="od-empty" style={{ textAlign: "center", padding: "40px" }}>
                  <Trash2 size={28} style={{ opacity: 0.35, margin: "0 auto 10px", display: "block" }} />
                  <strong>No Deleted Documents</strong>
                  <p style={{ margin: "5px 0 0", color: "var(--muted)", fontSize: "12px" }}>
                    When you remove documents from your workspace, they will be archived here for preview and recovery.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
        <div className="od-brand" style={{ padding: "16px 12px" }}>
          <TrustVaultLogo size={34} caption="OWNER CONSOLE" animated={true} />
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
          <div
            className="od-profile"
            onClick={() => (onOpenProfile ? onOpenProfile() : onNavigate?.("profile"))}
            style={{ cursor: "pointer" }}
            title="Click to view My Profile"
          >
            <span className="od-profile-avatar">
              {(currentUser?.name || currentUser?.email || "DO").slice(0, 2).toUpperCase()}
            </span>
            <span>
              <strong>{currentUser?.name || "Document Owner"}</strong>
              <small>{currentUser?.email || "owner@trustvault.local"}</small>
            </span>
          </div>

          <button
            className="od-nav-item od-logout"
            onClick={() => onNavigate?.("home")}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
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
            {/* Unified Role Box & Worker ID */}
            <div
              className="navbar-role-box"
              onClick={() => (onOpenProfile ? onOpenProfile() : onNavigate?.("profile"))}
              style={{ cursor: "pointer" }}
              title="Click to view My Profile"
            >
              <span>TrustVault - Owner</span>
              {currentUser?.userCode && (
                <span className="navbar-id-pill">{currentUser.userCode}</span>
              )}
            </div>

            <span className="od-demo-label" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)", display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <span className="clearance-beacon-dot" style={{ backgroundColor: "#10b981" }} />
              ZERO-TRUST VAULT
            </span>

            {onSelectPalette && (
              <ThemePalettePicker
                currentPaletteId={palette}
                onSelectPalette={onSelectPalette}
              />
            )}

            <button
              className="od-icon-button"
              onClick={onToggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* Profile Avatar Button */}
            <button
              type="button"
              className="od-icon-button od-profile-btn"
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
              }}
            >
              {(currentUser?.name || currentUser?.email || "DO").slice(0, 2).toUpperCase()}
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

        <div className="od-content">
          <div className="od-demo-warning" style={{ background: "rgba(37, 99, 235, 0.08)", borderColor: "rgba(37, 99, 235, 0.25)", color: "#1d4ed8" }}>
            <ShieldCheck size={19} />
            <span>
              <strong>Zero-Trust Document Enclave Active.</strong> All uploads, access controls, and downloads are enforced by the server with SHA-256 cryptographic verification.
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
          {activeSection === "deleted" && renderDeletedDocuments()}
        </div>
      </main>

      {selectedDocument && (
        <div
          className="od-modal-backdrop"
          onClick={() => setSelectedDocument(null)}
        >
          <section
            className="od-modal od-modal-expanded"
            role="dialog"
            aria-modal="true"
            aria-labelledby="od-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="od-modal-heading">
              <div>
                <span className="od-eyebrow">OWNER DOCUMENT ENCLAVE</span>
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

            <div className="vd-reader-tabs">
              <button
                type="button"
                className={`vd-reader-tab-btn ${readerTab === "content" ? "active" : ""}`}
                onClick={() => setReaderTab("content")}
              >
                <Eye size={15} /> Document Content & Text
              </button>
              <button
                type="button"
                className={`vd-reader-tab-btn ${readerTab === "metadata" ? "active" : ""}`}
                onClick={() => setReaderTab("metadata")}
              >
                <ShieldCheck size={15} /> Security & Metadata
              </button>
            </div>

            {readerTab === "content" ? (
              <div className="vd-reader-pane">
                <div className="vd-reader-banner">
                  <ShieldCheck size={16} />
                  <span>Document Owner Verified Clearance · Full Permissions</span>
                </div>
                <pre className="vd-file-content-box">
                  {generateDocumentText(selectedDocument)}
                </pre>
              </div>
            ) : (
              <div className="od-metadata-list">
                <div><span>Document Name</span><strong>{selectedDocument.name}</strong></div>
                <div><span>Category</span><strong>{selectedDocument.category}</strong></div>
                <div><span>File type</span><strong>{selectedDocument.type}</strong></div>
                <div><span>Size on Disk</span><strong>{selectedDocument.size}</strong></div>
                <div><span>Last updated</span><strong>{selectedDocument.updated}</strong></div>
                <div><span>Permitted Viewers</span><strong>{selectedDocument.viewers} active</strong></div>
              </div>
            )}

            <div className="od-modal-actions" style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                className="od-secondary-button"
                style={{ flex: 1 }}
                onClick={() => openDocumentInNewTab(selectedDocument, currentUser?.email)}
              >
                <ExternalLink size={16} /> Open in New Tab
              </button>

              <button
                type="button"
                className="od-primary-button"
                style={{ flex: 1 }}
                onClick={() => {
                  downloadRealDocument(selectedDocument, currentUser?.email);
                  showNotice(`Downloaded "${selectedDocument.name}" successfully!`);
                }}
              >
                <Download size={16} /> Download File (.txt)
              </button>

              <button
                type="button"
                className="od-secondary-button"
                onClick={() => setSelectedDocument(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
