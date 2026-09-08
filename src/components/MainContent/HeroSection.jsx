import logo from "./../../assets/permata.png";

export default function HeroSection() {
  return (
    <div className="max-w-2xl w-full flex flex-col items-center text-center mb-12 mt-8">
      <img src={logo} alt="Permata AI" className="w-20 h-20 mb-8" />

      <h1 className="font-display-lg text-headline-lg text-on-surface mb-6 leading-tight">
        Think bigger with{" "}
        <span className="text-primary font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#800020] to-[#FFD700]">
          Permata AI
        </span>{" "}
        for insights and innovation at your command
      </h1>
      <p className="font-body-lg text-on-surface-variant max-w-xl leading-relaxed">
        Turn imagination into impact with Permata AI built to unlock endless
        possibilities and shape your ideas into intelligent results.
      </p>
    </div>
  );
}
