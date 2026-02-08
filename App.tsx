
import React, { useState, useEffect, useRef } from 'react';
import { AppState, PrayerTimings, PrayerName } from './types';
import { Icons, PRAYER_DISPLAY_NAMES, ADHAN_URL } from './constants';
import { fetchPrayerTimings, getLocationName } from './services/prayerService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    loading: true,
    error: null,
    prayerData: null,
    currentTime: new Date(),
    location: null,
    adhanEnabled: false
  });

  const adhanRef = useRef<HTMLAudioElement | null>(null);
  const prayerOrder: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  useEffect(() => {
    // 1. Get Location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const data = await fetchPrayerTimings(latitude, longitude);
            const location = await getLocationName(latitude, longitude);
            setState(prev => ({ ...prev, prayerData: data, location, loading: false }));
          } catch (err) {
            setState(prev => ({ ...prev, error: "Gagal memuat data jadwal sholat.", loading: false }));
          }
        },
        () => {
          setState(prev => ({ ...prev, error: "Izin lokasi diperlukan untuk jadwal akurat.", loading: false }));
        }
      );
    }

    // 2. Real-time Clock
    const timer = setInterval(() => {
      setState(prev => ({ ...prev, currentTime: new Date() }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check for prayer time every second
  useEffect(() => {
    if (!state.prayerData || !state.adhanEnabled) return;

    const currentFormatted = state.currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const timings = state.prayerData.timings;

    // We check against all 5 major prayers (exclude Sunrise for Adhan usually)
    const adhanPrayers: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    
    for (const p of adhanPrayers) {
      if (timings[p] === currentFormatted && state.currentTime.getSeconds() === 0) {
        playAdhan(p);
        break;
      }
    }
  }, [state.currentTime, state.prayerData, state.adhanEnabled]);

  const playAdhan = (name: string) => {
    if (adhanRef.current) {
      adhanRef.current.play().catch(e => console.error("Adhan playback blocked", e));
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`Waktunya Sholat ${PRAYER_DISPLAY_NAMES[name]}`, {
          body: `Mari tunaikan ibadah sholat ${PRAYER_DISPLAY_NAMES[name]}.`,
          icon: "/favicon.ico"
        });
      }
    }
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  };

  const toggleAdhan = () => {
    setState(prev => ({ ...prev, adhanEnabled: !prev.adhanEnabled }));
    requestNotificationPermission();
    // Pre-load audio on user interaction to bypass browser restrictions
    if (!adhanRef.current) {
      adhanRef.current = new Audio(ADHAN_URL);
    }
  };

  const getNextPrayer = () => {
    if (!state.prayerData) return null;
    const now = state.currentTime;
    const timings = state.prayerData.timings;

    for (const name of prayerOrder) {
      const [hours, minutes] = timings[name].split(':').map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);

      if (prayerDate > now) {
        const diff = prayerDate.getTime() - now.getTime();
        return { name, diff };
      }
    }

    // If all passed, next is tomorrow's Fajr
    const [hours, minutes] = timings['Fajr'].split(':').map(Number);
    const tomorrowFajr = new Date();
    tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
    tomorrowFajr.setHours(hours, minutes, 0, 0);
    return { name: 'Fajr' as PrayerName, diff: tomorrowFajr.getTime() - now.getTime() };
  };

  const formatCountdown = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (state.loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">Menghubungkan ke langit...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="h-screen flex items-center justify-center p-6">
        <div className="glass p-8 rounded-3xl text-center max-w-md shadow-soft border-red-100">
          <div className="text-red-500 mb-4 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Ops! Terjadi Masalah</h2>
          <p className="text-slate-600 mb-6">{state.error}</p>
          <button onClick={() => window.location.reload()} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors">Coba Lagi</button>
        </div>
      </div>
    );
  }

  const next = getNextPrayer();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Icons.Moon />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">NurTime</h1>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
              <Icons.MapPin /> {state.location?.city}, {state.location?.country}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={toggleAdhan}
            className={`p-3 rounded-2xl transition-all duration-300 flex items-center gap-2 font-bold text-sm ${state.adhanEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}
           >
             {state.adhanEnabled ? <Icons.Volume /> : <Icons.VolumeX />}
             <span className="hidden md:inline">Adhan Otomatis</span>
           </button>
           <button className="p-3 bg-white rounded-2xl text-slate-400 hover:text-emerald-600 transition-colors shadow-soft">
             <Icons.Menu />
           </button>
        </div>
      </header>

      {/* Hero Card: Next Prayer */}
      <section className="relative mb-12 overflow-hidden bg-emerald-900 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/30 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <span className="bg-emerald-800/50 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-emerald-700/50">
              Sholat Selanjutnya
            </span>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter">
              {next ? PRAYER_DISPLAY_NAMES[next.name] : '--:--'}
            </h2>
            <div className="flex items-center gap-4 text-emerald-200 font-medium">
              <span className="flex items-center gap-2"><Icons.Clock /> Pukul {state.prayerData?.timings[next?.name || '']}</span>
              <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
              <span className="font-arabic text-xl">{state.prayerData?.date.hijri.month.ar}</span>
            </div>
          </div>
          
          <div className="glass px-8 py-6 rounded-[2rem] border-white/10 text-center md:min-w-[200px]">
            <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-1">Menuju Waktu Sholat</p>
            <p className="text-4xl font-mono font-bold tracking-tighter animate-pulse-gentle">
              {next ? formatCountdown(next.diff) : '00:00:00'}
            </p>
          </div>
        </div>
      </section>

      {/* Prayer Times Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-12">
        {prayerOrder.map((name) => {
          const isNext = next?.name === name;
          const time = state.prayerData?.timings[name];
          return (
            <div 
              key={name}
              className={`p-6 rounded-[2rem] text-center transition-all duration-500 ${
                isNext 
                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 scale-105' 
                : 'bg-white text-slate-800 hover:bg-slate-50 shadow-soft border border-slate-100'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${isNext ? 'text-emerald-100' : 'text-slate-400'}`}>
                {PRAYER_DISPLAY_NAMES[name]}
              </p>
              <p className="text-2xl font-bold tracking-tighter mb-1">{time}</p>
              <div className={`mx-auto w-1.5 h-1.5 rounded-full ${isNext ? 'bg-white' : 'bg-emerald-500/30'}`}></div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <footer className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-[2.5rem] shadow-soft flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
             <Icons.Sun />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Tanggal Hijriah</h4>
            <p className="text-slate-500 text-sm">
              {state.prayerData?.date.hijri.day} {state.prayerData?.date.hijri.month.en} {state.prayerData?.date.hijri.year} AH
            </p>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] shadow-soft flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
             <Icons.Clock />
          </div>
          <div>
            <h4 className="font-bold text-slate-800">Metode Hitung</h4>
            <p className="text-slate-500 text-sm truncate max-w-[200px]">
              {state.prayerData?.meta.method.name}
            </p>
          </div>
        </div>
      </footer>

      {/* Audio Element */}
      <audio ref={adhanRef} src={ADHAN_URL} preload="auto" />
    </div>
  );
};

export default App;
