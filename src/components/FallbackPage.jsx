import { useNavigate } from 'react-router-dom';
import errorImg from '../assets/error/error.jpg'; // if importing via module

const FallbackPage = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/', { replace: true }); // avoids going back to error page
  };

  const handleRefresh = () => {
    window.location.reload(); // just refresh the page
  };

  return (
    <section
      className="
        flex flex-col h-dvh justify-center items-center gap-4
        animate-fadeIn p-4
      "
    >
      <img
        src={errorImg} // or "/images/error/error.jpg" if using public folder
        alt="Page not found"
        className="w-64 md:w-70 rounded-lg shadow-lg lg:w-60"
      />

      <p className="text-center text-base font-poppins font-semibold text-gray-900 dark:text-gray-600 leading-relaxed w-[45ch]">
        Something went wrong. Try refreshing the page or go back to the homepage.
      </p>

      <div className="flex flex-row gap-4 mt-4">
        <button
          className="bg-yellow-700 w-32 rounded-2xl text-slate-100 hover:bg-yellow-600 transition-colors py-2"
          onClick={handleRefresh}
        >
          Refresh page
        </button>

        <button
          className="bg-yellow-700 w-32 rounded-2xl text-slate-100 hover:bg-yellow-600 transition-colors py-2"
          onClick={handleGoHome}
        >
          Go home
        </button>
      </div>
    </section>
  );
};

export default FallbackPage;