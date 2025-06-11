import React from 'react';
import Countdown from 'react-countdown';

interface CountDownProps {
  date: Date | number;
  className?: string;
}

// Renderer callback with condition
const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
  if (completed) {
    return <span>You are too late!</span>;
  } else {
    return (
      <div className="flex gap-5">
        <div className="text-center border border-[#A3A3A3] flex flex-col rounded-2xl min-w-[70px] py-2.5 px-4">
          <span className="countdown font-semibold text-2xl">{days}</span>
          <span className="text-sm">days</span>
        </div>
        <div className="text-center border border-[#A3A3A3] flex flex-col rounded-2xl min-w-[70px] py-2.5 px-4">
          <span className="countdown font-semibold text-2xl">{hours}</span>
          <span className="text-sm">hours</span>
        </div>
        <div className="text-center border border-[#A3A3A3] flex flex-col rounded-2xl min-w-[70px] py-2.5 px-4">
          <span className="countdown font-semibold text-2xl">{minutes}</span>
          <span className="text-sm">min</span>
        </div>
        <div className="text-center border border-[#A3A3A3] flex flex-col rounded-2xl min-w-[70px] py-2.5 px-4">
          <span className="countdown font-semibold text-2xl">{seconds}</span>
          <span className="text-sm">sec</span>
        </div>
      </div>
    );
  }
};

const CountDown: React.FC<CountDownProps> = ({ date, className }) => {
  return (
    <div className={className}>
      <Countdown date={date} renderer={renderer} />
    </div>
  );
};

export default CountDown;
