"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Save,
  Undo,
  Redo,
  Car,
  Route,
  AlertTriangle,
  Lightbulb,
  Trees,
  Building,
  Trash2,
  Square,
  RotateCw,
  X,
} from "lucide-react";
import { ParkingLot, LayoutElement, Size } from "@/constants/types/parking";
import { SpotType, LayoutElementType } from "@/constants/enums/parking";
import { motion } from "framer-motion";

function CreateParkingLayoutContent() {
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
  const [gridSize] = useState(20);
  const [history, setHistory] = useState<LayoutElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

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

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isSavingAndClosing, setIsSavingAndClosing] = useState(false);

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
      const snappedAngle = Math.round(angle / 15) * 15;

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
      } else {
        alert("Failed to save layout");
      }
    } catch (error) {
      console.error("Error saving layout:", error);
      alert("Error saving layout");
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
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-white to-indigo-100 flex flex-col">
      <div className="flex flex-col md:flex-row gap-6 p-4 md:p-8">
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
          className="w-full md:w-80 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-xl border border-blue-100 p-6 flex flex-col gap-6 mb-4 md:mb-0"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.type}
                  className={`p-3 rounded-xl shadow-md bg-blue-50 hover:bg-blue-100 transition-all ${
                    selectedTool === tool.type ? "ring-2 ring-blue-400" : ""
                  }`}
                  title={tool.label}
                  onClick={() => setSelectedTool(tool.type)}
                >
                  <Icon className="w-5 h-5 text-blue-600" />
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 mb-4">
            <button
              className="p-2 rounded-lg bg-white shadow hover:bg-blue-50 transition-all"
              onClick={undo}
              title="Undo"
            >
              <Undo />
            </button>
            <button
              className="p-2 rounded-lg bg-white shadow hover:bg-blue-50 transition-all"
              onClick={redo}
              title="Redo"
            >
              <Redo />
            </button>
            <button
              className="p-2 rounded-lg bg-blue-500 text-white shadow hover:bg-blue-600 transition-all"
              onClick={handleSave}
              title="Save"
            >
              <Save />
            </button>
          </div>
          {selectedElement && (
            <div className="bg-white/90 rounded-xl p-4 shadow border border-blue-50">
              <h4 className="font-semibold text-blue-700 mb-2">
                Element Properties
              </h4>
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
        </motion.div>
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
          className="flex-1 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-blue-100 h-[80vh] overflow-hidden relative"
        >
          <button
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-red-100 border border-red-200 shadow text-red-500 transition-all"
            title="Close editor"
            onClick={() => setShowCloseModal(true)}
          >
            <X className="w-6 h-6" />
          </button>
          <div
            ref={canvasRef}
            className="relative w-full h-full grid-bg cursor-crosshair select-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)
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
                <motion.div
                  key={element.id}
                  className={`absolute border-2 transition-all rounded-xl flex items-center justify-center ${
                    isSelected
                      ? "border-blue-500 shadow-xl z-10 scale-105"
                      : "border-gray-300 hover:border-blue-400"
                  }`}
                  style={{
                    left: element.position.x,
                    top: element.position.y,
                    width: element.size.width,
                    height: element.size.height,
                    transform: `rotate(${element.rotation}deg)`,
                    cursor: isDragging ? "grabbing" : "grab",
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.98 }}
                  onMouseDown={(e) => handleElementMouseDown(e, element)}
                  onClick={(e) => handleElementClick(e, element)}
                >
                  <div
                    className="w-full h-full flex items-center justify-center text-white font-bold text-xs rounded-xl shadow"
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
                </motion.div>
              );
            })}
            <style jsx>{`
              .grid-bg {
                background-image: linear-gradient(
                    rgba(59, 130, 246, 0.08) 1px,
                    transparent 1px
                  ),
                  linear-gradient(
                    90deg,
                    rgba(59, 130, 246, 0.08) 1px,
                    transparent 1px
                  );
                background-size: 20px 20px;
              }
            `}</style>
          </div>
          {showCloseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md animate-fade-in">
              <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-blue-200/60 p-8 max-w-sm w-full flex flex-col items-center relative animate-scale-in">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full p-3 shadow-lg">
                  <Save className="w-7 h-7 text-white drop-shadow" />
                </div>
                <div className="mt-8 mb-2 text-2xl font-bold text-blue-700 text-center font-display drop-shadow-sm">
                  Save and Exit?
                </div>
                <div className="mb-6 text-gray-600 text-center font-body text-base">
                  Your layout will be saved on close. Proceed?
                </div>
                <div className="flex gap-4 w-full justify-center mt-2">
                  <button
                    className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-base disabled:opacity-60"
                    disabled={isSavingAndClosing}
                    onClick={async () => {
                      setIsSavingAndClosing(true);
                      await handleSave();
                      setIsSavingAndClosing(false);
                      setShowCloseModal(false);
                      router.push("/admin");
                    }}
                  >
                    {isSavingAndClosing ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                        Saving...
                      </span>
                    ) : (
                      "Yes, Save & Exit"
                    )}
                  </button>
                  <button
                    className="flex-1 px-4 py-2 rounded-xl bg-white/80 border border-blue-200 text-blue-700 font-semibold hover:bg-blue-50 transition-all duration-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-200 text-base"
                    onClick={() => setShowCloseModal(false)}
                    disabled={isSavingAndClosing}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <style jsx>{`
                .animate-fade-in {
                  animation: fade-in 0.25s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .animate-scale-in {
                  animation: scale-in 0.25s cubic-bezier(0.22, 1, 0.36, 1);
                }
                @keyframes fade-in {
                  from {
                    opacity: 0;
                  }
                  to {
                    opacity: 1;
                  }
                }
                @keyframes scale-in {
                  from {
                    opacity: 0;
                    transform: scale(0.95);
                  }
                  to {
                    opacity: 1;
                    transform: scale(1);
                  }
                }
              `}</style>
            </div>
          )}
        </motion.div>
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

export default function CreateParkingLayoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateParkingLayoutContent />
    </Suspense>
  );
}
