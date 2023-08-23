import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <main>
      <div className="grid grid-cols-1 grid-rows-1">
        <section className="col-start-1 row-start-1">
          <picture>
            <source
              media="(min-width:650px)"
              srcSet="Frontend_to_use_1-large_840_height.webp"
            />

            <img
              src="Frontend_to_use_small.webp"
              alt="A purple jar on a block"
            />
          </picture>
        </section>

        <section className="col-start-1 row-start-1 mt-[100px] p-4 text-black">
          <article>
            <p>
              <strong>Be inquisitive</strong>
            </p>
            <p>Discover what great minds have to say about a topic.</p>
          </article>

          <article>
            <p>
              <strong>Are you a great mind?</strong>
            </p>
            <p>
              Let the world hear you and realize how exceptionally intelligent,
              creative and insightful you are.
            </p>
          </article>

          <p>
            <Link>Start reading</Link>
            <Link>Start writing</Link>
          </p>
        </section>
      </div>

      <section>
        <h2>Trending on Udohs Platform</h2>

        <div>
          <article>
            <figure>
              <img alt="" src="" />

              <figcaption>
                <p>Udoh Abasi</p>
              </figcaption>
            </figure>

            <div>
              <p>Gender equality - Project Title</p>
              <p>August 10</p>
            </div>
          </article>
        </div>
      </section>

      <Link>All articles</Link>
    </main>
  );
};

export default HomePage;
