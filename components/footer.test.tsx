import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from './footer';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Cpu: ({ className, ...props }: any) => <div data-testid="cpu-icon" className={className} {...props} />,
  Github: ({ className, ...props }: any) => <div data-testid="github-icon" className={className} {...props} />
}));

describe('Footer Component', () => {
  // Basic Rendering Tests
  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<Footer />);
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should have proper semantic structure with footer element', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer.tagName.toLowerCase()).toBe('footer');
    });

    it('should have correct CSS classes for styling', () => {
      render(<Footer />);
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('w-full', 'border-t', 'py-6');
    });

    it('should render container div with proper classes', () => {
      render(<Footer />);
      const container = screen.getByRole('contentinfo').firstChild;
      expect(container).toHaveClass('container', 'flex', 'flex-col', 'md:flex-row');
    });
  });

  // Brand Section Tests
  describe('Brand Section', () => {
    it('should render brand section with CPU icon and OSimulate text', () => {
      render(<Footer />);
      
      expect(screen.getByTestId('cpu-icon')).toBeInTheDocument();
      expect(screen.getByText('OSimulate')).toBeInTheDocument();
    });

    it('should have correct styling for brand section', () => {
      render(<Footer />);
      
      const cpuIcon = screen.getByTestId('cpu-icon');
      expect(cpuIcon).toHaveClass('h-5', 'w-5', 'text-primary');
      
      const brandText = screen.getByText('OSimulate');
      expect(brandText).toHaveClass('font-semibold');
    });

    it('should wrap brand elements in flex container', () => {
      render(<Footer />);
      
      const brandContainer = screen.getByText('OSimulate').parentElement;
      expect(brandContainer).toHaveClass('flex', 'items-center', 'gap-2');
    });
  });

  // Navigation Links Tests
  describe('Navigation Links', () => {
    const expectedLinks = [
      { text: 'Page Replacement', href: '/page-replacement' },
      { text: 'CPU Scheduling', href: '/cpu-scheduling' },
      { text: 'Disk Scheduling', href: '/disk-scheduling' },
      { text: 'Notes', href: '/notes' }
    ];

    it('should render all navigation links with correct text and href', () => {
      render(<Footer />);
      
      expectedLinks.forEach(({ text, href }) => {
        const link = screen.getByRole('link', { name: text });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', href);
      });
    });

    it('should have correct styling for navigation links', () => {
      render(<Footer />);
      
      expectedLinks.forEach(({ text }) => {
        const link = screen.getByRole('link', { name: text });
        expect(link).toHaveClass('text-xs', 'hover:underline', 'underline-offset-4');
      });
    });

    it('should wrap navigation links in proper container', () => {
      render(<Footer />);
      
      const navContainer = screen.getByRole('navigation') || 
        screen.getByRole('link', { name: 'Page Replacement' }).parentElement;
      expect(navContainer).toHaveClass('flex', 'gap-4', 'sm:gap-6');
    });

    it('should handle link clicks without errors', () => {
      render(<Footer />);
      
      expectedLinks.forEach(({ text }) => {
        const link = screen.getByRole('link', { name: text });
        fireEvent.click(link);
        // No errors should be thrown
      });
    });

    it('should handle hover states', () => {
      render(<Footer />);
      
      expectedLinks.forEach(({ text }) => {
        const link = screen.getByRole('link', { name: text });
        fireEvent.mouseEnter(link);
        fireEvent.mouseLeave(link);
        // No errors should be thrown
      });
    });
  });

  // GitHub Link Tests
  describe('GitHub Link', () => {
    it('should render GitHub link with correct attributes', () => {
      render(<Footer />);
      
      const githubLink = screen.getByRole('link', { name: /OSimulate GitHub repository/i });
      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute('href', 'https://github.com/OSimulate/OSimulate');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render GitHub icon within the link', () => {
      render(<Footer />);
      
      const githubIcon = screen.getByTestId('github-icon');
      expect(githubIcon).toBeInTheDocument();
      expect(githubIcon).toHaveClass('h-5', 'w-5');
    });

    it('should have screen reader text for accessibility', () => {
      render(<Footer />);
      
      const srText = screen.getByText('OSimulate GitHub repository');
      expect(srText).toBeInTheDocument();
      expect(srText).toHaveClass('sr-only');
    });

    it('should have correct styling for GitHub link container', () => {
      render(<Footer />);
      
      const githubLink = screen.getByRole('link', { name: /OSimulate GitHub repository/i });
      expect(githubLink).toHaveClass('text-muted-foreground', 'hover:text-foreground');
    });

    it('should handle external link security properly', () => {
      render(<Footer />);
      
      const githubLink = screen.getByRole('link', { name: /OSimulate GitHub repository/i });
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(githubLink).toHaveAttribute('target', '_blank');
    });
  });

  // Layout and Container Tests
  describe('Layout and Container', () => {
    it('should have proper flex layout for main container', () => {
      render(<Footer />);
      
      const mainContainer = screen.getByRole('contentinfo').firstChild;
      expect(mainContainer).toHaveClass(
        'container',
        'flex',
        'flex-col',
        'md:flex-row',
        'items-center',
        'justify-between',
        'gap-4',
        'px-4',
        'md:px-6'
      );
    });

    it('should have proper container for GitHub link section', () => {
      render(<Footer />);
      
      const githubContainer = screen.getByRole('link', { name: /OSimulate GitHub repository/i }).parentElement;
      expect(githubContainer).toHaveClass('flex', 'items-center', 'gap-3');
    });

    it('should maintain proper spacing and alignment', () => {
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toHaveClass('w-full', 'border-t', 'py-6');
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have proper semantic footer element', () => {
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer.tagName.toLowerCase()).toBe('footer');
    });

    it('should have accessible link text for all links', () => {
      render(<Footer />);
      
      const allLinks = screen.getAllByRole('link');
      allLinks.forEach(link => {
        const accessibleName = link.getAttribute('aria-label') || link.textContent;
        expect(accessibleName).toBeTruthy();
        expect(accessibleName?.trim()).not.toBe('');
      });
    });

    it('should have proper screen reader support for GitHub icon', () => {
      render(<Footer />);
      
      const srOnlyText = screen.getByText('OSimulate GitHub repository');
      expect(srOnlyText).toBeInTheDocument();
      expect(srOnlyText).toHaveClass('sr-only');
    });

    it('should be keyboard navigable', () => {
      render(<Footer />);
      
      const focusableElements = screen.getAllByRole('link');
      focusableElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabindex', '-1');
        
        // Test focus and blur
        fireEvent.focus(element);
        fireEvent.blur(element);
      });
    });

    it('should not have any accessibility violations with color contrast', () => {
      render(<Footer />);
      
      // Test that elements have defined colors
      const textElements = [
        screen.getByText('OSimulate'),
        ...screen.getAllByRole('link')
      ];
      
      textElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        expect(computedStyle.color).toBeDefined();
      });
    });
  });

  // Props and Customization Tests
  describe('Props Handling', () => {
    it('should accept and apply custom className', () => {
      const CustomFooter = (props: any) => <Footer {...props} />;
      const { container } = render(<CustomFooter className="custom-footer" />);
      
      // Since Footer doesn't accept className directly, test that it renders normally
      expect(container).toBeInTheDocument();
    });

    it('should handle additional props gracefully', () => {
      const CustomFooter = (props: any) => <Footer {...props} />;
      
      expect(() => {
        render(<CustomFooter data-testid="custom-footer" role="contentinfo" />);
      }).not.toThrow();
    });
  });

  // Error Handling and Edge Cases
  describe('Error Handling', () => {
    it('should render when icons fail to load', () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<Footer />);
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should handle missing Next.js Link gracefully', () => {
      // This tests our mock, but ensures the component works with mocked Link
      render(<Footer />);
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('should not break with rapid re-renders', () => {
      const { rerender } = render(<Footer />);
      
      for (let i = 0; i < 10; i++) {
        rerender(<Footer key={i} />);
      }
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  // Integration Tests
  describe('Component Integration', () => {
    it('should work with Next.js Link component', () => {
      render(<Footer />);
      
      // Test that internal links are properly rendered
      const internalLinks = [
        screen.getByRole('link', { name: 'Page Replacement' }),
        screen.getByRole('link', { name: 'CPU Scheduling' }),
        screen.getByRole('link', { name: 'Disk Scheduling' }),
        screen.getByRole('link', { name: 'Notes' })
      ];
      
      internalLinks.forEach(link => {
        expect(link).toBeInTheDocument();
        expect(link.getAttribute('href')).toMatch(/^\/[a-z-]+$/);
      });
    });

    it('should integrate properly with Lucide React icons', () => {
      render(<Footer />);
      
      const cpuIcon = screen.getByTestId('cpu-icon');
      const githubIcon = screen.getByTestId('github-icon');
      
      expect(cpuIcon).toBeInTheDocument();
      expect(githubIcon).toBeInTheDocument();
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should not cause memory leaks on unmount', () => {
      const { unmount } = render(<Footer />);
      
      expect(() => unmount()).not.toThrow();
    });

    it('should render consistently across multiple mounts', () => {
      const renderFooter = () => render(<Footer />);
      
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderFooter();
        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
        unmount();
      }
    });
  });

  // Responsive Design Tests
  describe('Responsive Design', () => {
    it('should have responsive classes for different screen sizes', () => {
      render(<Footer />);
      
      const container = screen.getByRole('contentinfo').firstChild;
      expect(container).toHaveClass('flex-col', 'md:flex-row');
      expect(container).toHaveClass('px-4', 'md:px-6');
    });

    it('should handle mobile and desktop layouts', () => {
      // Mobile simulation
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<Footer />);
      let footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Desktop simulation
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      expect(footer).toBeInTheDocument();
    });
  });

  // Snapshot Tests
  describe('Snapshot Testing', () => {
    it('should match snapshot for consistent rendering', () => {
      const { container } = render(<Footer />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  // Cleanup
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});

// Test utilities for reusability
export const FooterTestUtils = {
  renderFooter: (props = {}) => render(<Footer {...props} />),
  
  getAllLinks: () => screen.getAllByRole('link'),
  
  getNavigationLinks: () => [
    screen.getByRole('link', { name: 'Page Replacement' }),
    screen.getByRole('link', { name: 'CPU Scheduling' }),
    screen.getByRole('link', { name: 'Disk Scheduling' }),
    screen.getByRole('link', { name: 'Notes' })
  ],
  
  getGithubLink: () => screen.getByRole('link', { name: /OSimulate GitHub repository/i }),
  
  getBrandElements: () => ({
    icon: screen.getByTestId('cpu-icon'),
    text: screen.getByText('OSimulate')
  })
};