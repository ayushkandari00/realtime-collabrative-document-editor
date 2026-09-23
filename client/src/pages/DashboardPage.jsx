import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, LayoutGrid, List, FileText, Loader2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DocumentCard from '../components/DocumentCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { documentService } from '../services/documentService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const docType = searchParams.get('type') || 'all';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [creating, setCreating] = useState(false);
  const searchTimer = useRef(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const fetchDocuments = useCallback(async (reset = false) => {
    const currentPage = reset ? 1 : page;
    if (reset) setLoading(true);

    try {
      const { data } = await documentService.getAll({
        search: search || undefined,
        type: docType,
        page: currentPage,
        limit: 12,
      });

      if (reset) {
        setDocuments(data.documents);
        setPage(1);
      } else {
        setDocuments((prev) => [...prev, ...data.documents]);
      }
      setTotal(data.pagination.total);
      setHasMore(currentPage < data.pagination.pages);
    } catch {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, docType, page]);

  useEffect(() => { fetchDocuments(true); }, [docType, search]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore]);

  useEffect(() => { if (page > 1) fetchDocuments(false); }, [page]);

  const handleSearch = (value) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(value), 400);
  };

  const handleDelete = async (docId) => {
    try {
      await documentService.delete(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      setTotal((t) => t - 1);
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { data } = await documentService.create({ title: 'Untitled Document' });
      toast.success('Document created!');
      navigate(`/document/${data.document._id}`);
    } catch {
      toast.error('Failed to create document');
    } finally {
      setCreating(false);
    }
  };

  const typeLabel = {
    all:    'All Documents',
    owned:  'My Documents',
    shared: 'Shared with Me',
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="flex h-screen bg-ink-50 dark:bg-ink-950 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-ink-950 border-b border-ink-200 dark:border-ink-800 px-6 py-3.5 flex items-center gap-4 shrink-0">
          <div className="flex-1">
            <h1 className="text-base font-semibold text-ink-900 dark:text-ink-100">
              {typeLabel[docType] || 'Documents'}
            </h1>
            <p className="text-xs text-ink-400 mt-0.5">
              {total} document{total !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Search */}
          <div className="relative w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search documents…"
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field pl-9 py-2 text-sm"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-ink-100 dark:bg-ink-800 rounded-lg p-0.5">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-all ${view === 'grid'
                ? 'bg-white dark:bg-ink-700 shadow-sm text-primary-600 dark:text-primary-400'
                : 'text-ink-500'}`}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-all ${view === 'list'
                ? 'bg-white dark:bg-ink-700 shadow-sm text-primary-600 dark:text-primary-400'
                : 'text-ink-500'}`}
              title="List view"
            >
              <List size={14} />
            </button>
          </div>

          <button onClick={handleCreate} disabled={creating} className="btn-primary">
            {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            New
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Empty — no documents */}
          {!loading && documents.length === 0 && !search && (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center mx-auto mb-5">
                <FileText size={28} className="text-ink-400 dark:text-ink-500" />
              </div>
              <h2 className="text-lg font-semibold text-ink-800 dark:text-ink-200 mb-1.5">
                {docType === 'shared' ? 'No shared documents yet' : 'No documents yet'}
              </h2>
              <p className="text-sm text-ink-400 mb-7 max-w-xs mx-auto leading-relaxed">
                {docType === 'shared'
                  ? 'Documents shared with you will appear here.'
                  : `Hi ${firstName}! Create your first document and invite others to write with you.`}
              </p>
              {docType !== 'shared' && (
                <button onClick={handleCreate} className="btn-primary">
                  <Plus size={16} />
                  Create Document
                </button>
              )}
            </div>
          )}

          {/* No search results */}
          {!loading && documents.length === 0 && search && (
            <div className="text-center py-20">
              <Search size={36} className="text-ink-300 dark:text-ink-600 mx-auto mb-3" />
              <h2 className="text-base font-semibold text-ink-600 dark:text-ink-400 mb-1">No results for "{search}"</h2>
              <p className="text-sm text-ink-400">Try a different keyword</p>
            </div>
          )}

          {/* Document grid / list */}
          {loading ? (
            <SkeletonLoader type={view} count={6} />
          ) : documents.length > 0 ? (
            <>
              {view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {documents.map((doc, i) => (
                    <DocumentCard key={doc._id} document={doc} onDelete={handleDelete} view="grid" index={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5 max-w-3xl">
                  {documents.map((doc, i) => (
                    <DocumentCard key={doc._id} document={doc} onDelete={handleDelete} view="list" index={i} />
                  ))}
                </div>
              )}

              {/* Infinite scroll trigger */}
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {loadingMore && <Loader2 size={20} className="animate-spin text-primary-500" />}
                {!hasMore && documents.length > 0 && (
                  <p className="text-xs text-ink-400">All documents loaded</p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
