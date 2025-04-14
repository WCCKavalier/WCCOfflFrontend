import React, { useState } from "react";
import {
  Container,
  TabContainer,
  TabButton,
  GalleryContainer,
  AlbumCard,
  AlbumImg,
  AlbumOverlay,
} from "./GalleryStyles";
import "./gallery.css";

// Original albums array
const albums = [
  { year: "2017", albums: [{ title: "WCC 2017", imgSrc: "/img/wcc2017.jpg", link: "https://photos.app.goo.gl/NYrHfun6TWP3v8nW7" }] },
  { year: "2018", albums: [{ title: "WCC 2018", imgSrc: "/img/wcc2018.jpg", link: "https://photos.app.goo.gl/1GDgfP7EWv8NDAPj7" }] },
  { year: "2019", albums: [{ title: "WCC 2019", imgSrc: "/img/wcc2019.jpg", link: "https://photos.app.goo.gl/PUqR7i2wqTDaCENk7" }] },
  { year: "2019", albums: [{ title: "WCC 2019 Party", imgSrc: "/img/wcc2019party.jpg", link: "https://photos.app.goo.gl/Z67vdgAiWYbXFkvh8" }] },
  { year: "2020", albums: [{ title: "WCC 2020", imgSrc: "/img/wcc2020.jpg", link: "https://photos.app.goo.gl/WpFE2wXGpZY7ScmH8" }] },
  { year: "2020", albums: [{ title: "WCC 2020 Party", imgSrc: "/img/wcc2020party.jpg", link: "https://photos.app.goo.gl/r58tJ3AgAmtj3CE16" }] },
  { year: "2021", albums: [{ title: "WCC 2021", imgSrc: "/img/wcc2021.jpg", link: "https://photos.app.goo.gl/4cR9MS4jb6T3e84V8" }] },
  { year: "2021", albums: [{ title: "WCC 2021 Party", imgSrc: "/img/wcc2021party.jpg", link: "https://photos.app.goo.gl/NVQM4cK6HKpNFgAR8" }] },
  { year: "2022", albums: [{ title: "WCC 2022", imgSrc: "/img/wcc2022.jpg", link: "https://photos.app.goo.gl/YauW5uUGGX4XU5sh6" }] },
  { year: "2022", albums: [{ title: "WCC 2022 Party", imgSrc: "/img/wcc2022party.jpg", link: "https://photos.app.goo.gl/dZDSaRhZTRiNifD6A" }] },
  { year: "2023", albums: [{ title: "WCC 2023", imgSrc: "/img/wcc2023.jpg", link: "https://photos.app.goo.gl/PxygRZ8VuGkyAPtYA" }] },
  { year: "2023", albums: [{ title: "WCC 2023 Party", imgSrc: "/img/wcc2023party.jpg", link: "https://photos.app.goo.gl/QL5QAyg6xPj5Z12c8" }] },
  { year: "2024", albums: [{ title: "WCC 2024 Party", imgSrc: "/img/wcc2024party.jpg", link: "https://photos.app.goo.gl/T9KArYTZAfNZeUCW8" }] },
];

// Group albums by year
const groupedAlbums = albums.reduce((acc, item) => {
  if (!acc[item.year]) {
    acc[item.year] = [];
  }
  acc[item.year].push(...item.albums);
  return acc;
}, {});

function Gallery() {
  const years = Object.keys(groupedAlbums).sort();
  const [activeYear, setActiveYear] = useState(years[0]);

  return (
    <Container>
      <h2>📚 Gallery Albums</h2>

      {/* Horizontal Tabs for Year Selection */}
      <TabContainer>
        {years.map((year) => (
          <TabButton
            key={year}
            onClick={() => setActiveYear(year)}
            isActive={activeYear === year}
          >
            {year}
          </TabButton>
        ))}
      </TabContainer>

      {/* Display the selected year's albums */}
      <GalleryContainer>
        {groupedAlbums[activeYear].map((album, index) => (
          <AlbumCard key={index} href={album.link} target="_blank" rel="noopener noreferrer">
            <AlbumImg src={album.imgSrc} alt={album.title} />
            <AlbumOverlay>{album.title}</AlbumOverlay>
          </AlbumCard>
        ))}
      </GalleryContainer>
    </Container>
  );
}

export default Gallery;
