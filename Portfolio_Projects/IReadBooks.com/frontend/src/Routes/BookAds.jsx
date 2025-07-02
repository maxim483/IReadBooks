import { useState, useEffect } from "react";
import axios from "axios";
import "../BookAds.css";

const BookAds = () => {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/ads");
        setAds(res.data);
      } catch (err) {
        console.error("Failed to fetch ads:", err);
      }
    };

    fetchAds();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible || ads.length === 0) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [visible, ads]);

  const currentAd = ads[currentAdIndex];
  if (!visible || !currentAd) return null;

  return (
    <div className="bookAds">
      <button className="closeAdBtn" onClick={() => setVisible(false)}>×</button>
      <a href={currentAd.link} target="_blank" rel="noopener noreferrer">
        <img
          src={`http://localhost:8080${currentAd.image_url}`}
          alt={currentAd.title}
        />
      </a>
    </div>
  );
};

export default BookAds;
