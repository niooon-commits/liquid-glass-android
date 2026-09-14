import React, { useState } from 'react';
import { MaterialSymbol } from './MaterialSymbol';

export interface WebDownloadItem {
  id: string;
  fileName: string;
  fileSize: string;
  fileSizeBytes: number;
  date: string;
  dateGroup: 'Today' | 'Yesterday' | 'Earlier this month';
  category: 'All' | 'Images' | 'Pages & Docs' | 'Audio' | 'Videos' | 'Other';
  sourceUrl: string;
  domain: string;
  mimeType: string;
  status: 'completed' | 'downloading' | 'paused' | 'failed';
  progress?: number;
  downloadSpeed?: string;
}

const INITIAL_DOWNLOADS: WebDownloadItem[] = [
  {
    id: 'dl-1',
    fileName: 'liquid-glass-browser-v1.2.0.apk',
    fileSize: '24.8 MB',
    fileSizeBytes: 26004684,
    date: 'Today, 10:45 AM',
    dateGroup: 'Today',
    category: 'Other',
    sourceUrl: 'https://github.com/niooon-commits/liquid-glass-android',
    domain: 'github.com',
    mimeType: 'application/vnd.android.package-archive',
    status: 'completed',
  },
  {
    id: 'dl-2',
    fileName: 'chromium-engine-architecture.pdf',
    fileSize: '3.4 MB',
    fileSizeBytes: 3565158,
    date: 'Today, 09:15 AM',
    dateGroup: 'Today',
    category: 'Pages & Docs',
    sourceUrl: 'https://chromium.googlesource.com/specs',
    domain: 'chromium.googlesource.com',
    mimeType: 'application/pdf',
    status: 'completed',
  },
  {
    id: 'dl-3',
    fileName: 'google-material-symbols-pack.zip',
    fileSize: '18.2 MB',
    fileSizeBytes: 19084083,
    date: 'Today, 08:30 AM',
    dateGroup: 'Today',
    category: 'Other',
    sourceUrl: 'https://fonts.google.com/icons',
    domain: 'fonts.google.com',
    mimeType: 'application/zip',
    status: 'downloading',
    progress: 0.68,
    downloadSpeed: '2.4 MB/s',
  },
  {
    id: 'dl-4',
    fileName: 'amoled-aurora-minimalist.png',
    fileSize: '4.2 MB',
    fileSizeBytes: 4404019,
    date: 'Yesterday, 04:20 PM',
    dateGroup: 'Yesterday',
    category: 'Images',
    sourceUrl: 'https://unsplash.com/photos/aurora-lake',
    domain: 'unsplash.com',
    mimeType: 'image/png',
    status: 'completed',
  },
  {
    id: 'dl-5',
    fileName: 'android-14-developer-preview.mp4',
    fileSize: '62.4 MB',
    fileSizeBytes: 65431142,
    date: 'Yesterday, 02:10 PM',
    dateGroup: 'Yesterday',
    category: 'Videos',
    sourceUrl: 'https://developer.android.com/videos/compose',
    domain: 'developer.android.com',
    mimeType: 'video/mp4',
    status: 'completed',
  },
  {
    id: 'dl-6',
    fileName: 'lofi-focus-beats-ambient.mp3',
    fileSize: '8.6 MB',
    fileSizeBytes: 9017753,
    date: 'Earlier this month',
    dateGroup: 'Earlier this month',
    category: 'Audio',
    sourceUrl: 'https://archive.org/audio/focus-beats',
    domain: 'archive.org',
    mimeType: 'audio/mpeg',
    status: 'completed',
  },
];

const CATEGORIES: ('All' | 'Images' | 'Pages & Docs' | 'Audio' | 'Videos' | 'Other')[] = [
  'All',
  'Images',
  'Pages & Docs',
  'Audio',
  'Videos',
  'Other',
];

interface ChromeDownloadsViewProps {
  onBack?: () => void;
}

export const ChromeDownloadsView: React.FC<ChromeDownloadsViewProps> = ({ onBack }) => {
  const [downloads, setDownloads] = useState<WebDownloadItem[]>(INITIAL_DOWNLOADS);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Images' | 'Pages & Docs' | 'Audio' | 'Videos' | 'Other'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  const [activeItemMenuId, setActiveItemMenuId] = useState<string | null>(null);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setFeedbackToast(message);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const filteredDownloads = downloads.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.domain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedByDate: Record<string, WebDownloadItem[]> = {
    Today: filteredDownloads.filter((i) => i.dateGroup === 'Today'),
    Yesterday: filteredDownloads.filter((i) => i.dateGroup === 'Yesterday'),
    'Earlier this month': filteredDownloads.filter((i) => i.dateGroup === 'Earlier this month'),
  };

  const handleTogglePause = (id: string) => {
    setDownloads((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'downloading' ? 'paused' : 'downloading';
          showToast(nextStatus === 'paused' ? 'Download paused' : 'Download resumed');
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handleDelete = (id: string, fileName: string) => {
    setDownloads((prev) => prev.filter((i) => i.id !== id));
    setActiveItemMenuId(null);
    showToast(`Removed "${fileName}"`);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setActiveItemMenuId(null);
    showToast('Download link copied to clipboard');
  };

  const handleClearAll = () => {
    setDownloads([]);
    setShowOverflowMenu(false);
    showToast('All downloads cleared');
  };

  const handleSimulateDownload = () => {
    const id = `dl-${Date.now()}`;
    const newItem: WebDownloadItem = {
      id,
      fileName: `niooon-release-v${Math.floor(Math.random() * 10 + 1)}.${Math.floor(Math.random() * 9)}.apk`,
      fileSize: '32.1 MB',
      fileSizeBytes: 33659289,
      date: 'Today, Just now',
      dateGroup: 'Today',
      category: 'Other',
      sourceUrl: 'https://github.com/niooon-commits/liquid-glass-android',
      domain: 'github.com',
      mimeType: 'application/vnd.android.package-archive',
      status: 'completed',
    };
    setDownloads((prev) => [newItem, ...prev]);
    showToast(`Downloaded ${newItem.fileName}`);
  };

  const getCategoryIconInfo = (item: WebDownloadItem) => {
    if (item.category === 'Other') {
      if (item.fileName.endsWith('.apk')) {
        return { name: 'android', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      }
      return { name: 'folder', bg: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
    if (item.category === 'Pages & Docs') return { name: 'description', bg: 'bg-rose-50 text-rose-600 border-rose-200' };
    if (item.category === 'Images') return { name: 'image', bg: 'bg-sky-50 text-sky-600 border-sky-200' };
    if (item.category === 'Videos') return { name: 'movie', bg: 'bg-purple-50 text-purple-600 border-purple-200' };
    if (item.category === 'Audio') return { name: 'music_note', bg: 'bg-amber-50 text-amber-600 border-amber-200' };
    return { name: 'download', bg: 'bg-blue-50 text-blue-600 border-blue-200' };
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Chrome Downloads Header Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
        {isSearchActive ? (
          <div className="h-16 px-4 flex items-center gap-3">
            <button
              onClick={() => {
                setIsSearchActive(false);
                setSearchQuery('');
              }}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
              aria-label="Back"
            >
              <MaterialSymbol name="arrow_back" size={24} />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                autoFocus
                placeholder="Search downloads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-3 text-slate-800 placeholder-slate-400 bg-transparent text-base outline-hidden"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                aria-label="Clear query"
              >
                <MaterialSymbol name="close" size={20} />
              </button>
            )}
          </div>
        ) : (
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
                  aria-label="Back"
                >
                  <MaterialSymbol name="arrow_back" size={24} />
                </button>
              )}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                  <MaterialSymbol name="download" size={20} />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-medium text-slate-900 leading-tight">Downloads</h1>
                  <span className="text-xs text-slate-500 hidden sm:inline">Google Chrome style file manager</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={handleSimulateDownload}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
              >
                <MaterialSymbol name="add" size={16} />
                <span>Simulate Download</span>
              </button>

              <button
                onClick={() => setIsSearchActive(true)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
                aria-label="Search"
                title="Search downloads"
              >
                <MaterialSymbol name="search" size={22} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
                  aria-label="More options"
                >
                  <MaterialSymbol name="more_vert" size={22} />
                </button>

                {showOverflowMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        setShowOverflowMenu(false);
                        setShowStorageModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <MaterialSymbol name="info" size={18} className="text-sky-600" />
                      <span>Storage details</span>
                    </button>
                    <button
                      onClick={handleSimulateDownload}
                      className="sm:hidden w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <MaterialSymbol name="add" size={18} className="text-emerald-600" />
                      <span>New download test</span>
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                    >
                      <MaterialSymbol name="delete" size={18} className="text-rose-600" />
                      <span>Clear all downloads</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chrome Storage Information Header */}
        <div className="bg-slate-100/90 px-4 sm:px-6 py-2 flex items-center justify-between border-t border-slate-200 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <MaterialSymbol name="folder" size={16} className="text-slate-500" />
            <span className="font-medium text-slate-700">Downloads</span>
            <span>•</span>
            <span>12.4 GB of 64 GB used</span>
          </div>
          <div className="w-24 sm:w-32 bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-sky-600 h-full rounded-full" style={{ width: '19%' }} />
          </div>
        </div>

        {/* Filter Chips Bar (Chrome Style) */}
        <div className="bg-white px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-slate-100">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-sky-100 text-sky-800 border border-sky-300 font-semibold shadow-2xs'
                    : 'bg-slate-100/80 text-slate-600 border border-slate-200/80 hover:bg-slate-200/70'
                }`}
              >
                {isSelected && <MaterialSymbol name="check_circle" size={14} className="text-sky-700" />}
                {category}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {filteredDownloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-4 border border-sky-100 shadow-xs">
              <MaterialSymbol name="download" size={40} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              {searchQuery ? 'No matching downloads' : 'Files you download appear here'}
            </h2>
            <p className="text-sm text-slate-500 max-w-xs mt-1">
              {searchQuery
                ? 'Try searching with another keyword or file name.'
                : 'You can download documents, APKs, images, and videos while browsing the web.'}
            </p>
            {downloads.length === 0 && (
              <button
                onClick={() => setDownloads(INITIAL_DOWNLOADS)}
                className="mt-5 px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <MaterialSymbol name="refresh" size={18} />
                <span>Restore Sample Downloads</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([dateGroup, items]) => {
              if (items.length === 0) return null;
              return (
                <section key={dateGroup} className="space-y-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">
                    {dateGroup}
                  </h3>

                  <div className="space-y-2">
                    {items.map((item) => {
                      const iconInfo = getCategoryIconInfo(item);
                      const isMenuOpen = activeItemMenuId === item.id;

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all p-3 sm:p-3.5 flex flex-col gap-2 relative"
                        >
                          <div className="flex items-center gap-3">
                            {/* File Type Badge Icon */}
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${iconInfo.bg}`}
                            >
                              <MaterialSymbol name={iconInfo.name} size={24} />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-slate-900 truncate" title={item.fileName}>
                                {item.fileName}
                              </h4>
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                <span className="font-medium text-slate-600">{item.fileSize}</span>
                                <span className="mx-1.5">•</span>
                                <span>{item.domain}</span>
                                <span className="mx-1.5">•</span>
                                <span>{item.date}</span>
                              </p>
                            </div>

                            {/* Active Action / 3-Dot Menu */}
                            <div className="flex items-center gap-1 shrink-0">
                              {(item.status === 'downloading' || item.status === 'paused') && (
                                <button
                                  onClick={() => handleTogglePause(item.id)}
                                  className="p-1.5 rounded-lg text-sky-700 hover:bg-sky-50 transition-colors"
                                  title={item.status === 'downloading' ? 'Pause' : 'Resume'}
                                >
                                  <MaterialSymbol
                                    name={item.status === 'downloading' ? 'pause' : 'play_arrow'}
                                    size={20}
                                  />
                                </button>
                              )}

                              <div className="relative">
                                <button
                                  onClick={() => setActiveItemMenuId(isMenuOpen ? null : item.id)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                                  aria-label="Item actions"
                                >
                                  <MaterialSymbol name="more_vert" size={20} />
                                </button>

                                {isMenuOpen && (
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                                    <button
                                      onClick={() => {
                                        setActiveItemMenuId(null);
                                        showToast(`Opened ${item.fileName}`);
                                      }}
                                      className="w-full px-3.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                      <MaterialSymbol name="folder" size={16} className="text-sky-600" />
                                      <span>Open file</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setActiveItemMenuId(null);
                                        showToast(`Sharing ${item.fileName}`);
                                      }}
                                      className="w-full px-3.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                      <MaterialSymbol name="share" size={16} className="text-slate-600" />
                                      <span>Share link</span>
                                    </button>
                                    <button
                                      onClick={() => handleCopyLink(item.sourceUrl)}
                                      className="w-full px-3.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                      <MaterialSymbol name="content_copy" size={16} className="text-slate-600" />
                                      <span>Copy link address</span>
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item.id, item.fileName)}
                                      className="w-full px-3.5 py-1.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                    >
                                      <MaterialSymbol name="delete" size={16} className="text-rose-600" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Live Downloading Progress Bar */}
                          {(item.status === 'downloading' || item.status === 'paused') && (
                            <div className="pt-1">
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    item.status === 'downloading' ? 'bg-sky-600' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${(item.progress || 0) * 100}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 font-medium">
                                <span className={item.status === 'downloading' ? 'text-sky-700' : 'text-amber-700'}>
                                  {item.status === 'downloading'
                                    ? `Downloading... ${Math.round((item.progress || 0) * 100)}%`
                                    : 'Paused'}
                                </span>
                                {item.downloadSpeed && item.status === 'downloading' && (
                                  <span>{item.downloadSpeed}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Storage Details Modal */}
      {showStorageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-700 font-medium">
                <MaterialSymbol name="folder" size={22} />
                <h3 className="text-base font-semibold text-slate-900">Download Storage</h3>
              </div>
              <button
                onClick={() => setShowStorageModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <MaterialSymbol name="close" size={20} />
              </button>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p className="text-xs text-slate-500">Location: /Download/NIOOON</p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Storage Used</span>
                  <span className="text-slate-900 font-semibold">12.4 GB / 64 GB (19%)</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-600 h-full rounded-full" style={{ width: '19%' }} />
                </div>
                <div className="text-[11px] text-slate-500">51.6 GB available for new downloads</div>
              </div>
              <div className="text-xs text-slate-500 flex justify-between">
                <span>Total files in library:</span>
                <span className="font-medium text-slate-700">{downloads.length} files</span>
              </div>
            </div>

            <button
              onClick={() => setShowStorageModal(false)}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {feedbackToast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-150">
          <MaterialSymbol name="check_circle" size={16} className="text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}
    </div>
  );
};
