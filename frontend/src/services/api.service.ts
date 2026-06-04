import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// Helper for generating random IDs since we don't have a backend UUID generator
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// LocalStorage wrappers
const getLocalData = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    return [];
  }
};

const saveLocalData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.message.includes('quota') || e.message.includes('exceeded')) {
      if (key === 'akp_audits' && Array.isArray(data)) {
        // Taktik 1: Buang semua image_url (foto/dokumen base64 raksasa) dari riwayat lama untuk menghemat kapasitas.
        // Hanya simpan foto di audit yang paling terbaru.
        let strippedData = data.map((item, idx) => {
          if (idx < data.length - 1 && item.image_url) {
            return { ...item, image_url: '' };
          }
          return item;
        });
        
        try {
          localStorage.setItem(key, JSON.stringify(strippedData));
          return;
        } catch (e2) {
          // Taktik 2: Kalau masih penuh juga, pangkas paksa sisakan 5 laporan audit terbaru saja.
          strippedData = strippedData.slice(-5);
          localStorage.setItem(key, JSON.stringify(strippedData));
          return;
        }
      }
    }
    throw e;
  }
};

export class ApiService {
  static async callGeminiApi(prompt: string, apiKey: string | null, isJson: boolean = false) {
    if (!apiKey || apiKey === 'TEST') {
      // MOCK MODE FOR TESTING
      console.log('Mode Uji Coba LLM (Mock) Aktif');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      if (prompt.includes('Jenis Audit:')) {
        return JSON.stringify({
          "title": "Laporan Audit Simulasi AI",
          "score": 45,
          "riskLevel": "TINGGI",
          "summary": "Ini adalah hasil simulasi. Dokumen yang diberikan menunjukkan beberapa kejanggalan administratif.",
          "sections": {
            "constitutionalAnalysis": "Terdapat potensi pelanggaran asas transparansi UUD 1945.",
            "publicImpact": "Dapat merugikan masyarakat jika anggaran tidak tersalurkan.",
            "corruptionRisk": "Risiko KKN tinggi pada bagian pengadaan.",
            "uud1945Deviations": "Pasal 33 tentang kesejahteraan rakyat mungkin terabaikan.",
            "akpRecommendations": "Segera lakukan investigasi lapangan.",
            "finalConclusion": "Proyek harus ditunda sampai audit forensik selesai.",
            "conflictOfInterest": "Ditemukan afiliasi antara vendor dan pejabat."
          },
          "findingsList": ["Dokumen tidak lengkap", "Mark-up harga terdeteksi"],
          "investigationLeads": ["Periksa rekening vendor", "Panggil panitia lelang"],
          "constitutionReferences": ["Pasal 33", "Pasal 27"]
        });
      } else if (prompt.toLowerCase().includes('academic')) {
        const mockArticle = {
          title: "PENGARUH DEVIASI ANGGARAN DAERAH TERHADAP KEADILAN DISTRIBUTIF MASYARAKAT: PERSPEKTIF HUKUM DAN PILAR KONSTITUSI UUD 1945",
          detectedField: "Hukum dan Keadilan",
          journalRecommendation: "Jurnal Hukum dan Keadilan",
          matchPercentage: 94,
          auditScore: 85,
          auditFindings: `### Temuan Audit Akademik
- **Struktur Artikel**: Alur pemaparan cukup sistematis namun perlu transisi yang lebih halus antara Tinjauan Pustaka dan Metode Penelitian.
- **Judul**: Sangat representatif dengan objek kebijakan/anggaran yang dianalisis.
- **Abstrak**: Kurang merangkum kontribusi metodologi kualitatif dan implikasi konstitusional secara eksplisit.
- **Kata Kunci**: Terlalu sedikit dan kurang menggambarkan fokus hukum tata negara.
- **Sitasi & Referensi**: Beberapa sitasi belum secara konsisten menggunakan standar penulisan APA Style.
- **Metodologi**: Penjelasan metode analisis yuridis normatif masih kurang mendalam pada bab tersendiri.
- **Pembahasan**: Analisis implikasi markup anggaran belum dihubungkan secara teoritis dengan konsep keadilan distributif Rawls.
- **Kesimpulan**: Rekomendasi kebijakan masih bersifat makro dan belum merinci solusi checks-and-balances SIMBG.`,
          auditImprovements: `### Daftar Perbaikan yang Dilakukan
- **Abstrak**: Ditulis ulang dalam Bahasa Indonesia dan Bahasa Inggris untuk menyertakan metodologi yuridis normatif dan ringkasan kuantitatif temuan deviasi.
- **Kata Kunci**: Ditambahkan istilah spesifik seperti 'Audit Kebijakan' dan 'Deviasi Anggaran'.
- **Pendahuluan**: Diperluas menjadi 3 paragraf komprehensif yang menjabarkan landasan hukum tata negara APBD dan Pasal 33 UUD 1945.
- **Tinjauan Pustaka**: Ditambahkan penjelasan mendalam tentang teori keadilan John Rawls dan keterkaitannya dengan asas moralitas anggaran.
- **Metodologi**: Menyusun bab metodologi yuridis normatif dengan pendekatan perundang-undangan (*statute approach*) secara spesifik.
- **Hasil & Pembahasan**: Memaparkan tabel perbandingan formal temuan markup anggaran beton struktural (+291.6%), baja profil (+57.9%), galian tanah (+20.3%), dan sambungan listrik (+158.2%).
- **Kesimpulan**: Ditambahkan 3 butir rekomendasi operasional bagi Pemda mengenai pengetatan checks-and-balances SIMBG.
- **Referensi**: Merapikan daftar pustaka sesuai gaya APA Style dan menambahkan referensi mutakhir.`,
          content: `# DETEKSI ANOMALI FISKAL DAN DEVIASI ANGGARAN BELANJA DAERAH DALAM PEMBANGUNAN INFRASTRUKTUR KOMERSIAL: ANALISIS YURIDIS TERHADAP KEADILAN DISTRIBUTIF BERDASARKAN PASAL 33 UUD 1945

**Penulis:**
**Dr. Ahmad Prakoso, M.H.** (Fakultas Hukum, Universitas Keadilan Indonesia)  
**Prof. Dr. Hendra Wijaya, S.H., M.S.** (Departemen Hukum Tata Negara, Institut Kajian Konstitusi)  
**Korespondensi Email:** ahmad.prakoso@uki.ac.id | hendra.wijaya@ikk.or.id

---

### Abstrak
Pembangunan infrastruktur daerah melalui skema pengadaan barang dan jasa pemerintah (PBJP) sering kali diwarnai oleh praktik deviasi anggaran berupa mark-up harga satuan dan manipulasi volume kontrak. Praktik ini secara langsung mengurangi alokasi anggaran belanja sosial publik, yang berimplikasi pada ketidakadilan distributif bagi masyarakat luas. Penelitian ini menganalisis implikasi hukum dan keselarasan konstitusional dari kasus anomali pos anggaran konstruksi bangunan komersial non-akademik di area pendidikan tinggi Jawa Timur terhadap prinsip keadilan sosial Pasal 33 UUD 1945. Penelitian ini menggunakan metode penelitian hukum yuridis normatif dengan pendekatan perundang-undangan (*statute approach*), konseptual (*conceptual approach*), dan pendekatan kasus (*case approach*). Hasil penelitian menunjukkan adanya deviasi fiskal yang sangat ekstrem, khususnya pada pekerjaan beton struktural utama (K-300/K-350) yang digelembungkan hingga +291.6% dari standar Standar Satuan Harga (SSH) daerah, serta fenomena *lazy pricing* pada material baja profil WF (+57.9%). Secara hukum, deviasi ini melanggar ketentuan Undang-Undang Nomor 17 Tahun 2003 tentang Keuangan Negara dan Undang-Undang Nomor 31 Tahun 1999 jo. UU Nomor 20 Tahun 2001 tentang Pemberantasan Tindak Pidana Korupsi. Secara konstitusional, ketimpangan pengalokasian APBD ini menghambat pemenuhan hak-hak sosial-ekonomi masyarakat kelas bawah, melanggar hak atas keadilan distributif (*distributive justice*) sebagaimana diamanatkan sila kelima Pancasila. Penelitian ini merekomendasikan perlunya penguatan sistem pengawasan berbasis integrasi digital (SIMBG-PBJ) dan kewajiban audit forensik teknis independen oleh Tim Profesi Ahli (TPA) sebelum pengesahan dokumen anggaran.

**Kata Kunci:** Deviasi Anggaran, Keadilan Distributif, Hukum Keuangan Negara, Audit Kebijakan Publik, Asas Konstitusi.

---

### Abstract
*Regional infrastructure development through government procurement schemes is frequently marred by budget deviation practices in the form of unit price markups and contract volume manipulation. These practices directly diminish the allocation for public social welfare budgets, leading to distributive injustice for the wider community. This study analyzes the legal implications and constitutional alignment of budget deviations in a non-academic commercial construction project within a higher education area in East Java against the social justice principles of Article 33 of the 1945 Constitution. Utilizing a normative legal research method with statutory, conceptual, and case approaches, this study examines budget audit data. The results demonstrate extreme fiscal deviations, particularly in structural concrete works (K-300/K-350) which were marked up by +291.6% above the regional Standard Price Index (SSH), and lazy pricing on structural steel WF (+57.9%). Legally, these deviations violate Law No. 17 of 2003 on State Finance and Law No. 31 of 1999 in conjunction with Law No. 20 of 2001 on the Eradication of Corruption. Constitutionally, this misallocation impedes the economic and social rights of vulnerable groups, thereby violating distributive justice as mandated by the fifth pillar of Pancasila. This study recommends strengthening digital integration checks (SIMBG-PBJ) and mandatory technical forensic audits by independent professional experts before budget ratification.*

**Keywords:** *Budget Deviation, Distributive Justice, State Finance Law, Policy Audit, Constitutional Principles.*

---

### I. PENDAHULUAN

#### 1.1 Latar Belakang Masalah
Pembangunan nasional yang berkeadilan sosial merupakan amanat luhur pendiri bangsa Indonesia, sebagaimana tercermin dalam rumusan Pancasila dan Undang-Undang Dasar 1945. Anggaran Pendapatan dan Belanja Daerah (APBD) diposisikan sebagai instrumen fiskal utama yang mendistribusikan kekayaan negara untuk pemenuhan hak ekonomi, sosial, dan budaya warga negara di daerah. Ketika instrumen ini mengalami deviasi dan inefisiensi, esensi keadilan sosial menjadi terancam. Pembangunan daerah yang didanai oleh APBD seharusnya menjadi katalisator bagi kesejahteraan masyarakat setempat. APBD bukan sekadar tumpukan angka-angka akuntansi, melainkan perwujudan konkret dari kontrak sosial antara pemerintah dan rakyat. Oleh karena itu, setiap rupiah yang disalahgunakan atau dialokasikan dengan mark-up harga yang ekstrem secara langsung mencederai perjanjian moral tersebut.

Dalam konteks hukum tata negara, pengelolaan keuangan publik wajib merujuk pada ketentuan Pasal 33 Ayat 3 UUD 1945 yang berbunyi bahwa bumi, air, dan kekayaan alam yang terkandung di dalamnya dikuasai oleh negara dan dipergunakan untuk sebesar-besar kemakmuran rakyat. Ketentuan ini melahirkan asas kemanfaatan kolektif dan asas moralitas keuangan negara, di mana setiap rupiah uang rakyat harus dipertanggungjawabkan efektivitas kemanfaatannya. Namun, realitas di lapangan menunjukkan maraknya deviasi anggaran, baik dalam bentuk mark-up volume, penggelembungan harga satuan (gold-plating), maupun duplikasi pos pengeluaran. Hal ini diperparah oleh lemahnya pengawasan internal pada tingkat perencanaan anggaran pembangunan daerah yang sering kali meloloskan dokumen perencanaan yang tidak logis.

Ketidakpatuhan tata kelola anggaran ini memicu ketimpangan alokasi belanja daerah. Alokasi anggaran pembangunan yang seharusnya diprioritaskan pada sektor-sektor esensial seperti pendidikan, kesehatan, dan pengentasan kemiskinan sering kali tersedot ke proyek-proyek infrastruktur fisik komersial non-akademik yang tidak mendesak. Melalui rekayasa penyusunan Harga Perkiraan Sendiri (HPS) yang tidak profesional dan manipulatif, harga material dikondisikan melampaui harga pasar wajar secara tidak rasional. Ketika proyek infrastruktur mengalami penggelembungan biaya, kapasitas fiskal daerah untuk mendanai pelayanan publik langsung mengalami kontraksi hebat. Akibatnya, pemenuhan hak-hak dasar masyarakat terpaksa dikorbankan demi menutupi inefisiensi proyek.

Selain aspek kerugian material, deviasi fiskal ini mencerminkan kegagalan moral birokrasi dalam menjalankan amanat kepemimpinan. Hubungan kolusif antara pejabat pembuat komitmen, panitia lelang, dan kontraktor pelaksana menciptakan ekosistem pengadaan barang dan jasa yang koruptif dan tertutup. Pola ini terus berulang karena lemahnya sistem pengawasan yang mengintegrasikan data teknis fisik dengan regulasi hukum keuangan. Akibatnya, audit yang dilakukan sering kali hanya bersifat formal administratif di atas kertas, tanpa pernah menyentuh substansi kewajaran harga material di lapangan. Keadaan ini menuntut adanya restrukturisasi total sistem audit pengadaan barang dan jasa pemerintah daerah.

Penelitian ini memfokuskan analisis pada dampak yuridis deviasi pos anggaran teknis konstruksi di daerah terhadap pemenuhan asas keadilan distributif. Urgensi penelitian ini terletak pada perlunya mendudukkan kasus penyimpangan harga material secara komprehensif, bukan hanya dari sudut pandang kerugian negara, melainkan juga dari perspektif konstitusionalitas kebijakan fiskal daerah. Analisis ini diharapkan mampu melahirkan paradigma baru dalam pengawasan anggaran daerah yang berorientasi pada hak-hak konstitusional publik. Pemerataan pembangunan tidak boleh sekadar menjadi jargon politik, melainkan harus dikawal secara ketat melalui penegakan keadilan fiskal di tingkat daerah.

#### 1.2 Rumusan Masalah
Penyimpangan fiskal dalam pengadaan barang dan jasa pemerintah (PBJP) ini tidak boleh dipandang secara sempit sebagai pelanggaran administratif belaka. Masalah ini memiliki dimensi hukum konstitusi yang mendalam. Ketika uang rakyat didelegasikan pada proyek-proyek bernilai tinggi dengan tingkat kemahalan yang tidak wajar (overpricing), hak-hak konstitusional masyarakat atas keadilan distributif secara sistematis telah diabaikan. Berdasarkan latar belakang tersebut, penelitian ini bertujuan menjawab dua permasalahan utama:
1. Bagaimana implikasi yuridis formal dari temuan deviasi ekstrim harga satuan material konstruksi pada proyek pembangunan komersial terhadap Undang-Undang Nomor 17 Tahun 2003 tentang Keuangan Negara dan Undang-Undang Tipikor?
2. Bagaimana ketidaksesuaian alokasi anggaran tersebut memengaruhi pemenuhan asas keadilan distributif warga negara berdasarkan prinsip penguasaan negara Pasal 33 UUD 1945?

#### 1.3 Tujuan Penelitian
Tujuan dari penelitian ini adalah untuk membedah secara kritis implikasi hukum formal dari adanya anomali fiskal berupa markup ekstrem pada komponen biaya konstruksi infrastruktur komersial daerah. Selain itu, penelitian ini bertujuan untuk mengaitkan penyimpangan anggaran pembangunan fisik tersebut dengan dampaknya terhadap ketidakadilan distributif bagi masyarakat setempat yang berhak atas kemakmuran bersama yang dijamin konstitusi. Penelitian ini berupaya memformulasikan solusi integratif yang memadukan keahlian teknik konstruksi dengan penafsiran hukum tata negara.

#### 1.4 Urgensi dan Manfaat Penelitian
Manfaat akademis dari penelitian ini adalah memperkaya khazanah keilmuan hukum tata negara dan hukum administrasi negara, khususnya dalam mengintegrasikan metode audit kuantitatif dengan analisis yuridis filosofis konstitusional. Secara praktis, penelitian ini memberikan rekomendasi operasional kepada badan pengawas internal pemerintah dan penegak hukum dalam mendeteksi pola anomali harga pada tahap perencanaan tender guna meminimalkan celah korupsi anggaran pembangunan daerah. Diharapkan model pengawasan ini dapat diadopsi secara luas di berbagai daerah di Indonesia demi mewujudkan anggaran yang bersih dan pro-rakyat.

---

### II. TINJAUAN PUSTAKA

#### 2.1 Teori Keadilan Distributif John Rawls
Analisis mengenai keadilan alokasi sumber daya publik dalam filsafat hukum tidak dapat dilepaskan dari kontribusi pemikiran John Rawls, khususnya melalui konsep Keadilan sebagai Fairness (*Justice as Fairness*). Rawls merumuskan dua prinsip keadilan utama: prinsip kebebasan yang setara bagi semua orang (*equal liberty principle*), dan prinsip perbedaan (*difference principle*) yang menyatakan bahwa ketimpangan sosial dan ekonomi harus diatur sedemikian rupa sehingga memberikan manfaat terbesar bagi anggota masyarakat yang paling tidak beruntung [1]. Dalam konteks anggaran pembangunan negara, prinsip perbedaan Rawls mewajibkan setiap kebijakan anggaran daerah mendahulukan pemenuhan kepentingan ekonomi warga miskin dan rentan.

APBD harus diposisikan sebagai alat redistribusi kekayaan untuk memperkecil jurang ketimpangan sosial. Apabila pos anggaran infrastruktur justru digelembunkan untuk membiayai keuntungan tidak wajar pihak ketiga, maka instrumen APBD telah bergeser fungsi dari alat penyejahtera rakyat menjadi alat pengayaan kelompok kapitalis tertentu. Tindakan ini secara telak mencederai keadilan distributif. Pembangunan yang mengabaikan keadilan sosial tidak memiliki legitimasi moral dan konstitusional, karena mencederai hak warga negara untuk menikmati bagian yang adil dari kemakmuran kolektif. Konsep keadilan Rawls menegaskan bahwa setiap ketimpangan fiskal harus dipertanggungjawabkan di hadapan kepentingan kemanusiaan.

Lebih lanjut, Rawls berargumen bahwa struktur dasar masyarakat harus diatur sedemikian rupa untuk mencegah penumpukan kekayaan yang tidak terkendali pada satu golongan sementara golongan lain hidup dalam keterbatasan sarana dasar publik. Ketika deviasi anggaran dibiarkan terjadi tanpa sanksi hukum yang tegas, sistem hukum secara tidak langsung melegitimasi transfer kekayaan publik ke ruang-ruang privat yang tidak produktif secara sosial. Ini adalah pelanggaran mendasar terhadap kontrak sosial (*social contract*) yang mendasari berdirinya suatu negara hukum yang demokratis. Uang rakyat tidak boleh dialihkan menjadi profit ekstra-legal bagi kontraktor tanpa dasar keadilan sosial.

Oleh karena itu, keadilan distributif menuntut adanya komitmen aktif dari penyelenggara negara untuk mengaudit dan memastikan setiap rupiah anggaran pembangunan fisik dialokasikan secara efisien dan tepat sasaran. Setiap deviasi fiskal yang menggelembungkan biaya proyek harus diidentifikasi sebagai bentuk ketidakadilan struktural yang menghambat pemerataan kesejahteraan sosial sebagaimana diamanatkan Pancasila. Hukum harus bertindak sebagai pelindung hak-hak masyarakat yang rentan terhadap penyalahgunaan anggaran oleh elite birokrasi dan korporasi mitra.

#### 2.2 Hukum Keuangan Negara dan Asas Kepatuhan Fiskal
Pengelolaan keuangan negara di Indonesia diatur secara ketat berdasarkan Undang-Undang Nomor 17 Tahun 2003 tentang Keuangan Negara. Pasal 3 ayat (1) undang-undang tersebut menetapkan bahwa keuangan negara harus dikelola secara tertib, taat pada peraturan perundang-undangan, efisien, ekonomis, efektif, transparan, dan bertanggung jawab dengan memperhatikan rasa keadilan dan kepatutan [2]. Asas ekonomis menuntut agar perolehan sumber daya anggaran dilakukan dengan kualitas dan kuantitas tertentu pada tingkat harga yang paling rendah (wajar). Sementara asas kepatutan menuntut agar alokasi belanja daerah mencerminkan kelayakan moral dan kepantasan sosial.

Deviasi anggaran berupa mark-up harga satuan konstruksi hingga mencapai ratusan persen di atas SSH daerah secara eksplisit melanggar asas efisiensi, ekonomis, dan kepatutan yang diamanatkan undang-undang tersebut. Asas-asas umum pengelolaan keuangan daerah yang baik (Good Corporate Governance) juga menegaskan pentingnya transparansi dalam menyusun perkiraan harga pasar. Jika perencanaan anggaran mengabaikan prinsip-prinsip tersebut, maka legitimasi hukum dari seluruh proses pengadaan barang dan jasa menjadi cacat secara hukum formil.

Cacat formil dalam penyusunan anggaran ini berimplikasi pada pertanggungjawaban hukum administrasi negara dan pidana. UU Nomor 17 Tahun 2003 mengamanatkan bahwa setiap pejabat yang diberi kewenangan mengelola uang negara wajib bertanggung jawab atas kerugian negara yang disebabkan oleh kelalaian atau kesengajaan. Pelanggaran terhadap batas kewajaran harga yang ditetapkan oleh SSH daerah adalah bentuk nyata dari pengabaian asas kepatuhan hukum (*compliance*) yang tidak dapat ditoleransi.

Dalam kerangka yuridis, audit kepatuhan fiskal berfungsi untuk mencocokkan realisasi pengadaan dengan ketentuan peraturan perundang-undangan yang berlaku. Apabila ditemukan disparitas ekstrem yang tidak memiliki penjelasan logis teknis, maka patut diduga telah terjadi penyalahgunaan wewenang (*detournement de pouvoir*) oleh pihak perencana anggaran yang mengutamakan kepentingan pribadi atau golongan di atas kepentingan umum. Tindakan pencegahan harus didahulukan melalui integrasi SSH digital dengan sistem perencanaan APBD.

#### 2.3 Prinsip Penguasaan Negara dan Kedaulatan Rakyat
Ketentuan Pasal 33 ayat (3) UUD 1945 menegaskan bahwa bumi, air, dan kekayaan alam yang terkandung di dalamnya dikuasai oleh negara dan dipergunakan untuk sebesar-besar kemakmuran rakyat. Mahkamah Konstitusi dalam berbagai putusannya menafsirkan konsep "dikuasai oleh negara" melahirkan kewajiban bagi negara untuk melakukan pengurusan (*beheersdaard*), pengelolaan (*beheersdaad*), dan pengawasan (*toezichthoudensdaad*) demi kepentingan publik [3]. Dalam mengelola keuangan daerah yang bersumber dari pajak rakyat dan pemanfaatan sumber daya alam, pemerintah bertindak sebagai wali amanat (*trustee*) dari rakyat.

Oleh karena itu, kegagalan pemerintah daerah dalam mengawasi kewajaran harga proyek pembangunan fisik daerah, yang membiarkan terjadinya mark-up anggaran struktural secara masif, merupakan pelanggaran serius terhadap mandat wali amanat rakyat (*public trust doctrine*) dan asas kedaulatan rakyat atas APBD. Anggaran belanja daerah pada hakikatnya adalah milik rakyat yang didelegasikan pengelolaannya kepada eksekutif dan legislatif. Penyalahgunaan alokasi dana ini adalah pengkhianatan terhadap kedaulatan ekonomi rakyat yang dilindungi konstitusi.

Doktrin wali amanat publik menegaskan bahwa setiap tindakan pengelolaan keuangan oleh negara harus selalu berorientasi pada maksimalisasi kesejahteraan sosial (*social welfare maximization*). Ketika anggaran daerah mengalami kebocoran akibat mark-up, hal itu berarti negara gagal memenuhi fungsi perlindungan sosial dan pengawasan terhadap sumber daya publik yang dikuasainya. Ini berujung pada delegitimasi kekuasaan negara di mata hukum konstitusi. Konstitusi ekonomi menuntut akuntabilitas mutlak dari pemegang otoritas fiskal daerah.

Negara tidak boleh pasif ketika melihat aset keuangan publik tergerus oleh praktik spekulasi kontraktor yang melipatgandakan margin keuntungan secara tidak halal. Pengawasan konstitusional atas APBD harus ditegakkan kembali untuk memastikan bahwa setiap instrumen kebijakan fiskal benar-benar bekerja untuk melayani hajat hidup orang banyak, bukan melayani hasrat akumulasi modal segelintir elite. Penguatan lembaga legislatif dan partisipasi masyarakat dalam pembahasan anggaran adalah kunci utama pemulihan kedaulatan rakyat tersebut.

---

### III. METODE PENELITIAN

#### 3.1 Desain Penelitian Yuridis Normatif
Penelitian ini merupakan jenis penelitian hukum normatif (*yuridis normatif*), yaitu penelitian hukum yang meletakkan hukum sebagai sistem norma [4]. Pendekatan yang digunakan dalam penelitian ini meliputi pendekatan perundang-undangan (*statute approach*) untuk menganalisis sinkronisasi vertikal regulasi keuangan negara dan UU Tipikor; pendekatan konseptual (*conceptual approach*) untuk membedah penerapan teori keadilan distributif; serta pendekatan kasus (*case approach*) dengan menganalisis dokumen audit forensik pengadaan proyek pembangunan komersial non-akademik di area pendidikan tinggi Jawa Timur.

#### 3.2 Sumber Bahan Hukum dan Data Audit
Bahan hukum yang digunakan terdiri dari bahan hukum primer berupa UU Keuangan Negara, UU Tipikor, Perpres PBJP, dan Perda Standardisasi Satuan Harga Daerah. Selain itu, digunakan bahan hukum sekunder yang mencakup literatur hukum, jurnal ilmiah, laporan hasil pemeriksaan (LHP) badan audit, serta artikel ilmiah bereputasi nasional dan internasional yang relevan dengan audit pembangunan daerah dan keadilan fiskal. Pengolahan bahan hukum dilakukan dengan mengkaji silang antara data teknis audit dan aturan legal formal yang berlaku di tingkat nasional maupun daerah.

#### 3.3 Teknik Pengumpulan dan Analisis Bahan Hukum
Pengumpulan bahan hukum dilakukan melalui studi dokumen secara sistematis, yang kemudian dianalisis secara kualitatif preskriptif untuk menghasilkan kesimpulan hukum yang komprehensif. Analisis bahan hukum dilakukan dengan cara membedah data audit konstruksi fisik, membandingkannya dengan regulasi baku, mengidentifikasi unsur-unsur hukum yang dilanggar, serta memformulasikan konsep perbaikan tata kelola berbasis konstitusi ekonomi. Preskripsi yang dihasilkan ditujukan untuk memperbaiki instrumen pengawasan di lingkungan kementerian dan pemerintah daerah.

---

### IV. HASIL PENELITIAN DAN PEMBAHASAN

#### 4.1 Analisis Deviasi Anggaran Fisik Kontrak Konstruksi
Berdasarkan hasil audit forensik terhadap Rencana Anggaran Biaya (RAB) dan rincian BoQ pengadaan pembangunan gedung komersial di Jawa Timur, ditemukan penyimpangan harga satuan material yang sangat mencolok dan tidak dapat dipertanggungjawabkan secara teknis. Tabel berikut menyajikan ringkasan komparasi harga satuan kontrak terhadap acuan Standar Satuan Harga (SSH) resmi daerah:

**Tabel 1. Komparasi Harga Kontrak Konstruksi Terhadap Standar Satuan Harga Daerah**
| No | Pos Pekerjaan Konstruksi | Volume Pekerjaan | Harga Satuan RAB Kontrak | Harga Acuan Wajar (SSH/HSPK) | Deviasi Persentase | Status Risiko Kepatuhan |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 1 | Beton Utama K-300 / K-350 | 48.02 m³ | Rp 5.677.530 / m³ | Rp 1.450.000 / m³ | +291.6% | **CRITICAL: MARK-UP EKSTREM** |
| 2 | Rangka Baja Profil WF | 4,021.59 Kg | Rp 38.700 / Kg | Rp 24.500 / Kg | +57.9% | *WARNING: LAZY PRICING* |
| 3 | Sambungan Listrik & ME | 1.00 Paket | Rp 47.000.000 / Paket | Rp 18.200.000 / Paket | +158.2% | *WARNING: GOLD-PLATING* |
| 4 | Galian & Urugan Tanah | 265.08 m³ | Rp 66.200 / m³ | Rp 55.000 / m³ | +20.3% | *VOLUME INFLATION* |

Dari Tabel 1 di atas, anomali terbesar terdapat pada pekerjaan beton struktural utama (K-300 / K-350) dengan tingkat kemahalan kontrak mencapai Rp 5.677.530 / m³ dibandingkan dengan harga standar SSH yang hanya berkisar Rp 1.450.000 / m³. Selisih harga satuan beton yang melonjak hampir empat kali lipat ini mengindikasikan adanya rekayasa penyusunan Harga Perkiraan Sendiri (HPS) oleh Pejabat Pembuat Komitmen (PPK) secara sengaja untuk menguntungkan penyedia jasa konstruksi tertentu [5]. Penyimpangan ini bukan merupakan kelalaian kalkulasi biasa, melainkan pola yang direncanakan secara matang dalam dokumen perencanaan.

Selain itu, penetapan harga satuan material baja secara pukul rata (*lazy pricing*) sebesar Rp 38.700 / Kg untuk seluruh komponen (baik profil WF berat maupun pelat buhul tipis) menunjukkan ketidakpatuhan terhadap ketentuan perhitungan teknis harga satuan yang diatur dalam Peraturan Menteri Pekerjaan Umum dan Perumahan Rakyat (PUPR) mengenai analisis harga satuan pekerjaan (AHSP) bidang cipta karya. Ketidakakuratan penentuan harga satuan ini berimplikasi pada pemborosan keuangan daerah yang bernilai signifikan.

Dalam praktiknya, analisis harga satuan pekerjaan konstruksi harus mengacu pada komponen upah tenaga kerja, harga bahan, dan sewa alat yang divalidasi secara berkala di pasar setempat. Namun, dokumen kontrak yang diteliti membuktikan bahwa parameter penyusunan HPS sengaja dimanipulasi dengan menggunakan koefisien yang tidak sesuai standar teknis. Hal ini dilakukan guna menjustifikasi tingginya nilai penawaran kontraktor pelaksana, sehingga proyek tersebut tampak legal secara prosedural namun koruptif secara substansial.

Hal serupa juga ditemukan pada komponen elektrikal (ME), di mana biaya penyambungan daya baru dari PLN digelembungkan hingga 158.2%. Pemasangan daya baru yang memiliki tarif resmi transparan dari badan usaha milik negara (BUMN) ternyata dinaikkan dengan alasan biaya jasa instalasi tambahan yang fiktif. Temuan ini menegaskan bahwa setiap celah anggaran dalam kontrak konstruksi daerah rentan dimanfaatkan untuk kepentingan memperkaya kelompok penyedia jasa konstruksi. Pola-pola markup semacam ini menunjukkan betapa krusialnya pengawasan berlapis pada proses pengadaan.

#### 4.2 Implikasi Hukum Formil Terhadap Tindak Pidana Korupsi
Tindakan Pejabat Pembuat Komitmen (PPK) yang meloloskan draf RAB kontrak dengan tingkat harga yang melampaui batas kewajaran pasar secara eksplisit memenuhi unsur perbuatan melawan hukum (PMH) sebagaimana diatur dalam Pasal 2 ayat (1) UU Pemberantasan Tindak Pidana Korupsi (UU Tipikor) [6]. Unsur perbuatan melawan hukum tersebut terpenuhi karena PPK terbukti mengabaikan Peraturan Presiden tentang Pengadaan Barang/Jasa Pemerintah yang mewajibkan penyusunan HPS dihitung secara keahlian berdasarkan data yang dapat dipertanggungjawabkan dan merujuk pada standar harga pasar setempat. Tindakan mengabaikan batas atas SSH daerah adalah bukti nyata adanya niat jahat (*mens rea*) untuk memperkaya diri sendiri atau korporasi.

Lebih lanjut, selisih anggaran yang timbul akibat markup harga beton struktural utama dan pekerjaan ME (seperti pemasangan daya baru PLN 41 kVA seharga Rp 47 juta yang sebenarnya bertarif resmi Rp 18.2 juta) secara langsung mengakibatkan kerugian keuangan negara. Dalam yurisprudensi hukum pidana korupsi di Indonesia, kerugian negara tidak lagi harus bersifat nyata terjadi (*actual loss*), melainkan cukup berupa potensi kerugian negara (*potential loss*) yang timbul dari penggelembungan biaya di atas harga wajar [7]. Oleh karena itu, temuan deviasi ini memiliki dasar hukum yang sangat kuat untuk ditingkatkan ke tahap penyelidikan tindak pidana korupsi sektor konstruksi daerah.

Dalam perspektif hukum pidana, unsur menguntungkan diri sendiri atau orang lain atau suatu korporasi terbukti secara materiil dengan beralihnya dana surplus anggaran proyek ke rekening kontraktor penyedia jasa tanpa diiringi dengan penyerahan volume pekerjaan yang setara dengan nilai uang yang dibayarkan. Nilai ekonomis riil dari bangunan yang diserahkan jauh di bawah total anggaran yang dikeluarkan daerah. Kesenjangan nilai inilah yang merupakan bentuk konkret dari kerugian keuangan negara yang dapat diusut secara pidana. Proses penegakan hukum harus menyasar tidak hanya aspek pidana tetapi juga pengembalian aset (*asset recovery*).

Selain Pasal 2, tindakan PPK dan kontraktor pelaksana juga dapat dijerat dengan Pasal 3 UU Tipikor mengenai penyalahgunaan kewenangan, kesempatan, atau sarana yang ada padanya karena jabatan atau kedudukan. PPK memiliki kewajiban hukum untuk menolak penawaran yang tidak wajar and membatalkan tender yang terindikasi kolutif. Dengan membiarkan proses pengadaan berjalan hingga penandatanganan kontrak yang sarat markup, PPK telah menyalahgunakan kewenangan jabatan publik demi memfasilitasi keuntungan tidak sah bagi pihak penyedia. Pertanggungjawaban pidana ini bersifat individual dan institusional, menuntut ketegasan aparat penegak hukum.

#### 4.3 Opportunity Cost dan Pelanggaran Keadilan Distributif
Kerugian fiskal yang diakibatkan oleh deviasi proyek pembangunan fisik komersial ini berdampak sistemik pada keterbatasan kapasitas fiskal daerah (*fiscal capacity*). Setiap dana yang diserap oleh markup proyek konstruksi melahirkan biaya peluang sosial (*social opportunity cost*) berupa tidak terdanainya hak-hak dasar warga negara kelas bawah. Ketika efisiensi anggaran diabaikan demi membiayai keuntungan tidak sah kontraktor, maka alokasi dana untuk pelayanan publik dasar secara otomatis terpangkas. Ketiadaan efisiensi ini berdampak langsung pada terhambatnya pembangunan sumber daya manusia di tingkat lokal.

Sebagai simulasi analisis, akumulasi deviasi anggaran beton struktural dan sambungan daya listrik pada proyek tersebut mencapai nilai ratusan juta rupiah. Apabila dana kebocoran anggaran tersebut disalurkan secara benar dan berkeadilan, dana tersebut setara dengan biaya pembangunan dua ruang kelas sekolah dasar di daerah terpencil, pembiayaan program jaminan persalinan bagi puluhan ibu miskin, atau pemberian bantuan langsung tunai bagi puluhan kepala keluarga rawan pangan. Ketidakadilan ini bersifat struktural karena merampas kesempatan masyarakat miskin untuk memperbaiki taraf hidup mereka.

**Gambar 1. Bagan Alur Opportunity Cost Akibat Deviasi Anggaran**
\`\`\`
+--------------------------+     +--------------------------+
|  Deviasi Anggaran Proyek | --> | Markup Harga Vendor Fikty|
|  Infrastruktur Komersial |     | (Pengayaan Pihak Ketiga) |
+--------------------------+     +--------------------------+
             |
             v
+--------------------------+     +--------------------------+
|  Berkurangnya Dana APBD  | --> | Hilangnya Beasiswa, Obat |
|  Sektor Sosial & Publik  |     | Murah & Fasilitas Sekolah|
+--------------------------+     +--------------------------+
\`\`\`

Dengan demikian, pembiaran deviasi anggaran oleh pemerintah daerah merupakan pelanggaran tidak langsung terhadap hak ekonomi, sosial, dan budaya warga negara (*omission of state obligation*). Kebijakan anggaran semacam ini bertentangan dengan esensi sila kelima Pancasila dan prinsip keadilan sosial yang menghendaki kemakmuran dinikmati secara merata dan adil oleh seluruh lapisan masyarakat, bukan terkonsentrasi pada lingkar kekuasaan kontraktor pelaksana tender. Keadilan fiskal menuntut agar setiap alokasi APBD diprioritaskan untuk mengikis ketimpangan, bukan memperlebar jurang pemisah antara elite dan rakyat biasa.

Lebih jauh lagi, kegagalan dalam mengoptimalkan APBD untuk kesejahteraan sosial memperlemah tingkat kepercayaan publik (*public trust*) terhadap sistem demokrasi dan pemerintahan daerah. Warga negara yang taat membayar pajak merasa dikhianati ketika melihat uang pajak mereka tidak dikonversi menjadi fasilitas publik yang berkualitas, melainkan menguap dalam jaringan korupsi konstruksi. Dampak jangka panjang dari kondisi ini adalah menurunnya partisipasi pembangunan warga dan resistensi terhadap kebijakan perpajakan daerah. Pemulihan kepercayaan publik hanya bisa diraih melalui pembuktian transparansi pengadaan secara nyata.

Oleh karena itu, penyusunan anggaran daerah yang berkeadilan harus meletakkan analisis biaya peluang (*opportunity cost analysis*) sebagai instrumen wajib sebelum penetapan program pembangunan fisik dilakukan. Hal ini penting guna menjamin bahwa setiap kebijakan belanja daerah benar-benar didasari oleh asas kemanfaatan sosial tertinggi (*social utility maximization*) yang berpihak pada kesejahteraan bersama seluruh lapisan masyarakat. Anggaran daerah harus dirancang dengan paradigma keberpihakan pada kaum marjinal (*pro-poor budgeting*).

#### 4.4 Analisis Efektivitas Pengawasan Internal dan APIP
Peran Aparat Pengawas Intern Pemerintah (APIP) dalam mengawal akuntabilitas APBD di daerah dirasa masih belum optimal dalam mendeteksi deviasi anggaran sejak dini. Sejauh ini, APIP cenderung berfokus pada pengawasan administratif pasca-pelaksanaan proyek (*post-audit*) ketimbang melakukan pengawasan preventif sejak tahap perencanaan anggaran (*pre-audit*). Akibatnya, indikasi markup harga satuan beton dan ME sering kali baru terungkap setelah anggaran dicairkan sepenuhnya dan kerugian negara telah terjadi secara nyata. Hal ini memerlukan reformasi kelembagaan di tubuh inspektorat daerah.

Untuk mengatasi kelemahan ini, diperlukan pergeseran paradigma pengawasan ke arah pemanfaatan teknologi informasi terintegrasi. Penggunaan sistem verifikasi otomatis yang menghubungkan Rencana Kerja dan Anggaran (RKA) Satuan Kerja Perangkat Daerah dengan bank data SSH daerah secara *real-time* akan meminimalkan celah rekayasa harga. Dengan sistem ini, setiap usulan pos anggaran yang melampaui batas kewajaran harga akan secara otomatis ditolak oleh sistem (*system-blocked*), sehingga mencegah proses pengadaan bermasalah berlanjut ke tahap kontrak. Pengawasan melekat secara digital ini adalah solusi modern bagi transparansi daerah.

---

### V. KESIMPULAN DAN REKOMENDASI

#### 5.1 Kesimpulan
Penelitian ini menyimpulkan bahwa deviasi pos anggaran teknis konstruksi daerah bukan sekadar isu inefisiensi manajerial operasional, melainkan pelanggaran serius terhadap kerangka hukum keuangan negara dan pilar konstitusi UUD 1945. Temuan deviasi ekstrem harga satuan beton struktural utama yang mencapai +291.6% di atas SSH dan *lazy pricing* material baja berat memenuhi kualifikasi perbuatan melawan hukum yang berimplikasi pada kerugian keuangan negara sebagaimana diatur dalam UU Pemberantasan Tindak Pidana Korupsi. Secara konstitusional, ketidakpatuhan ini melahirkan bias anggaran yang merugikan publik dan melanggar prinsip keadilan distributif Rawlsian, karena merampas hak warga miskin atas jaminan kesejahteraan sosial akibat alokasi anggaran daerah yang salah sasaran. Kegagalan sistemik ini harus segera diatasi melalui reformasi pengawasan yang menyeluruh dan berorientasi pada kemaslahatan publik secara transparan.

#### 5.2 Rekomendasi
Untuk mencegah berulangnya penyimpangan pos anggaran pembangunan di masa depan dan memulihkan marwah konstitusi fiskal, direkomendasikan lima langkah strategis operasional:
1. **Digitalisasi dan Integrasi Pengawasan SIMBG dengan Sistem Pengadaan Pemerintah**: Kementerian Terkait dan Pemerintah Daerah harus membangun sistem verifikasi silang otomatis antara data permohonan Sistem Informasi Manajemen Bangunan Gedung (SIMBG) dengan basis data SSH nasional untuk mendeteksi *red flags* kemahalan harga secara *real-time*. Hal ini penting guna menjamin transparansi harga material konstruksi utama.
2. **Kewajiban Pelibatan Tim Profesi Ahli (TPA) Independen**: Setiap draf anggaran konstruksi daerah wajib diaudit kelayakannya oleh TPA akademis yang independen dan tersertifikasi untuk memvalidasi kewajaran harga material utama sebelum dokumen HPS dan kontrak disahkan oleh PPK. Hal ini untuk menghindari bias kepentingan kelompok perencana dan manipulasi koefisien teknis.
3. **Reformasi Pengawasan Internal Aparat Pengawas Intern Pemerintah (APIP)**: APIP harus memperluas cakupan auditnya dari sekadar audit administratif menjadi audit kinerja forensik yang mendalam dengan mengadopsi pilar akuntabilitas konstitusional sebagai indikator keberhasilan pengelolaan keuangan daerah. APIP juga harus diberikan independensi penuh dari intervensi kepala daerah.
4. **Penerapan Sanksi Administratif dan Pidana Secara Tegas**: Setiap pejabat pembuat komitmen dan penyedia jasa yang terbukti secara sengaja melakukan mark-up harga satuan konstruksi wajib dikenakan sanksi administratif berupa daftar hitam (*blacklisting*) perusahaan, pencabutan izin usaha, serta pelaporan langsung ke aparat penegak hukum untuk diproses secara pidana korupsi demi menciptakan efek jera.
5. **Pemberdayaan Partisipasi Publik dalam Pengawasan Anggaran Daerah**: Membuka akses publik terhadap dokumen RAB dan BoQ proyek pembangunan daerah agar masyarakat dapat secara aktif ikut mengawasi kewajaran pelaksanaan proyek di lapangan melalui platform aduan warga yang aman, responsif, dan dilindungi oleh undang-undang perlindungan saksi.

---

### DAFTAR PUSTAKA
[1] Rawls, J. (1971). *A Theory of Justice*. Cambridge: Harvard University Press.  
[2] Indonesia. *Undang-Undang Nomor 17 Tahun 2003 tentang Keuangan Negara*. Lembaran Negara Republik Indonesia Tahun 2003 Nomor 47.  
[3] Asshiddiqie, J. (2010). *Konstitusi Ekonomi*. Jakarta: Kompas Penerbit Buku.  
[4] Marzuki, P. M. (2013). *Penelitian Hukum (Edisi Revisi)*. Jakarta: Kencana Prenada Media Group.  
[5] Wibowo, A. (2018). *Akuntabilitas Keuangan Publik di Indonesia*. Jurnal Hukum Tata Negara, 14(2), 145-160.  
[6] Indonesia. *Undang-Undang Nomor 31 Tahun 1999 tentang Pemberantasan Tindak Pidana Korupsi* sebagaimana telah diubah dengan *Undang-Undang Nomor 20 Tahun 2001*. Lembaran Negara Republik Indonesia Tahun 2001 Nomor 134.  
[7] Harahap, M. Y. Y. (2016). *Pemberantasan Tindak Pidana Korupsi Sektor Pengadaan Barang dan Jasa*. Jurnal Forensik Keadilan, 8(1), 32-48.  
[8] Rawls, J. (2001). *Justice as Fairness: A Restatement*. Cambridge: Harvard University Press.  
[9] Kelsen, H. (1945). *General Theory of Law and State*. New York: Russell & Russell.  
[10] Prasetyo, B. (2019). *Analisis Hukum Forensik Konstruksi Terhadap Penyimpangan Volume Pekerjaan Beton*. Jurnal Teknik Sipil dan Hukum, 7(3), 201-215.  
[11] Sen, A. (2009). *The Idea of Justice*. London: Allen Lane.  
[12] Siregar, D. D. (2004). *Manajemen Aset: Strategi Penataan dan Pendayagunaan Aset Negara*. Jakarta: Gramedia Pustaka Utama.  
[13] Indonesia. *Undang-Undang Nomor 20 Tahun 2001 tentang Perubahan atas Undang-Undang Nomor 31 Tahun 1999 tentang Pemberantasan Tindak Pidana Korupsi*. Lembaran Negara Republik Indonesia Tahun 2001 Nomor 134.  
[14] Soekanto, S. (2010). *Pengantar Penelitian Hukum*. Jakarta: UI Press.  
[15] Habermas, J. (1996). *Between Facts and Norms: Contributions to a Discourse Theory of Law and Democracy*. Cambridge: MIT Press.
[16] UNDP. (2015). *Corruption Risk Assessment in Public Procurement*. New York: United Nations Development Programme.  
[17] BPK RI. (2021). *Laporan Hasil Pemeriksaan Atas Kepatuhan Belanja Daerah Sektor Konstruksi*. Jakarta: Badan Pemeriksa Keuangan.  
[18] Mahkamah Konstitusi RI. *Putusan Perkara Nomor 001-021-022/PUU-I/2003 tentang Pengujian Undang-Undang Ketenagalistrikan*. Jakarta: Kepaniteraan MK.  
[19] Rawls, J. (1993). *Political Liberalism*. New York: Columbia University Press.  
[20] KPK. (2020). *Panduan Pencegahan Korupsi pada Sektor Infrastruktur dan PBJ*. Jakarta: Komisi Pemberantasan Korupsi.`,
          tags: ["hukum", "keadilan", "akademik", "jurnal"]
        };
        return JSON.stringify(mockArticle);
      } else if (prompt.includes('Gaya Bahasa:')) {
        return JSON.stringify({
          "title": "Berita Simulasi: Investigasi Kasus",
          "content": "Ini adalah isi berita simulasi yang digenerate tanpa API Key. Semuanya tampak normal, namun ada rahasia di baliknya.",
          "tags": ["simulasi", "ai", "berita"]
        });
      }
      return "Halo! Ini adalah pesan simulasi dari asisten AI karena API Key belum dimasukkan.";
    }
    
    // We use gemini-2.5-flash as the standard fast model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192,
            ...(isJson ? { responseMimeType: "application/json" } : {})
          }
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Gagal menghubungi Gemini API');
      }

      const result = await response.json();
      let text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!isJson) {
        // Extract JSON block using regex if wrapped in markdown (legacy fallback)
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          text = jsonMatch[1];
        } else {
          text = text.trim();
        }
      }
      
      return text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  static async audit(input: string, type: string) {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    
    // Construct the prompt similar to what backend did
    const prompt = `Anda adalah sistem Audit Kebijakan Publik (AKP) Republik Indonesia.
Lakukan analisis dan audit mendalam terhadap informasi berikut.
Jenis Audit: ${type}

Data/Informasi:
${input}

Tolong keluarkan hasil dalam format JSON murni dengan struktur berikut persis:
{
  "title": "Judul Laporan Singkat",
  "score": 85, 
  "riskLevel": "TINGGI/SEDANG/RENDAH",
  "summary": "Ringkasan Eksekutif",
  "sections": {
    "constitutionalAnalysis": "Analisis Konstitusi UUD 1945",
    "publicImpact": "Dampak Publik",
    "corruptionRisk": "Risiko KKN",
    "uud1945Deviations": "Penyimpangan UUD 1945",
    "akpRecommendations": "Rekomendasi AKP",
    "finalConclusion": "Kesimpulan Akhir",
    "conflictOfInterest": "Potensi Konflik Kepentingan"
  },
  "findingsList": ["Temuan 1", "Temuan 2"],
  "investigationLeads": ["Jejak 1", "Jejak 2"],
  "constitutionReferences": ["Pasal 33", "Pasal 27"]
}`;

    const textResult = await this.callGeminiApi(prompt, apiKey, true);
    
    try {
      const parsed = JSON.parse(textResult);
      return parsed; // Returns the findings object
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", textResult);
      throw new Error(`Respons AI bukan JSON valid. Info: ${textResult.substring(0, 100)}...`);
    }
  }

  static async generateArticle(auditData: any, articleType: string) {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    
    let prompt = '';
    if (articleType === 'academic') {
      prompt = `Anda adalah Academic Journal Writer AI.

Tugas Anda menghasilkan artikel ilmiah lengkap yang siap diterbitkan pada jurnal akademik nasional maupun internasional berdasarkan data audit di bawah ini.

Selain menulis artikel, Anda juga harus:
1. Menganalisis dokumen audit untuk menentukan bidang ilmu yang sesuai.
2. Menentukan Persentase Kecocokan (0-100) dan Kategori Jurnal yang Direkomendasikan.
3. Melakukan Audit Akademik terhadap naskah (menentukan Skor Audit 0-100, Temuan Audit, dan Daftar Perbaikan).

Aturan Penulisan Artikel:
* Panjang antara 4.000 - 5.000 kata (Maksimal batas aman token).
* Menggunakan bahasa akademik formal.
* Struktur mengikuti standar jurnal terindeks Google Scholar.
* Format kompatibel dengan DOI Crossref.
* Wajib memiliki:
  * Judul
  * Abstrak Indonesia
  * Kata Kunci
  * Abstract English
  * Keywords
  * Pendahuluan
  * Tinjauan Pustaka
  * Metode Penelitian
  * Hasil dan Pembahasan
  * Implikasi Teoritis
  * Implikasi Praktis
  * Kesimpulan
  * Saran
  * Daftar Pustaka APA 7th

Output harus siap dipublikasikan sebagai artikel jurnal ilmiah Standart Google Scholar dan Sinta.
PENTING: JANGAN melewati batas panjang teks agar format JSON tidak terpotong. Pastikan JSON ditutup dengan sempurna ('}').

Data Audit:
${JSON.stringify(auditData, null, 2)}

Tolong kembalikan respons dalam format JSON murni persis seperti ini:
{
  "title": "Judul asli dari data audit",
  "category": "Academic Journal",
  "headline": "Judul asli dari data audit",
  "detectedField": "Nama bidang keilmuan yang terdeteksi secara otomatis (contoh: Hukum, Ilmu Komputer, Kedokteran, Sains, dll)",
  "journalRecommendation": "Jurnal ...",
  "matchPercentage": 94,
  "auditScore": 85,
  "auditFindings": "Markdown berisi Temuan Audit secara rinci (Struktur, Judul, Abstrak, dll.)",
  "auditImprovements": "Markdown berisi Daftar Perbaikan secara rinci",
  "content": "Isi lengkap artikel versi perbaikan dalam format Markdown yang terstruktur rapi dengan format jurnal ilmiah (Nama Penulis, Afiliasi, Email, Abstrak, Pendahuluan, Metode, Hasil, Pembahasan, Kesimpulan, Daftar Pustaka). Gunakan heading markdown yang sesuai.",
  "tags": ["akademik", "jurnal"]
}`;
    } else {
      prompt = `Tulis sebuah artikel berita jurnalistik berdasarkan data audit berikut.
Gaya Bahasa: ${articleType} (misalnya Tajam, Investigatif, atau Informatif)

Data Audit:
${JSON.stringify(auditData, null, 2)}

Tolong kembalikan respons dalam format JSON murni persis seperti ini:
{
  "title": "Judul Berita",
  "content": "Isi berita lengkap (dalam format teks biasa atau markdown ringan)",
  "tags": ["tag1", "tag2"]
}`;
    }

    const textResult = await this.callGeminiApi(prompt, apiKey, true);
    
    try {
      return JSON.parse(textResult);
    } catch (e) {
      throw new Error("Gagal mem-parsing artikel. Respons AI: " + textResult);
    }
  }

  static async chat(message: string, history: any[]) {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    const prompt = `Anda adalah asisten AI dari AKP (Audit Kebijakan Publik).\nRiwayat percakapan: ${JSON.stringify(history)}\nPesan Baru: ${message}`;
    const textResult = await this.callGeminiApi(prompt, apiKey);
    return { response: textResult };
  }

  static async scrape(urlToScrape: string) {
    try {
      const response = await fetch(`https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(urlToScrape)}`);
      const html = await response.text();
      const text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
                       .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
                       .replace(/<[^>]+>/g, ' ')
                       .replace(/\s+/g, ' ')
                       .trim();
      return { content: text.substring(0, 15000) };
    } catch (e) {
      throw new Error("Gagal menarik link berita. Pastikan URL dapat diakses publik.");
    }
  }

  static async extractPdf(file: File) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      
      return { content: fullText.trim() };
    } catch (e: any) {
      console.error('PDF Extraction Error:', e);
      throw new Error('Gagal membaca PDF: ' + e.message);
    }
  }

  static async extractImage(file: File) {
    const apiKey = localStorage.getItem('GEMINI_API_KEY');
    if (!apiKey) throw new Error("API Key diperlukan untuk ekstrak foto.");
    
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Ekstrak seluruh teks yang ada dalam gambar ini secara akurat:" },
            { inlineData: { mimeType: file.type, data: base64 } }
          ]
        }]
      })
    });
    
    if (!response.ok) throw new Error("Gagal mengekstrak teks dari foto via AI.");
    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { content: text };
  }

  // Local Data Operations: AUDITS
  static async getAudits() {
    return getLocalData('akp_audits');
  }

  static async getAudit(id: string) {
    const audits = getLocalData('akp_audits');
    return audits.find((a: any) => a.id === id) || null;
  }

  static async saveAudit(data: any) {
    const audits = getLocalData('akp_audits');
    const newAudit = { ...data, id: data.id || generateId(), createdAt: data.createdAt || new Date().toISOString() };
    audits.push(newAudit);
    saveLocalData('akp_audits', audits);
    return newAudit;
  }

  static async updateAudit(id: string, data: any) {
    const audits = getLocalData('akp_audits');
    const index = audits.findIndex((a: any) => a.id === id);
    if (index !== -1) {
      audits[index] = { ...audits[index], ...data };
      saveLocalData('akp_audits', audits);
      return audits[index];
    }
    throw new Error('Audit tidak ditemukan');
  }

  static async deleteAudit(id: string) {
    let audits = getLocalData('akp_audits');
    audits = audits.filter((a: any) => a.id !== id);
    saveLocalData('akp_audits', audits);
    return { success: true };
  }

  // Local Data Operations: USERS
  static async getUser(phone: string) {
    const users = getLocalData('akp_users');
    return users.find((u: any) => u.phone === phone) || null;
  }

  static async getUsers() {
    return getLocalData('akp_users');
  }

  static async createUser(data: any) {
    const users = getLocalData('akp_users');
    const newUser = { ...data, id: generateId() };
    users.push(newUser);
    saveLocalData('akp_users', users);
    return newUser;
  }

  static async updateUser(id: string, data: any) {
    const users = getLocalData('akp_users');
    const index = users.findIndex((u: any) => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...data };
      saveLocalData('akp_users', users);
      return users[index];
    }
    throw new Error('User tidak ditemukan');
  }

  static async deleteUser(id: string) {
    let users = getLocalData('akp_users');
    users = users.filter((u: any) => u.id !== id);
    saveLocalData('akp_users', users);
    return { success: true };
  }

  // Local Data Operations: ARTICLES
  static async getArticles() {
    return getLocalData('akp_articles');
  }

  static async getArticle(id: string) {
    const articles = getLocalData('akp_articles');
    return articles.find((a: any) => a.id === id) || null;
  }

  static async saveArticle(data: any) {
    const articles = getLocalData('akp_articles');
    const newArticle = { ...data, id: generateId(), createdAt: data.createdAt || new Date().toISOString() };
    articles.push(newArticle);
    saveLocalData('akp_articles', articles);
    return newArticle;
  }

  static async updateArticle(id: string, data: any) {
    const articles = getLocalData('akp_articles');
    const index = articles.findIndex((a: any) => a.id === id);
    if (index !== -1) {
      articles[index] = { ...articles[index], ...data };
      saveLocalData('akp_articles', articles);
      return articles[index];
    }
    throw new Error('Artikel tidak ditemukan');
  }

  static async deleteArticle(id: string) {
    let articles = getLocalData('akp_articles');
    articles = articles.filter((a: any) => a.id !== id);
    saveLocalData('akp_articles', articles);
    return { success: true };
  }

  static async checkConfig() {
    // In standalone mode, we pretend the backend is always OK, 
    // and rely on LocalStorage for API KEY.
    return { status: 'ok', isPackaged: true, has_gemini: !!localStorage.getItem('GEMINI_API_KEY') };
  }

  static async saveSettings(config: any) {
    if (config.apiKey) {
      localStorage.setItem('GEMINI_API_KEY', config.apiKey);
    }
    return { success: true };
  }

  static async exportDatabase() {
    const data = {
      audits: getLocalData('akp_audits'),
      articles: getLocalData('akp_articles'),
      users: getLocalData('akp_users')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `akp-database-offline-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return { success: true };
  }

  static async importDatabase(data?: any) {
    if (data && data.audits) saveLocalData('akp_audits', data.audits);
    if (data && data.articles) saveLocalData('akp_articles', data.articles);
    if (data && data.users) saveLocalData('akp_users', data.users);
    return { success: true };
  }

  static async clearDatabase() {
    localStorage.removeItem('akp_audits');
    localStorage.removeItem('akp_articles');
    localStorage.removeItem('akp_users');
    return { success: true };
  }
}
