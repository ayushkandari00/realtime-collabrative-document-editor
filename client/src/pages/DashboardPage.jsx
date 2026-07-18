import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, LayoutGrid, List, FileText, Loader2, RefreshCw, Filter } from 'lucide-react';
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

  // Initial load + when type/search changes
  useEffect(() => {
    fetchDocuments(true);
  }, [docType, search]);

  // Infinite scroll observer
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

  // Load more when page changes
  useEffect(() => {
    if (page > 1) fetchDocuments(false);
  }, [page]);

  const handleSearch = (value) => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearch(value);
    }, 400);
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

  const typeLabel = { all: 'All Documents', owned: 'My Documents', shared: 'Shared with Me' };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-4 shrink-0">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {typeLabel[docType] || 'Documents'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {total} document{total !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Search */}
          <div className="relative w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field pl-10 py-2 text-sm"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500'}`}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500'}`}
              title="List view"
            >
              <List size={15} />
            </button>
          </div>

          <button onClick={handleCreate} disabled={creating} className="btn-primary">
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            New
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Welcome banner (first time / empty) */}
          {!loading && documents.length === 0 && !search && (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/40 dark:to-indigo-900/40 flex items-center justify-center mx-auto mb-6">
                <FileText size={40} className="text-primary-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                {docType === 'shared' ? 'No shared documents' : 'Create your first document'}
              </h2>
              <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                {docType === 'shared'
                  ? "Documents shared with you will appear here."
                  : "Start writing, collaborate in real-time, and keep all your work in one place."}
              </p>
              {docType !== 'shared' && (
                <button onClick={handleCreate} className="btn-primary">
                  <Plus size={18} />
                  Create Document
                </button>
              )}
            </div>
          )}

          {/* No search results */}
          {!loading && documents.length === 0 && search && (
            <div className="text-center py-20">
              <Search size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No results found</h2>
              <p className="text-sm text-slate-400">Try a different search term</p>
            </div>
          )}

          {/* Documents grid/list */}
          {loading ? (
            <SkeletonLoader type={view} count={6} />
          ) : documents.length > 0 ? (
            <>
              {view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {documents.map((doc) => (
                    <DocumentCard key={doc._id} document={doc} onDelete={handleDelete} view="grid" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-w-4xl">
                  {documents.map((doc) => (
                    <DocumentCard key={doc._id} document={doc} onDelete={handleDelete} view="list" />
                  ))}
                </div>
              )}

              {/* Infinite scroll trigger */}
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {loadingMore && (
                  <Loader2 size={24} className="animate-spin text-primary-500" />
                )}
                {!hasMore && documents.length > 0 && (
                  <p className="text-xs text-slate-400">All documents loaded</p>
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
