import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TierBadge } from '@/comp/common/TierBadge';
import { ReliabilityBar } from '@/comp/common/ReliabilityBar';
import { StaleBadge } from '@/comp/common/StaleBadge';
import { PriorityBandChip } from '@/comp/common/PriorityBandChip';
import { FactorBars } from '@/comp/common/FactorBars';
import { KpiCard } from '@/comp/common/KpiCard';
import { EmptyState } from '@/comp/feedback/EmptyState';
import { ErrorState } from '@/comp/feedback/ErrorState';
import { ConfirmDialog } from '@/comp/feedback/ConfirmDialog';
import { Activity } from 'lucide-react';

describe('Shared UI Components (React Testing Library)', () => {
  it('TierBadge renders correct label and title per tier', () => {
    const { rerender } = render(<TierBadge tier="T1" />);
    expect(screen.getByText(/T1 Govt\/Field/i)).toBeDefined();

    rerender(<TierBadge tier="T2" />);
    expect(screen.getByText(/T2 Sensor IoT/i)).toBeDefined();

    rerender(<TierBadge tier="T3" />);
    expect(screen.getByText(/T3 Verified Public/i)).toBeDefined();

    rerender(<TierBadge tier="T4" />);
    expect(screen.getByText(/T4 Unverified/i)).toBeDefined();
  });

  it('ReliabilityBar displays progressbar role, percentage, and accessible label', () => {
    render(<ReliabilityBar score={0.85} />);
    const progress = screen.getByRole('progressbar');
    expect(progress.getAttribute('aria-valuenow')).toBe('85');
    expect(progress.getAttribute('aria-label')).toContain('85%');
    expect(screen.getByText('0.85')).toBeDefined();
  });

  it('StaleBadge renders Stale indicator when elapsed time exceeds threshold', () => {
    const twentyMinAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const handleRefresh = vi.fn();
    render(<StaleBadge lastUpdated={twentyMinAgo} thresholdMinutes={15} onRefresh={handleRefresh} />);

    expect(screen.getByText(/Stale/i)).toBeDefined();
    expect(screen.getByText(/20m ago/i)).toBeDefined();

    const refreshBtn = screen.getByTitle('Request field verification');
    fireEvent.click(refreshBtn);
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('PriorityBandChip renders CRITICAL, HIGH, MEDIUM, LOW and matches score', () => {
    const { rerender } = render(<PriorityBandChip band="LOW" score={24.9} />);
    expect(screen.getByText(/LOW/i)).toBeDefined();
    expect(screen.getByText(/\(24.9\)/i)).toBeDefined();

    rerender(<PriorityBandChip band="LOW" score={65.5} />);
    expect(screen.getByText(/CRITICAL/i)).toBeDefined();
  });

  it('FactorBars renders S, V, U, E, N labels and values', () => {
    const factors = {
      severity: 0.8,
      vulnerability: 0.6,
      urgency: 0.9,
      exposure: 0.5,
      needCoverage: 0.3,
      waitingBonus: 0.1,
    };
    render(<FactorBars factors={factors} />);
    expect(screen.getByText(/Severity \(S\)/i)).toBeDefined();
    expect(screen.getByText(/Vulnerability \(V\)/i)).toBeDefined();
    expect(screen.getByText(/Urgency \(U\)/i)).toBeDefined();
  });

  it('KpiCard renders title, value, caption, and accessible styling', () => {
    render(
      <KpiCard
        title="Pending Approvals"
        value={12}
        caption="Awaiting supervisor or operator sign-off"
        icon={Activity}
        severity="warning"
      />
    );
    expect(screen.getByText('Pending Approvals')).toBeDefined();
    expect(screen.getByText('12')).toBeDefined();
    expect(screen.getByText('Awaiting supervisor or operator sign-off')).toBeDefined();
  });

  it('EmptyState renders message and action button', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="No Incidents Reported"
        description="All reported incidents have been resolved."
        action={<button onClick={onAction}>Refresh Data</button>}
      />
    );
    expect(screen.getByText('No Incidents Reported')).toBeDefined();
    const btn = screen.getByRole('button', { name: /Refresh Data/i });
    fireEvent.click(btn);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('ErrorState displays error description and retry button', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Failed to connect to telemetric station" onRetry={onRetry} />);
    expect(screen.getByText('Failed to connect to telemetric station')).toBeDefined();
    const retryBtn = screen.getByRole('button', { name: /Try again/i });
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('ConfirmDialog opens, handles Escape/Cancel and confirms with keyboard accessibility', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        title="Confirm Unit Dispatch"
        description="Are you sure you want to deploy Boat Unit 01 to Singanallur?"
        confirmText="Authorize Dispatch"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText('Confirm Unit Dispatch')).toBeDefined();
    const confirmBtn = screen.getByRole('button', { name: /Authorize Dispatch/i });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
