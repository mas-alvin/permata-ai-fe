import logo from "./../../assets/permata.png";
export default function HeroSection() {
  return (
    <div className="w-full flex flex-col items-center text-center">
      <img src={logo} alt="Permata AI" className="w-20 h-20 mb-8" />
      <h1 className="font-display-lg text-headline-lg text-on-surface mb-2 leading-tight">
        Think bigger with{" "}
        <span className="text-primary font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#800020] to-[#FFD700]">
          Permata AI
        </span>{" "}
        for insights and innovation at your command
      </h1>
    </div>
  )
}