const Footer = () => {
  const date = new Date();

  return (
    <footer className="p-4 h-[200px] min-[850px]:text-2xl text-xl font-bold text-white dark:text-black drop-shadow-[1px_1px_black] dark:drop-shadow-[0px_1px_white]">
      <p className="text-center min-[700px]:-mb-8 dark:text-black">
        &copy;{date.getFullYear()}
      </p>
      <div className="flex flex-col justify-around min-[700px]:justify- items-center h-full min-[700px]:flex-row">
        <p>udohsplatform</p>
        <p className="text-center max-[700px]:text-white">
          Every great mind needs a platform.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
