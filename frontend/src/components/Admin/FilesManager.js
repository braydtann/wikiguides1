import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Search, 
  Folder, 
  File, 
  Image, 
  FileText,
  Film,
  Music,
  Archive,
  MoreHorizontal,
  Plus,
  FolderPlus,
  Calendar,
  User,
  Download,
  Trash2,
  Edit,
  Star,
  Grid,
  List
} from 'lucide-react';

const FilesManager = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('home');
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const fileInputRef = useRef(null);

  // Mock data based on Helpjuice Files Manager screenshot
  const folders = [
    { id: 'editor-uploads', name: 'Editor Uploads', count: 958 },
    { id: 'helpjuice-uploads', name: 'Helpjuice-uploads', count: 1 }
  ];

  const recentFiles = [
    { 
      id: 1, 
      name: 'Medical_Bracelet_Product_R...', 
      type: 'image',
      size: '1.2 MB',
      linkedTo: 9,
      modifiedDate: '3 months',
      modifiedBy: 'Jordan Dean',
      thumbnail: '/api/placeholder/150/100'
    },
    { 
      id: 2, 
      name: 'New_Flood_Freeze_Sensor_O...', 
      type: 'document',
      size: '845 KB',
      linkedTo: 0,
      modifiedDate: '3 months',
      modifiedBy: 'Jordan Dean'
    },
    { 
      id: 3, 
      name: 'Skybell_Cameras_App_Com...', 
      type: 'document',
      size: '2.1 MB',
      linkedTo: 0,
      modifiedDate: '3 months',
      modifiedBy: 'Jordan Dean'
    },
    { 
      id: 4, 
      name: 'Temporary_Key_Fob_Backlit...', 
      type: 'document',
      size: '1.8 MB',
      linkedTo: 0,
      modifiedDate: '3 months',
      modifiedBy: 'Jordan Dean'
    },
    { 
      id: 5, 
      name: 'Alula_Dealer_Portal_Changes...', 
      type: 'document',
      size: '756 KB',
      linkedTo: 0,
      modifiedDate: '4 months',
      modifiedBy: 'Naomi Ramirez'
    }
  ];

  const allFiles = [
    ...folders.map(folder => ({ ...folder, type: 'folder' })),
    { 
      id: 'c-logo', 
      name: 'C_logo_- Copy.png', 
      type: 'image', 
      size: '8.58 KB',
      modifiedDate: '8 months',
      modifiedBy: 'Jordan Dean',
      linkedTo: 0
    },
    { 
      id: 'cove-logo', 
      name: 'Cove_Logo_Green_2023.png', 
      type: 'image', 
      size: '33.8 KB',
      modifiedDate: '8 months',
      modifiedBy: 'Jordan Dean',
      linkedTo: 0
    },
    { 
      id: 'alula-changes', 
      name: 'Alula_Dealer_Portal_Changes_09132024.pdf', 
      type: 'document', 
      size: '242 KB',
      modifiedDate: '4 months',
      modifiedBy: 'Naomi Ramirez',
      linkedTo: 0
    },
    { 
      id: 'aldesa-leadership', 
      name: 'Aldesa_Leadership_Structure_08192024.pdf', 
      type: 'document', 
      size: '62.6 KB',
      modifiedDate: '4 months',
      modifiedBy: 'Naomi Ramirez',
      linkedTo: 0
    }
  ];

  const storageInfo = {
    used: 322,
    total: 1024,
    percentage: 0
  };

  const getFileIcon = (type, size = 'h-5 w-5') => {
    switch (type) {
      case 'folder':
        return <Folder className={`${size} text-blue-500`} />;
      case 'image':
        return <Image className={`${size} text-green-500`} />;
      case 'document':
        return <FileText className={`${size} text-red-500`} />;
      case 'video':
        return <Film className={`${size} text-purple-500`} />;
      case 'audio':
        return <Music className={`${size} text-yellow-500`} />;
      case 'archive':
        return <Archive className={`${size} text-gray-500`} />;
      default:
        return <File className={`${size} text-gray-500`} />;
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    console.log('Selected files:', files);
    // Handle file upload logic here
  };

  const toggleFileSelection = (fileId) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const filteredFiles = allFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cove's Files</h3>
            <span className="text-sm text-gray-500">1228</span>
          </div>
        </div>

        {/* Folder Navigation */}
        <div className="mb-6">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors mb-1 ${
                selectedFolder === folder.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <Folder className="h-4 w-4 mr-2" />
                <span>{folder.name}</span>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {folder.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mb-6">
          <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg mb-1">
            <Star className="h-4 w-4 mr-2" />
            Recent Files
          </button>
          <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg mb-1">
            <Image className="h-4 w-4 mr-2" />
            Images
            <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">1051</span>
          </button>
          <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg mb-1">
            <Film className="h-4 w-4 mr-2" />
            Videos
            <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">1</span>
          </button>
          <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg mb-1">
            <FileText className="h-4 w-4 mr-2" />
            Documents
            <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">176</span>
          </button>
          <button className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 className="h-4 w-4 mr-2" />
            Recently Deleted
            <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">2</span>
          </button>
        </div>

        {/* Storage Usage */}
        <div className="mt-auto">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Archive className="h-4 w-4 mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Storage Used</span>
            </div>
            <div className="text-xs text-gray-600 mb-2">
              {storageInfo.percentage}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${storageInfo.percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {storageInfo.used} MB of Data
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Files Manager</h1>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                <span>Home</span>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleFileUpload}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload New File
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search folders and files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Suggested Files */}
        {searchQuery === '' && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Suggested</h3>
            <div className="grid grid-cols-5 gap-4">
              {recentFiles.slice(0, 5).map((file) => (
                <div key={file.id} className="text-center group cursor-pointer">
                  <div className="w-24 h-16 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {file.thumbnail ? (
                      <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      getFileIcon(file.type, 'h-8 w-8')
                    )}
                  </div>
                  <p className="text-xs text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">Linked to {file.linkedTo} articles</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main File Area */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">File name</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">File size</span>
              <span className="text-sm text-gray-600">Type</span>
              <span className="text-sm text-gray-600">Date Modified</span>
              <span className="text-sm text-gray-600">Used In</span>
              <span className="text-sm text-gray-600">Last Modifier</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="bg-white rounded-lg border border-gray-200">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 group"
              >
                <div className="flex items-center flex-1">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.id)}
                    onChange={() => toggleFileSelection(file.id)}
                    className="mr-3 rounded"
                  />
                  {getFileIcon(file.type)}
                  <span className="ml-3 font-medium text-gray-900">{file.name}</span>
                </div>
                
                <div className="flex items-center space-x-8 text-sm text-gray-500">
                  <span className="w-16 text-center">{file.size || '—'}</span>
                  <span className="w-16 text-center capitalize">{file.type}</span>
                  <span className="w-20 text-center">{file.modifiedDate}</span>
                  <span className="w-12 text-center">{file.linkedTo !== undefined ? file.linkedTo : '—'}</span>
                  <span className="w-24 text-center">{file.modifiedBy || '—'}</span>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Download className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-200 rounded">
                      <MoreHorizontal className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  );
};

export default FilesManager;