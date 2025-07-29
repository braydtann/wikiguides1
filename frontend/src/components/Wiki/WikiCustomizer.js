import React, { useState, useEffect } from 'react';
import { useWiki } from '../../contexts/WikiContext';
import { useAuth } from '../../contexts/AuthContext';
import PublicWikiView from './PublicWikiView';
import { 
  Settings, 
  Palette, 
  Layout, 
  Image, 
  Type, 
  Monitor, 
  Smartphone,
  Eye,
  Save,
  RotateCcw,
  Upload,
  X,
  Plus,
  Trash2,
  Move,
  Grid3X3,
  List,
  Columns,
  Square,
  Circle
} from 'lucide-react';

const WikiCustomizer = () => {
  const { selectedWiki, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('appearance');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showPreview, setShowPreview] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const [customSettings, setCustomSettings] = useState({
    theme: {
      primaryColor: '#0891b2',
      backgroundColor: '#ffffff',
      headerColor: '#0891b2',
      textColor: '#1f2937',
      accentColor: '#06b6d4',
      darkMode: false
    },
    layout: {
      showHeader: true,
      showBreadcrumbs: true,
      showSearch: true,
      headerStyle: 'professional',
      categoryLayout: 'grid',
      showIcons: true,
      showDescriptions: true,
      maxWidth: 'full', // full, container, narrow
      spacing: 'normal' // tight, normal, spacious
    },
    branding: {
      logo: null,
      companyName: selectedWiki?.name || 'Knowledge Base',
      headerLinks: [
        { name: 'Home', href: '/' },
        { name: 'Contact Us', href: '/contact' }
      ],
      favicon: null
    },
    typography: {
      fontFamily: 'Inter',
      headingSize: 'normal',
      bodySize: 'normal',
      lineHeight: 'normal'
    },
    categories: {
      iconStyle: 'rounded', // rounded, square, circle
      iconSize: 'normal', // small, normal, large
      showCount: true,
      showDescription: true,
      hoverEffect: true
    }
  });

  // Mark as changed when settings are modified
  useEffect(() => {
    setUnsavedChanges(true);
  }, [customSettings]);

  const updateSetting = (path, value) => {
    setCustomSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const addHeaderLink = () => {
    const newLink = { name: 'New Link', href: '#' };
    updateSetting('branding.headerLinks', [...customSettings.branding.headerLinks, newLink]);
  };

  const updateHeaderLink = (index, field, value) => {
    const newLinks = [...customSettings.branding.headerLinks];
    newLinks[index][field] = value;
    updateSetting('branding.headerLinks', newLinks);
  };

  const removeHeaderLink = (index) => {
    const newLinks = customSettings.branding.headerLinks.filter((_, i) => i !== index);
    updateSetting('branding.headerLinks', newLinks);
  };

  const handleSave = async () => {
    try {
      // In a real app, this would save to backend
      console.log('Saving customization settings:', customSettings);
      setUnsavedChanges(false);
      // Could show success toast here
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleReset = () => {
    // Reset to default settings
    setCustomSettings({
      theme: {
        primaryColor: '#0891b2',
        backgroundColor: '#ffffff',
        headerColor: '#0891b2',
        textColor: '#1f2937',
        accentColor: '#06b6d4',
        darkMode: false
      },
      layout: {
        showHeader: true,
        showBreadcrumbs: true,
        showSearch: true,
        headerStyle: 'professional',
        categoryLayout: 'grid',
        showIcons: true,
        showDescriptions: true,
        maxWidth: 'full',
        spacing: 'normal'
      },
      branding: {
        logo: null,
        companyName: selectedWiki?.name || 'Knowledge Base',
        headerLinks: [
          { name: 'Home', href: '/' },
          { name: 'Contact Us', href: '/contact' }
        ],
        favicon: null
      },
      typography: {
        fontFamily: 'Inter',
        headingSize: 'normal',
        bodySize: 'normal',
        lineHeight: 'normal'
      },
      categories: {
        iconStyle: 'rounded',
        iconSize: 'normal',
        showCount: true,
        showDescription: true,
        hoverEffect: true
      }
    });
    setUnsavedChanges(false);
  };

  const renderAppearanceTab = () => (
    <div className="space-y-8">
      {/* Color Scheme */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Color Scheme
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customSettings.theme.primaryColor}
                onChange={(e) => updateSetting('theme.primaryColor', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={customSettings.theme.primaryColor}
                onChange={(e) => updateSetting('theme.primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Accent Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customSettings.theme.accentColor}
                onChange={(e) => updateSetting('theme.accentColor', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={customSettings.theme.accentColor}
                onChange={(e) => updateSetting('theme.accentColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Background Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customSettings.theme.backgroundColor}
                onChange={(e) => updateSetting('theme.backgroundColor', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={customSettings.theme.backgroundColor}
                onChange={(e) => updateSetting('theme.backgroundColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Text Color</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customSettings.theme.textColor}
                onChange={(e) => updateSetting('theme.textColor', e.target.value)}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <input
                type="text"
                value={customSettings.theme.textColor}
                onChange={(e) => updateSetting('theme.textColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Type className="h-5 w-5 mr-2" />
          Typography
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Font Family</label>
            <select
              value={customSettings.typography.fontFamily}
              onChange={(e) => updateSetting('typography.fontFamily', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Heading Size</label>
            <select
              value={customSettings.typography.headingSize}
              onChange={(e) => updateSetting('typography.headingSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="small">Small</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Body Text Size</label>
            <select
              value={customSettings.typography.bodySize}
              onChange={(e) => updateSetting('typography.bodySize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="small">Small</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Line Height</label>
            <select
              value={customSettings.typography.lineHeight}
              onChange={(e) => updateSetting('typography.lineHeight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLayoutTab = () => (
    <div className="space-y-8">
      {/* Header Settings */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Layout className="h-5 w-5 mr-2" />
          Header Settings
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={customSettings.layout.showHeader}
                onChange={(e) => updateSetting('layout.showHeader', e.target.checked)}
                className="rounded"
              />
              <span>Show Header</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={customSettings.layout.showSearch}
                onChange={(e) => updateSetting('layout.showSearch', e.target.checked)}
                className="rounded"
              />
              <span>Show Search Bar</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Header Style</label>
            <select
              value={customSettings.layout.headerStyle}
              onChange={(e) => updateSetting('layout.headerStyle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="professional">Professional</option>
              <option value="minimal">Minimal</option>
              <option value="branded">Branded</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Width</label>
            <select
              value={customSettings.layout.maxWidth}
              onChange={(e) => updateSetting('layout.maxWidth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="narrow">Narrow</option>
              <option value="container">Container</option>
              <option value="full">Full Width</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Layout */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Grid3X3 className="h-5 w-5 mr-2" />
          Category Layout
        </h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <button
            onClick={() => updateSetting('layout.categoryLayout', 'grid')}
            className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
              customSettings.layout.categoryLayout === 'grid'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Grid3X3 className="h-6 w-6" />
            <span className="text-sm">Grid</span>
          </button>

          <button
            onClick={() => updateSetting('layout.categoryLayout', 'list')}
            className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
              customSettings.layout.categoryLayout === 'list'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <List className="h-6 w-6" />
            <span className="text-sm">List</span>
          </button>

          <button
            onClick={() => updateSetting('layout.categoryLayout', 'cards')}
            className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-colors ${
              customSettings.layout.categoryLayout === 'cards'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Columns className="h-6 w-6" />
            <span className="text-sm">Cards</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={customSettings.layout.showIcons}
                onChange={(e) => updateSetting('layout.showIcons', e.target.checked)}
                className="rounded"
              />
              <span>Show Category Icons</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={customSettings.layout.showDescriptions}
                onChange={(e) => updateSetting('layout.showDescriptions', e.target.checked)}
                className="rounded"
              />
              <span>Show Descriptions</span>
            </label>
          </div>
        </div>
      </div>

      {/* Category Icon Settings */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Category Icon Settings</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Icon Style</label>
            <div className="flex space-x-2">
              <button
                onClick={() => updateSetting('categories.iconStyle', 'square')}
                className={`p-2 border-2 rounded transition-colors ${
                  customSettings.categories.iconStyle === 'square'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <Square className="h-4 w-4" />
              </button>
              <button
                onClick={() => updateSetting('categories.iconStyle', 'rounded')}
                className={`p-2 border-2 rounded transition-colors ${
                  customSettings.categories.iconStyle === 'rounded'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
              </button>
              <button
                onClick={() => updateSetting('categories.iconStyle', 'circle')}
                className={`p-2 border-2 rounded transition-colors ${
                  customSettings.categories.iconStyle === 'circle'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <Circle className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Icon Size</label>
            <select
              value={customSettings.categories.iconSize}
              onChange={(e) => updateSetting('categories.iconSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="small">Small</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={customSettings.categories.hoverEffect}
                onChange={(e) => updateSetting('categories.hoverEffect', e.target.checked)}
                className="rounded"
              />
              <span>Hover Effects</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBrandingTab = () => (
    <div className="space-y-8">
      {/* Logo & Company */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Image className="h-5 w-5 mr-2" />
          Logo & Branding
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <input
              type="text"
              value={customSettings.branding.companyName}
              onChange={(e) => updateSetting('branding.companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Logo</label>
            <div className="flex items-center space-x-4">
              {customSettings.branding.logo ? (
                <div className="flex items-center space-x-2">
                  <img src={customSettings.branding.logo} alt="Logo" className="h-12 w-12 object-contain" />
                  <button
                    onClick={() => updateSetting('branding.logo', null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                    <Upload className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      // In a real app, this would upload the file
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => updateSetting('branding.logo', e.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header Links */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Header Navigation Links</h3>
          <button
            onClick={addHeaderLink}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Link</span>
          </button>
        </div>

        <div className="space-y-3">
          {customSettings.branding.headerLinks.map((link, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <Move className="h-4 w-4 text-gray-400 cursor-move" />
              <input
                type="text"
                value={link.name}
                onChange={(e) => updateHeaderLink(index, 'name', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Link Name"
              />
              <input
                type="text"
                value={link.href}
                onChange={(e) => updateHeaderLink(index, 'href', e.target.value)}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Link URL"
              />
              <button
                onClick={() => removeHeaderLink(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'layout', name: 'Layout', icon: Layout },
    { id: 'branding', name: 'Branding', icon: Image }
  ];

  if (!hasPermission('wiki:write')) {
    return (
      <div className="text-center py-12">
        <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-500">You don't have permission to customize this wiki.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-sm border-r min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Wiki Customizer</h2>
            <p className="text-sm text-gray-600">Customize the appearance and layout of your public wiki</p>
          </div>

          {/* Navigation Tabs */}
          <nav className="p-4">
            <div className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Preview Controls */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Preview Mode</span>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-1 rounded ${
                    previewMode === 'desktop' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-1 rounded ${
                    previewMode === 'mobile' ? 'bg-white shadow-sm' : ''
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowPreview(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>Preview Changes</span>
            </button>
          </div>

          {/* Save/Reset */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={!unsavedChanges}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {unsavedChanges && (
              <p className="text-xs text-orange-600 mt-2">You have unsaved changes</p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl">
            {activeTab === 'appearance' && renderAppearanceTab()}
            {activeTab === 'layout' && renderLayoutTab()}
            {activeTab === 'branding' && renderBrandingTab()}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`bg-white rounded-lg shadow-xl overflow-hidden ${
            previewMode === 'mobile' ? 'w-96 h-[80vh]' : 'w-full max-w-6xl h-[80vh]'
          }`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="h-full overflow-auto">
              <PublicWikiView customSettings={customSettings} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WikiCustomizer;