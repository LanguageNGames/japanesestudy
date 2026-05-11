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
        <footer>
            {isHovered ? (
                <>
                    <div className="speech-bubble">
                        <img  
                        alt="speech-bubble"
                        height="200px"
                        width="150px"
                        src="https://i.imgur.com/fIKLUn8.png" />
                    </div>
                    <img className='kanna-img'
                    onMouseLeave={() => setIsHovered(false)}
                    src="https://i.imgur.com/4xRvCTu.png" height="150px" width="100px" alt="kanna" />
                </>
            ) : (
                <img className='kanna-img'
                onMouseOver={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                src="https://i.imgur.com/xsnkDVg.png" height="150px" width="100px" alt="kanna"/>
            )}
            
        </footer>
    )
}