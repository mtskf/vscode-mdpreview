import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CopyButton from '../components/CopyButton';

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock document.execCommand for fallback
document.execCommand = vi.fn();

describe('CopyButton', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<CopyButton text="some code" />);
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('copies text to clipboard when clicked', async () => {
    render(<CopyButton text="some code" />);
    const button = screen.getByRole('button', { name: /copy/i });

    fireEvent.click(button);
    expect(mockWriteText).toHaveBeenCalledWith('some code');
  });

  it('uses fallback if clipboard API fails', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'));
    render(<CopyButton text="fallback code" />);
    const button = screen.getByRole('button', { name: /copy/i });

    fireEvent.click(button);

    // Wait for the async writeText failure to be handled and fallback triggered
    await new Promise(process.nextTick);

    // Fallback creates textarea and calls execCommand
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });

  it('logs when execCommand fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard error'));
    (document.execCommand as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error('execCommand failed');
    });

    render(<CopyButton text="error case" />);
    const button = screen.getByRole('button', { name: /copy/i });

    fireEvent.click(button);
    await new Promise(process.nextTick);

    expect(errorSpy).toHaveBeenCalledWith('Copy failed:', expect.any(Error));

    errorSpy.mockRestore();
  });
});
