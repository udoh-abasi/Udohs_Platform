const OurStory = () => {
  return (
    <>
      <title>Our Story - udohsplatform</title>
      <meta name="description" content="udohsplatform story and About us" />

      <main className="min-h-screen pt-[5rem] mx-auto">
        <h1 id="AboutHeader" className="h-[50vh] grid place-items-center">
          <span className="text-black uppercase font-bold text-5xl min-[700px]:text-6xl">
            Our story
          </span>
        </h1>

        <article className="grid justify-center p-4">
          <div className="max-w-[700px]">
            <p className="text-justify mb-4 first-letter:text-5xl first-letter:font-bold">
              Welcome to udohsplatform, your go-to source for thought-provoking
              and inspiring contents. We are a team of passionate writers and
              editors who are dedicated to bringing you the best possible
              reading experience
            </p>

            <p className="text-justify mb-4">
              We believe that the power of words can change lives. That is why
              we strive to create contents that are informative, engaging, and
              uplifting. We want to help you learn, grow, improve your writing
              and make a positive impact on the world.
            </p>

            <p className="text-justify mb-1">
              We cover a wide range of topics, including:
            </p>
            <ul className="mb-4 list-inside list-disc">
              <li>Personal development</li>
              <li>Health and wellness</li>
              <li>Travel and adventure</li>
              <li>Food and cooking</li>
              <li>Fashion and beauty</li>
              <li>Family and relationships</li>
              <li>Current events and social issues</li>
            </ul>

            <p className="text-justify mb-4">
              We also have a team of expert contributors, writers and aspiring
              writers who offer their insights on a variety of topics. We create
              a unique space for you to write on your thought and experience and
              share your adventures with readers and other writers.
            </p>

            <p className="text-justify mb-4">
              We are committed to providing our readers with high-quality
              content that is relevant and up-to-date. We also believe in
              fostering a community of engaged readers. We encourage you to
              leave comments and share your thoughts.
            </p>

            <p className="text-justify mb-4">
              Thank you for visiting udohsplatform. We hope you enjoy your time
              here!
            </p>
          </div>
        </article>
      </main>
    </>
  );
};

export default OurStory;
