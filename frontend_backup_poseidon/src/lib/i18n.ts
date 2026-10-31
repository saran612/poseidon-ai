import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'POSEIDON AI',
      tagline: 'Disaster Intelligence & Autonomous Relief Coordination',
      nav: {
        overview: 'Overview',
        map: 'Mission Map',
        weather: 'Weather & Sensors',
        priorities: 'Prioritization',
        resources: 'Resources',
        shelters: 'Shelters & Hospitals',
        routing: 'Routing & Replanning',
        decisions: 'Explainable Decisions',
        analytics: 'Analytics',
        logs: 'Audit Logs',
        settings: 'Settings',
        dispatchQueue: 'Dispatch Queue',
      },
      status: {
        live: 'Live Connected',
        mock: 'Mock Simulation',
        reconnecting: 'Reconnecting...',
        disconnected: 'Offline',
        proposed: 'Proposed',
        approved: 'Approved',
        active: 'Active',
        rejected: 'Rejected',
      },
      roles: {
        operator: 'Operator',
        supervisor: 'Supervisor',
        viewer: 'Viewer',
      },
      actions: {
        approve: 'Approve',
        reject: 'Reject',
        edit: 'Edit',
        why: 'Why?',
        confirm: 'Confirm Action',
        cancel: 'Cancel',
        retry: 'Retry',
        refresh: 'Refresh',
      },
      rules: {
        humansDecide: 'Humans Decide: No action is dispatched without explicit operator confirmation.',
        tierHeader: 'Reliability Tier & Provenance',
      },
    },
  },
  ta: {
    translation: {
      appName: 'போஸிடான் AI',
      tagline: 'பேரிடர் நுண்ணறிவு மற்றும் தன்னாட்சி நிவாரண ஒருங்கிணைப்பு',
      nav: {
        overview: 'கண்ணோட்டம்',
        map: 'செயல் வரைபடம்',
        weather: 'வானிலை மற்றும் உணரிகள்',
        priorities: 'முன்னுரிமை மதிப்பீடு',
        resources: 'நிவாரணப் படைகள்',
        shelters: 'முகாம்கள் & மருத்துவமனைகள்',
        routing: 'பாதை திட்டமிடல்',
        decisions: 'விளக்க முடிவுகள்',
        analytics: 'புள்ளிவிவரங்கள்',
        logs: 'பதிவேடு',
        settings: 'அமைப்புகள்',
        dispatchQueue: 'அனுப்பும் வரிசை',
      },
      status: {
        live: 'நேரலை இணைக்கப்பட்டது',
        mock: 'மாதிரி உருவகப்படுத்துதல்',
        reconnecting: 'மீண்டும் இணைகிறது...',
        disconnected: 'இணைப்பில்லை',
        proposed: 'முன்மொழியப்பட்டது',
        approved: 'ஒப்புதல் அளிக்கப்பட்டது',
        active: 'செயலில்',
        rejected: 'நிராகரிக்கப்பட்டது',
      },
      roles: {
        operator: 'இயக்குபவர்',
        supervisor: 'மேற்பார்வையாளர்',
        viewer: 'பார்வையாளர்',
      },
      actions: {
        approve: 'ஒப்புதல்',
        reject: 'நிராகரி',
        edit: 'திருத்து',
        why: 'காரணம் என்ன?',
        confirm: 'உறுதி செய்',
        cancel: 'ரத்து செய்',
        retry: 'மீண்டும் முயற்சி',
        refresh: 'புதுப்பி',
      },
      rules: {
        humansDecide: 'மனிதர்கள் முடிவு செய்கிறார்கள்: ஒப்புதல் இன்றி எந்த நடவடிக்கையும் தொடங்கப்படாது.',
        tierHeader: 'நம்பகத்தன்மை நிலை மற்றும் சான்றுகள்',
      },
    },
  },
  hi: {
    translation: {
      appName: 'पोसाइडन AI',
      tagline: 'आपदा प्रबंधन एवं स्वायत्त राहत समन्वय प्रणाली',
      nav: {
        overview: 'सिंहावलोकन',
        map: 'मिशन मानचित्र',
        weather: 'मौसम और सेंसर',
        priorities: 'प्राथमिकता क्षेत्र',
        resources: 'राहत संसाधन',
        shelters: 'आश्रय एवं अस्पताल',
        routing: 'मार्ग एवं पुनः नियोजन',
        decisions: 'निर्णय स्पष्टीकरण',
        analytics: 'विश्लेषण',
        logs: 'ऑडिट लॉग',
        settings: 'सेटिंग्स',
        dispatchQueue: 'प्रेषण कतार',
      },
      status: {
        live: 'लाइव कनेक्टेड',
        mock: 'मॉक सिमुलेशन',
        reconnecting: 'पुनः कनेक्ट हो रहा है...',
        disconnected: 'ऑफ़लाइन',
        proposed: 'प्रस्तावित',
        approved: 'स्वीकृत',
        active: 'सक्रिय',
        rejected: 'अस्वीकृत',
      },
      roles: {
        operator: 'ऑपरेटर',
        supervisor: 'पर्यवेक्षक',
        viewer: 'दर्शक',
      },
      actions: {
        approve: 'स्वीकृत करें',
        reject: 'अस्वीकार करें',
        edit: 'संपादित करें',
        why: 'क्यों?',
        confirm: 'पुष्टि करें',
        cancel: 'रद्द करें',
        retry: 'पुनः प्रयास करें',
        refresh: 'रिफ्रेश',
      },
      rules: {
        humansDecide: 'मानव निर्णय: ऑपरेटर की स्पष्ट सहमति के बिना कोई राहत दल रवाना नहीं होगा।',
        tierHeader: 'विश्वसनीयता स्तर एवं प्रमाण',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  missingKeyHandler: (lngs, ns, key) => {
    if (import.meta.env.DEV) {
      console.warn(`[i18n MISSING KEY] Languages: ${lngs.join(', ')} | Namespace: ${ns} | Key: ${key}`);
    }
  },
  saveMissing: import.meta.env.DEV,
});

export { resources };
export default i18n;
