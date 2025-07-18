import React from 'react';
import GantryPosition from '../gantry/GantryPosition';

// A generic component to render a row of gantry positions using a wrapping flexbox layout.
function GantryLayout({ row, onPositionSelect, getScanResult, getPositionStatus, selectedPositionId }) {
  return (
    <div className="flex flex-wrap gap-x-2 gap-y-8 justify-center">
      {row.map(position => (
        <GantryPosition
          key={position.id}
          position={position}
          onClick={() => onPositionSelect(position)}
          scanResult={getScanResult(position.id)}
          status={getPositionStatus(position.id)}
          isSelected={selectedPositionId === position.id}
        />
      ))}
    </div>
  );
}

// Main GantryView component that organizes the rows
export default function GantryView({ session, positions, onPositionSelect, selectedPositionId }) {
  const getScanResult = (positionId) => {
    return session.scan_results?.find(r => r.position_id === positionId);
  };
  
  const getPositionStatus = (positionId) => {
    const result = getScanResult(positionId);
    if (result && result.model_id && result.serial_number && result.asset_tag) {
      return "completed";
    }
    return "pending";
  };
  
  const topRow = positions.filter(p => p.row === 'top').sort((a,b) => a.column - b.column);
  const bottomRow = positions.filter(p => p.row === 'bottom').sort((a,b) => a.column - b.column);

  const commonProps = {
    onPositionSelect,
    selectedPositionId,
    getScanResult,
    getPositionStatus,
  };

  return (
    // Removed overflow-x-auto and min-w-max to allow content to wrap naturally
    <div className="p-4 sm:p-6 bg-gray-50 rounded-lg">
      <div className="space-y-12">
        {topRow.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-center text-gray-600 mb-4">Top Row</div>
            <GantryLayout row={topRow} {...commonProps} />
          </div>
        )}
        
        {bottomRow.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-center text-gray-600 mb-4">Bottom Row</div>
            <GantryLayout row={bottomRow} {...commonProps} />
          </div>
        )}
      </div>
    </div>
  );
}