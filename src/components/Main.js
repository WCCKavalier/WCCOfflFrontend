import Home2 from "./Home2"; // Use Home2 instead of HomePage
import Profile from "./Profile";
import Gallery from "./Gallery";
import "./Main.css";

function Main() {
  return (
    <main>
      <Home2 /> {/* Replacing HomePage with Home2 */}
      <Profile />
      <Gallery />
    </main>
  );
}

export default Main;
