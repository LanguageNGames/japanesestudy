import React, { useState, useEffect } from "react";

export default function Footer() {
    const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const images = [
      "https://i.imgur.com/4xRvCTu.png",
      "https://i.imgur.com/fIKLUn8.png",
    ];

    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    }, []);

    return(
        <footer
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            >
            {isHovered && (
                <div className="speech-bubble">
                <img
                    alt="speech-bubble"
                    height="200"
                    width="150"
                    src="https://i.imgur.com/fIKLUn8.png"
                />
                </div>
            )}

            <img
                className="kanna-img"
                src={isHovered
                    ? "https://i.imgur.com/4xRvCTu.png"
                    : "https://i.imgur.com/xsnkDVg.png"
                    }
                height="150"
                width="100"
                alt="kanna"
            />
            </footer>
    )
}