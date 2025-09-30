export function Background() {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full -z-20 bg-gradient-to-br from-[#200E01] via-[#2a0f03] to-[#200E01]" />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10 opacity-30"
        style={{
          background: "radial-gradient(circle at center, #8B0000 0%, transparent 70%)",
          animation: "pulse 8s infinite",
        }}
      />
    </>
  )
}
