'use client';

import { useState, useRef, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface HotspotRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

interface QuestionFormHotspotProps {
  question: {
    questionText: string;
    imageUrl: string;
    hotspotRegions?: HotspotRegion[];
    marks: number;
    negativeMarks: number;
  };
  onChange: (updates: any) => void;
}

export default function QuestionFormHotspot({ question, onChange }: QuestionFormHotspotProps) {
  const [uploading, setUploading] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentHotspot, setCurrentHotspot] = useState<HotspotRegion | null>(null);
  const [editingLabel, setEditingLabel] = useState<number | null>(null);
  const [hotspotType, setHotspotType] = useState<'point' | 'rectangle' | 'polygon'>('rectangle');
  const [polygonPoints, setPolygonPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [selectedHotspotIndex, setSelectedHotspotIndex] = useState<number | null>(null);
  const [hotspotHistory, setHotspotHistory] = useState<HotspotRegion[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize history when component loads or question changes
  useEffect(() => {
    if (question.hotspotRegions && hotspotHistory.length === 0) {
      const initialHistory = [JSON.parse(JSON.stringify(question.hotspotRegions))];
      setHotspotHistory(initialHistory);
      setHistoryIndex(0);
    }
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      toast.loading('Uploading image...', { id: 'upload-image' });

      // Upload to Cloudinary
      const response = await apiService.uploadImage(file, 'career-master/quiz-images');
      
      if (response.success && response.data?.url) {
        const emptyRegions: HotspotRegion[] = [];
        setHotspotHistory([emptyRegions]);
        setHistoryIndex(0);
        onChange({ imageUrl: response.data.url, hotspotRegions: [] });
        toast.success('Image uploaded successfully!', { id: 'upload-image' });
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image. Please try again.', { id: 'upload-image' });
    } finally {
      setUploading(false);
    }
  };

  const getImageCoordinates = (clientX: number, clientY: number) => {
    if (!imageRef.current || !containerRef.current) return null;
    
    const rect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate relative to image
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Get actual image dimensions (may be scaled)
    const img = imageRef.current;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const displayedWidth = rect.width;
    const displayedHeight = rect.height;
    
    // Calculate scale factors
    const scaleX = naturalWidth / displayedWidth;
    const scaleY = naturalHeight / displayedHeight;
    
    // Convert to natural image coordinates (percentage)
    const percentX = (x / displayedWidth) * 100;
    const percentY = (y / displayedHeight) * 100;
    
    return { x: percentX, y: percentY, scaleX, scaleY, displayedWidth, displayedHeight };
  };

  const handleImageMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    e.preventDefault();
    
    const coords = getImageCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    if (hotspotType === 'polygon') {
      // Add vertex to current polygon
      setPolygonPoints((prev) => [...prev, { x: coords.x, y: coords.y }]);
      return;
    }

    if (hotspotType === 'point') {
      // Create a small fixed-size hotspot around the click point
      const hotspotNumber = (question.hotspotRegions?.length || 0) + 1;
      const size = 5; // 5% width/height
      const newHotspot: HotspotRegion = {
        x: Math.max(0, Math.min(100 - size, coords.x - size / 2)),
        y: Math.max(0, Math.min(100 - size, coords.y - size / 2)),
        width: size,
        height: size,
        label: `Hotspot ${hotspotNumber}`
      };

      const updatedRegions = [...(question.hotspotRegions || []), newHotspot];
      saveToHistory(updatedRegions);
      onChange({ hotspotRegions: updatedRegions });
      setSelectedHotspotIndex(updatedRegions.length - 1);
      setCurrentHotspot(null);
      setStartPoint(null);

      setTimeout(() => {
        setEditingLabel(updatedRegions.length - 1);
      }, 100);
      return;
    }

    // Rectangle mode - start drag
    setStartPoint({ x: coords.x, y: coords.y });
    setCurrentHotspot({
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0,
      label: ''
    });
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    // Only rectangles use drag-to-resize while drawing
    if (hotspotType !== 'rectangle') return;
    if (!startPoint || !imageRef.current) return;
    
    const coords = getImageCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    setCurrentHotspot({
      x: Math.min(startPoint.x, coords.x),
      y: Math.min(startPoint.y, coords.y),
      width: Math.abs(coords.x - startPoint.x),
      height: Math.abs(coords.y - startPoint.y),
      label: ''
    });
  };

  const handleImageMouseUp = (e: React.MouseEvent<HTMLImageElement>) => {
    if (hotspotType !== 'rectangle') return;
    if (!startPoint || !imageRef.current) return;
    
    const coords = getImageCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    // Finish creating hotspot
    const finalX = Math.min(startPoint.x, coords.x);
    const finalY = Math.min(startPoint.y, coords.y);
    const finalWidth = Math.abs(coords.x - startPoint.x);
    const finalHeight = Math.abs(coords.y - startPoint.y);

    // Minimum size for hotspot (2% of image)
    if (finalWidth < 2 || finalHeight < 2) {
      toast.error('Hotspot is too small. Please drag to create a larger area.');
      setStartPoint(null);
      setCurrentHotspot(null);
      return;
    }

    const hotspotNumber = (question.hotspotRegions?.length || 0) + 1;
    const newHotspot: HotspotRegion = {
      x: finalX,
      y: finalY,
      width: finalWidth,
      height: finalHeight,
      label: `Hotspot ${hotspotNumber}`
    };

    const updatedRegions = [...(question.hotspotRegions || []), newHotspot];
    saveToHistory(updatedRegions);
    onChange({ hotspotRegions: updatedRegions });
    
    setStartPoint(null);
    setCurrentHotspot(null);
    setSelectedHotspotIndex(updatedRegions.length - 1);
    
    // Auto-focus the label input for the new hotspot
    setTimeout(() => {
      setEditingLabel(updatedRegions.length - 1);
    }, 100);
  };

  const deleteHotspot = (index: number) => {
    const updatedRegions = (question.hotspotRegions || []).filter((_, i) => i !== index);
    saveToHistory(updatedRegions);
    onChange({ hotspotRegions: updatedRegions });
    if (selectedHotspotIndex === index) {
      setSelectedHotspotIndex(null);
    } else if (selectedHotspotIndex !== null && selectedHotspotIndex > index) {
      setSelectedHotspotIndex(selectedHotspotIndex - 1);
    }
    toast.success('Hotspot deleted');
  };

  const updateHotspotLabel = (index: number, label: string) => {
    const updatedRegions = [...(question.hotspotRegions || [])];
    updatedRegions[index] = { ...updatedRegions[index], label };
    saveToHistory(updatedRegions);
    onChange({ hotspotRegions: updatedRegions });
  };

  const saveToHistory = (regions: HotspotRegion[]) => {
    const newHistory = hotspotHistory.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(regions)));
    setHotspotHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onChange({ hotspotRegions: JSON.parse(JSON.stringify(hotspotHistory[newIndex])) });
    }
  };

  const redo = () => {
    if (historyIndex < hotspotHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onChange({ hotspotRegions: JSON.parse(JSON.stringify(hotspotHistory[newIndex])) });
    }
  };

  const deleteSelectedHotspot = () => {
    if (selectedHotspotIndex !== null) {
      deleteHotspot(selectedHotspotIndex);
      setSelectedHotspotIndex(null);
    }
  };


  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
        <p className="text-xs text-blue-800">
          <strong>Hotspot Question:</strong> Upload an image and create clickable hotspot regions. Students will click on the correct hotspot area to answer the question.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Text *
        </label>
        <textarea
          value={question.questionText || ''}
          onChange={(e) => onChange({ questionText: e.target.value })}
          placeholder="Enter your question about the image hotspots..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image *
        </label>
        <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Instructions:</strong> Upload an image, then click and drag on the image to create hotspot regions. Each hotspot can be renamed below.
          </p>
        </div>
        {question.imageUrl ? (
          <div className="space-y-4">
            {/* Hotspot Controls Bar */}
            <div className="flex items-center justify-between p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700">Hotspot type:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHotspotType('point')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border-2 ${
                      hotspotType === 'point'
                        ? 'border-purple-600 bg-purple-600 text-white shadow-md'
                        : 'border-purple-300 bg-white text-gray-700 hover:bg-purple-50'
                    }`}
                    title="Create point hotspots (single-click on image)"
                  >
                    Point
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHotspotType('rectangle');
                      setPolygonPoints([]);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border-2 ${
                      hotspotType === 'rectangle'
                        ? 'border-purple-600 bg-purple-600 text-white shadow-md'
                        : 'border-purple-300 bg-white text-gray-700 hover:bg-purple-50'
                    }`}
                    title="Create rectangle hotspots (click and drag on image)"
                  >
                    Rectangle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHotspotType('polygon');
                      setStartPoint(null);
                      setCurrentHotspot(null);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border-2 ${
                      hotspotType === 'polygon'
                        ? 'border-purple-600 bg-purple-600 text-white shadow-md'
                        : 'border-purple-300 bg-white text-gray-700 hover:bg-purple-50'
                    }`}
                    title="Draw polygon hotspots by clicking multiple points on the image"
                  >
                    Polygon
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={redo}
                  disabled={historyIndex >= hotspotHistory.length - 1}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={deleteSelectedHotspot}
                  disabled={selectedHotspotIndex === null}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete selected hotspot"
                >
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div 
              ref={containerRef}
              className="relative inline-block border-2 border-purple-300 rounded-lg overflow-visible"
            >
              <img
                ref={imageRef}
                src={question.imageUrl}
                alt="Question image"
                className="max-w-full max-h-96 h-auto block select-none"
                onMouseDown={handleImageMouseDown}
                onMouseMove={handleImageMouseMove}
                onMouseUp={handleImageMouseUp}
                onMouseLeave={() => {
                  if (startPoint) {
                    // Cancel if mouse leaves while creating
                    setStartPoint(null);
                    setCurrentHotspot(null);
                  }
                }}
                style={{ cursor: 'crosshair' }}
                draggable={false}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                }}
              />
              
              {/* Render existing hotspots */}
              {question.hotspotRegions?.map((hotspot, index) => {
                if (!imageRef.current) return null;
                const isSelected = selectedHotspotIndex === index;
                
                return (
                  <div
                    key={index}
                    className={`absolute border-2 cursor-pointer transition-all shadow-lg z-10 ${
                      isSelected 
                        ? 'border-purple-600 bg-purple-400 bg-opacity-50' 
                        : 'border-purple-500 bg-purple-300 bg-opacity-40 hover:bg-opacity-50'
                    }`}
                    style={{
                      left: `${hotspot.x}%`,
                      top: `${hotspot.y}%`,
                      width: `${hotspot.width}%`,
                      height: `${hotspot.height}%`,
                      pointerEvents: 'auto'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHotspotIndex(index);
                    }}
                  >
                    {/* Resize handles */}
                    {isSelected && (
                      <>
                        {/* Corner handles */}
                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border-2 border-purple-600 rounded-sm cursor-nwse-resize" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-purple-600 rounded-sm cursor-nesw-resize" />
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-2 border-purple-600 rounded-sm cursor-nesw-resize" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-purple-600 rounded-sm cursor-nwse-resize" />
                        {/* Midpoint handles */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-purple-600 rounded-sm cursor-ns-resize" />
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-purple-600 rounded-sm cursor-ns-resize" />
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-purple-600 rounded-sm cursor-ew-resize" />
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-purple-600 rounded-sm cursor-ew-resize" />
                      </>
                    )}
                    
                    {/* Correct label */}
                    <div className="absolute -top-8 left-0 bg-white border border-gray-300 rounded shadow-md px-2 py-1 flex items-center gap-2 z-20 whitespace-nowrap">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-semibold text-gray-700">Correct</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHotspot(index);
                        }}
                        className="ml-1 text-red-600 hover:text-red-700"
                        type="button"
                        title="Delete hotspot"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Render current hotspot being created */}
              {currentHotspot && imageRef.current && (
                <div
                  className="absolute border-2 border-purple-600 bg-purple-400 bg-opacity-50 border-dashed shadow-lg z-10"
                  style={{
                    left: `${currentHotspot.x}%`,
                    top: `${currentHotspot.y}%`,
                    width: `${currentHotspot.width}%`,
                    height: `${currentHotspot.height}%`,
                    pointerEvents: 'none'
                  }}
                />
              )}

              {/* Render polygon outline while drawing in polygon mode */}
              {hotspotType === 'polygon' && polygonPoints.length > 0 && imageRef.current && (
                <svg
                  className="absolute inset-0 pointer-events-none z-20"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="rgba(168, 85, 247, 0.25)" /* purple-500 with opacity */
                    stroke="rgba(147, 51, 234, 1)" /* purple-600 */
                    strokeWidth={0.8}
                  />
                  {polygonPoints.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={1.2}
                      fill="#ffffff"
                      stroke="rgba(147, 51, 234, 1)"
                      strokeWidth={0.6}
                    />
                  ))}
                </svg>
              )}
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <button
                type="button"
                onClick={() => onChange({ imageUrl: '', hotspotRegions: [] })}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Remove Image
              </button>
              {hotspotType === 'polygon' && polygonPoints.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      // Finish polygon: convert to bounding box hotspot
                      const minX = Math.max(0, Math.min(...polygonPoints.map(p => p.x)));
                      const maxX = Math.min(100, Math.max(...polygonPoints.map(p => p.x)));
                      const minY = Math.max(0, Math.min(...polygonPoints.map(p => p.y)));
                      const maxY = Math.min(100, Math.max(...polygonPoints.map(p => p.y)));
                      const width = Math.max(2, maxX - minX);
                      const height = Math.max(2, maxY - minY);

                      const hotspotNumber = (question.hotspotRegions?.length || 0) + 1;
                      const newHotspot: HotspotRegion = {
                        x: minX,
                        y: minY,
                        width,
                        height,
                        label: `Hotspot ${hotspotNumber}`
                      };

                      const updatedRegions = [...(question.hotspotRegions || []), newHotspot];
                      saveToHistory(updatedRegions);
                      onChange({ hotspotRegions: updatedRegions });
                      setSelectedHotspotIndex(updatedRegions.length - 1);
                      setPolygonPoints([]);
                      setTimeout(() => {
                        setEditingLabel(updatedRegions.length - 1);
                      }, 100);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                  >
                    Finish Polygon
                  </button>
                  <button
                    type="button"
                    onClick={() => setPolygonPoints([])}
                    className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-xs font-medium"
                  >
                    Cancel Polygon
                  </button>
                </>
              )}
            </div>

            {/* Hotspot list */}
            {question.hotspotRegions && question.hotspotRegions.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Hotspot Names ({question.hotspotRegions.length})
                </h4>
                <p className="text-xs text-gray-600 mb-3">
                  <strong>Rename your hotspots:</strong> Click and drag on the image to create more hotspots. Each hotspot can be given a custom name below.
                </p>
                <div className="space-y-3">
                  {question.hotspotRegions.map((hotspot, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Hotspot {index + 1} Name:
                        </label>
                        <input
                          type="text"
                          value={hotspot.label ?? ''}
                          onChange={(e) => updateHotspotLabel(index, e.target.value)}
                          placeholder={`Enter name for hotspot ${index + 1}`}
                          className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          autoFocus={editingLabel === index}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Position: {hotspot.x.toFixed(1)}%, {hotspot.y.toFixed(1)}% | Size: {hotspot.width.toFixed(1)}% × {hotspot.height.toFixed(1)}%
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteHotspot(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        title="Delete this hotspot"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                  <strong>Note:</strong> All hotspots are considered correct answers. Students must click on any of these highlighted areas to answer correctly.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="hotspot-image-upload"
              disabled={uploading}
            />
            <label
              htmlFor="hotspot-image-upload"
              className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <span className="text-sm text-gray-600 font-medium">Uploading image...</span>
                </>
              ) : (
                <>
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-600 font-medium">Click to upload image</span>
                  <span className="text-xs text-gray-500">Supports: JPG, PNG, GIF, WebP (Max 10MB)</span>
                </>
              )}
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marks *
          </label>
          <input
            type="number"
            value={question.marks || 1}
            onChange={(e) => onChange({ marks: parseInt(e.target.value) || 1 })}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Negative Marks
          </label>
          <input
            type="number"
            value={question.negativeMarks || 0}
            onChange={(e) => onChange({ negativeMarks: parseFloat(e.target.value) || 0 })}
            min="0"
            step="0.25"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
    </div>
  );
}

