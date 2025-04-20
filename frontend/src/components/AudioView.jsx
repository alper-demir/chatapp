import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { FaPause } from "react-icons/fa6";
import { BiSolidRightArrow } from "react-icons/bi";

const AudioView = ({ audioUrl }) => {
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (waveformRef.current) {
            wavesurferRef.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#4f46e5',
                progressColor: '#8B5CF6',
                height: 30,
                responsive: true,
                cursorColor: '#000',
                cursorWidth: 2,
                barWidth: 2,
                normalize: true,
            });

            wavesurferRef.current.load(audioUrl);

            wavesurferRef.current.on('play', () => setIsPlaying(true));
            wavesurferRef.current.on('pause', () => setIsPlaying(false));
            wavesurferRef.current.on('finish', () => setIsPlaying(false));

            // Bileşen unmount olduğunda WaveSurfer'ı temizle
            return () => {
                if (wavesurferRef.current) {
                    wavesurferRef.current.destroy();
                }
            };
        }
    }, [audioUrl]);

    const togglePlayPause = () => {
        if (wavesurferRef.current) {
            if (isPlaying) {
                wavesurferRef.current.pause();
            } else {
                wavesurferRef.current.play();
            }
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <button
                onClick={togglePlayPause}
                className="p-2 rounded-full cursor-pointer hover:scale-105 transition-transform duration-200"
            >
                {isPlaying ? <FaPause className='text-lg' /> : <BiSolidRightArrow className='text-lg' />}
            </button>
            <div ref={waveformRef} className="w-full"></div>
        </div>
    );
};

export default AudioView;