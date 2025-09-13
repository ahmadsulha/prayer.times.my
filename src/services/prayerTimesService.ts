export interface PrayerTimeResp {
  PrayerTime: PrayerTime[];
}

export interface PrayerTime {
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
}

export const getPrayerTimes = async (): Promise<PrayerTime | null> => {
    const resp = await fetch("https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=wly01");
    const data = await resp.json();

    const prayerTimes: PrayerTime[] = data.prayerTime.map((p: any) => ({
        hijri: p.hijri,
        date: p.date,
        day: p.day,
        imsak: p.imsak,
        fajr: p.fajr,
        syuruk: p.syuruk,
        dhuha: p.dhuha,
        dhuhr: p.dhuhr,
        asr: p.asr,
        maghrib: p.maghrib,
        isha: p.isha,
    }));

    if (validatePrayerTimes(prayerTimes[0]))
        return prayerTimes[0];

    return null;
}

const validatePrayerTimes = (prayerTimes: PrayerTime): boolean => {
    if (prayerTimes?.fajr && prayerTimes?.dhuhr && prayerTimes?.asr && prayerTimes?.maghrib &&prayerTimes?.isha)
        return true;
    
    return false;
};