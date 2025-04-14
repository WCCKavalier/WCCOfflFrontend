import styled from "styled-components";

export const Container = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

export const TabContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  overflow-x: auto;
  padding: 10px 20px;
  margin-bottom: 20px;
  scroll-padding-left: 20px;
  scrollbar-width: thin;
  scrollbar-color: #999 transparent;

  @media (min-width: 768px) {
    justify-content: center;
  }

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

export const TabButton = styled.button`
  background: ${({ isActive }) =>
    isActive ? "linear-gradient(135deg, #2c2c2c, #444)" : "transparent"};
  color: ${({ isActive }) => (isActive ? "#fff" : "#ccc")};
  border: 2px solid ${({ isActive }) => (isActive ? "#ffd700" : "#666")};
  padding: 10px 20px;
  margin-right: 10px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s, border 0.3s, color 0.3s;

  &:hover {
    background: linear-gradient(135deg, #2c2c2c, #444);
    color: #fff;
    border: 2px solid #ffd700;
  }
`;



export const GalleryContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
`;

export const AlbumCard = styled.a`
  position: relative;
  width: 250px;         // Fixed width
  height: 180px;        // Fixed height
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

export const AlbumImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;  // This ensures the image fills the box nicely
  display: block;
`;


export const AlbumOverlay = styled.div`
  position: absolute;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  width: 100%;
  text-align: center;
  padding: 10px;
  font-size: 1rem;
`;
