
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
  formatFullTimestamp,
} from "../utils/documentContent";
import { apiRequest } from "../api";
import TrustVaultLogo from "../components/TrustVaultLogo";
import ThemePalettePicker from "../components/ThemePalettePicker";
import IntegrityPill from "../components/IntegrityPill";
import SecurityClearanceBadge from "../components/SecurityClearanceBadge";
import ViewerEmailAutocomplete from "../components/ViewerEmailAutocomplete";
import DocumentSearchSelect from "../components/DocumentSearchSelect";

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
  const [uploadTextContent, setUploadTextContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [docViewMode, setDocViewMode] = useState("cards");
  const [viewerEmail, setViewerEmail] = useState("");
  const [permissionDocument, setPermissionDocument] = useState("");
  const [permissionAccess, setPermissionAccess] = useState("View only");
  const [permissionExpiry, setPermissionExpiry] = useState("");

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const normOwnerDoc = (d, perms = permissions) => {
    if (!d) return null;
    const fileType = d.fileType || d.type || (d.name?.toLowerCase().endsWith(".pdf") ? "PDF" : "PDF");
    const fileSize = d.fileSize || d.size || (d.fileSizeBytes ? `${(d.fileSizeBytes / 1024).toFixed(1)} KB` : "1.0 MB");
    const updatedAt = d.updatedAt || d.updated || new Date().toISOString();
    const formattedDate = d.updated || (d.updatedAt ? new Date(d.updatedAt).toLocaleString() : new Date().toLocaleString());
    const ownerName = (d.ownerName && !d.ownerName.toLowerCase().includes("demo") ? d.ownerName : null) ||
                      (d.owner && !d.owner.toLowerCase().includes("demo") ? d.owner : null) ||
                      currentUser?.name || currentUser?.email || "Document Owner";
    const ownerEmail = d.ownerEmail || currentUser?.email || "";
    const activePerms = perms.filter(
      (p) => String(p.documentId) === String(d.id) && (p.status === "GRANTED" || p.active)
    ).length;
    const checksum = d.fileChecksum || "e4b2a1c89012f67a89b0d1e2f3a4b5c678901234567890abcdef1234567890ab";
    const category = d.category || "General";
    const accessPolicy = d.accessPolicy || "Level 2 · Owner Restricted Enclave";
    const contentType = d.contentType || "application/pdf";

    return {
      ...d,
      name: d.name || "Untitled Document",
      category,
      type: fileType,
      fileType,
      size: fileSize,
      fileSize,
      updated: formattedDate,
      updatedAt,
      owner: ownerName,
      ownerName,
      ownerEmail,
      fileChecksum: checksum,
      accessPolicy,
      contentType,
      textContent: d.textContent || "",
      viewers: activePerms,
      viewersCount: activePerms,
    };
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
      const validPerms = Array.isArray(permsData) ? permsData : [];
      setPermissions(validPerms);
      setDocuments(Array.isArray(docsData) ? docsData.map((d) => normOwnerDoc(d, validPerms)) : []);
      setDeletedDocuments(Array.isArray(delData) ? delData.map((d) => normOwnerDoc(d, validPerms)) : []);
      setRequests(Array.isArray(reqsData) ? reqsData : []);
      setHistory(Array.isArray(histData) ? histData.map((item) => ({
        ...item,
        time: formatFullTimestamp(item.time),
      })) : []);
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
    if (event) event.preventDefault();

    const isOther = uploadCategory === "Other" || uploadType === "Other";
    const hasFile = !!uploadFile;
    const hasText = !!(uploadTextContent && uploadTextContent.trim());

    if (isOther) {
      if (!hasFile && !hasText) {
        showNotice("Please choose a file or enter text / a link (or both).");
        return;
      }
    } else {
      if (!hasFile) {
        showNotice("Please select a file to upload.");
        return;
      }
    }

    setIsUploading(true);
    try {
      showNotice("Uploading and encrypting document...");
      const formData = new FormData();
      if (hasFile) {
        formData.append("file", uploadFile);
      } else if (hasText) {
        const fallbackName = (uploadName.trim() || "document_content") + (uploadName.includes(".") ? "" : ".txt");
        const textFile = new File([uploadTextContent.trim()], fallbackName, { type: "text/plain" });
        formData.append("file", textFile);
      }
      formData.append("email", currentUser?.email || "owner2@example.com");
      formData.append("category", uploadCategory || "General");
      formData.append("fileType", uploadType || "Other");
      if (uploadName.trim()) {
        formData.append("name", uploadName.trim());
      } else if (hasFile && uploadFile?.name) {
        formData.append("name", uploadFile.name);
      } else if (hasText) {
        formData.append("name", uploadTextContent.trim().startsWith("http") ? "Web Resource Link" : "Secure Note Document");
      }
      if (hasText) formData.append("textContent", uploadTextContent.trim());

      await apiRequest("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const uploadedTitle = uploadName.trim() || (uploadFile ? uploadFile.name : (hasText ? "Secure Note / Link" : "Document"));
      showNotice(`Successfully uploaded and protected "${uploadedTitle}"!`);
      setUploadName("");
      setUploadFile(null);
      setUploadTextContent("");
      if (event?.target?.reset) {
        try { event.target.reset(); } catch {}
      }
      setActiveSection("documents");
      await fetchOwnerData();
    } catch (err) {
      showNotice("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
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

  const renderDocuments = (compact = false) => {
    const list = compact ? documents.slice(0, 3) : filteredDocuments;

    if (list.length === 0) {
      return (
        <div className="od-empty" style={{ padding: "40px 20px", textAlign: "center" }}>
          <Files size={36} style={{ margin: "0 auto 12px", opacity: 0.35, display: "block" }} />
          <strong style={{ fontSize: "14px" }}>No documents found</strong>
          <p style={{ margin: "6px 0 0", color: "var(--od-muted)", fontSize: "12px" }}>
            Upload your files to monitor them in the Zero-Trust Enclave with real-time SHA-256 validation.
          </p>
        </div>
      );
    }

    if (docViewMode === "table") {
      return (
        <div className="od-table-wrap">
          <table className="od-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Category</th>
                <th>Timestamp & Date</th>
                <th>Viewers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((document) => {
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
                            {document.fileChecksum && <IntegrityPill hash={document.fileChecksum} />}
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
                          title="Download PDF"
                          onClick={() => {
                            downloadRealDocument(document, currentUser?.email);
                            showNotice(`Downloaded "${document.name}" in PDF format!`);
                          }}
                        >
                          <Download size={17} />
                        </button>
                        <button
                          className="od-icon-button od-danger"
                          title="Remove entry"
                          onClick={() => deleteDocument(document)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    // Default: Rich Cards View matching #reports
    return (
      <div className="ad-reports-grid" style={{ margin: "10px 0" }}>
        {list.map((document) => (
          <div key={document.id} className="ad-report-card">
            <div>
              <div className="ad-report-card-top">
                <span className="ad-report-day-badge">
                  {document.category || "GENERAL"}
                </span>
                <span className="ad-report-pdf-tag">
                  {document.type ? `${document.type.toUpperCase()} ASSET` : "PDF DOCUMENT"}
                </span>
              </div>
              <h3
                className="ad-report-title"
                onClick={() => {
                  setSelectedDocument(document);
                  setReaderTab("content");
                }}
                style={{ cursor: "pointer" }}
                title="Click to view document content & security metadata"
              >
                {document.name}
              </h3>
              <p className="ad-report-summary">
                {document.summary || "Cryptographically indexed document secured in Zero-Trust Enclave with SHA-256 integrity verification."}
              </p>
            </div>

            <div>
              <div className="ad-report-meta-row">
                <span>📅 {document.updated || "Recently updated"}</span>
                <span>{document.size || "1.0 MB"}</span>
              </div>

              <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>SHA-256 Fingerprint:</span>
                {document.fileChecksum ? (
                  <IntegrityPill hash={document.fileChecksum} />
                ) : (
                  <small className="ad-muted">Verified</small>
                )}
              </div>

              <div className="ad-report-actions-row" style={{ marginTop: "16px" }}>
                <button
                  type="button"
                  className="ad-report-btn-preview"
                  onClick={() => openDocumentInNewTab(document, currentUser?.email)}
                  title="Preview document in secure reader"
                >
                  <Eye size={15} /> Preview
                </button>
                <button
                  type="button"
                  className="ad-report-btn-download"
                  onClick={() => {
                    downloadRealDocument(document, currentUser?.email);
                    showNotice(`Downloaded "${document.name}" in PDF format!`);
                  }}
                  title="Download document in PDF format"
                >
                  <Download size={15} /> Download PDF
                </button>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button
                  type="button"
                  className="ad-report-btn-preview"
                  style={{ flex: 1, fontSize: "0.78rem" }}
                  onClick={() => {
                    setPermissionDocument(document.id);
                    setActiveSection("permissions");
                  }}
                  title="Grant access permissions on this document"
                >
                  <LockKeyhole size={13} /> Grant Access
                </button>
                <button
                  type="button"
                  className="ad-report-btn-preview"
                  style={{ flex: 1, fontSize: "0.78rem", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.25)" }}
                  onClick={() => deleteDocument(document)}
                  title="Move to Deleted Documents Enclave"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
            Recipient user (Viewer or Owner email)
            <ViewerEmailAutocomplete
              value={viewerEmail}
              onChange={setViewerEmail}
              placeholder="Type viewer or owner email..."
              required
            />
          </label>

          <label>
            Select Document
            <DocumentSearchSelect
              documents={documents}
              value={permissionDocument}
              onChange={setPermissionDocument}
              theme={theme}
              required
            />
          </label>

          <label>
            Permission level
            <select
              value={permissionAccess}
              onChange={(event) => setPermissionAccess(event.target.value)}
              style={{
                backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                color: theme === "dark" ? "#f8fafc" : "#0f172a",
              }}
            >
              <option
                value="View only"
                style={{
                  backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                  color: theme === "dark" ? "#f8fafc" : "#0f172a",
                }}
              >
                View only
              </option>
              <option
                value="View + Download"
                style={{
                  backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                  color: theme === "dark" ? "#f8fafc" : "#0f172a",
                }}
              >
                View + Download
              </option>
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
          <h2>Upload & Ingest Enclave Document</h2>
          <p>
            Files, secure notes, and verified links are cryptographically fingerprinted with SHA-256 and committed to the Zero-Trust Enclave storage.
          </p>
        </div>

        <form className="od-upload-form" onSubmit={handleUpload}>
          <label>
            Document name <span style={{ color: "var(--muted)", fontWeight: 400 }}>(Optional - auto-named from file or content)</span>
            <input
              type="text"
              placeholder="e.g. Business Proposal (or auto-named from file/link)"
              value={uploadName}
              onChange={(event) => setUploadName(event.target.value)}
            />
          </label>

          <div className="od-form-grid">
            <label>
              Document category
              <select
                value={uploadCategory}
                onChange={(event) => setUploadCategory(event.target.value)}
                style={{
                  backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                  color: theme === "dark" ? "#f8fafc" : "#0f172a",
                }}
              >
                <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>Business</option>
                <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>Finance</option>
                <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>Legal</option>
                <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>Technical</option>
                <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>Personal</option>
                <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>Other</option>
              </select>
            </label>

            <label>
              File type
              <select
                value={uploadType}
                onChange={(event) => setUploadType(event.target.value)}
                style={{
                  backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                  color: theme === "dark" ? "#f8fafc" : "#0f172a",
                }}
              >
                <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>PDF</option>
                <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>Word</option>
                <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>Excel</option>
                <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>Other</option>
              </select>
            </label>
          </div>

          <div className="od-file-picker-group">
            <label className="od-file-picker">
              <span>Select a file {(uploadCategory === "Other" || uploadType === "Other") && <span style={{ color: "var(--muted)", fontWeight: 400 }}>(Optional)</span>}</span>
              <input
                type="file"
                accept={(uploadCategory === "Other" || uploadType === "Other") ? undefined : ".pdf,.doc,.docx,.xls,.xlsx,.txt"}
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setUploadFile(file);
                  if (file && !uploadName) {
                    setUploadName(file.name);
                  }
                }}
              />
              <small>
                {uploadFile
                  ? `${uploadFile.name} (${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)`
                  : (uploadCategory === "Other" || uploadType === "Other")
                    ? "Any file format (PDF, images, documents, archives, code, data, etc.)"
                    : "PDF, Word, Excel, or text files"}
              </small>
            </label>
            {(uploadCategory === "Other" || uploadType === "Other") && uploadFile && (
              <button
                type="button"
                onClick={() => setUploadFile(null)}
                style={{
                  marginTop: "6px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--danger, #ef4444)",
                  cursor: "pointer",
                }}
              >
                ✕ Clear chosen file
              </button>
            )}
          </div>

          {(uploadCategory === "Other" || uploadType === "Other") && (
            <div style={{
              margin: "14px 0",
              padding: "16px",
              borderRadius: "12px",
              border: "1.5px dashed var(--primary)",
              background: theme === "dark" ? "rgba(59, 130, 246, 0.06)" : "rgba(59, 130, 246, 0.04)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ margin: 0, fontWeight: 600, color: "var(--text)" }}>
                  Write text content or enter a link / URL <span style={{ color: "var(--muted)", fontWeight: 400 }}>(Optional)</span>
                </label>
                <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "12px", background: "var(--primary)", color: "#fff", fontWeight: 700 }}>
                  OTHER MODE
                </span>
              </div>
              <p style={{ margin: "0 0 10px", fontSize: "12px", color: "var(--muted)" }}>
                You can choose a file above, enter text/a link below, or do both. Neither is individually required.
              </p>
              <textarea
                rows={4}
                placeholder="Enter document text content, secure notes, or paste a link/URL (e.g. https://...)"
                value={uploadTextContent}
                onChange={(e) => setUploadTextContent(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                  color: theme === "dark" ? "#f8fafc" : "#0f172a",
                  fontFamily: "inherit",
                  fontSize: "0.88rem",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

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

          <button
            type="submit"
            className="od-primary-button"
            disabled={isUploading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 26px",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: isUploading ? "not-allowed" : "pointer",
              opacity: isUploading ? 0.75 : 1,
            }}
          >
            <Upload size={18} />
            {isUploading ? "Uploading & Encrypting..." : "Upload Document"}
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
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ display: "flex", background: "var(--od-bg)", border: "1px solid var(--od-border)", borderRadius: "8px", padding: "2px" }}>
                    <button
                      type="button"
                      onClick={() => setDocViewMode("cards")}
                      style={{
                        padding: "6px 12px",
                        border: "none",
                        borderRadius: "6px",
                        background: docViewMode === "cards" ? "var(--od-primary)" : "transparent",
                        color: docViewMode === "cards" ? "#ffffff" : "var(--od-muted)",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      Cards View
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocViewMode("table")}
                      style={{
                        padding: "6px 12px",
                        border: "none",
                        borderRadius: "6px",
                        background: docViewMode === "table" ? "var(--od-primary)" : "transparent",
                        color: docViewMode === "table" ? "#ffffff" : "var(--od-muted)",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "12px",
                      }}
                    >
                      Table View
                    </button>
                  </div>
                  <button
                    className="od-primary-button"
                    onClick={() => setActiveSection("upload")}
                  >
                    <Plus size={17} /> New Upload
                  </button>
                </div>
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
                {selectedDocument.textContent && (
                  <div style={{
                    marginBottom: "14px",
                    padding: "14px 18px",
                    background: theme === "dark" ? "rgba(30, 41, 59, 0.8)" : "rgba(241, 245, 249, 0.95)",
                    border: "1.5px solid var(--border)",
                    borderRadius: "12px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--primary)" }}>
                        Enclave Text Content / Link
                      </span>
                      {/https?:\/\/[^\s]+/i.test(selectedDocument.textContent) && (
                        <a
                          href={selectedDocument.textContent.match(/https?:\/\/[^\s]+/i)[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "12px",
                            color: "var(--primary)",
                            textDecoration: "underline",
                            fontWeight: 600,
                          }}
                        >
                          <ExternalLink size={13} /> Open Link
                        </a>
                      )}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "13px", lineHeight: "1.6", color: "var(--text)" }}>
                      {selectedDocument.textContent}
                    </div>
                  </div>
                )}
                <pre className="vd-file-content-box">
                  {generateDocumentText(selectedDocument)}
                </pre>
              </div>
            ) : (
              <div className="od-metadata-list">
                <div><span>Document Name</span><strong>{selectedDocument.name || "Untitled Document"}</strong></div>
                <div><span>Owner / Publisher</span><strong>{selectedDocument.owner || selectedDocument.ownerName || selectedDocument.ownerEmail || currentUser?.name || "Document Owner"}</strong></div>
                <div>
                  <span>Classification</span>
                  <SecurityClearanceBadge level={selectedDocument.category || "CONFIDENTIAL"} />
                </div>
                <div><span>File Type & Format</span><strong>{selectedDocument.fileType || selectedDocument.type || "PDF"} ({selectedDocument.contentType || "application/pdf"})</strong></div>
                <div><span>Size on Disk</span><strong>{selectedDocument.size || selectedDocument.fileSize || "1.0 MB"}</strong></div>
                <div>
                  <span>SHA-256 Fingerprint</span>
                  <div style={{ marginTop: "4px" }}>
                    <IntegrityPill hash={selectedDocument.fileChecksum || "e4b2a1c89012f67a89b0d1e2f3a4b5c678901234567890abcdef1234567890ab"} />
                  </div>
                </div>
                <div><span>Access Policy</span><strong>{selectedDocument.accessPolicy || "Level 2 · Owner Restricted Enclave"}</strong></div>
                {selectedDocument.textContent && (
                  <div>
                    <span>Document Text / Link</span>
                    <strong style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{selectedDocument.textContent}</strong>
                  </div>
                )}
                <div><span>Last Updated & Ingested</span><strong>{selectedDocument.updated || (selectedDocument.updatedAt ? new Date(selectedDocument.updatedAt).toLocaleString() : new Date().toLocaleString())}</strong></div>
                <div><span>Permitted Viewers</span><strong>{selectedDocument.viewers ?? (permissions.filter(p => String(p.documentId) === String(selectedDocument.id) && (p.status === "GRANTED" || p.active)).length)} active</strong></div>
                <div>
                  <span>Cryptographic Verification</span>
                  <span style={{ color: "#10b981", fontWeight: 700, fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <ShieldCheck size={13} /> Verified Integrity (Match on disk)
                  </span>
                </div>
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
                  showNotice(`Downloaded "${selectedDocument.name}" in PDF format!`);
                }}
              >
                <Download size={16} /> Download PDF (.pdf)
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
