import React from 'react';
import AdditionalScreensList from './AdditionalScreensList';

export default function AdditionalScreensView({ session, positions, onPositionSelect, selectedPositionId }) {
  return (
    <AdditionalScreensList
      positions={positions}
      scanResults={session.scan_results || []}
      onScreenSelect={onPositionSelect}
      selectedScreenId={selectedPositionId}
    />
  );
}