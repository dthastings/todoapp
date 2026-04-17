import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';

describe('App', () => {
  it('shows default temperature of 21C', () => {
    render(<App />);
    expect(screen.getByText('21C')).toBeInTheDocument();
  });

  it('updates feed time slider and ripe output', () => {
    render(<App />);

    const before = screen.getByText(/Starter ripe at/i).nextElementSibling?.textContent;
    const slider = screen.getByLabelText(/feed your starter today/i);
    fireEvent.change(slider, { target: { value: '60' } });

    const after = screen.getByText(/Starter ripe at/i).nextElementSibling?.textContent;
    expect(after).not.toEqual(before);
  });

  it('uses current time when selecting ready now', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-23T10:05:00'));

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /my starter is ready now/i }));

    expect(screen.getByText(/Using current time as the starter-ready start point/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bake without cold proof/i })).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('does not show bake options until feed time changes or ready-now is used', () => {
    render(<App />);
    expect(screen.queryByRole('button', { name: /bake without cold proof/i })).not.toBeInTheDocument();
  });

  it('shows bake options after feed time changes', () => {
    render(<App />);
    const slider = screen.getByLabelText(/feed your starter today/i);
    fireEvent.change(slider, { target: { value: '60' } });

    expect(screen.getByRole('button', { name: /bake without cold proof/i })).toBeInTheDocument();
  });

  it('shows proof result shape based on selected option', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/feed your starter today/i), { target: { value: '60' } });
    fireEvent.click(screen.getByRole('button', { name: /bake with cold proof/i }));

    const readyText = screen.getByText('Ready to bake').nextElementSibling?.textContent ?? '';
    expect(readyText.toLowerCase()).toContain(' to ');

    fireEvent.click(screen.getByRole('button', { name: /bake without cold proof/i }));
    const readyTextNoCold = screen.getByText('Ready to bake').nextElementSibling?.textContent ?? '';
    expect(readyTextNoCold.toLowerCase()).not.toContain(' to ');
  });

  it('shows today or tomorrow in output labels', () => {
    render(<App />);
    const label = screen.getByText(/Starter ripe at/i).nextElementSibling?.textContent?.toLowerCase() ?? '';
    expect(label.includes('today') || label.includes('tomorrow')).toBe(true);
  });

  it('switches to the amount calculator tab', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /sourdough amount calculator/i }));

    expect(screen.getByLabelText(/how much starter do you need for bread/i)).toBeInTheDocument();
  });

  it('shows default amount breakdown for 8g desired starter', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /sourdough amount calculator/i }));

    expect(screen.getByText('58.0g')).toBeInTheDocument();
    expect(screen.getByText('11.6g')).toBeInTheDocument();
    expect(screen.getAllByText('23.2g')).toHaveLength(2);
  });

  it('updates amount breakdown when desired starter changes', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /sourdough amount calculator/i }));
    const input = screen.getByLabelText(/how much starter do you need for bread/i);

    fireEvent.change(input, { target: { value: '20' } });

    expect(screen.getByText('70.0g')).toBeInTheDocument();
    expect(screen.getByText('14.0g')).toBeInTheDocument();
    expect(screen.getAllByText('28.0g')).toHaveLength(2);
  });

  it('switches to timeline mode and shows recipe steps', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /timeline mode/i }));

    expect(screen.getByText(/timeline start/i)).toBeInTheDocument();
    expect(screen.getByText('Prepare levain')).toBeInTheDocument();
    expect(screen.getByText('Bake')).toBeInTheDocument();
  });

  it('uses selected start time for timeline mode', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(/feed your starter today/i), { target: { value: '60' } });
    const ripeDisplay = screen.getByText(/Starter ripe at/i).nextElementSibling?.textContent;
    fireEvent.click(screen.getByRole('tab', { name: /timeline mode/i }));

    const startDisplay = screen.getByText(/timeline start/i).nextElementSibling?.textContent;
    const firstStepDisplay = document.querySelector('.recipe-step-time')?.textContent;
    expect(startDisplay).toEqual(ripeDisplay);
    expect(firstStepDisplay).toEqual(startDisplay);
  });
});
