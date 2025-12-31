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
    let data;
    if (isWithinTheSameYear(reqDates)) {
        data = await getPrayerTimesWithinTheSameYear(reqDates);
    }
    else {
        data = await getPrayerTimesAcrossYears(reqDates);
    }

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

const isWithinTheSameYear = (dates: { today: string, tomorrow: string }): boolean => {
    let todayYear = parseInt(dates.today.slice(0, 4));
    let tomorrowYear = parseInt(dates.tomorrow.slice(0, 4));
    return tomorrowYear - todayYear == 0;
}

const getPrayerTimesWithinTheSameYear = async (reqDates : { today: string, tomorrow: string }): Promise<any> => {
    const reqParams = new URLSearchParams();
    reqParams.append("datestart", reqDates.today);
    reqParams.append("dateend", reqDates.tomorrow);
    const resp = await fetch("https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=duration&zone=wly01", {
        method: "post",
        body: reqParams
    });

    return await resp.json();
}

const getPrayerTimesAcrossYears = async (reqDates : { today: string, tomorrow: string }): Promise<any> => {
    const reqParamsToday = new URLSearchParams();
    reqParamsToday.append("datestart", reqDates.today);
    reqParamsToday.append("dateend", reqDates.today);
    
    const respToday = await fetch("https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=duration&zone=wly01", {
        method: "post",
        body: reqParamsToday
    });

    const todayPrayerTimes = await respToday.json();
    
    const reqParamsTomorrow = new URLSearchParams();
    reqParamsTomorrow.append("datestart", reqDates.tomorrow);
    reqParamsTomorrow.append("dateend", reqDates.tomorrow);

    const respTomorrow = await fetch("https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=duration&zone=wly01", {
        method: "post",
        body: reqParamsTomorrow
    });

    const tomorrowPrayerTimes = await respTomorrow.json();

    return {
        prayerTime: [todayPrayerTimes.prayerTime[0], tomorrowPrayerTimes.prayerTime[0]]
    };
} 