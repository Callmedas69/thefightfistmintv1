import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  startTimestamp: bigint; // Use bigint if startTimestamp is a BigInt
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ startTimestamp }) => {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());

  function calculateTimeRemaining() {
    const startTime = Number(startTimestamp) * 1000; // Convert to milliseconds if using BigInt
    const currentTime = Date.now();
    const difference = startTime - currentTime;

    return difference > 0 ? difference : 0; // Avoid negative time
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer); // Cleanup on component unmount
  }, [startTimestamp]);

  // Format time into days, hours, minutes, seconds
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  return (
    <div>
      {timeRemaining > 0 ? (
        <div>
          {days}d {hours}h {minutes}m {seconds}s
        </div>
      ) : (
        <span>Minting Now</span>
      )}
    </div>
  );
};

export default CountdownTimer;
