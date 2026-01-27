
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const USER_EMAIL = 'tegar@jakpat.net';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Data grouped by logic derived from user input
// Year 2026
const adsData = [
    // 14 Jan Wed
    {
        title: "MODEL SOSIO‑PSIKOLOGIS",
        customer_name: "SUHUD",
        startDate: "2026-01-14",
        duration: 2,
        type: "new"
    },
    {
        title: "EKOSISTEM PENDIDIKAN",
        customer_name: "SUHUD",
        startDate: "2026-01-14",
        duration: 2,
        type: "new"
    },
    // 15 Jan Thu
    {
        title: "Persetujuan Partisipasi Kuesioner",
        customer_name: "Chritoper",
        startDate: "2026-01-15",
        duration: 2,
        type: "new"
    },
    // 16 Jan Fri
    {
        title: "KEWIRAUSAHAAN INKLUSIF",
        customer_name: "SUHUD",
        startDate: "2026-01-16",
        duration: 1,
        type: "new"
    },
    {
        title: "PENGALAMAN SOSIAL",
        customer_name: "SUHUD",
        startDate: "2026-01-16",
        duration: 2,
        type: "new"
    },
    // 17 Jan Sat
    {
        title: "Grocery di Jabodetabek",
        customer_name: "Salsabila",
        startDate: "2026-01-17",
        duration: 1,
        type: "new"
    },
    {
        title: "Pinhome Home Service",
        customer_name: "Hasya",
        startDate: "2026-01-17",
        duration: 2,
        type: "new"
    },
    // 19 Jan Mon
    {
        title: "Mental Health",
        customer_name: "Zulfadli",
        startDate: "2026-01-19",
        duration: 1,
        type: "new"
    },
    {
        title: "Konsumen Pengguna Aplikasi PayLater",
        customer_name: "Tiara",
        startDate: "2026-01-19",
        duration: 1,
        type: "new"
    },
    {
        title: "UMKM Jabodetabek (Pengaruh Rantai Pasok)",
        customer_name: "Niexuan",
        startDate: "2026-01-19",
        duration: 1,
        type: "new"
    },
    // 20 Jan Tue
    {
        title: "Baterai Bekas Pakai Kendaraan Listrik",
        customer_name: "Fadli Nur Cahyo",
        startDate: "2026-01-20",
        duration: 1,
        type: "new"
    },
    {
        title: "FOMO FUn Run",
        customer_name: "Nia",
        startDate: "2026-01-20",
        duration: 1,
        type: "new"
    },
    {
        title: "Pinhome Home Service",
        customer_name: "Hasya",
        startDate: "2026-01-20",
        duration: 2,
        type: "extended",
        parentMatch: { customer: "Hasya", title: "Pinhome Home Service" }
    },
    // 21 Jan Wed
    {
        title: "EM-2603-JAK EKOSISTEM PENDIDIKAN",
        customer_name: "SUHUD",
        startDate: "2026-01-21",
        duration: 1,
        type: "extended",
        parentMatch: { customer: "SUHUD", title: "EKOSISTEM PENDIDIKAN" }
    },
    {
        title: "EM-2601-JAK KEWIRAUSAHAAN INKLUSIF",
        customer_name: "SUHUD",
        startDate: "2026-01-21",
        duration: 1,
        type: "extended",
        parentMatch: { customer: "SUHUD", title: "KEWIRAUSAHAAN INKLUSIF" }
    },
    // 22 Jan Thu
    {
        title: "JAK2610 Circular Economy Integration",
        customer_name: "SUHUD",
        startDate: "2026-01-22",
        duration: 2,
        type: "new"
    },
    {
        title: "JAK2611 Heritage Value",
        customer_name: "SUHUD",
        startDate: "2026-01-22",
        duration: 2,
        type: "new"
    },
    {
        title: "Survei Negosiasi",
        customer_name: "Ahyar",
        startDate: "2026-01-22",
        duration: 1,
        type: "new"
    },
    // 23 Jan Fri
    {
        title: "Pekerja Generasi Z",
        customer_name: "Adila",
        startDate: "2026-01-23",
        duration: 2,
        type: "new"
    },
    {
        title: "Pinhome Home Service",
        customer_name: "Hasya",
        startDate: "2026-01-23",
        duration: 3,
        type: "extended",
        parentMatch: { customer: "Hasya", title: "Pinhome Home Service" }
    },
    // 24 Jan Sat
    {
        title: "Gaya Kepemimpinan Atasan",
        customer_name: "Agnes",
        startDate: "2026-01-24",
        duration: 1,
        type: "new"
    },
    {
        title: "Pembelian Makanan Instan UMKM secara Spontan",
        customer_name: "Aryono",
        startDate: "2026-01-24",
        duration: 3,
        type: "new"
    },
    // 25 Jan Sun
    {
        title: "Kuesioner Pengalaman Dosen",
        customer_name: "Amelia",
        startDate: "2026-01-25",
        duration: 2,
        type: "new"
    },
    {
        title: "Survey Perilaku Belanja Gen Z pada Live Streaming Commerce",
        customer_name: "Annastasya",
        startDate: "2026-01-25",
        duration: 1,
        type: "new"
    },
];

async function seed() {
    console.log('Starting seed process...');

    // 1. Get User ID
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', USER_EMAIL)
        .single();

    if (userError || !userData) {
        console.error(`Error: Could not find user with email ${USER_EMAIL}.`, userError);
        return;
    }

    const userId = userData.id;
    console.log(`Found user ID: ${userId} for ${USER_EMAIL}`);

    // 2. Insert ads sequentially to handle dependencies
    const insertedAds = [];

    for (const ad of adsData) {
        // Calculate timestamp
        // Assuming starts at 00:00:00 Asia/Jakarta. Since we use ISO strings, we can simple use YYYY-MM-DDT00:00:00+07:00
        // But simplified, let's just use UTC or a fixed offset.
        // The DB likely expects TIMESTAMPTZ.
        const publishAt = `${ad.startDate}T00:00:00+07:00`;

        // Calculate takedown
        const startDateObj = new Date(ad.startDate);
        const takedownDateObj = new Date(startDateObj);
        takedownDateObj.setDate(startDateObj.getDate() + ad.duration);
        // Takedown is usually End of Day or Start of Next Day?
        // Based on previous discussions/schema, let's set it to 23:59:59 of the last day? 
        // Or just +Duration days at same time?
        // Let's use the logic: Publish Jan 14, 1 day -> Takedown Jan 15 00:00.
        // Publish Jan 14, 2 days -> Takedown Jan 16 00:00.
        // Schema default logic often checks `NOW() >= takedown`.
        // Let's use strict dates.
        const takedownAt = takedownDateObj.toISOString().split('T')[0] + 'T00:00:00+07:00';

        let originalAdId = null;

        if (ad.type === 'extended' && ad.parentMatch) {
            // Find parent in previously inserted ads
            const parent = insertedAds.find(p =>
                p.customer_name === ad.parentMatch.customer &&
                p.title === ad.parentMatch.title
            );
            if (parent) {
                originalAdId = parent.id;
            } else {
                console.warn(`Warning: Could not find parent for extended ad ${ad.title} (${ad.customer_name})`);
            }
        }

        // Determine status
        // For seeding past/future data, we should set status based on dates relative to NOW.
        // But since we are seeding likely for *future* or *active* usage, let's let the system decide or hardcode based on date.
        // However, the DB has a trigger `update_ad_status`.
        // If we insert 'scheduled', the trigger might update it.
        // The schema says:
        // BEFORE INSERT OR UPDATE ON ads EXECUTE FUNCTION update_ad_status();
        // So we can just send 'scheduled' and let the trigger fix it.
        // EXCEPT if the trigger overrides manual status.
        // Trigger logic:
        // IF NEW.status = 'cancelled' THEN ...
        // ELSIF NOW() >= NEW.takedown_at THEN status = 'completed'
        // ELSIF NOW() >= NEW.publish_at THEN status = 'live'
        // ELSE status = 'scheduled'
        // So we can pass any valid status and it will be auto-corrected.

        const payload = {
            title: ad.title,
            customer_name: ad.customer_name,
            description: "Bulk imported",
            publish_at: publishAt,
            takedown_at: takedownAt,
            duration_days: ad.duration,
            ad_type: ad.type === 'extended' ? 'extended' : 'new',
            status: 'scheduled', // Trigger will update this
            original_ad_id: originalAdId,
            created_by: userId
        };

        const { data, error } = await supabase
            .from('ads')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error(`Failed to insert ${ad.title}:`, error);
        } else {
            console.log(`Inserted: [${data.status}] ${data.title} (${data.publish_at})`);
            insertedAds.push(data);
        }
    }

    console.log('Seeding completed.');
}

seed();
