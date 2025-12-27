export interface PrayerTimeResp {
  PrayerTime: PrayerTime[];
}

export interface PrayerTime {
    today: {
        hijri: string;
        date: string;
        day: string;
        imsak: string;
        fajr: string;
        syuruk: string;
        dhuha: string;
        dhuhr: string;
        asr: string;
        maghrib: string;
        isha: string;
    },
    tomorrow: {
        hijri: string;
        date: string;
        day: string;
        imsak: string;
        fajr: string;
        syuruk: string;
        dhuha: string;
        dhuhr: string;
        asr: string;
        maghrib: string;
        isha: string;
    },
    isFromCache: boolean
}

export const getPrayerTimesTodayAndTomorrow = async (): Promise<PrayerTime | null> => {
    const cachedPrayerTimes = getPrayerTimesFromCache();
    if (cachedPrayerTimes != null && validateMultiplePrayerTimes(cachedPrayerTimes))
        return cachedPrayerTimes;

    const reqDates = getDatesForTodayAndTomorrow();
    const reqParams = new URLSearchParams();
    reqParams.append("datestart", reqDates.today);
    reqParams.append("dateend", reqDates.tomorrow);
    const resp = await fetch("https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=duration&zone=wly01", {
        method: "post",
        body: reqParams
    });

    const data = await resp.json();
    const prayerTimes: PrayerTime = mapPrayerTimesForTodayAndTomorrow(data.prayerTime);
    
    if(validateMultiplePrayerTimes(prayerTimes))
    {
        cachePrayerTimes(prayerTimes);
        return { ...prayerTimes, isFromCache: false };
    }

    return null;
};

const getDatesForTodayAndTomorrow = (): { today: string, tomorrow: string } => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return {
        today: today.toLocaleDateString("en-CA"),
        tomorrow: tomorrow.toLocaleDateString("en-CA")
    };
};

const validateMultiplePrayerTimes = (prayerTimes: PrayerTime): boolean => {
    if (prayerTimes?.today?.fajr && prayerTimes?.today?.dhuhr && prayerTimes?.today?.asr && prayerTimes?.today?.maghrib &&prayerTimes?.today?.isha
        && prayerTimes?.tomorrow?.fajr && prayerTimes?.tomorrow?.dhuhr && prayerTimes?.tomorrow?.asr && prayerTimes?.tomorrow?.maghrib &&prayerTimes?.tomorrow?.isha)
        return true;
    
    return false;
};

const mapPrayerTimesForTodayAndTomorrow = (prayerTimes: any): PrayerTime => ({
    today: { ...prayerTimes[0] },
    tomorrow: { ...prayerTimes[1] },
    isFromCache: false
});

const cachePrayerTimes = (prayerTimes: any): void => {
    localStorage.setItem("prayer-time", JSON.stringify(prayerTimes));
}

const getPrayerTimesFromCache = (): PrayerTime | null => {
    const cachedPrayerTimeString = localStorage.getItem("prayer-time");
    if (cachedPrayerTimeString == null) return null;
    
    const cachedPrayerTimes: PrayerTime = JSON.parse(cachedPrayerTimeString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const options: Intl.DateTimeFormatOptions = {
        day: "2-digit"
        , month: "short"
        , year: "numeric"
    };

    const todayFormatted = today.toLocaleDateString("en-GB", options).replace(/ /g, '-');
    const tomorrowFormatted = tomorrow.toLocaleDateString("en-GB", options).replace(/ /g, '-');;
    debugger;
    if (todayFormatted != cachedPrayerTimes.today.date || tomorrowFormatted != cachedPrayerTimes.tomorrow.date)
    {
        localStorage.removeItem("prayer-time");
        return null;
    }

    return {...cachedPrayerTimes, isFromCache: true};
}