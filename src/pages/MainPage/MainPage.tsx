import './MainPage.css'
import type { PrayerTime } from "../../services/prayerTimesService"
import { getPrayerTimes } from "../../services/prayerTimesService"
import { useEffect, useState } from "react"

function MainPage(){
    const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>();
    const [nextPrayer, setNextPrayer] = useState<{prayerName: string, prayerTime: string} | null>();
    
    useEffect(() => {
        const fetchPrayerTimes = async () => {
            setPrayerTimes(await getPrayerTimes());
        };
        fetchPrayerTimes();
    }, []);

    useEffect(() => {
        if(prayerTimes) {
            setNextPrayer(getNextPrayer());
        }
    }, [prayerTimes]);
    
    const getNextPrayer = (): { prayerName: string, prayerTime: string } | null => {
        const now = getCurrentTime();
        if (prayerTimes === null) return null;

        if (now < prayerTimes?.fajr!) { return { prayerName: "Fajr", prayerTime: prayerTimes?.fajr! }; }
        else if (now < prayerTimes?.dhuhr!) { return { prayerName: "Dhuhr", prayerTime: prayerTimes?.dhuhr! } ; }
        else if (now < prayerTimes?.asr!) { return { prayerName: "Asr", prayerTime: prayerTimes?.asr! } ; }
        else if (now < prayerTimes?.maghrib!) { return { prayerName: "Maghrib", prayerTime: prayerTimes?.maghrib! } ; }
        else if (now < prayerTimes?.isha!) { return { prayerName: "Isha", prayerTime: prayerTimes?.isha! } ; }
        
        return null;
    };

    const getCurrentTime = (): string => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const second = now.getSeconds();

        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
    }
    
    

    return (
        <>
            <div id="date">
                {prayerTimes?.hijri} | {prayerTimes?.date}
            </div>
            <div id="next-prayer">
                <h1>Upcoming prayer</h1>
                <h3>{nextPrayer?.prayerName}</h3>
                <h3>{nextPrayer?.prayerTime}</h3>
            </div>
            <div id="prayer-time-table">
                <div>
                    <h1>Imsak</h1>
                    <p>{prayerTimes?.imsak}</p>
                </div>
                <div>
                    <h1>Fajr</h1>
                    <p>{prayerTimes?.fajr}</p>
                </div>
                <div>
                    <h1>Syuruk</h1>
                    <p>{prayerTimes?.syuruk}</p>
                </div>
                <div>
                    <h1>Dhuha</h1>
                    <p>{prayerTimes?.dhuha}</p>
                </div>
                <div>
                    <h1>Dhuhr</h1>
                    <p>{prayerTimes?.dhuhr}</p>
                </div>
                <div>
                    <h1>Asr</h1>
                    <p>{prayerTimes?.asr}</p>
                </div>
                <div>
                    <h1>Maghrib</h1>
                    <p>{prayerTimes?.maghrib}</p>
                </div>
                <div>
                    <h1>Isha</h1>
                    <p>{prayerTimes?.isha}</p>
                </div>
            </div>
        </>
    );
}

export default MainPage