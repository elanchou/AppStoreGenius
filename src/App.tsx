import React, { useState, useRef } from 'react';
import { ScreenshotData, AppDetails, TemplateConfig, TemplateLayout } from './types';
import { generateScreenshotAssets } from './services/ai';
import { ScreenshotCanvas } from './components/ScreenshotCanvas';
import { Upload, Sparkles, Download, Loader2, Layout, Type, Palette } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useDropzone } from 'react-dropzone';

const DEFAULT_SCREENSHOTS: ScreenshotData[] = [
  {
    id: '1',
    title: 'Welcome to Your App',
    subtitle: 'The best way to do something amazing.',
    appImage: null,
    template: {
      id: 't1',
      name: 'Default',
      layout: 'text-top',
      background: 'bg-gradient-to-br from-zinc-900 to-zinc-800',
      titleColor: '#ffffff',
      subtitleColor: '#a1a1aa',
      fontFamily: 'Inter',
    }
  },
  {
    id: '2',
    title: 'Track Your Progress',
    subtitle: 'See how far you have come with detailed analytics.',
    appImage: null,
    template: {
      id: 't2',
      name: 'Split',
      layout: 'split-left',
      background: 'bg-gradient-to-br from-indigo-900 to-indigo-800',
      titleColor: '#ffffff',
      subtitleColor: '#c7d2fe',
      fontFamily: 'Space Grotesk',
    }
  },
  {
    id: '3',
    title: 'Stay Connected',
    subtitle: 'Share your achievements with friends and family.',
    appImage: null,
    template: {
      id: 't3',
      name: 'Angled',
      layout: 'angled-right',
      background: 'bg-gradient-to-br from-emerald-900 to-emerald-800',
      titleColor: '#ffffff',
      subtitleColor: '#a7f3d0',
      fontFamily: 'Outfit',
    }
  }
];

export default function App() {
  const [appDetails, setAppDetails] = useState<AppDetails>({
    name: '',
    description: '',
    targetAudience: '',
    keyFeatures: []
  });
  
  const [screenshots, setScreenshots] = useState<ScreenshotData[]>(DEFAULT_SCREENSHOTS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeId, setActiveId] = useState<string>(DEFAULT_SCREENSHOTS[0].id);
  const [globalImage, setGlobalImage] = useState<string | null>(null);
  const [isPanorama, setIsPanorama] = useState(false);

  const activeScreenshot = screenshots.find(s => s.id === activeId) || screenshots[0];

  const handleGenerate = async () => {
    if (!appDetails.description) return;
    setIsGenerating(true);
    try {
      const assets = await generateScreenshotAssets(appDetails.description);
      
      const newScreenshots: ScreenshotData[] = assets.screenshots.map((s, i) => {
        const bgHex = assets.palette[s.backgroundIndex] || assets.palette[0] || '#18181b';
        // Determine text color based on background brightness (simple heuristic: if it's a dark color, use white text)
        // For simplicity, we'll assume the AI generates a cohesive palette. Let's just use white for now, or let user edit.
        const isDarkBg = true; // We can improve this
        
        return {
          id: `gen-${i}`,
          title: s.title,
          subtitle: s.subtitle,
          appImage: globalImage, // apply previously uploaded image if any
          template: {
            id: `t-${i}`,
            name: `Template ${i}`,
            layout: s.layout,
            background: bgHex,
            titleColor: '#ffffff',
            subtitleColor: 'rgba(255,255,255,0.8)',
            fontFamily: assets.fontFamily || 'Inter',
          }
        };
      });
      
      setScreenshots(newScreenshots);
      setActiveId(newScreenshots[0].id);
    } catch (error) {
      console.error("Failed to generate assets:", error);
      alert("Failed to generate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportAll = async () => {
    // We need to render them at full scale off-screen to export properly
    // For now, let's export the currently visible ones by finding their DOM nodes
    for (const screenshot of screenshots) {
      const el = document.getElementById(`screenshot-${screenshot.id}`);
      if (el) {
        const canvas = await html2canvas(el, { scale: 2, useCORS: true });
        const link = document.createElement('a');
        link.download = `screenshot-${screenshot.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    }
  };

  const updateActiveScreenshot = (updates: Partial<ScreenshotData>) => {
    setScreenshots(prev => prev.map(s => s.id === activeId ? { ...s, ...updates } : s));
  };

  const updateActiveTemplate = (updates: Partial<TemplateConfig>) => {
    setScreenshots(prev => prev.map(s => s.id === activeId ? { ...s, template: { ...s.template, ...updates } } : s));
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setGlobalImage(result);
        updateActiveScreenshot({ appImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  // @ts-ignore - react-dropzone types conflict with React 19
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp']
    },
    multiple: false
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800/50 flex items-center justify-between px-6 shrink-0 bg-zinc-950/50 backdrop-blur-xl z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-semibold text-lg tracking-tight">AppStoreGenius</h1>
        </div>
        <button 
          onClick={handleExportAll}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-medium text-sm hover:bg-zinc-200 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export All
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - AI & Data */}
        <aside className="w-80 border-r border-zinc-800/50 bg-zinc-900/20 flex flex-col overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">AI Generation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-zinc-300">App Description</label>
                  <textarea 
                    value={appDetails.description}
                    onChange={e => setAppDetails({...appDetails, description: e.target.value})}
                    placeholder="e.g. A meditation app for busy professionals that helps them relax in 5 minutes..."
                    className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none placeholder:text-zinc-600"
                  />
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !appDetails.description}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-xl font-medium text-sm transition-all shadow-lg shadow-indigo-500/20"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGenerating ? 'Designing...' : 'Auto-Generate Design'}
                </button>
              </div>
            </div>

            <div className="h-px bg-zinc-800/50" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Upload Screenshot</h2>
                {globalImage && (
                  <button 
                    onClick={() => setScreenshots(prev => prev.map(s => ({ ...s, appImage: globalImage })))}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Apply to All
                  </button>
                )}
              </div>
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-6 h-6 mx-auto mb-3 text-zinc-500" />
                <p className="text-sm text-zinc-400">Drag & drop app screenshot here, or click to select</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 flex flex-col relative bg-zinc-950 overflow-hidden">
          {/* Canvas */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-12 relative">
            {/* Background grid pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            {/* The actual screenshot being edited */}
            <div className="relative group">
              {/* We render it at full size but scale it down with CSS for viewing */}
              <div className="scale-[0.65] origin-center shadow-2xl ring-1 ring-white/10 rounded-3xl overflow-hidden transition-transform duration-500 hover:scale-[0.67]">
                <div id={`screenshot-${activeScreenshot.id}`}>
                  <ScreenshotCanvas 
                    data={activeScreenshot} 
                    index={screenshots.findIndex(s => s.id === activeId)} 
                    total={screenshots.length} 
                    isPanorama={isPanorama} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Thumbnails */}
          <div className="h-40 border-t border-zinc-800/50 bg-zinc-900/50 p-4 flex items-center gap-4 overflow-x-auto">
            {screenshots.map((s, i) => (
              <div key={s.id} className="relative h-full aspect-[1284/2778] shrink-0 group">
                <button
                  onClick={() => setActiveId(s.id)}
                  className={`w-full h-full rounded-lg overflow-hidden border-2 transition-all ${
                    activeId === s.id ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-transparent hover:border-zinc-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="absolute inset-0 origin-top-left scale-[0.15] w-[414px] h-[896px] pointer-events-none">
                    <ScreenshotCanvas 
                      data={s} 
                      index={i} 
                      total={screenshots.length} 
                      isPanorama={isPanorama} 
                    />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[10px] font-medium text-white truncate">
                    {i + 1}. {s.title}
                  </div>
                </button>
                {screenshots.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const newScreenshots = screenshots.filter(x => x.id !== s.id);
                      setScreenshots(newScreenshots);
                      if (activeId === s.id) setActiveId(newScreenshots[0].id);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => {
                const newId = `new-${Date.now()}`;
                setScreenshots([...screenshots, {
                  ...screenshots[screenshots.length - 1],
                  id: newId,
                  title: 'New Screenshot',
                  subtitle: 'Describe your feature here.'
                }]);
                setActiveId(newId);
              }}
              className="h-full aspect-[1284/2778] shrink-0 rounded-lg border-2 border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                +
              </div>
              <span className="text-xs font-medium">Add</span>
            </button>
          </div>
        </main>

        {/* Right Sidebar - Editor */}
        <aside className="w-80 border-l border-zinc-800/50 bg-zinc-900/20 flex flex-col overflow-y-auto">
          <div className="p-6 space-y-8">
            <div>
              <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Type className="w-4 h-4" /> Content
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-zinc-400">Title</label>
                  <input 
                    type="text"
                    value={activeScreenshot.title}
                    onChange={e => updateActiveScreenshot({ title: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-zinc-400">Subtitle</label>
                  <textarea 
                    value={activeScreenshot.subtitle}
                    onChange={e => updateActiveScreenshot({ subtitle: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-800/50" />

            <div>
              <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4" /> Layout
              </h2>
              
              <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-3 mb-4">
                <span className="text-xs font-medium text-zinc-300">Continuous Panorama</span>
                <button 
                  onClick={() => setIsPanorama(!isPanorama)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${isPanorama ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPanorama ? 'left-5' : 'left-1'}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(['text-top', 'text-bottom', 'split-left', 'split-right', 'angled-right', 'panorama-right', 'panorama-left'] as TemplateLayout[]).map(layout => (
                  <button
                    key={layout}
                    onClick={() => updateActiveTemplate({ layout })}
                    className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
                      activeScreenshot.template.layout === layout 
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    {layout.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-zinc-800/50" />

            <div>
              <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4" /> Style
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-zinc-400">Background (Hex or Class)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={activeScreenshot.template.background}
                      onChange={e => updateActiveTemplate({ background: e.target.value })}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    {activeScreenshot.template.background.startsWith('#') && (
                      <div 
                        className="w-10 h-10 rounded-lg border border-zinc-700 shrink-0"
                        style={{ backgroundColor: activeScreenshot.template.background }}
                      />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-zinc-400">Title Color</label>
                    <input 
                      type="color"
                      value={activeScreenshot.template.titleColor.startsWith('#') ? activeScreenshot.template.titleColor : '#ffffff'}
                      onChange={e => updateActiveTemplate({ titleColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer bg-zinc-900 border border-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-zinc-400">Subtitle Color</label>
                    <input 
                      type="color"
                      value={activeScreenshot.template.subtitleColor.startsWith('#') ? activeScreenshot.template.subtitleColor : '#a1a1aa'}
                      onChange={e => updateActiveTemplate({ subtitleColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer bg-zinc-900 border border-zinc-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-zinc-400">Font Family</label>
                  <select
                    value={activeScreenshot.template.fontFamily}
                    onChange={e => updateActiveTemplate({ fontFamily: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Space Grotesk">Space Grotesk</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Outfit">Outfit</option>
                    <option value="system-ui">System UI</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}

