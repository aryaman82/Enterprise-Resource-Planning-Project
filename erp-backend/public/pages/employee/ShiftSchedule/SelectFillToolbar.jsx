import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getShiftColors } from './shiftUtils';

const SelectFillToolbar = ({
  shiftTypes = [],
  directAssignShift = '',
  onSelectShift,
  headerOffset = 80,
}) => {
  const toolbarRef = useRef(null);
  const containerRef = useRef(null);
  const [dock, setDock] = useState(false);
  const [dims, setDims] = useState({ left: 0, width: 0, height: 0 });

  useEffect(() => {
    const updateDock = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement?.getBoundingClientRect();
      const shouldDock = rect.top <= headerOffset;
      const left = parentRect ? parentRect.left : rect.left;
      const width = parentRect ? parentRect.width : rect.width;
      const height = toolbarRef.current ? toolbarRef.current.getBoundingClientRect().height : 0;
      setDims({ left, width, height });
      setDock(shouldDock);
    };
    updateDock();
    window.addEventListener('scroll', updateDock, { passive: true });
    window.addEventListener('resize', updateDock);
    return () => {
      window.removeEventListener('scroll', updateDock);
      window.removeEventListener('resize', updateDock);
    };
  }, [headerOffset]);

  const handleClick = (code) => {
    if (!onSelectShift) return;
    onSelectShift(code);
  };

  // Floating dropdown (top-right) state and outside click handler
  const [floatingOpen, setFloatingOpen] = useState(false);
  const floatingRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (floatingRef.current && !floatingRef.current.contains(e.target)) {
        setFloatingOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <>
      <div ref={containerRef} style={{ height: dock ? dims.height : undefined }}>
        <div
          ref={toolbarRef}
          className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 flex items-center justify-between"
          style={dock ? { position: 'fixed', top: headerOffset, left: dims.left, width: dims.width, zIndex: 40 } : undefined}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 font-medium">Select & Fill:</span>
            <div className="flex flex-wrap gap-2">
              {shiftTypes.map((shift) => {
                const colors = getShiftColors(shift.shift_code);
                const active = directAssignShift === shift.shift_code;
                return (
                  <button
                    key={`fill-${shift.shift_code}`}
                    onClick={() => handleClick(shift.shift_code)}
                    className={`inline-flex items-center justify-center h-9 px-3 min-w-[40px] rounded-full text-sm border text-center leading-none ${colors.bgColor} ${colors.textColor} ${colors.borderColor} ${active ? 'ring-2 ring-blue-500' : 'hover:opacity-80'}`}
                    title={`Direct-assign ${shift.shift_code}`}
                  >
                    <span className="font-semibold">{shift.shift_code}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{directAssignShift ? `Click any cell to assign \"${directAssignShift}\"` : 'Select a shift to enable direct-assign'}</span>
            {directAssignShift && (
              <button
                onClick={() => handleClick('')}
                className="inline-flex items-center justify-center px-3 h-9 rounded-md text-sm bg-gray-800 text-white border border-transparent hover:bg-gray-700 leading-none"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {createPortal(
        <div className="fixed top-4 right-4 z-[1000]" ref={floatingRef}>
          <div className="relative bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg rounded-lg p-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFloatingOpen((v) => !v)}
                className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-gray-200 bg-white text-sm text-gray-700 shadow-sm hover:bg-gray-50"
                title="Select & Fill"
              >
                <span className="text-gray-700">Select & Fill:</span>
                {(() => {
                  const active = shiftTypes.find((s) => s.shift_code === directAssignShift);
                  if (!active) return <span className="text-gray-500">Select</span>;
                  const colors = getShiftColors(active.shift_code);
                  return (
                    <span className={`inline-flex items-center justify-center h-7 px-2 rounded-full border text-sm font-semibold leading-none ${colors.bgColor} ${colors.textColor} ${colors.borderColor} ring-2 ring-blue-500`}>
                      {active.shift_code}
                    </span>
                  );
                })()}
                <span className="ml-1 text-gray-500">{floatingOpen ? '▴' : '▾'}</span>
              </button>
              {directAssignShift && (
                <button
                  onClick={() => handleClick('')}
                  className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm bg-gray-800 text-white border border-transparent hover:bg-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
            {floatingOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                <div className="grid grid-cols-3 gap-2">
                  {shiftTypes.map((shift) => {
                    const colors = getShiftColors(shift.shift_code);
                    const active = directAssignShift === shift.shift_code;
                    return (
                      <button
                        key={`dropdown-${shift.shift_code}`}
                        onClick={() => { handleClick(shift.shift_code); setFloatingOpen(false); }}
                        className={`inline-flex items-center justify-center h-8 px-2 rounded-full text-sm border leading-none ${colors.bgColor} ${colors.textColor} ${colors.borderColor} ${active ? 'ring-2 ring-blue-500' : 'hover:opacity-80'}`}
                        title={`${shift.shift_code}: ${shift.shift_name}`}
                      >
                        <span className="font-semibold">{shift.shift_code}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>, document.body)}
    </>
  );
};

export default SelectFillToolbar;

