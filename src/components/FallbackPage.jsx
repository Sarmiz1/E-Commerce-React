import { useNavigate } from 'react-router-dom';

const FallbackPage = (props) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/', { replace: true }); // replace avoids going back to error page
    props.resetErrorBoundary(); // optional: reset boundary state
  };

  return (
    <section
      className="
        flex flex-col h-dvh justify-center items-center gap-4
        animate-fadeIn p-4
      "
    >
      <img
        src='/images/error/error.jpg'
        alt='Page not found'
        className="w-64 md:w-70 rounded-lg shadow-lg lg:w-60"
      />

      <p className="text-center text-base font-poppins font-semibold text-gray-900 dark:text-gray-600 leading-relaxed w-[45ch]">
        Something went wrong. Try clicking the refresh page button to reload the application or go back to homepage.
      </p>

      <div className="flex flex-row gap-4 mt-4">
        <button
          className='bg-yellow-700 w-32 rounded-2xl text-slate-100 hover:bg-yellow-600 transition-colors py-2'
          onClick={props.resetErrorBoundary}
        >
          Refresh page
        </button>

        <button
          className='bg-yellow-700 w-32 rounded-2xl text-slate-100 hover:bg-yellow-600 transition-colors py-2'
          onClick={handleGoHome}
        >
          Go home
        </button>
      </div>
    </section>
  );
};

export default FallbackPage;