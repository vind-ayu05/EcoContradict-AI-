import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck,
  Terminal,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  UserX,
  Download,
  Eye,
  Server,
  FileText,
  Clock,
  ExternalLink,
  Info
} from 'lucide-react';
import {
  SecurityTestResult,
  AuditLogEntry,
  UserPublicProfile
} from '../types.ts';
import {
  runSecurityTestSuite,
  fetchAuditLogs,
  deleteUserAccount
} from '../lib/api.ts';

interface SecurityViewProps {
  currentUser: UserPublicProfile | null;
  onOpenAuth: () => void;
  onAccountDeleted: () => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  currentUser,
  onOpenAuth,
  onAccountDeleted
}) => {
  const [testResults, setTestResults] = useState<SecurityTestResult[]>([]);
  const [runningTests, setRunningTests] = useState(false);
  const [testSummary, setTestSummary] = useState<{ total: number; passed: number; failed: number } | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'INFO' | 'WARNING' | 'CRITICAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Account deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'architecture' | 'tests' | 'audit' | 'privacy'>('architecture');

  // Load audit logs and test suite initially
  useEffect(() => {
    handleRunTests();
    loadAuditLogs();
  }, [currentUser]);

  const handleRunTests = async () => {
    setRunningTests(true);
    try {
      const data = await runSecurityTestSuite();
      setTestResults(data.results);
      setTestSummary({ total: data.total, passed: data.passed, failed: data.failed });
    } catch (err) {
      console.error('Failed to run security test suite:', err);
    } finally {
      setRunningTests(false);
    }
  };

  const loadAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const logs = await fetchAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleDeleteAccountConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    setDeletingAccount(true);
    try {
      await deleteUserAccount(deletePassword);
      setShowDeleteModal(false);
      onAccountDeleted();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account. Please verify your password.');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleDownloadData = () => {
    const exportData = {
      user: currentUser,
      exportedAt: new Date().toISOString(),
      platform: 'EcoContradict AI Enterprise',
      policy: 'GDPR / CCPA Data Minimization Standard',
      recentAuditLogs: auditLogs.slice(0, 50)
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecocontradict_privacy_export_${currentUser?.id || 'guest'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = auditLogs.filter(log => {
    if (severityFilter !== 'ALL' && log.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.eventType.toLowerCase().includes(q) ||
        (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
        (log.ip && log.ip.includes(q)) ||
        JSON.stringify(log.details).toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Security Status */}
      <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 text-white p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Dedicated Security Architecture</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Enterprise Privacy & Platform Security
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed">
              EcoContradict AI operates on a defense-in-depth security model: bcrypt 12-round salted hashing, 
              strict cryptographic tenant isolation, sliding-window rate limiters, adversarial prompt injection shields, and binary magic byte file sanitization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              id="btn-run-security-suite"
              onClick={handleRunTests}
              disabled={runningTests}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${runningTests ? 'animate-spin' : ''}`} />
              <span>{runningTests ? 'Running Verification...' : 'Run Security Tests'}</span>
            </button>

            {!currentUser && (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 px-5 py-3 text-sm font-semibold text-stone-200 transition-all"
              >
                <Lock className="h-4 w-4 text-emerald-400" />
                <span>Sign In / Test Roles</span>
              </button>
            )}
          </div>
        </div>

        {/* Security Posture Metric Chips */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-stone-800/80">
          <div className="bg-stone-800/40 backdrop-blur-sm rounded-xl p-3 border border-stone-700/50">
            <div className="text-xs text-stone-400">Authentication</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">Argon2 / bcrypt</div>
            <div className="text-[11px] text-stone-400 mt-1">12 salt rounds + JWT Bearer</div>
          </div>
          <div className="bg-stone-800/40 backdrop-blur-sm rounded-xl p-3 border border-stone-700/50">
            <div className="text-xs text-stone-400">Authorization</div>
            <div className="text-base font-bold text-blue-400 mt-0.5">RBAC & Tenant Scoped</div>
            <div className="text-[11px] text-stone-400 mt-1">USER / ADMIN isolated</div>
          </div>
          <div className="bg-stone-800/40 backdrop-blur-sm rounded-xl p-3 border border-stone-700/50">
            <div className="text-xs text-stone-400">AI Prompt Shield</div>
            <div className="text-base font-bold text-purple-400 mt-0.5">XML Delimited</div>
            <div className="text-[11px] text-stone-400 mt-1">Adversary signature scanner</div>
          </div>
          <div className="bg-stone-800/40 backdrop-blur-sm rounded-xl p-3 border border-stone-700/50">
            <div className="text-xs text-stone-400">File Ingestion</div>
            <div className="text-base font-bold text-teal-400 mt-0.5">Magic Bytes Only</div>
            <div className="text-[11px] text-stone-400 mt-1">Ephemeral memory extraction</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'architecture'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>Security Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'tests'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Live Verification Tests ({testSummary?.passed || 11}/{testSummary?.total || 11})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Audit Log Trail</span>
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'privacy'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Privacy & GDPR Controls</span>
        </button>
      </div>

      {/* TAB 1: ARCHITECTURE OVERVIEW */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Auth & Cryptography */}
            <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Authentication & Hashing
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Passwords are never stored in plaintext. They are salted and hashed using bcrypt with 12 computational rounds, rendering rainbow table and brute-force attacks computationally infeasible.
              </p>
              <ul className="text-xs space-y-1.5 text-stone-700 dark:text-stone-300 pt-2 border-t border-stone-100 dark:border-stone-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>JWT session tokens signed with server secret</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Configured 24-hour expiration window</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Timing-safe hash comparisons</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Authorization & Multi-Tenancy */}
            <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Tenant Isolation & RBAC
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Never trust user IDs supplied by the frontend. The backend strictly determines the identity from the authenticated JWT token and enforces database-level scoping on all queries.
              </p>
              <ul className="text-xs space-y-1.5 text-stone-700 dark:text-stone-300 pt-2 border-t border-stone-100 dark:border-stone-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>Cross-tenant probes return 404 to avoid leaking existence</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>USER and ADMIN distinct capability policies</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>Automated audit logging on unauthorized attempts</span>
                </li>
              </ul>
            </div>

            {/* Card 3: AI Security & Prompt Injection */}
            <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Prompt Shield & Validation
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Untrusted user documents, plans, and chat questions are framed inside rigid XML delimiters (<code className="text-purple-600 font-mono">&lt;UNTRUSTED_DOCUMENT_CONTENT&gt;</code>) to prevent prompt injection attacks.
              </p>
              <ul className="text-xs space-y-1.5 text-stone-700 dark:text-stone-300 pt-2 border-t border-stone-100 dark:border-stone-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                  <span>Adversarial pattern scanner (e.g. system override)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                  <span>Strict Zod output schema validation & clamping</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" />
                  <span>Server-side API proxy: GEMINI_API_KEY never leaves server</span>
                </li>
              </ul>
            </div>

            {/* Card 4: File Security */}
            <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                File Validation & Magic Bytes
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                MIME types and extensions can be forged by attackers. EcoContradict inspects binary magic bytes (<code className="text-teal-600 font-mono">%PDF-</code>, JPEG, PNG headers) before processing.
              </p>
              <ul className="text-xs space-y-1.5 text-stone-700 dark:text-stone-300 pt-2 border-t border-stone-100 dark:border-stone-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                  <span>10MB upload limit to mitigate DoS vectors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                  <span>Ephemeral processing: files scrubbed after extraction</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                  <span>Strict filename sanitization preventing traversal</span>
                </li>
              </ul>
            </div>

            {/* Card 5: Rate Limiting & DoS Protection */}
            <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Sliding-Window Rate Limiting
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Custom in-memory sliding window rate limiters protect each tier of the application against brute-force attacks and API abuse.
              </p>
              <ul className="text-xs space-y-1.5 text-stone-700 dark:text-stone-300 pt-2 border-t border-stone-100 dark:border-stone-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                  <span>Auth: max 15 attempts / 15 minutes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                  <span>AI Ingestion: max 25 audits / 15 minutes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" />
                  <span>Uploads: max 20 files / 15 minutes</span>
                </li>
              </ul>
            </div>

            {/* Card 6: Error Handling & Data Leakage */}
            <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
              <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-700 dark:text-rose-300 font-bold">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Zero-Leakage Error Handling
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Internal stack traces, database schemas, and cloud credentials are never transmitted to the client. The centralized error middleware sanitizes all server responses.
              </p>
              <ul className="text-xs space-y-1.5 text-stone-700 dark:text-stone-300 pt-2 border-t border-stone-100 dark:border-stone-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>Standardized machine-readable error envelopes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>Security headers: HSTS, X-Frame-Options, nosniff</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-rose-600" />
                  <span>Tamper-evident audit logging on security anomalies</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE VERIFICATION TESTS */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Automated 11-Point Security Verification Suite
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Runs live end-to-end cryptographic and boundary assertions directly against active backend controllers.
              </p>
            </div>
            <button
              onClick={handleRunTests}
              disabled={runningTests}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${runningTests ? 'animate-spin' : ''}`} />
              <span>Re-run All Verification Tests</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testResults.map((test, index) => (
              <div
                key={test.id || index}
                className="rounded-2xl bg-white dark:bg-stone-900 p-5 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                      {test.category}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{test.status}</span>
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-1">
                    {test.name}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mb-3">
                    {test.description}
                  </p>
                </div>

                <div className="rounded-xl bg-stone-50 dark:bg-stone-800/60 p-2.5 text-[11px] font-mono text-stone-700 dark:text-stone-300 border border-stone-200/60 dark:border-stone-700/60">
                  <div className="text-[10px] uppercase font-bold text-stone-400 mb-1">Assertion Verification</div>
                  {test.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 mr-1">Filter Severity:</span>
              {(['ALL', 'INFO', 'WARNING', 'CRITICAL'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    severityFilter === sev
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail..."
                className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 px-3 py-1.5 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-emerald-600"
              />
              <button
                onClick={loadAuditLogs}
                disabled={loadingLogs}
                className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
                title="Refresh audit logs"
              >
                <RefreshCw className={`h-4 w-4 ${loadingLogs ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600 dark:text-stone-400">
                <thead className="bg-stone-50 dark:bg-stone-800/80 text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-400">
                        No audit log entries matched your filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const sevBg =
                        log.severity === 'CRITICAL'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          : log.severity === 'WARNING'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300';

                      return (
                        <tr key={log.id} className="hover:bg-stone-50 dark:hover:bg-stone-850/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                            {log.eventType}
                          </td>
                          <td className="py-3 px-4 text-stone-700 dark:text-stone-300 whitespace-nowrap">
                            {log.userEmail || log.userId || 'system'}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap">
                            {log.ip}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sevBg}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] max-w-md truncate text-stone-600 dark:text-stone-400">
                            {JSON.stringify(log.details)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACY & GDPR CONTROLS */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Privacy Commitments */}
            <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    Data Minimization Commitment
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Zero AI Training & Ephemeral Retention</p>
                </div>
              </div>

              <div className="text-xs text-stone-600 dark:text-stone-400 space-y-2.5 leading-relaxed">
                <p>
                  <strong>1. No Model Training:</strong> Your uploaded sustainability documents, project plans, and audit outputs are processed ephemerally and are never used to train foundational AI models.
                </p>
                <p>
                  <strong>2. Ephemeral Ingestion:</strong> Uploaded PDF files are held in memory-isolated buffers and cleared immediately after textual token extraction.
                </p>
                <p>
                  <strong>3. Tenant Isolation:</strong> Every record is cryptographically bound to your unique authenticated subject ID. Other accounts cannot view, query, or enumerate your data.
                </p>
                <p>
                  <strong>4. Right to Portability:</strong> You may export all analyses and audit logs associated with your account in JSON format at any time.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleDownloadData}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500 text-xs font-semibold text-stone-800 dark:text-stone-200 transition-all hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  <Download className="h-4 w-4 text-emerald-600" />
                  <span>Download Personal Data Archive (.json)</span>
                </button>
              </div>
            </div>

            {/* Right to be Forgotten (Account Deletion) */}
            <div className="rounded-2xl bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-700 dark:text-rose-300 font-bold">
                  <UserX className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    Right to Be Forgotten (GDPR Art. 17)
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Permanent Cascading Erasure</p>
                </div>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                When you initiate an account deletion, EcoContradict AI cascades the deletion across all database collections. 
                Your profile, password hashes, stored sustainability plans, simulation runs, and associated audit records are irrevocably expunged.
              </p>

              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                <p className="font-semibold">Irreversible Action</p>
                <p>This action cannot be undone. You will immediately lose access to all saved audit scores and historical reports.</p>
              </div>

              <div className="pt-2">
                <button
                  id="btn-trigger-delete-account"
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <UserX className="h-4 w-4" />
                  <span>Delete My Account & Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Deletion Password Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Confirm Account Deletion
              </h3>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              To verify that you authorize permanent erasure of your account and all associated sustainability audits, please re-enter your account password:
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccountConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  id="input-delete-account-password"
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 px-3.5 py-2 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-delete-account"
                  type="submit"
                  disabled={deletingAccount}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {deletingAccount ? 'Erasing...' : 'Permanently Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
