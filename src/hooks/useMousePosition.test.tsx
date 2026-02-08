
import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useMousePosition } from './useMousePosition';
import { describe, it, expect } from 'vitest';

describe('useMousePosition', () => {
    it('should attach listener when ref becomes available (simulating conditional rendering)', async () => {
        const { result, rerender } = renderHook(({ show }) => {
            // We use a ref that persists across renders
            const ref = useRef<HTMLDivElement>(null);

            // Simulate ref attachment manually
            // In a real React component, React assigns ref.current during commit phase.
            // Here we do it during render phase for simulation, which is close enough for this test
            // because useEffect runs after this.
            if (show && !ref.current) {
                ref.current = document.createElement('div');
            } else if (!show) {
                ref.current = null;
            }
            const pos = useMousePosition(ref);
            return { pos, ref };
        }, {
            initialProps: { show: false }
        });

        // Initially null, no position
        expect(result.current.pos).toEqual({ x: 0, y: 0 });

        // Now "mount" the element
        rerender({ show: true });

        // The ref.current is now set.
        const element = result.current.ref.current;
        expect(element).not.toBeNull();

        if (element) {
            // Mock getBoundingClientRect
            element.getBoundingClientRect = () => ({
                left: 10,
                top: 10,
                width: 100,
                height: 100,
                x: 10,
                y: 10,
                bottom: 110,
                right: 110,
                toJSON: () => {}
            });

            const event = new MouseEvent('mousemove', {
                clientX: 50,
                clientY: 50,
                bubbles: true
            });

            act(() => {
                element.dispatchEvent(event);
            });
        }

        // We expect the position to update to (50-10, 50-10) = (40, 40)
        expect(result.current.pos).toEqual({ x: 40, y: 40 });
    });
});
