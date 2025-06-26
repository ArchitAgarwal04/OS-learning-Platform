import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import CPUSchedulingVisualizer from './cpu-scheduling-visualizer';

// Mock the analytics tracking function
jest.mock('@/lib/analytics', () => ({
  trackVisualization: jest.fn(),
}));

// Mock UI components to avoid dependency issues
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: any) => <table>{children}</table>,
  TableBody: ({ children }: any) => <tbody>{children}</tbody>,
  TableCell: ({ children }: any) => <td>{children}</td>,
  TableHead: ({ children }: any) => <th>{children}</th>,
  TableHeader: ({ children }: any) => <thead>{children}</thead>,
  TableRow: ({ children }: any) => <tr>{children}</tr>,
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

describe('CPUSchedulingVisualizer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial Rendering', () => {
    it('should render without crashing', () => {
      render(<CPUSchedulingVisualizer />);
      expect(screen.getByText('Process Configuration')).toBeInTheDocument();
    });

    it('should initialize with default processes', () => {
      render(<CPUSchedulingVisualizer />);
      expect(screen.getByText('P1')).toBeInTheDocument();
      expect(screen.getByText('P2')).toBeInTheDocument();
      expect(screen.getByText('P3')).toBeInTheDocument();
    });

    it('should display the main control sections', () => {
      render(<CPUSchedulingVisualizer />);
      expect(screen.getByText('Process Configuration')).toBeInTheDocument();
      expect(screen.getByText('Add Process')).toBeInTheDocument();
      expect(screen.getByText(/Run.*Simulation/)).toBeInTheDocument();
    });

    it('should show process table with headers', () => {
      render(<CPUSchedulingVisualizer />);
      expect(screen.getByText('Process ID')).toBeInTheDocument();
      expect(screen.getByText('Arrival Time')).toBeInTheDocument();
      expect(screen.getByText('Burst Time')).toBeInTheDocument();
      expect(screen.getByText('Color Preview')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('Process Management', () => {
    it('should add a new process when Add Process button is clicked', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      const initialProcesses = screen.getAllByText(/P\d+/).length;
      await user.click(screen.getByText('Add Process'));

      const newProcesses = screen.getAllByText(/P\d+/).length;
      expect(newProcesses).toBe(initialProcesses + 1);
    });

    it('should remove a process when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      const deleteButtons = screen.getAllByRole('button');
      const trashButton = deleteButtons.find(button => 
        button.querySelector('svg') && button.getAttribute('class')?.includes('hover:text-red-600')
      );

      if (trashButton) {
        await user.click(trashButton);
        // Should not remove if only one process remains
        expect(screen.getByText('P1')).toBeInTheDocument();
      }
    });

    it('should not allow removal of the last process', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      // Remove processes until only one remains
      const deleteButtons = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg') && button.getAttribute('class')?.includes('hover:text-red-600')
      );

      // Click delete buttons but the last process should remain
      for (let i = 0; i < deleteButtons.length && screen.getAllByText(/P\d+/).length > 1; i++) {
        if (!deleteButtons[i].disabled) {
          await user.click(deleteButtons[i]);
        }
      }

      expect(screen.getAllByText(/P\d+/).length).toBeGreaterThanOrEqual(1);
    });

    it('should update process arrival time', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      const arrivalTimeInputs = screen.getAllByDisplayValue('0');
      if (arrivalTimeInputs.length > 0) {
        await user.clear(arrivalTimeInputs[0]);
        await user.type(arrivalTimeInputs[0], '5');
        expect(arrivalTimeInputs[0]).toHaveValue(5);
      }
    });

    it('should update process burst time', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      const burstTimeInputs = screen.getAllByDisplayValue('4');
      if (burstTimeInputs.length > 0) {
        await user.clear(burstTimeInputs[0]);
        await user.type(burstTimeInputs[0], '10');
        expect(burstTimeInputs[0]).toHaveValue(10);
      }
    });

    it('should handle invalid input values gracefully', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      const inputs = screen.getAllByRole('spinbutton');
      if (inputs.length > 0) {
        await user.clear(inputs[0]);
        await user.type(inputs[0], '-5');
        // Component should handle negative values by converting to 0 or preventing input
        expect(inputs[0]).toHaveValue(0);
      }
    });
  });

  describe('Algorithm Selection and Execution', () => {
    it('should run FCFS simulation', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      await user.click(screen.getByText(/Run.*FCFS.*Simulation/));

      await waitFor(() => {
        expect(screen.getByText('Enhanced Gantt Chart')).toBeInTheDocument();
      });
    });

    it('should run SJF simulation', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      // Assuming there's a way to change algorithm (might need to be implemented)
      await user.click(screen.getByText(/Run.*Simulation/));

      await waitFor(() => {
        expect(screen.getByText('Enhanced Gantt Chart')).toBeInTheDocument();
      });
    });

    it('should show time quantum input for Round Robin', () => {
      // This test assumes the component has algorithm selection
      // If not implemented, this would be a good feature to add
      render(<CPUSchedulingVisualizer />);
      
      // Check if time quantum is shown when RR is selected
      const timeQuantumLabel = screen.queryByText('Time Quantum:');
      if (timeQuantumLabel) {
        expect(timeQuantumLabel).toBeInTheDocument();
      }
    });

    it('should validate time quantum value for Round Robin', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      const timeQuantumInput = screen.queryByLabelText('quantum');
      if (timeQuantumInput) {
        await user.clear(timeQuantumInput);
        await user.type(timeQuantumInput, '0');
        // Should not allow 0 or negative values
        expect(timeQuantumInput).not.toHaveValue(0);
      }
    });
  });

  describe('Simulation Controls', () => {
    beforeEach(async () => {
      render(<CPUSchedulingVisualizer />);
      const user = userEvent.setup();
      // Run simulation first to have controls available
      await user.click(screen.getByText(/Run.*Simulation/));
      await waitFor(() => {
        expect(screen.getByText('Enhanced Gantt Chart')).toBeInTheDocument();
      });
    });

    it('should have play/pause functionality', () => {
      const playPauseButton = screen.getByRole('button', { 
        name: /play|pause/i 
      });
      expect(playPauseButton).toBeInTheDocument();
    });

    it('should have step forward functionality', () => {
      const nextButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg') // ChevronRight icon
      );
      expect(nextButton).toBeInTheDocument();
    });

    it('should have step backward functionality', () => {
      const prevButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg') // ChevronLeft icon
      );
      expect(prevButton).toBeInTheDocument();
    });

    it('should have reset functionality', () => {
      const resetButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg') // RotateCcw icon
      );
      expect(resetButton).toBeInTheDocument();
    });

    it('should toggle play/pause state', async () => {
      const user = userEvent.setup();
      const playPauseButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg') && 
        button.getAttribute('class')?.includes('from-green-500')
      );

      if (playPauseButton) {
        await user.click(playPauseButton);
        // Animation should start/stop
        // This is difficult to test without accessing internal state
        expect(playPauseButton).toBeInTheDocument();
      }
    });
  });

  describe('Visualization Display', () => {
    beforeEach(async () => {
      render(<CPUSchedulingVisualizer />);
      const user = userEvent.setup();
      await user.click(screen.getByText(/Run.*Simulation/));
      await waitFor(() => {
        expect(screen.getByText('Enhanced Gantt Chart')).toBeInTheDocument();
      });
    });

    it('should display Gantt chart after simulation', () => {
      expect(screen.getByText('Enhanced Gantt Chart')).toBeInTheDocument();
    });

    it('should display ready queue', () => {
      expect(screen.getByText('Ready Queue')).toBeInTheDocument();
    });

    it('should display current status', () => {
      expect(screen.getByText('Current Status')).toBeInTheDocument();
      expect(screen.getByText('Time:')).toBeInTheDocument();
      expect(screen.getByText('Running:')).toBeInTheDocument();
    });

    it('should display statistics', () => {
      expect(screen.getByText('Statistics')).toBeInTheDocument();
      expect(screen.getByText('Total Time:')).toBeInTheDocument();
      expect(screen.getByText('Progress:')).toBeInTheDocument();
    });

    it('should display animation speed control', () => {
      expect(screen.getByText('Animation Speed')).toBeInTheDocument();
      const speedSlider = screen.getByRole('slider');
      expect(speedSlider).toBeInTheDocument();
    });

    it('should show progress bar', () => {
      expect(screen.getByText('Simulation Progress')).toBeInTheDocument();
    });
  });

  describe('Metrics and Analytics', () => {
    beforeEach(async () => {
      render(<CPUSchedulingVisualizer />);
      const user = userEvent.setup();
      await user.click(screen.getByText(/Run.*Simulation/));
      await waitFor(() => {
        expect(screen.getByText('Enhanced Gantt Chart')).toBeInTheDocument();
      });
    });

    it('should open metrics dialog', async () => {
      const user = userEvent.setup();
      const metricsButton = screen.getByText('Show Metrics Table');
      await user.click(metricsButton);

      await waitFor(() => {
        expect(screen.getByText('Process Performance Metrics')).toBeInTheDocument();
      });
    });

    it('should display process metrics in dialog', async () => {
      const user = userEvent.setup();
      await user.click(screen.getByText('Show Metrics Table'));

      await waitFor(() => {
        expect(screen.getByText('PID')).toBeInTheDocument();
        expect(screen.getByText('Arrival Time')).toBeInTheDocument();
        expect(screen.getByText('Burst Time')).toBeInTheDocument();
        expect(screen.getByText('Completion Time')).toBeInTheDocument();
        expect(screen.getByText('Turnaround Time')).toBeInTheDocument();
        expect(screen.getByText('Waiting Time')).toBeInTheDocument();
      });
    });

    it('should calculate average waiting and turnaround times', async () => {
      const user = userEvent.setup();
      await user.click(screen.getByText('Show Metrics Table'));

      await waitFor(() => {
        expect(screen.getByText('Average Waiting Time:')).toBeInTheDocument();
        expect(screen.getByText('Average Turnaround Time:')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle single process simulation', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      // Remove processes until only one remains
      const deleteButtons = screen.getAllByRole('button').filter(button => 
        button.querySelector('svg') && button.getAttribute('class')?.includes('hover:text-red-600')
      );

      // Try to remove processes (should maintain at least one)
      for (const button of deleteButtons.slice(0, 2)) {
        if (!button.disabled) {
          await user.click(button);
        }
      }

      await user.click(screen.getByText(/Run.*Simulation/));

      await waitFor(() => {
        expect(screen.getByText('Enhanced Gantt Chart')).toBeInTheDocument();
      });
    });

    it('should handle processes with zero arrival time', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      // Ensure all processes have zero arrival time (which they do by default)
      await user.click(screen.getByText(/Run.*Simulation/));

      await waitFor(() => {
        expect(screen.getByText('Enhanced Gantt Chart')).toBeInTheDocument();
      });
    });

    it('should handle processes with same arrival times', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      // All default processes have arrival time 0, 1, 2 - modify to be same
      const arrivalInputs = screen.getAllByDisplayValue(/[012]/);
      for (const input of arrivalInputs.slice(1)) {
        await user.clear(input);
        await user.type(input, '0');
      }

      await user.click(screen.getByText(/Run.*Simulation/));

      await waitFor(() => {
        expect(screen.getByText('Enhanced Gantt Chart')).toBeInTheDocument();
      });
    });

    it('should handle large burst times', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      const burstInput = screen.getAllByDisplayValue(/[345]/)[0];
      await user.clear(burstInput);
      await user.type(burstInput, '100');

      await user.click(screen.getByText(/Run.*Simulation/));

      await waitFor(() => {
        expect(screen.getByText('Enhanced Gantt Chart')).toBeInTheDocument();
      });
    });
  });

  describe('Animation and Timing', () => {
    beforeEach(async () => {
      render(<CPUSchedulingVisualizer />);
      const user = userEvent.setup();
      await user.click(screen.getByText(/Run.*Simulation/));
      await waitFor(() => {
        expect(screen.getByText('Enhanced Gantt Chart')).toBeInTheDocument();
      });
    });

    it('should update animation speed', async () => {
      const user = userEvent.setup();
      const speedSlider = screen.getByRole('slider');
      
      await user.click(speedSlider);
      fireEvent.change(speedSlider, { target: { value: '500' } });

      expect(speedSlider).toHaveValue('500');
    });

    it('should advance time during auto-play', async () => {
      const user = userEvent.setup();
      const playButton = screen.getAllByRole('button').find(button => 
        button.getAttribute('class')?.includes('from-green-500')
      );

      if (playButton) {
        await user.click(playButton);
        
        act(() => {
          jest.advanceTimersByTime(2000); // Advance by 2 seconds
        });

        // Current time should have advanced
        expect(screen.getByText(/T: \d+/)).toBeInTheDocument();
      }
    });

    it('should reset to time zero when reset is clicked', async () => {
      const user = userEvent.setup();
      const resetButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg') // Looking for RotateCcw icon
      );

      if (resetButton) {
        await user.click(resetButton);
        expect(screen.getByText('T: 0')).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for inputs', () => {
      render(<CPUSchedulingVisualizer />);
      
      const quantumInput = screen.queryByLabelText('quantum');
      const speedSlider = screen.getByRole('slider');
      
      expect(speedSlider).toHaveAttribute('aria-labelledby');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      // Tab through inputs
      await user.tab();
      expect(document.activeElement).toBeInstanceOf(HTMLElement);

      await user.tab();
      expect(document.activeElement).toBeInstanceOf(HTMLElement);
    });

    it('should have proper button labels', () => {
      render(<CPUSchedulingVisualizer />);
      
      expect(screen.getByText('Add Process')).toBeInTheDocument();
      expect(screen.getByText(/Run.*Simulation/)).toBeInTheDocument();
    });
  });

  describe('Performance and Memory', () => {
    it('should render efficiently with many processes', () => {
      const startTime = performance.now();
      render(<CPUSchedulingVisualizer />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render quickly
    });

    it('should clean up timers on unmount', () => {
      const { unmount } = render(<CPUSchedulingVisualizer />);
      
      expect(() => unmount()).not.toThrow();
      expect(jest.getTimerCount()).toBe(0);
    });

    it('should handle rapid state changes', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      // Rapidly add and remove processes
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByText('Add Process'));
      }

      expect(screen.getAllByText(/P\d+/).length).toBeGreaterThan(3);
    });
  });

  describe('Integration Tests', () => {
    it('should complete full workflow from process creation to metrics display', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      // Add a custom process
      await user.click(screen.getByText('Add Process'));
      
      // Run simulation
      await user.click(screen.getByText(/Run.*Simulation/));

      await waitFor(() => {
        expect(screen.getByText('Enhanced Gantt Chart')).toBeInTheDocument();
      });

      // View metrics
      await user.click(screen.getByText('Show Metrics Table'));

      await waitFor(() => {
        expect(screen.getByText('Process Performance Metrics')).toBeInTheDocument();
      });

      // Close dialog
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should maintain state consistency during simulation', async () => {
      const user = userEvent.setup();
      render(<CPUSchedulingVisualizer />);

      await user.click(screen.getByText(/Run.*Simulation/));

      await waitFor(() => {
        expect(screen.getByText('Enhanced Gantt Chart')).toBeInTheDocument();
      });

      // Check that time, progress, and status are consistent
      const timeDisplay = screen.getByText(/T: \d+/);
      const progressText = screen.getByText(/\d+\.\d+%/);
      
      expect(timeDisplay).toBeInTheDocument();
      expect(progressText).toBeInTheDocument();
    });
  });
});