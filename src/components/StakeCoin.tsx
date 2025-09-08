import React from "react";

type Props = {
  onClick?: () => void;
};

const StakeCoin = ({ onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className="
        relative
        px-8 py-4
        w-full max-w-sm
        rounded-2xl
        bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500
        hover:from-pink-600 hover:via-purple-700 hover:to-blue-600
        active:scale-95
        transition-all duration-300 ease-in-out
        shadow-lg hover:shadow-xl
        border-0
        cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-white/50
      "
    >
      <span
        className="
        text-white
        font-medium
        text-4xl
        tracking-wide
        select-none
        drop-shadow-sm
      "
      >
        stack $jellu
      </span>
    </button>
  );
};

export default StakeCoin;
