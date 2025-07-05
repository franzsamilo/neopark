import React from "react";
import { Car, Square } from "lucide-react";

interface ParkingDisplayTestProps {
  isParked: boolean;
}

function ParkingDisplayTest({ isParked }: ParkingDisplayTestProps) {
  return (
    <div className="parking-display">
      <div className="parking-spot">
        {isParked ? (
          <div className="car">
            <Car size={48} />
          </div>
        ) : (
          <div className="empty-spot">
            <Square size={48} />
          </div>
        )}
      </div>
      <p>{isParked ? "Occupied" : "Available"}</p>
    </div>
  );
}

export default ParkingDisplayTest;
