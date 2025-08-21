export default function Corners() {
  return (
    <>
      <div className="h-[24px] w-[4px] absolute top-0 left-0 bg-white" />
      <div className="h-[24px] w-[4px] absolute top-0 right-0 bg-white" />
      <div className="h-[24px] w-[4px] absolute bottom-0 left-0 bg-white" />
      <div className="h-[24px] w-[4px] absolute bottom-0 right-0 bg-white" />

      <div className="h-[4px] w-[24px] absolute top-0 left-0 bg-white" />
      <div className="h-[4px] w-[24px] absolute top-0 right-0 bg-white" />
      <div className="h-[4px] w-[24px] absolute bottom-0 left-0 bg-white" />
      <div className="h-[4px] w-[24px] absolute bottom-0 right-0 bg-white" />
    </>
  );
}
