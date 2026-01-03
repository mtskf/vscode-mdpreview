import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Toc from '../components/Toc';

describe('Toc Component', () => {
  it('renders nothing if no headings', () => {
    const { container } = render(<Toc content="Just text" />);
    // Should be empty or null. The component returns null if no headings?
    // Let's check logic: extractHeadings returns empty -> mapped to null?
    // In App.tsx: {content && <Toc ...>}
    // In Toc.tsx: return <nav>...
    // If headings empty?
    // The component renders <ul> empty?
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('generates unique IDs for duplicate headings', () => {
    const content = `
# Duplicate
# Duplicate
# Duplicate
    `;
    render(<Toc content={content} />);

    const items = screen.getAllByRole('button');
    expect(items).toHaveLength(3);

    // Check titles (visible text)
    expect(items[0]).toHaveTextContent('Duplicate');
    expect(items[1]).toHaveTextContent('Duplicate');
    expect(items[2]).toHaveTextContent('Duplicate');

    // Internal IDs are not directly on the button usually, let's check validation logic if possible.
    // Toc.tsx calls onNavigate with ID.
    // We can spy onNavigate.
  });

  it('calls onNavigate with correct unique slugs when clicked', () => {
    const handleNavigate = vi.fn();
    const content = `
# Duplicate
# Duplicate
    `;
    render(<Toc content={content} onNavigate={handleNavigate} />);

    const items = screen.getAllByText('Duplicate');

    // Click first
    fireEvent.click(items[0]);
    expect(handleNavigate).toHaveBeenCalledWith('duplicate');

    // Click second
    fireEvent.click(items[1]);
    expect(handleNavigate).toHaveBeenCalledWith('duplicate-1');
  });

  it('handles special characters in headings', () => {
    const handleNavigate = vi.fn();
    const content = `# Hello World! @ 123`;
    render(<Toc content={content} onNavigate={handleNavigate} />);

    const item = screen.getByText('Hello World! @ 123');
    fireEvent.click(item);

    // github-slugger typically lowercases and replaces non-chars.
    // "hello-world--123" or similar.
    // Actually github-slugger behavior: "hello-world--123" -> 'hello-world--123'
    // Let's expect failure first or check implementation.
    // valid slug for "Hello World! @ 123" -> "hello-world--123"
    expect(handleNavigate).toHaveBeenCalledWith('hello-world--123');
  });
});
