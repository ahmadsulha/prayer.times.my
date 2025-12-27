import './MainPage.css'
import type { PrayerTime } from "../../services/prayerTimesService"
import { getPrayerTimesTodayAndTomorrow } from "../../services/prayerTimesService"
import { useEffect, useState } from "react"

function MainPage(){
    const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>();
    const [nextPrayer, setNextPrayer] = useState<{prayerName: string, prayerTime: string} | null>();
    
    useEffect(() => {
        const fetchPrayerTimes = async () => {
            setPrayerTimes(await getPrayerTimesTodayAndTomorrow());
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

        if (now < prayerTimes?.today?.fajr!) { return { prayerName: "Fajr", prayerTime: prayerTimes?.today?.fajr! }; }
        else if (now < prayerTimes?.today?.dhuhr!) { return { prayerName: "Dhuhr", prayerTime: prayerTimes?.today?.dhuhr! }; }
        else if (now < prayerTimes?.today?.asr!) { return { prayerName: "Asr", prayerTime: prayerTimes?.today?.asr! }; }
        else if (now < prayerTimes?.today?.maghrib!) { return { prayerName: "Maghrib", prayerTime: prayerTimes?.today?.maghrib! }; }
        else if (now < prayerTimes?.today?.isha!) { return { prayerName: "Isha", prayerTime: prayerTimes?.today?.isha! }; }
        else { return { prayerName: "Fajr", prayerTime: prayerTimes?.tomorrow?.fajr! }; }
        
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
                {prayerTimes?.today?.hijri} | {prayerTimes?.today?.date}
            </div>
            <div id="next-prayer">
                <h1>Upcoming prayer</h1>
                <h3>{nextPrayer?.prayerName}</h3>
                <h3>{nextPrayer?.prayerTime}</h3>
            </div>
            <div id="prayer-time-table">
                <div>
                    <h1>Imsak</h1>
                    <p>{prayerTimes?.today?.imsak}</p>
                </div>
                <div>
                    <h1>Fajr</h1>
                    <p>{prayerTimes?.today?.fajr}</p>
                </div>
                <div>
                    <h1>Syuruk</h1>
                    <p>{prayerTimes?.today?.syuruk}</p>
                </div>
                <div>
                    <h1>Dhuha</h1>
                    <p>{prayerTimes?.today?.dhuha}</p>
                </div>
                <div>
                    <h1>Dhuhr</h1>
                    <p>{prayerTimes?.today?.dhuhr}</p>
                </div>
                <div>
                    <h1>Asr</h1>
                    <p>{prayerTimes?.today?.asr}</p>
                </div>
                <div>
                    <h1>Maghrib</h1>
                    <p>{prayerTimes?.today?.maghrib}</p>
                </div>
                <div>
                    <h1>Isha</h1>
                    <p>{prayerTimes?.today?.isha}</p>
                </div>
            </div>
            <div id="cache-status-square"
                className={`${prayerTimes?.isFromCache ? 'cache-status-from-cache' : 'cache-status-not-from-cache'}`}></div>
        </>
    );
}

export default MainPage