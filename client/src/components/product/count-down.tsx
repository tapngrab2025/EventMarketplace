import React from 'react';
import Countdown from 'react-countdown';

interface CountDownProps {
  date: Date | number;
  className?: string;
  variant?: "default" | "bar";
}

// Default renderer (boxed style)
const defaultRenderer = ({ days, hours, minutes, seconds, completed }: any) => {
  if (completed) return <span>You are too late!</span>;
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
};

// Bar renderer (hero style)
const barRenderer = ({ days, hours, minutes, seconds, completed }: any) => {
  const waveSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='260' viewBox='0 0 1600 260'>
      <path d='M0,170 C320,110 640,230 960,170 C1280,110 1600,230 1920,170' stroke='rgba(255,255,255,0.12)' stroke-width='1.6' fill='none'/>
      <path d='M0,150 C320,90 640,210 960,150 C1280,90 1600,210 1920,150' stroke='rgba(255,255,255,0.09)' stroke-width='1.3' fill='none'/>
      <path d='M0,190 C320,130 640,250 960,190 C1280,130 1600,250 1920,190' stroke='rgba(255,255,255,0.07)' stroke-width='1.1' fill='none'/>
      <path d='M0,210 C320,150 640,270 960,210 C1280,150 1600,270 1920,210' stroke='rgba(255,255,255,0.05)' stroke-width='1.0' fill='none'/>
    </svg>`
  );
  if (completed) {
    return (
      <div
        className="rounded-3xl px-8 py-6 min-h-[100px]"
        style={{
          backgroundImage: `linear-gradient(145deg, rgba(6,26,31,0.95), rgba(11,36,43,0.95)), url("data:image/svg+xml;utf8,${waveSvg}")`,
          backgroundBlendMode: "overlay, normal",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "center",
          backgroundSize: "1600px 260px",
        }}
      >
        <div className="grid grid-cols-1 text-center">
          <span className="text-white">Event Ended</span>
        </div>
      </div>);
  }
  return (
    <div
      className="rounded-3xl px-8 py-6"
      style={{
        backgroundImage: `linear-gradient(145deg, rgba(6,26,31,0.92), rgba(11,36,43,0.92)), url("data:image/svg+xml;utf8,${waveSvg}")`,
        backgroundBlendMode: "overlay, normal",
        backgroundRepeat: "repeat-x",
        backgroundPosition: "center",
        backgroundSize: "1600px 260px",
      }}
    >
      <div className="grid grid-cols-4 gap-6 text-center">
        <div>
          <div className="text-3xl font-bold text-primaryOrange">{pad(days)}</div>
          <div className="text-white/80 text-sm">Days</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-primaryGreen">{pad(hours)}</div>
          <div className="text-white/80 text-sm">Hours</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-teal-300">{pad(minutes)}</div>
          <div className="text-white/80 text-sm">Minutes</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">{pad(seconds)}</div>
          <div className="text-white/80 text-sm">Seconds</div>
        </div>
      </div>
    </div>
  );
};

const CountDown: React.FC<CountDownProps> = ({ date, className, variant = "default" }) => {
  const renderer = variant === "bar" ? barRenderer : defaultRenderer;
  return (
    <div className={className}>
      <Countdown date={date} renderer={renderer} />
    </div>
  );
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default CountDown;
