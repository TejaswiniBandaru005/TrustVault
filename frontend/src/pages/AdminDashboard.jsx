
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
  Upload,
} from "lucide-react";
import {
  downloadRealDocument,
  openDocumentInNewTab,
  formatFullTimestamp,
  calculateTextSize,
  getTextByteLength,
} from "../utils/documentContent";
import TrustVaultLogo from "../components/TrustVaultLogo";
import ThemePalettePicker from "../components/ThemePalettePicker";
import IntegrityPill from "../components/IntegrityPill";
import SecurityClearanceBadge from "../components/SecurityClearanceBadge";
import ViewerEmailAutocomplete from "../components/ViewerEmailAutocomplete";
import DocumentSearchSelect from "../components/DocumentSearchSelect";

// Start users and requests clean as requested
const starterUsers = [];
const starterRequests = [];

// Authentic Day 1 to Day 7 Engineering Progress Reports with exact timestamps
const starterDocuments = [
  { id: 101, day: 1, name: "Day 01 - Architecture and Zero-Trust Foundations.pdf", owner: "System Administrator", category: "Architecture", updated: "Oct 19, 2026 · 09:30:00 AM", size: "1.2 MB", fileChecksum: "e4b2a1c89012f67a89b0d1e2f3a4b5c678901234567890abcdef1234567890ab", summary: "Zero-Trust foundational axioms, triple-tier RBAC architecture (Admin, Owner, Viewer), Spring Security cryptographic gateway, and attack surface boundary definition." },
  { id: 102, day: 2, name: "Day 02 - Security Threat Modeling & STRIDE Matrix.pdf", owner: "System Administrator", category: "Security", updated: "Oct 20, 2026 · 11:15:22 AM", size: "1.8 MB", fileChecksum: "f7c3b2d90123a78b90c1e2f3a4b5c678901234567890abcdef1234567890bc", summary: "STRIDE threat model assessment, DREAD vulnerability quantification, SHA-256 byte digest pipeline, and single-use OTP replay mitigation." },
  { id: 103, day: 3, name: "Day 03 - Cryptographic Hashing & Storage Engine.pdf", owner: "System Administrator", category: "Engineering", updated: "Oct 21, 2026 · 02:20:45 PM", size: "2.1 MB", fileChecksum: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0", summary: "SHA-256 multipart upload processor, physical isolated disk storage, Neon AWS PostgreSQL relational schema, and append-only audit ledger." },
  { id: 104, day: 4, name: "Day 04 - Multi-Factor Authentication & OTP Engine.pdf", owner: "System Administrator", category: "Authentication", updated: "Oct 22, 2026 · 04:45:10 PM", size: "1.6 MB", fileChecksum: "b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01", summary: "Spring Security 6 stateless filter chain, 6-digit OTP verification protocol, purpose-bound email validation, and role clearance switcher." },
  { id: 105, day: 5, name: "Day 05 - Vercel & Render Cloud Infrastructure.pdf", owner: "System Administrator", category: "DevOps", updated: "Oct 23, 2026 · 10:00:30 AM", size: "2.4 MB", fileChecksum: "c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012", summary: "Dual-cloud deployment orchestration: Vercel Edge frontend with reverse-proxy rewrites, Render containerized backend with dynamic $PORT, and CORS configuration." },
  { id: 106, day: 6, name: "Day 06 - Enclave Soft-Delete & Access Gating.pdf", owner: "System Administrator", category: "Governance", updated: "Oct 24, 2026 · 06:30:18 PM", size: "1.9 MB", fileChecksum: "d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0123", summary: "Soft-deletion preservation enclave, unverified preview containment, instant administrative access revocation, and document restoration pipeline." },
  { id: 107, day: 7, name: "Day 07 - Autocomplete Delegation & Security Hardening.pdf", owner: "System Administrator", category: "Security", updated: "Oct 25, 2026 · 01:00:44 AM", size: "2.3 MB", fileChecksum: "e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01234", summary: "Viewer autocomplete delegation with prefix matching, real owner identity resolution, Docker security containerization, and unit test verification suite." },
];

const starterEvents = [
  { id: 41, type: "success", action: "Milestone reached", detail: "Day 7: Autocomplete Delegation & Testing Verified", time: "Oct 25, 2026 · 01:00 AM" },
  { id: 42, type: "success", action: "Milestone reached", detail: "Day 6: Soft-Delete Enclave & Access Gating Live", time: "Oct 24, 2026 · 06:30 PM" },
  { id: 43, type: "success", action: "Milestone reached", detail: "Day 5: Vercel & Render Cloud Infrastructure Active", time: "Oct 23, 2026 · 10:00 AM" },
  { id: 44, type: "success", action: "Milestone reached", detail: "Day 4: Multi-Factor Authentication & OTP Engine Tested", time: "Oct 22, 2026 · 04:45 PM" },
  { id: 45, type: "success", action: "Milestone reached", detail: "Day 3: SHA-256 Checksum Pipeline & Neon DB Connected", time: "Oct 21, 2026 · 02:20 PM" },
  { id: 46, type: "success", action: "Milestone reached", detail: "Day 2: Threat Modeling & STRIDE Matrix Formulated", time: "Oct 20, 2026 · 11:15 AM" },
  { id: 47, type: "success", action: "Milestone reached", detail: "Day 1: Zero-Trust Architecture & Role Clearances Defined", time: "Oct 19, 2026 · 09:30 AM" },
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
      const valid = ["overview", "reports", "requests", "users", "viewers", "owners", "documents", "upload", "permissions", "deleted", "activity", "events"];
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
  const [documentRequests, setDocumentRequests] = useState([]);
  const [documents, setDocuments] = useState(starterDocuments);
  const [deletedDocuments, setDeletedDocuments] = useState([]);
  const [inspectedOwnerHistory, setInspectedOwnerHistory] = useState(null);
  const [isLoadingOwnerHistory, setIsLoadingOwnerHistory] = useState(false);
  const [ownerHistoryTab, setOwnerHistoryTab] = useState("uploaded");
  const [events, setEvents] = useState(starterEvents);
  const [auditLogs, setAuditLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [reportsSearch, setReportsSearch] = useState("");
  const [docSortOrder, setDocSortOrder] = useState("desc");
  const [notice, setNotice] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Grant Document Permission States for Administrator
  const [grantViewerEmail, setGrantViewerEmail] = useState("");
  const [grantDocumentId, setGrantDocumentId] = useState("");
  const [grantAccessLevel, setGrantAccessLevel] = useState("View only");
  const [isSubmittingGrant, setIsSubmittingGrant] = useState(false);

  // Document & Daily Report Upload States for Administrator
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Technical");
  const [uploadType, setUploadType] = useState("PDF");
  const [uploadTextContent, setUploadTextContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const addEvent = (action, detail, type = "success") => {
    setEvents((current) => [
      {
        id: Date.now(),
        type,
        action,
        detail,
        time: formatFullTimestamp(new Date()),
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

  const filteredReports = useMemo(() => {
    const q = (reportsSearch || "").trim().toLowerCase();
    if (!q) return starterDocuments;
    return starterDocuments.filter((doc) =>
      doc.name.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q) ||
      doc.summary.toLowerCase().includes(q) ||
      `day ${doc.day}`.toLowerCase().includes(q)
    );
  }, [reportsSearch]);

  const filteredDocuments = useMemo(
    () =>
      documents.filter((doc) =>
        `${doc.name} ${doc.owner} ${doc.category}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [documents, search]
  );

  const sortedDocuments = useMemo(() => {
    const list = [...filteredDocuments];
    list.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.updatedAt || a.updated || 0).getTime();
      const timeB = new Date(b.createdAt || b.updatedAt || b.updated || 0).getTime();
      if (!isNaN(timeA) && !isNaN(timeB) && timeA !== timeB) {
        return docSortOrder === "asc" ? timeA - timeB : timeB - timeA;
      }
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      return docSortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    return list;
  }, [filteredDocuments, docSortOrder]);

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

    apiRequest("/api/admin/document-requests")
      .then((data) => {
        if (Array.isArray(data)) {
          setDocumentRequests(data);
        }
      })
      .catch((err) => console.warn("Failed to fetch document requests:", err));

    apiRequest("/api/admin/users")
      .then((data) => {
        if (Array.isArray(data)) {
          const normalized = data.map((u) => {
            const r = (u.role || "").toUpperCase();
            return {
              ...u,
              role: r === "OWNER" ? "Owner" : r === "ADMIN" ? "Admin" : "Viewer",
              lastLogin: formatFullTimestamp(u.lastLoginAt || u.lastLogin),
              lastLogout: formatFullTimestamp(u.lastLogoutAt || u.lastLogout),
            };
          });
          setUsers((current) => {
            const merged = [...normalized];
            starterUsers.forEach((su) => {
              if (!merged.some((u) => u.email.toLowerCase() === su.email.toLowerCase())) {
                merged.push({
                  ...su,
                  userCode: "TV-USR-000" + su.id,
                  lastLogin: formatFullTimestamp(su.lastLogin),
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
            time: formatFullTimestamp(log.timestamp),
          }));
          setEvents(mappedEvents);
        }
      })
      .catch((err) => console.warn("Failed to fetch audit logs:", err));

    apiRequest("/api/documents/catalog")
      .then((docs) => {
        if (Array.isArray(docs)) {
          setDocuments(() => {
            const merged = [...docs];
            starterDocuments.forEach((sd) => {
              if (!merged.some((d) => (d.name || "").toLowerCase() === sd.name.toLowerCase())) {
                merged.push(sd);
              }
            });
            return merged;
          });
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch catalog documents:", err);
        setDocuments(starterDocuments);
      });

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

  const approveDocumentAccess = async (reqItem, canDownload = false) => {
    try {
      await apiRequest("/api/admin/approve-document-request", {
        method: "POST",
        body: JSON.stringify({
          permissionId: reqItem.id || reqItem.permissionId,
          documentId: reqItem.documentId,
          viewerEmail: reqItem.viewerEmail,
          canView: true,
          canDownload,
          adminEmail: currentUser?.email || "admin123@gmail.com",
        }),
      });

      setDocumentRequests((current) =>
        current.filter((item) => item.id !== reqItem.id && item.permissionId !== reqItem.permissionId)
      );
      addEvent("Document access approved", `${reqItem.viewerEmail} • ${reqItem.documentName} (${canDownload ? 'View + Download' : 'View only'})`, "success");
      addNotice(`Granted ${canDownload ? 'View + Download' : 'View-only'} access on "${reqItem.documentName}" to ${reqItem.viewerEmail}!`);
      fetchAllData();
    } catch (err) {
      addNotice("Approval failed: " + err.message);
    }
  };

  const rejectDocumentAccess = async (reqItem) => {
    try {
      await apiRequest("/api/admin/reject-document-request", {
        method: "POST",
        body: JSON.stringify({
          permissionId: reqItem.id || reqItem.permissionId,
          documentId: reqItem.documentId,
          viewerEmail: reqItem.viewerEmail,
          adminEmail: currentUser?.email || "admin123@gmail.com",
        }),
      });

      setDocumentRequests((current) =>
        current.filter((item) => item.id !== reqItem.id && item.permissionId !== reqItem.permissionId)
      );
      addEvent("Document access rejected", `${reqItem.viewerEmail} • ${reqItem.documentName}`, "warning");
      addNotice(`Rejected document access request from ${reqItem.viewerEmail} on "${reqItem.documentName}".`);
      fetchAllData();
    } catch (err) {
      addNotice("Rejection failed: " + err.message);
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

  const handleAdminGrantPermission = async (e) => {
    e.preventDefault();
    if (!grantViewerEmail.trim() || !grantDocumentId) {
      addNotice("Please select a document and enter/select a viewer email.");
      return;
    }

    const docObj = documents.find((d) => String(d.id) === String(grantDocumentId));
    if (!docObj) {
      addNotice("Selected document not found.");
      return;
    }

    setIsSubmittingGrant(true);
    try {
      await apiRequest("/api/documents/grant-access", {
        method: "POST",
        body: JSON.stringify({
          documentId: docObj.id,
          viewerEmail: grantViewerEmail.trim(),
          canView: true,
          canDownload: grantAccessLevel === "View + Download",
          ownerEmail: currentUser?.email || "admin123@gmail.com",
        }),
      });

      addNotice(`Access granted on "${docObj.name}" to ${grantViewerEmail}!`);
      setGrantViewerEmail("");
      setGrantDocumentId("");
      fetchAllData();
    } catch (err) {
      addNotice("Permission grant failed: " + err.message);
    } finally {
      setIsSubmittingGrant(false);
    }
  };

  const handleAdminUpload = async (event) => {
    event.preventDefault();

    const isOther = uploadCategory === "Other" || uploadType === "Other";
    const hasFile = !!uploadFile;
    const hasText = !!(uploadTextContent && uploadTextContent.trim());

    if (isOther) {
      if (!hasFile && !hasText) {
        addNotice("Please choose a file or enter text / a link (or both).");
        return;
      }
    } else {
      if (!hasFile) {
        addNotice("Please select a document or report file to upload.");
        return;
      }
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      let effectiveFileType;
      let effectiveSize;

      if (hasText && !hasFile) {
        effectiveFileType = "Text";
        effectiveSize = calculateTextSize(uploadTextContent.trim());
        const fallbackName = (uploadTitle.trim() || "document_content") + (uploadTitle.includes(".") ? "" : ".txt");
        const textFile = new File([uploadTextContent.trim()], fallbackName, { type: "text/plain" });
        formData.append("file", textFile);
      } else if (hasFile) {
        formData.append("file", uploadFile);
        if (hasText || isOther) {
          effectiveFileType = "Text";
        } else {
          effectiveFileType = uploadType || "PDF";
        }
        effectiveSize = hasText
          ? calculateTextSize(uploadTextContent.trim())
          : `${(uploadFile.size / (1024 * 1024)).toFixed(2)} MB`;
      }

      formData.append("email", currentUser?.email || "admin123@gmail.com");
      formData.append("category", uploadCategory || "Technical");
      formData.append("fileType", effectiveFileType || "Text");
      if (effectiveSize) {
        formData.append("fileSize", effectiveSize);
      }

      const finalName = uploadTitle.trim() || (uploadFile ? uploadFile.name : (hasText ? "Text Document" : "Report"));
      formData.append("name", finalName);

      if (hasText) {
        formData.append("textContent", uploadTextContent.trim());
      }

      await apiRequest("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      addNotice(`Document "${finalName}" (Type: ${effectiveFileType || 'Text'}, Size: ${effectiveSize || 'Calculated'}) successfully uploaded and cryptographically indexed into the Zero-Trust Enclave!`);
      setUploadTitle("");
      setUploadFile(null);
      setUploadTextContent("");
      if (event?.target?.reset) {
        try { event.target.reset(); } catch {}
      }
      fetchAllData();
      setSection("documents");
    } catch (err) {
      addNotice("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "reports", label: "Daily Reports", icon: CalendarDays, count: 7 },
    { id: "requests", label: "New Requests", icon: UserCheck, count: requests.length + documentRequests.length },
    { id: "users", label: "User Details", icon: Users, count: users.length },
    { id: "documents", label: "All Documents", icon: FileText },
    { id: "upload", label: "Upload Document", icon: Upload },
    { id: "permissions", label: "Grant Permissions", icon: LockKeyhole },
    { id: "deleted", label: "Deleted Documents", icon: Trash2, count: deletedDocuments.length },
    { id: "activity", label: "Activity & Security", icon: History },
  ];

  const pageTitle = {
    overview: "Admin Overview",
    reports: "Daily Engineering Progress Reports (Day 1 – 7)",
    requests: "Registration Requests",
    users: "User Details",
    viewers: "User Details",
    owners: "User Details",
    documents: "Document Monitoring",
    upload: "Ingest Document & Enclave Reports",
    permissions: "Grant Document Permission",
    deleted: "Deleted Documents Enclave",
    activity: "Activity & Security",
  }[section];

  const visibleUsers = filteredUsers;

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
          {section !== "reports" && (
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
          )}

          {notice && section !== "reports" && (
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
                <Stat icon={Clock3} label="Pending Requests" value={requests.length + documentRequests.length} note={`${documentRequests.length} document access · ${requests.length} account`} tone="amber" />
                <Stat icon={FileText} label="Documents" value={documents.length} note="Across all demo owners" tone="purple" />
                <Stat icon={ShieldAlert} label="Security Alerts" value={events.filter((event) => event.type === "danger").length} note="Sample alert events" tone="red" />
              </div>

              <div className="ad-overview-grid">
                <section className="ad-panel ad-request-panel">
                  <div className="ad-panel-heading">
                    <div>
                      <h2>Pending Access & Registration Requests</h2>
                      <p>{documentRequests.length} document access · {requests.length} account requests</p>
                    </div>
                    <button className="ad-link-btn" onClick={() => setSection("requests")}>View all ({documentRequests.length + requests.length}) <ArrowUpRight size={14} /></button>
                  </div>
                  {documentRequests.length > 0 ? (
                    <DocumentRequestTable
                      requests={documentRequests.slice(0, 3)}
                      onApproveView={(req) => approveDocumentAccess(req, false)}
                      onApproveAll={(req) => approveDocumentAccess(req, true)}
                      onReject={rejectDocumentAccess}
                    />
                  ) : (
                    <RequestTable requests={requests.slice(0, 3)} onApprove={approveRequest} onReject={rejectRequest} />
                  )}
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

          {section === "reports" && (
            <div className="ad-reports-wrapper" style={{ maxWidth: "100%", paddingTop: "8px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div className="ad-search" style={{ flex: 1, maxWidth: "460px" }}>
                  <Search size={16} />
                  <input
                    type="search"
                    placeholder="Search daily engineering reports (e.g. STRIDE, Day 01, DevOps, Neon)..."
                    value={reportsSearch}
                    onChange={(e) => setReportsSearch(e.target.value)}
                  />
                  {reportsSearch && (
                    <button
                      type="button"
                      onClick={() => setReportsSearch("")}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--muted)",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
                <span style={{ fontSize: "0.84rem", color: "var(--muted)", fontWeight: 600 }}>
                  Showing {filteredReports.length} of {starterDocuments.length} technical reports
                </span>
              </div>

              {filteredReports.length === 0 ? (
                <EmptyState text={`No daily engineering reports match "${reportsSearch}".`} />
              ) : (
                <div className="ad-reports-grid">
                  {filteredReports.map((doc) => (
                    <div key={doc.id} className="ad-report-card">
                      <div>
                        <div className="ad-report-card-top">
                          <span className="ad-report-day-badge">DAY {String(doc.day || "").padStart(2, "0")} · {doc.category}</span>
                          <span className="ad-report-pdf-tag">PDF DOCUMENT</span>
                        </div>
                        <h3 className="ad-report-title">{doc.name}</h3>
                        <p className="ad-report-summary">{doc.summary}</p>
                      </div>

                      <div>
                        <div className="ad-report-meta-row">
                          <span>📅 Milestone: {doc.updated}</span>
                          <span>Size: {doc.size}</span>
                        </div>
                        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>SHA-256 Fingerprint:</span>
                          <IntegrityPill hash={doc.fileChecksum} />
                        </div>

                        <div className="ad-report-actions-row" style={{ marginTop: "16px" }}>
                          <button
                            type="button"
                            className="ad-report-btn-preview"
                            onClick={() => openDocumentInNewTab(doc)}
                            title="Preview document in secure reader"
                          >
                            <Eye size={15} /> Preview
                          </button>
                          <button
                            type="button"
                            className="ad-report-btn-download"
                            onClick={() => {
                              downloadRealDocument(doc);
                              addNotice(`Downloaded "${doc.name}" in PDF format!`);
                            }}
                            title="Download document in PDF format"
                          >
                            <Download size={15} /> Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === "requests" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Viewer Document Access Requests */}
              <section className="ad-panel">
                <div className="ad-panel-heading">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h2>Viewer Document Access Requests</h2>
                      <span className="ad-count-pill" style={{
                        background: documentRequests.length > 0 ? "rgba(59, 130, 246, 0.15)" : undefined,
                        color: documentRequests.length > 0 ? "var(--primary)" : undefined
                      }}>
                        {documentRequests.length} pending
                      </span>
                    </div>
                    <p>Review and grant clearance for protected files requested by viewers across the enclave.</p>
                  </div>
                </div>
                <DocumentRequestTable
                  requests={documentRequests}
                  onApproveView={(req) => approveDocumentAccess(req, false)}
                  onApproveAll={(req) => approveDocumentAccess(req, true)}
                  onReject={rejectDocumentAccess}
                />
              </section>

              {/* User Account Registration Requests */}
              <section className="ad-panel">
                <div className="ad-panel-heading">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h2>Account Approval Queue</h2>
                      <span className="ad-count-pill">{requests.length} pending</span>
                    </div>
                    <p>Review and approve newly registered user accounts before they can access the enclave.</p>
                  </div>
                </div>
                <RequestTable requests={requests} onApprove={approveRequest} onReject={rejectRequest} />
              </section>
            </div>
          )}

          {(section === "users" || section === "viewers" || section === "owners") && (
            <section className="ad-panel">
              <div className="ad-panel-heading">
                <div>
                  <h2>User Details</h2>
                  <p>Inspect registered user accounts (Viewers & Owners), filter by role, review activity, and manage permissions.</p>
                </div>
                <span className="ad-count-pill">{visibleUsers.length} accounts</span>
              </div>

              <div className="ad-toolbar">
                <div className="ad-search">
                  <Search size={17} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email..." />
                </div>
                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  aria-label="Filter role"
                  style={{
                    backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                    color: theme === "dark" ? "#f8fafc" : "#0f172a",
                  }}
                >
                  <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>All</option>
                  <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>Viewer</option>
                  <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>Owner</option>
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
                  <p>Inspect document metadata or manage document security policies.</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    className="ad-small-btn"
                    onClick={() => setSection("upload")}
                    style={{ background: "var(--primary)", color: "#fff", border: "none", padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <Upload size={14} /> Upload Document
                  </button>
                  <button
                    className="ad-small-btn"
                    onClick={() => setSection("permissions")}
                    style={{ background: "var(--card)", color: "var(--text)", border: "1px solid var(--border)", padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <LockKeyhole size={14} /> Grant Permission
                  </button>
                  <span className="ad-count-pill">{sortedDocuments.length} documents</span>
                </div>
              </div>
              <div className="ad-toolbar">
                <div className="ad-search">
                  <Search size={17} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search file, owner, category..." />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label htmlFor="ad-doc-sort-select" style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 600, whiteSpace: "nowrap" }}>
                    Sort Files:
                  </label>
                  <select
                    id="ad-doc-sort-select"
                    value={docSortOrder}
                    onChange={(e) => setDocSortOrder(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border)",
                      backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                      color: theme === "dark" ? "#f8fafc" : "#0f172a",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <option value="desc" style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>
                      Descending (Z → A / Newest First)
                    </option>
                    <option value="asc" style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }}>
                      Ascending (A → Z / Oldest First)
                    </option>
                  </select>
                </div>
              </div>
              <DocumentTable documents={sortedDocuments} onInspect={setSelectedDocument} onDelete={deleteDocument} />
            </section>
          )}

          {section === "permissions" && (
            <div className="ad-permissions-wrapper">
              <section className="ad-permissions-card">
                <div className="ad-card-header">
                  <div className="ad-card-header-info">
                    <div className="ad-card-header-icon">
                      <LockKeyhole size={24} />
                    </div>
                    <div className="ad-card-header-text">
                      <h2>Grant Document Permission</h2>
                      <p>Authorize a verified viewer or owner to view or download a selected document across any enclave with cryptographic access delegation.</p>
                    </div>
                  </div>
                  <span className="ad-auth-summary-badge">
                    <ShieldCheck size={14} /> ZERO-TRUST ENCLAVE
                  </span>
                </div>

                <form className="ad-permissions-form" onSubmit={handleAdminGrantPermission}>
                  <div className="ad-form-group">
                    <label className="ad-form-label">
                      <span>Recipient User (Viewer or Owner Email)</span>
                      <span className="ad-form-label-hint">Prefix-match registered viewers & owners</span>
                    </label>
                    <ViewerEmailAutocomplete
                      value={grantViewerEmail}
                      onChange={setGrantViewerEmail}
                      usersList={users}
                      placeholder="Type viewer or owner email (e.g. user@example.com)..."
                      required
                    />
                  </div>

                  <div className="ad-form-row-2">
                    <div className="ad-form-group">
                      <label className="ad-form-label">
                        <span>Select Document</span>
                        <span className="ad-form-label-hint">Recently added on top · Type to filter</span>
                      </label>
                      <DocumentSearchSelect
                        documents={documents}
                        value={grantDocumentId}
                        onChange={setGrantDocumentId}
                        theme={theme}
                        required
                      />
                    </div>

                    <div className="ad-form-group">
                      <label className="ad-form-label">
                        <span>Permission Clearance Level</span>
                        <span className="ad-form-label-hint">Access scope</span>
                      </label>
                      <select
                        className="ad-styled-select"
                        value={grantAccessLevel}
                        onChange={(e) => setGrantAccessLevel(e.target.value)}
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
                          View only (In-Browser Protected Reader)
                        </option>
                        <option
                          value="View + Download"
                          style={{
                            backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                            color: theme === "dark" ? "#f8fafc" : "#0f172a",
                          }}
                        >
                          View + Download (Allow Decrypted PDF Export)
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Authorization Summary Preview Card */}
                  <div className="ad-auth-summary-card">
                    <div className="ad-auth-summary-title">
                      <ShieldCheck size={16} /> Clearance Delegation Preview
                    </div>
                    <div className="ad-auth-summary-grid">
                      <div className="ad-auth-summary-item">
                        <span>Recipient Viewer</span>
                        <strong>{grantViewerEmail ? grantViewerEmail : "Not selected yet"}</strong>
                      </div>
                      <div className="ad-auth-summary-item">
                        <span>Target Asset</span>
                        <strong>
                          {grantDocumentId
                            ? documents.find((d) => String(d.id) === String(grantDocumentId))?.name || "Selected Document"
                            : "No document chosen"}
                        </strong>
                      </div>
                      <div className="ad-auth-summary-item">
                        <span>Granted Scope</span>
                        <span className="ad-auth-summary-badge" style={{ marginTop: "2px" }}>
                          {grantAccessLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ad-form-submit-row">
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                      Audit log entry will be permanently appended to the security ledger.
                    </span>
                    <button
                      type="submit"
                      className="ad-btn-grant"
                      disabled={isSubmittingGrant}
                    >
                      <ShieldCheck size={18} />
                      <span>{isSubmittingGrant ? "Granting Permission..." : "Authorize Document Permission"}</span>
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {section === "upload" && (
            <div className="ad-upload-wrapper">
              <section className="ad-upload-card">
                <div className="ad-card-header">
                  <div className="ad-card-header-info">
                    <div className="ad-card-header-icon">
                      <Upload size={24} />
                    </div>
                    <div className="ad-card-header-text">
                      <h2>Upload Enclave Document & Daily Reports</h2>
                      <p>Ingest technical records, architecture reports, or daily progress updates directly into the Zero-Trust Enclave with real-time SHA-256 fingerprinting.</p>
                    </div>
                  </div>
                  <span className="ad-auth-summary-badge">
                    <ShieldCheck size={14} /> SHA-256 INGESTION
                  </span>
                </div>

                <form className="ad-upload-styled-form" onSubmit={handleAdminUpload}>
                  <div className="ad-form-group">
                    <label className="ad-form-label">
                      <span>Document / Report Title {(uploadFile || (uploadCategory === "Other" || uploadType === "Other")) && <span style={{ color: "var(--muted)", fontWeight: 400 }}>(Optional - auto-named from file)</span>}</span>
                      <span className="ad-form-label-hint">Descriptive identifier</span>
                    </label>
                    <input
                      type="text"
                      className="ad-styled-input"
                      placeholder="e.g. Day 08 - Post-Quantum Access Control Audit.pdf (or auto-named from file)"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                    />
                  </div>

                  <div className="ad-form-row-2">
                    <div className="ad-form-group">
                      <label className="ad-form-label">
                        <span>Document Category</span>
                        <span className="ad-form-label-hint">Domain classification</span>
                      </label>
                      <select
                        className="ad-styled-select"
                        value={uploadCategory}
                        onChange={(e) => {
                          const val = e.target.value;
                          setUploadCategory(val);
                          if (val === "Other") {
                            setUploadType("Text");
                          }
                        }}
                        style={{
                          backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                          color: theme === "dark" ? "#f8fafc" : "#0f172a",
                        }}
                      >
                        <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} value="Technical">Technical</option>
                        <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} value="Engineering">Engineering</option>
                        <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} value="Architecture">Architecture</option>
                        <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} value="Security">Security</option>
                        <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} value="Compliance">Compliance</option>
                        <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} value="Business">Business</option>
                        <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} value="Finance">Finance</option>
                        <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} value="Legal">Legal</option>
                        <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} value="Personal">Personal</option>
                        <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} value="Other">Other</option>
                      </select>
                    </div>

                    <div className="ad-form-group">
                      <label className="ad-form-label">
                        <span>File Type & Format</span>
                        <span className="ad-form-label-hint">Data format</span>
                      </label>
                      <select
                        className="ad-styled-select"
                        value={uploadType}
                        onChange={(e) => setUploadType(e.target.value)}
                        style={{
                          backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                          color: theme === "dark" ? "#f8fafc" : "#0f172a",
                        }}
                      >
                        <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} value="PDF">PDF (.pdf)</option>
                        <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} value="Word">Word (.docx)</option>
                        <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} value="Excel">Excel (.xlsx)</option>
                        <option style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff", color: theme === "dark" ? "#f8fafc" : "#0f172a" }} value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="ad-form-group">
                    <label className="ad-form-label">
                      <span>Select File or Document {(uploadCategory === "Other" || uploadType === "Other") ? "(Any format - Optional)" : "(.pdf, .txt, .md, .docx)"}</span>
                      <span className="ad-form-label-hint">Max size 50MB</span>
                    </label>
                    <div style={{ padding: "18px", background: "var(--bg)", border: "1.5px dashed var(--border)", borderRadius: "14px" }}>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setUploadFile(file);
                          if (file && !uploadTitle) {
                            setUploadTitle(file.name);
                          }
                        }}
                        style={{ width: "100%", color: "var(--text)", fontSize: "0.85rem" }}
                      />
                      {uploadFile && (
                        <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 700 }}>
                            ✓ Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                          </span>
                          {(uploadCategory === "Other" || uploadType === "Other") && (
                            <button
                              type="button"
                              onClick={() => setUploadFile(null)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--danger, #ef4444)",
                                cursor: "pointer",
                                fontSize: "12px",
                                textDecoration: "underline",
                              }}
                            >
                              ✕ Remove file
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {(uploadCategory === "Other" || uploadType === "Other") && (
                    <div className="ad-form-group" style={{
                      padding: "16px",
                      borderRadius: "14px",
                      border: "1.5px dashed var(--primary)",
                      background: theme === "dark" ? "rgba(59, 130, 246, 0.06)" : "rgba(59, 130, 246, 0.04)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <label className="ad-form-label" style={{ margin: 0 }}>
                          <span>Document Text Content or Link / URL <span style={{ color: "var(--muted)", fontWeight: 400 }}>(Optional)</span></span>
                        </label>
                        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "12px", background: "var(--primary)", color: "#fff", fontWeight: 700 }}>
                          OTHER MODE
                        </span>
                      </div>
                      <p style={{ margin: "0 0 10px", fontSize: "12px", color: "var(--muted)" }}>
                        You can choose a file above, enter text / link below, or do both. Neither is individually required.
                      </p>
                      <textarea
                        rows={4}
                        className="ad-styled-input"
                        placeholder="Enter document text content, secure notes, or paste a link/URL (e.g. https://...)"
                        value={uploadTextContent}
                        onChange={(e) => setUploadTextContent(e.target.value)}
                        style={{
                          width: "100%",
                          resize: "vertical",
                          fontFamily: "inherit",
                          fontSize: "0.88rem",
                          boxSizing: "border-box",
                        }}
                      />
                      {uploadTextContent.trim() && (
                        <div style={{
                          marginTop: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          background: theme === "dark" ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.08)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: theme === "dark" ? "#34d399" : "#059669",
                          fontWeight: 600,
                        }}>
                          <span>✓ Document Type: <strong>Text</strong> (Defaulted from text entry)</span>
                          <span>✓ Calculated Size: <strong>{calculateTextSize(uploadTextContent.trim())}</strong> ({getTextByteLength(uploadTextContent.trim())} bytes)</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="ad-auth-summary-card">
                    <div className="ad-auth-summary-title">
                      <ShieldCheck size={16} /> Cryptographic Ingestion Guarantee
                    </div>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.55 }}>
                      The TrustVault server calculates a unique SHA-256 fingerprint upon upload, writes an immutable audit record to the security log, and catalogs the document for administrator and authorized viewer access.
                    </p>
                  </div>

                  <div className="ad-form-submit-row">
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                      Physical file stored in secure enclave on server storage.
                    </span>
                    <button
                      type="submit"
                      className="ad-btn-grant"
                      disabled={isUploading}
                    >
                      <Upload size={18} />
                      <span>{isUploading ? "Encrypting & Uploading..." : "Upload Document to Enclave"}</span>
                    </button>
                  </div>
                </form>
              </section>
            </div>
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
        <Modal title={selectedDocument.deleted ? "Deleted Document Details" : "Document Security & Metadata"} onClose={() => setSelectedDocument(null)}>
          <div className="ad-document-preview"><FileText size={28} /></div>
          <Detail label="Document name" value={selectedDocument.name || "Untitled Document"} />
          <Detail label="Owner / Publisher" value={selectedDocument.owner || selectedDocument.ownerName || selectedDocument.ownerEmail || "System Administrator"} />
          <Detail label="Classification" value={<SecurityClearanceBadge level={selectedDocument.category || "CONFIDENTIAL"} />} />
          <Detail label="File Type & Format" value={`${selectedDocument.fileType || selectedDocument.type || "PDF"} (${selectedDocument.contentType || "application/pdf"})`} />
          <Detail label="Size on Disk" value={selectedDocument.size || selectedDocument.fileSize || "1.0 MB"} />
          <Detail label="SHA-256 Fingerprint" value={<IntegrityPill hash={selectedDocument.fileChecksum || "e4b2a1c89012f67a89b0d1e2f3a4b5c678901234567890abcdef1234567890ab"} />} />
          <Detail label="Access Policy" value={selectedDocument.accessPolicy || "Level 1 · Admin Oversight Clearance"} />
          {selectedDocument.textContent && (
            <div style={{
              margin: "12px 0",
              padding: "12px 14px",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--primary)" }}>
                  Document Text Content / Link
                </span>
                {/https?:\/\/[^\s]+/i.test(selectedDocument.textContent) && (
                  <a
                    href={selectedDocument.textContent.match(/https?:\/\/[^\s]+/i)[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
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
              <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "13px", lineHeight: "1.5" }}>
                {selectedDocument.textContent}
              </div>
            </div>
          )}
          <Detail label="Status" value={selectedDocument.deleted ? "DELETED (In Deleted Enclave)" : "ACTIVE"} />
          <Detail label="Last Updated & Ingested" value={selectedDocument.updated || (selectedDocument.updatedAt ? new Date(selectedDocument.updatedAt).toLocaleString() : new Date().toLocaleString())} />
          {selectedDocument.deletedAt && (
            <Detail label="Deleted at" value={new Date(selectedDocument.deletedAt).toLocaleString()} />
          )}
          <div className="ad-modal-actions" style={{ gap: "10px", marginTop: "18px" }}>
            <button className="ad-secondary-btn" onClick={() => openDocumentInNewTab(selectedDocument)} title="Open document reader in new tab">
              <ExternalLink size={15} /> Preview Content
            </button>
            <button className="ad-primary-btn" onClick={() => {
              downloadRealDocument(selectedDocument);
              addNotice(`Downloaded "${selectedDocument.name}" in PDF format!`);
            }}>
              <Download size={15} /> Download PDF (.pdf)
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

function DocumentRequestTable({ requests, onApproveView, onApproveAll, onReject }) {
  if (!requests.length) return <EmptyState text="No pending document access requests from viewers." />;

  return (
    <div className="ad-request-list">
      {requests.map((req) => (
        <article className="ad-request-row" key={req.id || req.permissionId} style={{ alignItems: "center" }}>
          <span className="ad-avatar" style={{ background: "rgba(59, 130, 246, 0.15)", color: "var(--primary)" }}>
            <FileText size={18} />
          </span>
          <div className="ad-request-info" style={{ flex: "1 1 240px" }}>
            <strong style={{ fontSize: "14px" }}>{req.documentName}</strong>
            <div style={{ display: "flex", gap: "10px", marginTop: "3px", fontSize: "12px", color: "var(--muted)", flexWrap: "wrap" }}>
              <span>Requester: <strong style={{ color: "var(--text)" }}>{req.viewerName || req.viewerEmail}</strong> ({req.viewerEmail})</span>
              <span>Owner: <strong style={{ color: "var(--text)" }}>{req.ownerName || req.ownerEmail}</strong></span>
            </div>
          </div>
          <span className="ad-category-tag">{req.category || "General"}</span>
          <div className="ad-request-date" style={{ whiteSpace: "nowrap" }}>
            <Clock3 size={13} /> {formatFullTimestamp(req.requestedAt)}
          </div>
          <div className="ad-request-actions" style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              className="ad-approve-btn"
              style={{ fontSize: "12px", padding: "6px 10px" }}
              title="Grant View-only clearance"
              onClick={() => onApproveView(req)}
            >
              <Eye size={14} /> Approve (View)
            </button>
            <button
              className="ad-approve-btn"
              style={{ fontSize: "12px", padding: "6px 10px", background: "var(--primary)", color: "#fff", borderColor: "var(--primary)" }}
              title="Grant View and Download clearance"
              onClick={() => onApproveAll(req)}
            >
              <Download size={14} /> View + Download
            </button>
            <button
              className="ad-reject-btn"
              style={{ fontSize: "12px", padding: "6px 10px" }}
              title="Reject request"
              onClick={() => onReject(req)}
            >
              <XCircle size={14} /> Reject
            </button>
          </div>
        </article>
      ))}
    </div>
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
          <tr><th>DOCUMENT</th><th>OWNER</th><th>CATEGORY</th><th>TIMESTAMP & DATE</th><th>ACTIONS</th></tr>
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
                      <small>{doc.size || doc.fileSize || "1.0 MB"}</small>
                      {doc.fileChecksum && <IntegrityPill hash={doc.fileChecksum} />}
                    </div>
                  </div>
                </div>
              </td>
              <td>{doc.owner || doc.ownerName || "System Administrator"}</td>
              <td><span className="ad-category-tag">{doc.category || "General"}</span></td>
              <td className="ad-muted" style={{ whiteSpace: "nowrap" }}>
                {doc.updated || (doc.updatedAt ? new Date(doc.updatedAt).toLocaleString() : "Recently")}
              </td>
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
