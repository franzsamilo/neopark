"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Undo,
  Redo,
  Grid,
  Car,
  Route,
  AlertTriangle,
  Lightbulb,
  Trees,
  Building,
  Trash2,
  Square,
  RotateCw,
  Copy,
  Clipboard,
} from "lucide-react";
import { ParkingLot, LayoutElement, Size } from "@/constants/types/parking";
import { SpotType, LayoutElementType } from "@/constants/enums/parking";

export default function CreateParkingLayoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parkingLotId = searchParams.get("id");

  const [parkingLot, setParkingLot] = useState<ParkingLot | null>(null);
  const [layoutElements, setLayoutElements] = useState<LayoutElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<LayoutElement | null>(
    null
  );
  const [selectedTool, setSelectedTool] = useState<LayoutElementType>(
    LayoutElementType.PARKING_SPACE
  );
  const [gridSize, setGridSize] = useState(20);
  const [history, setHistory] = useState<LayoutElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  const [copiedElement, setCopiedElement] = useState<LayoutElement | null>(
    null
  );

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!parkingLotId) {
      router.push("/admin");
      return;
    }

    const loadParkingLot = async () => {
      try {
        const response = await fetch(`/api/parking-lot/${parkingLotId}`);
        if (response.ok) {
          const lot = await response.json();
          setParkingLot(lot);
          setLayoutElements(lot.layoutElements || []);
          addToHistory(lot.layoutElements || []);
        } else {
          console.error("Failed to load parking lot");
          router.push("/admin");
        }
      } catch (error) {
        console.error("Error loading parking lot:", error);
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };

    loadParkingLot();
  }, [parkingLotId, router]);

  const addToHistory = (elements: LayoutElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLayoutElements([...history[historyIndex - 1]]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLayoutElements([...history[historyIndex + 1]]);
    }
  };

  const snapToGrid = (value: number) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!parkingLot || isDragging || isResizing || isRotating) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = snapToGrid(event.clientX - rect.left);
    const y = snapToGrid(event.clientY - rect.top);

    const newElement: LayoutElement = {
      id: `temp-${Date.now()}`,
      parkingLotId: parkingLot.id,
      elementType: selectedTool,
      position: { x, y },
      size: getDefaultSize(selectedTool),
      rotation: 0,
      properties: getDefaultProperties(selectedTool),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newElements = [...layoutElements, newElement];
    setLayoutElements(newElements);
    addToHistory(newElements);
    setSelectedElement(newElement);
  };

  const handleElementMouseDown = (
    event: React.MouseEvent,
    element: LayoutElement
  ) => {
    event.stopPropagation();

    if (event.target instanceof HTMLElement) {
      const target = event.target as HTMLElement;

      if (target.classList.contains("resize-handle")) {
        setIsResizing(true);
        setResizeHandle(target.dataset.handle || null);
        setSelectedElement(element);
        return;
      }

      if (target.classList.contains("rotate-handle")) {
        setIsRotating(true);
        setSelectedElement(element);
        return;
      }
    }

    setIsDragging(true);
    setSelectedElement(element);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: event.clientX - rect.left - element.position.x,
        y: event.clientY - rect.top - element.position.y,
      });
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!canvasRef.current || !selectedElement) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (isDragging && dragOffset) {
      const newX = snapToGrid(mouseX - dragOffset.x);
      const newY = snapToGrid(mouseY - dragOffset.y);

      const updatedElement = {
        ...selectedElement,
        position: { x: newX, y: newY },
      };

      const newElements = layoutElements.map((e) =>
        e.id === selectedElement.id ? updatedElement : e
      );
      setLayoutElements(newElements);
      setSelectedElement(updatedElement);
    }

    if (isResizing && resizeHandle) {
      const currentElement = layoutElements.find(
        (e) => e.id === selectedElement.id
      );
      if (!currentElement) return;

      const newSize = { ...currentElement.size };

      switch (resizeHandle) {
        case "se":
          newSize.width = Math.max(
            20,
            snapToGrid(mouseX - currentElement.position.x)
          );
          newSize.height = Math.max(
            20,
            snapToGrid(mouseY - currentElement.position.y)
          );
          break;
        case "sw":
          const newWidth = Math.max(
            20,
            snapToGrid(
              currentElement.position.x + currentElement.size.width - mouseX
            )
          );
          newSize.width = newWidth;
          newSize.height = Math.max(
            20,
            snapToGrid(mouseY - currentElement.position.y)
          );
          break;
        case "ne":
          newSize.width = Math.max(
            20,
            snapToGrid(mouseX - currentElement.position.x)
          );
          const newHeight = Math.max(
            20,
            snapToGrid(
              currentElement.position.y + currentElement.size.height - mouseY
            )
          );
          newSize.height = newHeight;
          break;
        case "nw":
          const newWidthNW = Math.max(
            20,
            snapToGrid(
              currentElement.position.x + currentElement.size.width - mouseX
            )
          );
          const newHeightNW = Math.max(
            20,
            snapToGrid(
              currentElement.position.y + currentElement.size.height - mouseY
            )
          );
          newSize.width = newWidthNW;
          newSize.height = newHeightNW;
          break;
      }

      const updatedElement = {
        ...currentElement,
        size: newSize,
      };

      const newElements = layoutElements.map((e) =>
        e.id === selectedElement.id ? updatedElement : e
      );
      setLayoutElements(newElements);
      setSelectedElement(updatedElement);
    }

    if (isRotating) {
      const centerX =
        selectedElement.position.x + selectedElement.size.width / 2;
      const centerY =
        selectedElement.position.y + selectedElement.size.height / 2;

      const angle =
        (Math.atan2(mouseY - centerY, mouseX - centerX) * 180) / Math.PI;
      const snappedAngle = Math.round(angle / 15) * 15; // Snap to 15-degree increments

      const updatedElement = {
        ...selectedElement,
        rotation: snappedAngle,
      };

      const newElements = layoutElements.map((e) =>
        e.id === selectedElement.id ? updatedElement : e
      );
      setLayoutElements(newElements);
      setSelectedElement(updatedElement);
    }
  };

  const handleMouseUp = () => {
    if (isDragging || isResizing || isRotating) {
      addToHistory(layoutElements);
    }
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setDragOffset(null);
    setResizeHandle(null);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!selectedElement) return;

    switch (event.key) {
      case "Delete":
      case "Backspace":
        handleElementDelete(selectedElement.id);
        break;
      case "c":
        if (event.ctrlKey || event.metaKey) {
          setCopiedElement(selectedElement);
        }
        break;
      case "v":
        if (event.ctrlKey || (event.metaKey && copiedElement)) {
          handlePaste();
        }
        break;
      case "Escape":
        setSelectedElement(null);
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    selectedElement,
    layoutElements,
    isDragging,
    isResizing,
    isRotating,
    copiedElement,
  ]);

  const handlePaste = () => {
    if (!copiedElement || !parkingLot) return;

    const newElement: LayoutElement = {
      ...copiedElement,
      id: `temp-${Date.now()}`,
      position: {
        x: copiedElement.position.x + 20,
        y: copiedElement.position.y + 20,
      },
    };

    const newElements = [...layoutElements, newElement];
    setLayoutElements(newElements);
    addToHistory(newElements);
    setSelectedElement(newElement);
  };

  const getDefaultSize = (type: LayoutElementType): Size => {
    switch (type) {
      case LayoutElementType.PARKING_SPACE:
        return { width: 40, height: 60 };
      case LayoutElementType.DRIVING_PATH:
        return { width: 60, height: 20 };
      case LayoutElementType.ENTRANCE:
      case LayoutElementType.EXIT:
        return { width: 40, height: 40 };
      case LayoutElementType.SIGN:
        return { width: 20, height: 30 };
      case LayoutElementType.LIGHTING:
        return { width: 15, height: 15 };
      case LayoutElementType.VEGETATION:
        return { width: 30, height: 30 };
      case LayoutElementType.BUILDING:
        return { width: 80, height: 60 };
      default:
        return { width: 40, height: 40 };
    }
  };

  const getDefaultProperties = (
    type: LayoutElementType
  ): Record<string, unknown> => {
    switch (type) {
      case LayoutElementType.PARKING_SPACE:
        return {
          spotId: `SP${
            layoutElements.filter(
              (e) => e.elementType === LayoutElementType.PARKING_SPACE
            ).length + 1
          }`,
          spotType: SpotType.REGULAR,
          isOccupied: false,
          isActive: true,
        };
      case LayoutElementType.DRIVING_PATH:
        return {
          pathType: "two-way",
          speedLimit: 15,
          direction: "north",
        };
      case LayoutElementType.SIGN:
        return {
          signType: "parking",
          text: "P",
          color: "blue",
        };
      default:
        return {};
    }
  };

  const handleElementClick = (
    event: React.MouseEvent,
    element: LayoutElement
  ) => {
    event.stopPropagation(); // Prevent canvas click from firing

    if (!isDragging && !isResizing && !isRotating) {
      setSelectedElement(element);
    }
  };

  const handleElementDelete = (elementId: string) => {
    const newElements = layoutElements.filter((e) => e.id !== elementId);
    setLayoutElements(newElements);
    addToHistory(newElements);
    setSelectedElement(null);
  };

  const handleElementUpdate = (
    elementId: string,
    updates: Partial<LayoutElement>
  ) => {
    const newElements = layoutElements.map((e) =>
      e.id === elementId ? { ...e, ...updates, updatedAt: new Date() } : e
    );
    setLayoutElements(newElements);
    addToHistory(newElements);
  };

  const handleSave = async () => {
    if (!parkingLot) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/parking-lot/${parkingLot.id}/layout`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layoutElements }),
      });

      if (response.ok) {
        const parkingSpaces = layoutElements.filter(
          (e) => e.elementType === LayoutElementType.PARKING_SPACE
        );
        const availableSpaces = parkingSpaces.filter(
          (e) => !(e.properties as Record<string, unknown>)?.isOccupied
        ).length;

        await fetch(`/api/parking-lot/${parkingLot.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            totalSpots: parkingSpaces.length,
            availableSpots: availableSpaces,
          }),
        });

        alert("Layout saved successfully!");
      } else {
        alert("Failed to save layout");
      }
    } catch (error) {
      console.error("Error saving layout:", error);
      alert("Error saving layout");
    } finally {
      setSaving(false);
    }
  };

  const tools = [
    {
      type: LayoutElementType.PARKING_SPACE,
      icon: Car,
      label: "Parking Space",
      color: "bg-blue-500",
    },
    {
      type: LayoutElementType.DRIVING_PATH,
      icon: Route,
      label: "Driving Path",
      color: "bg-gray-500",
    },
    {
      type: LayoutElementType.ENTRANCE,
      icon: Square,
      label: "Entrance",
      color: "bg-green-500",
    },
    {
      type: LayoutElementType.EXIT,
      icon: Square,
      label: "Exit",
      color: "bg-red-500",
    },
    {
      type: LayoutElementType.SIGN,
      icon: AlertTriangle,
      label: "Sign",
      color: "bg-yellow-500",
    },
    {
      type: LayoutElementType.LIGHTING,
      icon: Lightbulb,
      label: "Lighting",
      color: "bg-yellow-400",
    },
    {
      type: LayoutElementType.VEGETATION,
      icon: Trees,
      label: "Vegetation",
      color: "bg-green-600",
    },
    {
      type: LayoutElementType.BUILDING,
      icon: Building,
      label: "Building",
      color: "bg-gray-700",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading layout editor...</p>
        </div>
      </div>
    );
  }

  if (!parkingLot) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Layout Editor - {parkingLot.name}
                </h1>
                <p className="text-gray-600">{parkingLot.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setCopiedElement(selectedElement)}
                disabled={!selectedElement}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Copy (Ctrl+C)"
              >
                <Copy className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handlePaste}
                disabled={!copiedElement}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Paste (Ctrl+V)"
              >
                <Clipboard className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Layout"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 h-full overflow-y-auto">
          <div className="p-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Tools
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.type}
                      onClick={() => setSelectedTool(tool.type)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTool === tool.type
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${tool.color.replace(
                          "bg-",
                          "text-"
                        )} mx-auto mb-1`}
                      />
                      <div className="text-xs text-gray-600 text-center">
                        {tool.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Grid Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grid Size: {gridSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Grid className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Snap to grid</span>
                </div>
              </div>
            </div>

            {selectedElement && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Properties
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={selectedElement.position.x}
                        onChange={(e) =>
                          handleElementUpdate(selectedElement.id, {
                            position: {
                              ...selectedElement.position,
                              x: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="X"
                      />
                      <input
                        type="number"
                        value={selectedElement.position.y}
                        onChange={(e) =>
                          handleElementUpdate(selectedElement.id, {
                            position: {
                              ...selectedElement.position,
                              y: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Y"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={selectedElement.size.width}
                        onChange={(e) =>
                          handleElementUpdate(selectedElement.id, {
                            size: {
                              ...selectedElement.size,
                              width: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Width"
                      />
                      <input
                        type="number"
                        value={selectedElement.size.height}
                        onChange={(e) =>
                          handleElementUpdate(selectedElement.id, {
                            size: {
                              ...selectedElement.size,
                              height: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Height"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rotation
                    </label>
                    <input
                      type="number"
                      value={selectedElement.rotation}
                      onChange={(e) =>
                        handleElementUpdate(selectedElement.id, {
                          rotation: Number(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Degrees"
                    />
                  </div>
                  <button
                    onClick={() => handleElementDelete(selectedElement.id)}
                    className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Element</span>
                  </button>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Statistics
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Elements:</span>
                  <span className="font-medium">{layoutElements.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parking Spaces:</span>
                  <span className="font-medium">
                    {
                      layoutElements.filter(
                        (e) => e.elementType === LayoutElementType.PARKING_SPACE
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Driving Paths:</span>
                  <span className="font-medium">
                    {
                      layoutElements.filter(
                        (e) => e.elementType === LayoutElementType.DRIVING_PATH
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">
                Quick Tips
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Click and drag to move elements</li>
                <li>• Drag corners to resize</li>
                <li>• Drag rotate handle to rotate</li>
                <li>• Ctrl+C/V to copy/paste</li>
                <li>• Delete key to remove elements</li>
                <li>• Click empty area to deselect</li>
                <li>• Escape to deselect</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 h-full overflow-hidden">
            <div
              ref={canvasRef}
              className="relative w-full h-full bg-gray-50 cursor-crosshair select-none"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  handleCanvasClick(e);
                } else {
                  setSelectedElement(null);
                }
              }}
            >
              {layoutElements.map((element) => {
                const isSelected = selectedElement?.id === element.id;

                return (
                  <div
                    key={element.id}
                    className={`absolute border-2 transition-all ${
                      isSelected
                        ? "border-blue-500 shadow-lg z-10"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{
                      left: element.position.x,
                      top: element.position.y,
                      width: element.size.width,
                      height: element.size.height,
                      transform: `rotate(${element.rotation}deg)`,
                      cursor: isDragging ? "grabbing" : "grab",
                    }}
                    onMouseDown={(e) => handleElementMouseDown(e, element)}
                    onClick={(e) => handleElementClick(e, element)}
                  >
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-bold text-xs"
                      style={{
                        backgroundColor: getElementColor(element.elementType),
                      }}
                    >
                      {getElementLabel(element)}
                    </div>

                    {isSelected && (
                      <>
                        <div
                          className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded cursor-se-resize"
                          data-handle="se"
                        ></div>
                        <div
                          className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded cursor-sw-resize"
                          data-handle="sw"
                        ></div>
                        <div
                          className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded cursor-ne-resize"
                          data-handle="ne"
                        ></div>
                        <div
                          className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded cursor-nw-resize"
                          data-handle="nw"
                        ></div>

                        <div
                          className="rotate-handle absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 border border-white rounded-full cursor-grab flex items-center justify-center"
                          style={{
                            transform: `translateX(-50%) rotate(${-element.rotation}deg)`,
                          }}
                        >
                          <RotateCw className="w-3 h-3 text-white" />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getElementColor(type: LayoutElementType): string {
  switch (type) {
    case LayoutElementType.PARKING_SPACE:
      return "#3B82F6";
    case LayoutElementType.DRIVING_PATH:
      return "#6B7280";
    case LayoutElementType.ENTRANCE:
      return "#10B981";
    case LayoutElementType.EXIT:
      return "#EF4444";
    case LayoutElementType.SIGN:
      return "#F59E0B";
    case LayoutElementType.LIGHTING:
      return "#FBBF24";
    case LayoutElementType.VEGETATION:
      return "#059669";
    case LayoutElementType.BUILDING:
      return "#374151";
    default:
      return "#9CA3AF";
  }
}

function getElementLabel(element: LayoutElement): string {
  switch (element.elementType) {
    case LayoutElementType.PARKING_SPACE:
      return (
        ((element.properties as Record<string, unknown>)?.spotId as string) ||
        "P"
      );
    case LayoutElementType.DRIVING_PATH:
      return "→";
    case LayoutElementType.ENTRANCE:
      return "IN";
    case LayoutElementType.EXIT:
      return "OUT";
    case LayoutElementType.SIGN:
      return (
        ((element.properties as Record<string, unknown>)?.text as string) || "S"
      );
    case LayoutElementType.LIGHTING:
      return "💡";
    case LayoutElementType.VEGETATION:
      return "🌳";
    case LayoutElementType.BUILDING:
      return "🏢";
    default:
      return "?";
  }
}
