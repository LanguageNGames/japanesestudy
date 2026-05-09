import React, { useState } from 'react';


export default function Footer() {
    const [isHovered, setIsHovered] = useState(false);
    
    return(
        <footer>
            {isHovered && (
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
            )}
            {!isHovered && (
                <img className='kanna-img'
                onMouseOver={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                src="https://i.imgur.com/xsnkDVg.png" height="150px" width="100px" alt="kanna"/>
            )}
            
        </footer>
    )
    
}