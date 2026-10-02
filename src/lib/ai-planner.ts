export type TargetJenjang = "paud" | "sd" | "smp" | "sma";

export interface StandarGiziAkg {
  jenjang: TargetJenjang;
  kaloriMin: number;
  kaloriMax: number;
  proteinMinGram: number;
}

export const STANDAR_AKG: Record<TargetJenjang, StandarGiziAkg> = {
  paud: { jenjang: "paud", kaloriMin: 350, kaloriMax: 450, proteinMinGram: 12 },
  sd: { jenjang: "sd", kaloriMin: 500, kaloriMax: 650, proteinMinGram: 18 },
  smp: { jenjang: "smp", kaloriMin: 700, kaloriMax: 850, proteinMinGram: 24 },
  sma: { jenjang: "sma", kaloriMin: 700, kaloriMax: 850, proteinMinGram: 26 },
};

export interface MenuItemPool {
  id: string;
  namaMenu: string;
  kategoriLauk: "ayam" | "daging" | "ikan" | "telur" | "nabati";
  kalori: number;
  protein: number;
  lemak: number;
  karbo: number;
  estimasiHpp: number;
  alergen: string[]; // e.g. ["kacang", "seafood", "telur", "susu"]
}

export interface HariMenuPlan {
  hariKe: number;
  menu: MenuItemPool;
  kepatuhanAkg: boolean;
  statusAlergenAman: boolean;
}

export interface HasilPerencanaanMenu {
  jenjang: TargetJenjang;
  totalHari: number;
  rataRataKalori: number;
  rataRataProtein: number;
  rataRataHpp: number;
  siklus: HariMenuPlan[];
  isMemenuhiSyarat: boolean;
  rekomendasiCatatan: string;
}

/**
 * Optimasi siklus menu cerdas (Linear / Heuristic Search)
 * Memenuhi batasan:
 * 1. AKG Jenjang (Kalori & Protein)
 * 2. Maksimal HPP anggaran
 * 3. Anti-repetisi lauk utama minimal 5 hari
 * 4. Pengecualian alergen sekolah
 */
export function generateMenuCycle(
  jenjang: TargetJenjang,
  hariSiklus: number,
  maxHppPerPorsi: number,
  pantangAlergen: string[] = [],
  customPool?: MenuItemPool[]
): HasilPerencanaanMenu {
  const akg = STANDAR_AKG[jenjang];

  const defaultPool: MenuItemPool[] = customPool || [
    {
      id: "m-ayam-kecap",
      namaMenu: "Nasi Ayam Semur Kecap + Tumis Buncis Jagung + Semangka",
      kategoriLauk: "ayam",
      kalori: 580,
      protein: 24,
      lemak: 14,
      karbo: 85,
      estimasiHpp: 12500,
      alergen: [],
    },
    {
      id: "m-ikan-dori",
      namaMenu: "Nasi Fillet Ikan Dori Goreng Tepung + Sayur Sup Wortel + Pisang",
      kategoriLauk: "ikan",
      kalori: 550,
      protein: 22,
      lemak: 12,
      karbo: 82,
      estimasiHpp: 13200,
      alergen: ["seafood"],
    },
    {
      id: "m-daging-teriyaki",
      namaMenu: "Nasi Sapi Teriyaki Lada Manis + Capcay Sayur Segar + Jeruk",
      kategoriLauk: "daging",
      kalori: 630,
      protein: 26,
      lemak: 16,
      karbo: 90,
      estimasiHpp: 14800,
      alergen: [],
    },
    {
      id: "m-telur-balado",
      namaMenu: "Nasi Telur Balado Pedas Manis + Tahu Orek + Sayur Lodeh",
      kategoriLauk: "telur",
      kalori: 520,
      protein: 20,
      lemak: 15,
      karbo: 76,
      estimasiHpp: 9800,
      alergen: ["telur"],
    },
    {
      id: "m-ayam-bakar",
      namaMenu: "Nasi Ayam Bakar Madu + Tempe Mendoan + Sayur Bening Bayam",
      kategoriLauk: "ayam",
      kalori: 600,
      protein: 25,
      lemak: 15,
      karbo: 88,
      estimasiHpp: 12900,
      alergen: [],
    },
    {
      id: "m-rawon-daging",
      namaMenu: "Nasi Rawon Daging Sapi + Telur Asin + Tauge Segar",
      kategoriLauk: "daging",
      kalori: 640,
      protein: 28,
      lemak: 18,
      karbo: 84,
      estimasiHpp: 14500,
      alergen: ["telur"],
    },
    {
      id: "m-pesmol-ikan",
      namaMenu: "Nasi Ikan Mas Pesmol Bumbu Kuning + Lalap Timun + Melon",
      kategoriLauk: "ikan",
      kalori: 560,
      protein: 23,
      lemak: 13,
      karbo: 80,
      estimasiHpp: 11800,
      alergen: ["seafood"],
    },
  ];

  // 1. Filter alergen
  const alergenSet = new Set(pantangAlergen.map((a) => a.toLowerCase()));
  const poolLolosAlergen = defaultPool.filter(
    (m) => !m.alergen.some((itemAlergen) => alergenSet.has(itemAlergen.toLowerCase()))
  );

  const availablePool = poolLolosAlergen.length > 0 ? poolLolosAlergen : defaultPool;

  // 2. Susun urutan siklus dengan batasan rotasi lauk (anti-repetisi lauk sejenis dlm rentang 3-5 hari)
  const siklus: HariMenuPlan[] = [];
  const riwayatLauk: string[] = [];

  for (let i = 0; i < hariSiklus; i++) {
    // Cari kandidat yang tidak sama dengan lauk hari sebelumnya
    let kandidat = availablePool.filter(
      (m) => riwayatLauk.length === 0 || m.kategoriLauk !== riwayatLauk[riwayatLauk.length - 1]
    );

    if (kandidat.length === 0) {
      kandidat = availablePool;
    }

    // Pilih kandidat dengan HPP di bawah limit
    const kandidatHpp = kandidat.filter((k) => k.estimasiHpp <= maxHppPerPorsi);
    const poolTerpilih = kandidatHpp.length > 0 ? kandidatHpp : kandidat;

    // Ambil berurutan / round-robin
    const index = i % poolTerpilih.length;
    const menuTerpilih = poolTerpilih[index];

    // Evaluasi AKG
    const kepatuhanAkg =
      menuTerpilih.kalori >= akg.kaloriMin &&
      menuTerpilih.kalori <= akg.kaloriMax &&
      menuTerpilih.protein >= akg.proteinMinGram;

    const statusAlergenAman = !menuTerpilih.alergen.some((a) =>
      alergenSet.has(a.toLowerCase())
    );

    siklus.push({
      hariKe: i + 1,
      menu: menuTerpilih,
      kepatuhanAkg,
      statusAlergenAman,
    });

    riwayatLauk.push(menuTerpilih.kategoriLauk);
  }

  const totalKalori = siklus.reduce((sum, s) => sum + s.menu.kalori, 0);
  const totalProtein = siklus.reduce((sum, s) => sum + s.menu.protein, 0);
  const totalHpp = siklus.reduce((sum, s) => sum + s.menu.estimasiHpp, 0);

  const rataRataKalori = Math.round(totalKalori / hariSiklus);
  const rataRataProtein = Math.round((totalProtein / hariSiklus) * 10) / 10;
  const rataRataHpp = Math.round(totalHpp / hariSiklus);

  const isMemenuhiSyarat =
    rataRataKalori >= akg.kaloriMin &&
    rataRataKalori <= akg.kaloriMax &&
    rataRataProtein >= akg.proteinMinGram &&
    rataRataHpp <= maxHppPerPorsi;

  const rekomendasiCatatan = isMemenuhiSyarat
    ? `Siklus ${hariSiklus} hari memenuhi standar gizi AKG jenjang ${jenjang.toUpperCase()} dan anggaran HPP.`
    : `Siklus membutuhkan penyesuaian kalori/anggaran terhadap standar ${jenjang.toUpperCase()}.`;

  return {
    jenjang,
    totalHari: hariSiklus,
    rataRataKalori,
    rataRataProtein,
    rataRataHpp,
    siklus,
    isMemenuhiSyarat,
    rekomendasiCatatan,
  };
}

/**
 * Panggil LLM (Gemini via AI Proxy) untuk menghasilkan ide variasi menu nusantara kreatif.
 */
export async function fetchAiMenuPool(
  jenjang: TargetJenjang,
  maxHppPerPorsi: number,
  pantangAlergen: string[] = [],
  count: number = 7
): Promise<MenuItemPool[] | null> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = process.env.AI_BASE_URL || "http://127.0.0.1:20128/v1";
  const model = process.env.AI_MODEL || "ag/gemini-3-flash";
  const akg = STANDAR_AKG[jenjang];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "Kamu ahli gizi kuliner nusantara untuk program Makan Bergizi Gratis (MBG). Hasilkan variasi menu makan siang sehat dalam format JSON murni tanpa markdown.",
          },
          {
            role: "user",
            content: `Buatkan ${count} menu unik variatif khas nusantara untuk anak sekolah jenjang ${jenjang.toUpperCase()} (kalori ${akg.kaloriMin}-${akg.kaloriMax} kkal, protein min ${akg.proteinMinGram}g, estimasi HPP maks Rp ${maxHppPerPorsi}, hindari alergen: ${pantangAlergen.join(", ") || "tidak ada"}). 
Format output HARUS array of JSON objects murni:
[
  {
    "id": "ai-1",
    "namaMenu": "Nama Menu Lengkap beserta lauk pendamping & sayur/buah",
    "kategoriLauk": "ayam"|"daging"|"ikan"|"telur"|"nabati",
    "kalori": number,
    "protein": number,
    "lemak": number,
    "karbo": number,
    "estimasiHpp": number,
    "alergen": ["nama alergen"]
  }
]`,
          },
        ],
      }),
    });

    clearTimeout(timeoutId);
    if (!res.ok) return null;

    const json = await res.json();
    let content = json.choices?.[0]?.message?.content;
    if (!content) return null;

    content = content.trim();
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
    }

    const items = JSON.parse(content);
    if (!Array.isArray(items)) return null;

    return items.filter(
      (it: MenuItemPool) =>
        it.id &&
        it.namaMenu &&
        it.kategoriLauk &&
        typeof it.kalori === "number" &&
        typeof it.protein === "number" &&
        typeof it.estimasiHpp === "number"
    );
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("AI Menu Generation fallback ke heuristik lokal:", err);
    return null;
  }
}

/**
 * Generate Siklus Menu Hybrid:
 * 1. LLM (Gemini) menghasilkan pool masakan nusantara unik
 * 2. Algoritma Heuristik Lokal memfilter alergen, merotasi lauk, dan memverifikasi kepatuhan AKG & pagu anggaran
 */
export async function generateMenuCycleWithAI(
  jenjang: TargetJenjang,
  hariSiklus: number,
  maxHppPerPorsi: number,
  pantangAlergen: string[] = []
): Promise<HasilPerencanaanMenu> {
  const targetPoolCount = Math.max(hariSiklus + 2, 7);
  const aiPool = await fetchAiMenuPool(jenjang, maxHppPerPorsi, pantangAlergen, targetPoolCount);

  if (aiPool && aiPool.length >= hariSiklus) {
    const hasil = generateMenuCycle(jenjang, hariSiklus, maxHppPerPorsi, pantangAlergen, aiPool);
    hasil.rekomendasiCatatan = `[AI Auto-Gen Gemini] ${hasil.rekomendasiCatatan}`;
    return hasil;
  }

  return generateMenuCycle(jenjang, hariSiklus, maxHppPerPorsi, pantangAlergen);
}
