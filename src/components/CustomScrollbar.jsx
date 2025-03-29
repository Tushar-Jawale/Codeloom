import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CustomScrollbar.css';

const CustomScrollbar = ({ children, className, maxHeight = null }) => {
  const contentRef = useRef(null);
  const scrollTrackRef = useRef(null);
  const scrollThumbRef = useRef(null);
  const observer = useRef(null);
  
  const [thumbHeight, setThumbHeight] = useState(20);
  const [scrollStartPosition, setScrollStartPosition] = useState(null);
  const [initialScrollTop, setInitialScrollTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate thumb height based on content
  const handleResize = useCallback((ref, trackSize) => {
    const { clientHeight, scrollHeight } = ref;
    const ratio = clientHeight / scrollHeight;
    setThumbHeight(Math.max(ratio * trackSize, 20));
  }, []);

  // Handle scroll positioning
  const handleScrollThumbPosition = useCallback(() => {
    if (contentRef.current && scrollTrackRef.current && scrollThumbRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const { clientHeight: trackHeight } = scrollTrackRef.current;
      
      // Calculate the thumb position
      const thumbPosition = (scrollTop / (scrollHeight - clientHeight)) * 
                          (trackHeight - thumbHeight);
      
      // Apply the position
      scrollThumbRef.current.style.top = `${thumbPosition}px`;
    }
  }, [thumbHeight]);

  // Set up resize observer and scroll event listeners
  useEffect(() => {
    if (contentRef.current && scrollTrackRef.current) {
      const ref = contentRef.current;
      const { clientHeight: trackSize } = scrollTrackRef.current;
      
      // Initialize thumb height
      handleResize(ref, trackSize);
      
      // Set up scroll event listener
      ref.addEventListener('scroll', handleScrollThumbPosition);
      
      // Set up resize observer
      observer.current = new ResizeObserver(() => {
        handleResize(ref, trackSize);
        handleScrollThumbPosition();
      });
      
      observer.current.observe(ref);
      
      return () => {
        ref.removeEventListener('scroll', handleScrollThumbPosition);
        observer.current && observer.current.unobserve(ref);
      };
    }
  }, [handleResize, handleScrollThumbPosition]);

  // Handle track click to jump to position
  const handleTrackClick = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    
    const { current: trackCurrent } = scrollTrackRef;
    const { current: contentCurrent } = contentRef;
    
    if (trackCurrent && contentCurrent) {
      // Get position of click relative to the track
      const { clientY } = e;
      const target = e.target;
      const rect = target.getBoundingClientRect();
      const trackTop = rect.top;
      const clickPosition = clientY - trackTop;
      
      // Calculate new scroll position
      const scrollPercent = clickPosition / trackCurrent.clientHeight;
      const scrollValue = scrollPercent * contentCurrent.scrollHeight;
      
      // Apply the scroll
      contentCurrent.scrollTo({
        top: scrollValue,
        behavior: 'smooth'
      });
    }
  }, []);

  // Handle thumb drag start
  const handleThumbMousedown = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    
    setScrollStartPosition(e.clientY);
    if (contentRef.current) setInitialScrollTop(contentRef.current.scrollTop);
    setIsDragging(true);
  }, []);

  // Handle thumb drag end
  const handleThumbMouseup = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  // Handle thumb drag movement
  const handleThumbMousemove = useCallback(e => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDragging && contentRef.current) {
      const {
        scrollHeight: contentScrollHeight,
        offsetHeight: contentOffsetHeight,
      } = contentRef.current;
      
      // Calculate delta and scale to content
      const deltaY = (e.clientY - scrollStartPosition) * 
                    (contentOffsetHeight / thumbHeight);
      
      // Calculate new scroll position
      const newScrollTop = Math.min(
        initialScrollTop + deltaY,
        contentScrollHeight - contentOffsetHeight
      );
      
      // Apply scroll
      contentRef.current.scrollTop = newScrollTop;
    }
  }, [isDragging, scrollStartPosition, thumbHeight, initialScrollTop]);

  // Listen for mouse events to handle thumb dragging
  useEffect(() => {
    document.addEventListener('mousemove', handleThumbMousemove);
    document.addEventListener('mouseup', handleThumbMouseup);
    document.addEventListener('mouseleave', handleThumbMouseup);
    
    return () => {
      document.removeEventListener('mousemove', handleThumbMousemove);
      document.removeEventListener('mouseup', handleThumbMouseup);
      document.removeEventListener('mouseleave', handleThumbMouseup);
    };
  }, [handleThumbMousemove, handleThumbMouseup]);

  // Handle scroll with buttons
  const handleScrollButton = (direction) => {
    const { current } = contentRef;
    if (current) {
      const scrollAmount = direction === 'down' ? 100 : -100;
      current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={`custom-scrollbars__container ${className || ''}`} style={maxHeight ? { maxHeight } : {}}>
      <div 
        className="custom-scrollbars__content" 
        ref={contentRef}
      >
        {children}
      </div>
      <div className="custom-scrollbars__scrollbar">
        <button 
          className="custom-scrollbars__button"
          onClick={() => handleScrollButton('up')}
        >
          ⇑
        </button>
        <div className="custom-scrollbars__track-and-thumb">
          <div
            className="custom-scrollbars__track"
            ref={scrollTrackRef}
            onClick={handleTrackClick}
            style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
          ></div>
          <div
            className="custom-scrollbars__thumb"
            ref={scrollThumbRef}
            onMouseDown={handleThumbMousedown}
            style={{
              height: `${thumbHeight}px`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          ></div>
        </div>
        <button 
          className="custom-scrollbars__button"
          onClick={() => handleScrollButton('down')}
        >
          ⇓
        </button>
      </div>
    </div>
  );
};

export default CustomScrollbar; 