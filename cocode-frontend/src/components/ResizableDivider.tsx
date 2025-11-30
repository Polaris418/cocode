import React, { useCallback, useEffect, useState } from 'react';

interface ResizableDividerProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
  onResizeEnd?: () => void;
}

export const ResizableDivider: React.FC<ResizableDividerProps> = ({
  direction,
  onResize,
  onResizeEnd,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos(direction === 'horizontal' ? e.clientX : e.clientY);
  }, [direction]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPos - startPos;
    setStartPos(currentPos);
    onResize(delta);
  }, [isDragging, direction, startPos, onResize]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onResizeEnd?.();
    }
  }, [isDragging, onResizeEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp, direction]);

  const isHorizontal = direction === 'horizontal';

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`
        ${isHorizontal ? 'w-1 cursor-col-resize hover:w-1.5' : 'h-1 cursor-row-resize hover:h-1.5'}
        ${isDragging ? 'bg-blue-500' : 'bg-gray-600 hover:bg-blue-400'}
        transition-all duration-150 flex-shrink-0 relative group
      `}
    >
      {/* 增大可点击区域 */}
      <div
        className={`
          absolute 
          ${isHorizontal ? 'inset-y-0 -left-1 -right-1' : 'inset-x-0 -top-1 -bottom-1'}
        `}
      />
      {/* 拖动指示器 */}
      <div
        className={`
          absolute opacity-0 group-hover:opacity-100 transition-opacity
          ${isHorizontal 
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-full' 
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-8 bg-blue-400 rounded-full'
          }
        `}
      />
    </div>
  );
};

export default ResizableDivider;
