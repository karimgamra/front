import img from "../assets/undraw_personal-notebook_blje.svg";
const Hero = () => {
  return (
    <section className="flex flex-col items-center text-center py-20 bg-gradient-to-r from-base-300 to-base-100 text-base-content">
      <div className="max-w-7xl flex flex-col md:flex-row items-center gap-12 px-6 md:px-12">
        {/* Text Section */}
        <div className="md:w-1/2 text-left">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-base-content">
            Teach, Present, Inspire
          </h1>
          <p className="text-lg md:text-xl mt-4 text-base-content">
            The ultimate platform for teachers to create interactive
            presentations and seamlessly share documents with students.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-blue-700 transition-all">
              Get Started
            </button>
            <button className="bg-gray-200 text-gray-900 px-6 py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-gray-300 transition-all">
              Learn More
            </button>
          </div>
        </div>

        {/* Image Section with Animations */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src={img}
            alt="Teacher presenting"
            className="w-full md:max-w-xl animate-float transition-transform duration-500 ease-in-out hover:scale-105"
          />
        </div>
      </div>

      {/* Keyframe Animation */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}
      </style>
    </section>
  );
};

export default Hero;
